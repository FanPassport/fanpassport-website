"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useClub } from "~~/hooks/useClub";

export const ClubSelector = () => {
  const { clubs, currentClub, loading, changeClub } = useClub();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClubChange = async (clubId: string) => {
    await changeClub(clubId);
    // Close dropdown
    setIsOpen(false);
    // Navigate to the club page
    router.replace(`/${clubId}`);
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
        <span className="text-sm">...</span>
      </div>
    );
  }

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="loading loading-spinner loading-sm"></div>
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  // If no club is selected, show a different state
  if (!currentClub) {
    return (
      <div className="dropdown dropdown-end" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Choose a club</span>
          </div>
          <ChevronDownIcon className="h-4 w-4" />
        </div>

        <ul
          tabIndex={0}
          className={`dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 ${isOpen ? "dropdown-open" : ""}`}
        >
          {clubs.map(club => (
            <li key={club.id}>
              <button
                className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg"
                onClick={() => handleClubChange(club.id)}
              >
                <div className="w-4 h-4 relative">
                  <Image
                    src={club.logo}
                    alt={`${club.name} logo`}
                    width={16}
                    height={16}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">{club.name}</span>
                  <span className="text-xs text-base-content/70">{club.shortName}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="dropdown dropdown-end" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative">
            <Image
              src={currentClub.logo}
              alt={`${currentClub.name} logo`}
              width={24}
              height={24}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-sm font-medium">{currentClub.shortName}</span>
        </div>
        <ChevronDownIcon className="h-4 w-4" />
      </div>

      <ul
        tabIndex={0}
        className={`dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 ${isOpen ? "dropdown-open" : ""}`}
      >
        {clubs.map(club => (
          <li key={club.id}>
            <button
              className={`flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg ${
                currentClub.id === club.id ? "bg-base-200" : ""
              }`}
              onClick={() => handleClubChange(club.id)}
            >
              <div className="w-4 h-4 relative">
                <Image
                  src={club.logo}
                  alt={`${club.name} logo`}
                  width={16}
                  height={16}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">{club.name}</span>
                <span className="text-xs text-base-content/70">{club.shortName}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
