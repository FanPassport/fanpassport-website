import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Club } from "~~/services/clubService";

// Default club data to prevent hydration mismatch
const defaultClub: Club = {
  id: "psg",
  name: "Paris Saint-Germain",
  shortName: "PSG",
  fullName: "Paris Saint-Germain Football Club",
  description: "The club of the French capital",
  colors: {
    primary: "#004D98",
    secondary: "#DA291C",
    accent: "#FFFFFF",
    background: "#1A1A1A",
    text: "#FFFFFF",
    success: "#00C851",
    warning: "#FFB300",
    error: "#FF4444",
  },
  logo: "/assets/clubs/Token-PSG.svg",
  logoAlt: "/assets/clubs/Token-PSG.svg",
  favicon: "/favicons/psg-favicon.ico",
  branding: {
    slogan: "Ici c'est Paris",
    tagline: "Unlock your PSG VIP experience",
    description: "The Web3 pass that takes you from fan to insider.",
  },
  experiences: [],
};

export const useClub = () => {
  const pathname = usePathname();
  const [clubs, setClubs] = useState<Club[]>([defaultClub]);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load clubs and current club on mount
  useEffect(() => {
    if (!mounted) return;

    const loadClubs = async () => {
      console.log(`🔄 Loading clubs`);
      setLoading(true);
      try {
        // If we're on the homepage, clear any stored club selection
        if (pathname === "/" && typeof window !== "undefined") {
          localStorage.removeItem("selectedClubId");
          console.log(`🏠 On homepage, cleared localStorage`);
        }

        // Check localStorage first
        const storedClubId = typeof window !== "undefined" ? localStorage.getItem("selectedClubId") : null;
        console.log(`📱 localStorage clubId: ${storedClubId}`);

        const response = await fetch("/api/clubs");
        if (response.ok) {
          const data = await response.json();
          console.log(`🌐 API response currentClub: ${data.currentClub?.id}`);

          // The API returns an object with clubs array, not just an array
          const clubsArray = data.clubs || data || [defaultClub];
          setClubs(clubsArray);

          // Only set current club if there's a stored club ID and we're not on homepage
          if (storedClubId && pathname !== "/") {
            const clubsArray = data.clubs || data || [];
            const storedClub = clubsArray.find((club: Club) => club.id === storedClubId);
            if (storedClub) {
              setCurrentClub(storedClub);
              console.log(`✅ Using localStorage club: ${storedClub.name}`);
            } else {
              // If stored club not found, don't set any club
              setCurrentClub(null);
              console.log(`❌ Stored club not found: ${storedClubId}`);
            }
          } else {
            // No stored club or on homepage, don't set any club by default
            setCurrentClub(null);
            console.log(`📡 No stored club or on homepage, no default selection`);
          }
        }
      } catch (error) {
        console.error("Error loading clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClubs();
  }, [mounted, pathname]);

  // Change current club
  const changeClub = useCallback(
    async (clubId: string) => {
      console.log(`🔄 Starting club change to: ${clubId}`);

      // Find the club in our clubs list
      const newClub = clubs.find(club => club.id === clubId);
      if (!newClub) {
        console.error("Club not found in clubs list:", clubId);
        return false;
      }

      console.log(`📝 Found club: ${newClub.name}`);

      // Store in localStorage immediately
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedClubId", clubId);
        console.log(`💾 Saved to localStorage: ${clubId}`);
      }

      // Update server in background
      try {
        const response = await fetch("/api/clubs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clubId }),
        });

        if (response.ok) {
          console.log("✅ Club changed successfully on server");
        } else {
          console.error("Failed to change club on server, status:", response.status);
        }
      } catch (error) {
        console.error("Error changing club on server:", error);
      }

      // Set the current club immediately
      setCurrentClub(newClub);

      return true;
    },
    [clubs],
  );

  return {
    clubs,
    currentClub,
    loading: loading || !mounted,
    changeClub,
  };
};
