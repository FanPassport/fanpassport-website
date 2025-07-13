import fs from "fs";
import path from "path";

export interface Task {
  id: number;
  name: string;
  description: string;
  taskType: "QUIZ" | "QR_CODE" | "PHOTO" | "CHECK_IN";
  data: string;
  answer: string;
  isCompleted: boolean;
}

export interface Experience {
  id: number;
  clubId: string;
  name: string;
  description: string;
  isActive: boolean;
  rewardAmount: number;
  rewardToken: string;
  tasks: Task[];
}

export interface UserProgress {
  experienceStarted: boolean;
  experienceCompleted: boolean;
  completedTasks: number[];
  completionDate?: number;
  lastRewardClaimDate?: number | null;
  rewards?: Record<
    number,
    {
      amount: number;
      token: string;
      claimed: boolean;
      claimedAt?: number;
    }
  >;
}

interface ExperienceData {
  experiences: Experience[];
  userProgress: Record<string, Record<number, UserProgress>>;
}

class ExperienceService {
  private dataPath: string;
  private inMemoryData: ExperienceData | null = null;

  constructor() {
    this.dataPath = path.join(process.cwd(), "data", "experiences.json");
  }

  private readData(): ExperienceData {
    // On Vercel, use in-memory data to avoid filesystem issues
    if (process.env.VERCEL && this.inMemoryData) {
      return this.inMemoryData;
    }

    try {
      const data = fs.readFileSync(this.dataPath, "utf8");
      const parsedData = JSON.parse(data);

      // Cache the data in memory for Vercel
      if (process.env.VERCEL) {
        this.inMemoryData = parsedData;
      }

      return parsedData;
    } catch (error) {
      console.error("Error reading experience data:", error);
      return { experiences: [], userProgress: {} };
    }
  }

  private writeData(data: ExperienceData): void {
    // On Vercel, update in-memory data instead of writing to file
    if (process.env.VERCEL) {
      this.inMemoryData = data;
      console.log("Updated in-memory data on Vercel");
      return;
    }

    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error writing experience data:", error);
    }
  }

  // Get all experiences
  getExperiences(): Experience[] {
    const data = this.readData();
    return data.experiences;
  }

  // Get experience by ID
  getExperience(experienceId: number): Experience | null {
    const data = this.readData();
    return data.experiences.find(exp => exp.id === experienceId) || null;
  }

  // Get user progress for an experience
  getUserProgress(userAddress: string, experienceId: number): UserProgress {
    const data = this.readData();
    const userProgress = data.userProgress[userAddress]?.[experienceId];

    if (!userProgress) {
      return {
        experienceStarted: false,
        experienceCompleted: false,
        completedTasks: [],
      };
    }

    return userProgress;
  }

  // Start an experience for a user
  startExperience(userAddress: string, experienceId: number): boolean {
    const data = this.readData();
    const experience = data.experiences.find(exp => exp.id === experienceId);

    if (!experience || !experience.isActive) {
      return false;
    }

    if (!data.userProgress[userAddress]) {
      data.userProgress[userAddress] = {};
    }

    if (data.userProgress[userAddress][experienceId]?.experienceStarted) {
      return false; // Already started
    }

    data.userProgress[userAddress][experienceId] = {
      experienceStarted: true,
      experienceCompleted: false,
      completedTasks: [],
    };

    this.writeData(data);
    return true;
  }

  // Complete a task for a user
  completeTask(userAddress: string, experienceId: number, taskId: number): boolean {
    const data = this.readData();
    const experience = data.experiences.find(exp => exp.id === experienceId);

    if (!experience || !experience.isActive) {
      return false;
    }

    const task = experience.tasks.find(t => t.id === taskId);
    if (!task) {
      return false;
    }

    if (!data.userProgress[userAddress]) {
      data.userProgress[userAddress] = {};
    }

    if (!data.userProgress[userAddress][experienceId]) {
      data.userProgress[userAddress][experienceId] = {
        experienceStarted: true,
        experienceCompleted: false,
        completedTasks: [],
      };
    }

    const userProgress = data.userProgress[userAddress][experienceId];

    // Check if task is already completed
    if (userProgress.completedTasks.includes(taskId)) {
      return false;
    }

    // Add task to completed tasks
    userProgress.completedTasks.push(taskId);

    // Calculate reward per task (total reward divided by number of tasks)
    const rewardPerTask = experience.rewardAmount / experience.tasks.length;

    // Store reward information for this task
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

    this.writeData(data);
    return true;
  }

  // Complete a quiz task
  completeQuizTask(userAddress: string, experienceId: number, taskId: number, answer: string): boolean {
    const data = this.readData();
    const experience = data.experiences.find(exp => exp.id === experienceId);

    if (!experience) {
      console.error("Experience not found:", experienceId);
      return false;
    }

    const task = experience.tasks.find(t => t.id === taskId);
    if (!task || task.taskType !== "QUIZ") {
      console.error("Task not found or not a quiz:", taskId, task?.taskType);
      return false;
    }

    console.log("Quiz validation:", {
      userAnswer: answer,
      correctAnswer: task.answer,
      isCorrect: task.answer.toLowerCase() === answer.toLowerCase(),
    });

    // Check if answer is correct
    if (task.answer.toLowerCase() !== answer.toLowerCase()) {
      console.error("Wrong answer for quiz task:", taskId);
      return false;
    }

    return this.completeTask(userAddress, experienceId, taskId);
  }

  // Complete a QR code task
  completeQRCodeTask(userAddress: string, experienceId: number, taskId: number, qrHash: string): boolean {
    const data = this.readData();
    const experience = data.experiences.find(exp => exp.id === experienceId);

    if (!experience) {
      return false;
    }

    const task = experience.tasks.find(t => t.id === taskId);
    if (!task || task.taskType !== "QR_CODE") {
      return false;
    }

    // Check if QR hash matches
    if (task.data !== qrHash) {
      return false;
    }

    return this.completeTask(userAddress, experienceId, taskId);
  }

  // Complete a check-in task
  completeCheckInTask(userAddress: string, experienceId: number, taskId: number): boolean {
    const data = this.readData();
    const experience = data.experiences.find(exp => exp.id === experienceId);

    if (!experience) {
      return false;
    }

    const task = experience.tasks.find(t => t.id === taskId);
    if (!task || task.taskType !== "CHECK_IN") {
      return false;
    }

    return this.completeTask(userAddress, experienceId, taskId);
  }

  // Complete a photo task (admin only)
  completePhotoTask(userAddress: string, experienceId: number, taskId: number): boolean {
    const data = this.readData();
    const experience = data.experiences.find(exp => exp.id === experienceId);

    if (!experience) {
      return false;
    }

    const task = experience.tasks.find(t => t.id === taskId);
    if (!task || task.taskType !== "PHOTO") {
      return false;
    }

    return this.completeTask(userAddress, experienceId, taskId);
  }

  // Get task by ID
  getTask(experienceId: number, taskId: number): Task | null {
    const experience = this.getExperience(experienceId);
    if (!experience) {
      return null;
    }

    return experience.tasks.find(task => task.id === taskId) || null;
  }

  // Check if task is completed for user
  isTaskCompleted(userAddress: string, experienceId: number, taskId: number): boolean {
    const userProgress = this.getUserProgress(userAddress, experienceId);
    return userProgress.completedTasks.includes(taskId);
  }

  // Get available rewards for a user
  getAvailableRewards(
    userAddress: string,
    experienceId: number,
  ): Array<{
    taskId: number;
    amount: number;
    token: string;
  }> {
    const userProgress = this.getUserProgress(userAddress, experienceId);
    const availableRewards = [];

    if (userProgress.rewards) {
      for (const [taskId, reward] of Object.entries(userProgress.rewards)) {
        if (!reward.claimed) {
          availableRewards.push({
            taskId: parseInt(taskId),
            amount: reward.amount,
            token: reward.token,
          });
        }
      }
    }

    return availableRewards;
  }

  // Mark reward as claimed
  claimReward(userAddress: string, experienceId: number, taskId: number): boolean {
    const data = this.readData();
    const userProgress = data.userProgress[userAddress]?.[experienceId];

    if (!userProgress || !userProgress.rewards || !userProgress.rewards[taskId]) {
      return false;
    }

    if (userProgress.rewards[taskId].claimed) {
      return false; // Already claimed
    }

    userProgress.rewards[taskId].claimed = true;
    userProgress.rewards[taskId].claimedAt = Date.now();
    this.writeData(data);
    return true;
  }

  // Claim NFT reward for completed experience
  claimNFTReward(userAddress: string, experienceId: number): boolean {
    const data = this.readData();
    const userProgress = data.userProgress[userAddress]?.[experienceId];

    if (!userProgress || !userProgress.experienceCompleted) {
      console.log("Cannot claim NFT: experience not completed");
      return false;
    }

    if (userProgress.lastRewardClaimDate) {
      console.log("Cannot claim NFT: already claimed");
      return false;
    }

    // Mark NFT reward as claimed
    userProgress.lastRewardClaimDate = Date.now();
    this.writeData(data);

    console.log("NFT reward claimed successfully for user:", userAddress, "experience:", experienceId);
    return true;
  }
}

// Export singleton instance
export const experienceService = new ExperienceService();
