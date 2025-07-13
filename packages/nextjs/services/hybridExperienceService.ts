import { Experience, UserProgress, indexedDBService } from "./indexedDBService";
import fs from "fs";
import path from "path";

class HybridExperienceService {
  private isClient = typeof window !== "undefined";

  async getExperiences(): Promise<Experience[]> {
    if (this.isClient) {
      try {
        const isAvailable = await indexedDBService.isAvailable();
        if (isAvailable) {
          return await indexedDBService.getExperiences();
        }
      } catch {
        console.warn("IndexedDB not available, falling back to server data");
      }
    }

    // Fallback to server data
    try {
      if (this.isClient) {
        // Client-side: use fetch
        const response = await fetch("/data/experiences.json");
        const data = await response.json();
        return data.experiences || [];
      } else {
        // Server-side: read file directly
        const dataPath = path.join(process.cwd(), "public", "data", "experiences.json");
        const fileContent = fs.readFileSync(dataPath, "utf-8");
        const data = JSON.parse(fileContent);
        return data.experiences || [];
      }
    } catch (error) {
      console.error("Failed to load experiences:", error);
      return [];
    }
  }

  async getUserProgress(userAddress: string, experienceId: number): Promise<UserProgress | null> {
    if (this.isClient) {
      try {
        const isAvailable = await indexedDBService.isAvailable();
        if (isAvailable) {
          return await indexedDBService.getUserProgress(userAddress, experienceId);
        }
      } catch {
        console.warn("IndexedDB not available, falling back to server data");
      }
    }

    // Fallback to server data (empty progress)
    return {
      experienceStarted: false,
      experienceCompleted: false,
      completedTasks: [],
    };
  }

  async startExperience(userAddress: string, experienceId: number): Promise<boolean> {
    const experiences = await this.getExperiences();
    const experience = experiences.find(exp => exp.id === experienceId);

    if (!experience || !experience.isActive) {
      return false;
    }

    if (this.isClient) {
      try {
        const isAvailable = await indexedDBService.isAvailable();
        if (isAvailable) {
          const existingProgress = await indexedDBService.getUserProgress(userAddress, experienceId);
          if (existingProgress?.experienceStarted) {
            return false; // Already started
          }

          const newProgress: UserProgress = {
            experienceStarted: true,
            experienceCompleted: false,
            completedTasks: [],
          };

          await indexedDBService.saveUserProgress(userAddress, experienceId, newProgress);
          return true;
        }
      } catch {
        console.warn("IndexedDB not available, cannot start experience");
      }
    }

    return false;
  }

  async completeTask(userAddress: string, experienceId: number, taskId: number): Promise<boolean> {
    const experiences = await this.getExperiences();
    const experience = experiences.find(exp => exp.id === experienceId);

    if (!experience || !experience.isActive) {
      return false;
    }

    const task = experience.tasks.find(t => t.id === taskId);
    if (!task) {
      return false;
    }

    if (this.isClient) {
      try {
        const isAvailable = await indexedDBService.isAvailable();
        if (isAvailable) {
          const userProgress = (await indexedDBService.getUserProgress(userAddress, experienceId)) || {
            experienceStarted: true,
            experienceCompleted: false,
            completedTasks: [],
          };

          // Check if task is already completed
          if (userProgress.completedTasks.includes(taskId)) {
            return false;
          }

          // Add task to completed tasks
          userProgress.completedTasks.push(taskId);

          // Calculate reward per task
          const rewardPerTask = experience.rewardAmount / experience.tasks.length;

          // Store reward information
          if (!userProgress.rewards) {
            userProgress.rewards = {};
          }
          userProgress.rewards[taskId] = {
            amount: rewardPerTask,
            token: experience.rewardToken,
            claimed: false,
          };

          // Check if all tasks are completed
          if (userProgress.completedTasks.length === experience.tasks.length) {
            userProgress.experienceCompleted = true;
            userProgress.completionDate = Date.now();
          }

          await indexedDBService.saveUserProgress(userAddress, experienceId, userProgress);
          return true;
        }
      } catch {
        console.warn("IndexedDB not available, cannot complete task");
      }
    }

    return false;
  }

  async completeQuizTask(userAddress: string, experienceId: number, taskId: number, answer: string): Promise<boolean> {
    const experiences = await this.getExperiences();
    const experience = experiences.find(exp => exp.id === experienceId);

    if (!experience) {
      return false;
    }

    const task = experience.tasks.find(t => t.id === taskId);
    if (!task || task.taskType !== "QUIZ") {
      return false;
    }

    // Check if answer is correct
    if (task.answer.toLowerCase() !== answer.toLowerCase()) {
      return false;
    }

    return this.completeTask(userAddress, experienceId, taskId);
  }

  async getCurrentClub(): Promise<string | null> {
    if (this.isClient) {
      try {
        const isAvailable = await indexedDBService.isAvailable();
        if (isAvailable) {
          return await indexedDBService.getCurrentClub();
        }
      } catch {
        console.warn("IndexedDB not available, falling back to server data");
      }
    }

    // Fallback to server data
    try {
      if (this.isClient) {
        // Client-side: use fetch
        const response = await fetch("/data/current-club.json");
        const data = await response.json();
        return data.currentClubId || "psg";
      } else {
        // Server-side: read file directly
        const dataPath = path.join(process.cwd(), "public", "data", "current-club.json");
        const fileContent = fs.readFileSync(dataPath, "utf-8");
        const data = JSON.parse(fileContent);
        return data.currentClubId || "psg";
      }
    } catch (error) {
      console.error("Failed to load current club:", error);
      return "psg"; // Default fallback
    }
  }

  async setCurrentClub(clubId: string): Promise<boolean> {
    if (this.isClient) {
      try {
        const isAvailable = await indexedDBService.isAvailable();
        if (isAvailable) {
          await indexedDBService.setCurrentClub(clubId);
          return true;
        }
      } catch {
        console.warn("IndexedDB not available, cannot set current club");
      }
    }

    return false;
  }

  async initializeData(): Promise<void> {
    if (!this.isClient) return;

    try {
      const isAvailable = await indexedDBService.isAvailable();
      if (!isAvailable) return;

      // Check if data is already initialized
      const existingExperiences = await indexedDBService.getExperiences();
      if (existingExperiences.length > 0) return;

      // Load initial data from server
      const response = await fetch("/data/experiences.json");
      const data = await response.json();

      if (data.experiences) {
        await indexedDBService.saveExperiences(data.experiences);
      }
    } catch (error) {
      console.warn("Failed to initialize IndexedDB data:", error);
    }
  }
}

export const hybridExperienceService = new HybridExperienceService();
