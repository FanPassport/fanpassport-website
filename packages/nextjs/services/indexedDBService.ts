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

class IndexedDBService {
  private dbName = "FanAIPassportDB";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create experiences store
        if (!db.objectStoreNames.contains("experiences")) {
          const experiencesStore = db.createObjectStore("experiences", { keyPath: "id" });
          experiencesStore.createIndex("clubId", "clubId", { unique: false });
        }

        // Create userProgress store
        if (!db.objectStoreNames.contains("userProgress")) {
          db.createObjectStore("userProgress", { keyPath: ["userAddress", "experienceId"] });
        }

        // Create currentClub store
        if (!db.objectStoreNames.contains("currentClub")) {
          db.createObjectStore("currentClub", { keyPath: "id" });
        }
      };
    });
  }

  async getExperiences(): Promise<Experience[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["experiences"], "readonly");
      const store = transaction.objectStore("experiences");
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const experiences = request.result as Experience[];
        resolve(experiences);
      };
    });
  }

  async saveExperiences(experiences: Experience[]): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["experiences"], "readwrite");
      const store = transaction.objectStore("experiences");

      // Clear existing data
      const clearRequest = store.clear();
      clearRequest.onerror = () => reject(clearRequest.error);

      clearRequest.onsuccess = () => {
        // Add new experiences
        let completed = 0;
        const total = experiences.length;

        if (total === 0) {
          resolve();
          return;
        }

        experiences.forEach(experience => {
          const addRequest = store.add(experience);
          addRequest.onerror = () => reject(addRequest.error);
          addRequest.onsuccess = () => {
            completed++;
            if (completed === total) resolve();
          };
        });
      };
    });
  }

  async getUserProgress(userAddress: string, experienceId: number): Promise<UserProgress | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["userProgress"], "readonly");
      const store = transaction.objectStore("userProgress");
      const request = store.get([userAddress, experienceId]);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  async saveUserProgress(userAddress: string, experienceId: number, progress: UserProgress): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["userProgress"], "readwrite");
      const store = transaction.objectStore("userProgress");
      const request = store.put({
        userAddress,
        experienceId,
        ...progress,
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCurrentClub(): Promise<string | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["currentClub"], "readonly");
      const store = transaction.objectStore("currentClub");
      const request = store.get("current");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result?.clubId || null);
      };
    });
  }

  async setCurrentClub(clubId: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["currentClub"], "readwrite");
      const store = transaction.objectStore("currentClub");
      const request = store.put({ id: "current", clubId });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.initDB();
      return true;
    } catch {
      return false;
    }
  }
}

export const indexedDBService = new IndexedDBService();
