"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useClub } from "~~/hooks/useClub";
import { hybridExperienceService } from "~~/services/hybridExperienceService";

interface Task {
  id: number;
  name: string;
  description: string;
  taskType: string;
  data: string;
  answer: string;
  isCompleted: boolean;
}

interface Experience {
  id: number;
  clubId: string;
  name: string;
  isActive: boolean;
  rewardAmount: number;
  rewardToken: string;
  tasks: Task[];
}

interface UserProgress {
  experienceStarted: boolean;
  experienceCompleted: boolean;
  completedTasks: number[];
}

type PageProps = {
  params: Promise<{ club: string }>;
};

const ClubPageClient = ({ club }: { club: string }) => {
  const { address: connectedAddress } = useAccount();
  const [claiming, setClaiming] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [userProgress, setUserProgress] = useState<Record<number, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const { clubs, loading: clubsLoading } = useClub();

  // Scaffold-ETH hook for writing to contract
  const { writeContractAsync: writeExperienceNFTAsync } = useScaffoldWriteContract({
    contractName: "ExperienceNFT",
  });

  // Find the current club based on the URL parameter
  const currentClub = clubs.find(clubData => clubData.id === club);

  // Load experiences and user progress
  useEffect(() => {
    const loadData = async () => {
      if (!connectedAddress) {
        setLoading(false);
        return;
      }

      try {
        // Load experiences for this club
        const response = await fetch("/data/experiences.json");
        const data = await response.json();
        const clubExperiences = data.experiences.filter((exp: Experience) => exp.clubId === club);
        setExperiences(clubExperiences);

        // Load user progress for each experience
        const progressData: Record<number, UserProgress> = {};
        for (const experience of clubExperiences) {
          const progress = await hybridExperienceService.getUserProgress(connectedAddress, experience.id);
          if (progress) {
            progressData[experience.id] = progress;
          }
        }
        setUserProgress(progressData);
      } catch (error) {
        console.error("Error loading experiences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [connectedAddress, club]);

  const handleClaimNFT = async (experienceId: number) => {
    if (!connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    // Check if experience is completed
    const progress = userProgress[experienceId];
    if (!progress?.experienceCompleted) {
      alert("You must complete all tasks in the experience before claiming the NFT!");
      return;
    }

    setClaiming(true);
    try {
      console.log(`Claiming NFT for experience ${experienceId}`);

      // Call the smart contract to mint NFT
      await writeExperienceNFTAsync({
        functionName: "mintExperienceNFT",
        args: [connectedAddress, BigInt(experienceId)],
      });

      alert(`NFT claimed successfully for experience ${experienceId}!`);
    } catch (error) {
      console.error("Error claiming NFT:", error);
      alert("Error claiming NFT. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  if (clubsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!currentClub) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Club not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{currentClub.name}</h1>
        <p className="text-lg text-base-content/70">{currentClub.branding.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {experiences.map(experience => {
          const progress = userProgress[experience.id];
          const isCompleted = progress?.experienceCompleted || false;
          const completedTasks = progress?.completedTasks.length || 0;
          const totalTasks = experience.tasks.length;

          return (
            <div key={experience.id} className="bg-base-100 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-2">{experience.name}</h3>
                <p className="text-base-content/70 mb-4">Complete all {totalTasks} tasks to claim your exclusive NFT</p>

                {/* Progress indicator */}
                {connectedAddress && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-base-content/70">
                        {completedTasks} / {totalTasks} tasks
                      </span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  {isCompleted ? (
                    <button
                      onClick={() => handleClaimNFT(experience.id)}
                      disabled={claiming || !connectedAddress}
                      className="btn btn-success w-full"
                    >
                      {claiming ? (
                        <>
                          <div className="loading loading-spinner loading-sm"></div>
                          Claiming NFT...
                        </>
                      ) : !connectedAddress ? (
                        "🔗 Connect Wallet"
                      ) : (
                        "🎁 Claim NFT"
                      )}
                    </button>
                  ) : (
                    <Link href={`/${club}/experiences/${experience.id}`} className="btn btn-primary w-full">
                      {connectedAddress ? "🚀 Start Experience" : "🔗 Connect Wallet"}
                    </Link>
                  )}
                </div>

                <div className="text-center text-sm text-base-content/70">
                  {!connectedAddress
                    ? "Connect your wallet to start the experience"
                    : isCompleted
                      ? "Experience completed! Claim your NFT now."
                      : `Complete all ${totalTasks} tasks to unlock NFT claiming`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ClubPage: NextPage<PageProps> = async ({ params }) => {
  const { club } = await params;
  return <ClubPageClient club={club} />;
};

export default ClubPage;
