"use client";

import { useEffect } from "react";
import { hybridExperienceService } from "~~/services/hybridExperienceService";

export const ExperienceDataInitializer = () => {
  useEffect(() => {
    const initializeData = async () => {
      try {
        await hybridExperienceService.initializeData();
      } catch (error) {
        console.warn("Failed to initialize experience data:", error);
      }
    };

    initializeData();
  }, []);

  return null; // This component doesn't render anything
};
