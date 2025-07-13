import fs from "fs";
import path from "path";

export interface ClubColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  success: string;
  warning: string;
  error: string;
}

export interface ClubBranding {
  slogan: string;
  tagline: string;
  description: string;
}

export interface ClubExperience {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  rewardAmount: number;
  rewardToken: string;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  fullName: string;
  description: string;
  colors: ClubColors;
  logo: string;
  logoAlt: string;
  favicon: string;
  branding: ClubBranding;
  experiences: ClubExperience[];
}

interface ClubData {
  clubs: Club[];
  defaultClub: string;
}

interface CurrentClubData {
  currentClubId: string;
}

class ClubService {
  private dataPath: string;
  private currentClubPath: string;
  private inMemoryClubData: ClubData | null = null;
  private inMemoryCurrentClub: CurrentClubData | null = null;

  constructor() {
    this.dataPath = path.join(process.cwd(), "data", "clubs.json");
    this.currentClubPath = path.join(process.cwd(), "data", "current-club.json");
  }

  private readData(): ClubData {
    // On Vercel, use in-memory data to avoid filesystem issues
    if (process.env.VERCEL && this.inMemoryClubData) {
      return this.inMemoryClubData;
    }

    try {
      const data = fs.readFileSync(this.dataPath, "utf8");
      const parsedData = JSON.parse(data);

      // Cache the data in memory for Vercel
      if (process.env.VERCEL) {
        this.inMemoryClubData = parsedData;
      }

      return parsedData;
    } catch (error) {
      console.error("Error reading club data:", error);
      return { clubs: [], defaultClub: "psg" };
    }
  }

  private readCurrentClub(): CurrentClubData {
    // On Vercel, use in-memory data to avoid filesystem issues
    if (process.env.VERCEL && this.inMemoryCurrentClub) {
      return this.inMemoryCurrentClub;
    }

    try {
      const data = fs.readFileSync(this.currentClubPath, "utf8");
      const parsedData = JSON.parse(data);

      // Cache the data in memory for Vercel
      if (process.env.VERCEL) {
        this.inMemoryCurrentClub = parsedData;
      }

      return parsedData;
    } catch (error) {
      console.error("Error reading current club data:", error);
      return { currentClubId: "psg" };
    }
  }

  private writeCurrentClub(data: CurrentClubData): void {
    // On Vercel, update in-memory data instead of writing to file
    if (process.env.VERCEL) {
      this.inMemoryCurrentClub = data;
      console.log("Updated in-memory current club data on Vercel");
      return;
    }

    try {
      fs.writeFileSync(this.currentClubPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error writing current club data:", error);
    }
  }

  // Get all clubs
  getAllClubs(): Club[] {
    const data = this.readData();
    return data.clubs;
  }

  // Get current club
  getCurrentClub(): Club | null {
    const clubs = this.getAllClubs();
    const currentClubData = this.readCurrentClub();
    return clubs.find(club => club.id === currentClubData.currentClubId) || null;
  }

  // Set current club
  setCurrentClub(clubId: string): boolean {
    const clubs = this.getAllClubs();
    const club = clubs.find(c => c.id === clubId);
    if (club) {
      this.writeCurrentClub({ currentClubId: clubId });
      return true;
    }
    return false;
  }

  // Get club by ID
  getClubById(clubId: string): Club | null {
    const clubs = this.getAllClubs();
    return clubs.find(club => club.id === clubId) || null;
  }

  // Get default club
  getDefaultClub(): Club | null {
    const data = this.readData();
    return this.getClubById(data.defaultClub);
  }

  // Get current club colors
  getCurrentClubColors(): ClubColors | null {
    const club = this.getCurrentClub();
    return club?.colors || null;
  }

  // Get current club branding
  getCurrentClubBranding(): ClubBranding | null {
    const club = this.getCurrentClub();
    return club?.branding || null;
  }

  // Get current club experiences
  getCurrentClubExperiences(): ClubExperience[] {
    const club = this.getCurrentClub();
    return club?.experiences || [];
  }

  // Get CSS variables for current club
  getCurrentClubCSSVariables(): string {
    const colors = this.getCurrentClubColors();
    if (!colors) return "";

    return `
      --club-primary: ${colors.primary};
      --club-secondary: ${colors.secondary};
      --club-accent: ${colors.accent};
      --club-background: ${colors.background};
      --club-text: ${colors.text};
      --club-success: ${colors.success};
      --club-warning: ${colors.warning};
      --club-error: ${colors.error};
    `;
  }
}

// Export singleton instance
export const clubService = new ClubService();
