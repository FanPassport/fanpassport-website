"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ExperienceQuiz } from "~~/components/ExperienceQuiz";
import { ExperienceResults } from "~~/components/ExperienceResults";
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

type PageProps = {
  params: Promise<{ club: string; id: string }>;
};

const ExperiencePageClient = ({ club, id }: { club: string; id: string }) => {
  const { address: connectedAddress } = useAccount();
  const searchParams = useSearchParams();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showClaimButton, setShowClaimButton] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const { clubs, loading: clubsLoading } = useClub();

  // Find the current club based on the URL parameter
  const currentClub = clubs.find(clubData => clubData.id === club);

  // Scaffold-ETH hook for writing to contract
  const { writeContractAsync: writeExperienceNFTAsync } = useScaffoldWriteContract({
    contractName: "ExperienceNFT",
  });

  // Load experience data and user progress
  useEffect(() => {
    const loadExperience = async () => {
      setLoading(true);
      try {
        // Load experience from experiences.json
        const response = await fetch("/data/experiences.json");
        const data = await response.json();

        // Find the experience by ID and club
        const foundExperience = data.experiences.find(
          (exp: Experience) => exp.id === parseInt(id) && exp.clubId === club,
        );

        if (foundExperience) {
          setExperience(foundExperience);

          // Load user progress if connected
          if (connectedAddress) {
            const progress = await hybridExperienceService.getUserProgress(connectedAddress, foundExperience.id);
            setUserProgress(progress);

            // Check if we should show results view
            const viewParam = searchParams.get("view");
            if (viewParam === "results" && progress?.experienceCompleted) {
              setShowResults(true);
            }
          }
        } else {
          setExperience(null);
        }
      } catch (error) {
        console.error("Error loading experience:", error);
        setExperience(null);
      } finally {
        setLoading(false);
      }
    };

    loadExperience();
  }, [club, id, connectedAddress, searchParams]);

  // Handle experience completion
  const handleExperienceCompleted = () => {
    setShowClaimButton(true);
  };

  // Handle show results
  const handleShowResults = () => {
    setShowResults(true);
  };

  // Handle back to experience
  const handleBackToExperience = () => {
    setShowResults(false);
  };

  // Handle claim NFT
  const handleClaimNFT = async () => {
    if (!connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!experience) {
      alert("Experience not found");
      return;
    }

    setClaiming(true);
    try {
      console.log(`Claiming NFT for experience ${experience.id}`);

      // Call the smart contract to mint NFT
      await writeExperienceNFTAsync({
        functionName: "mintExperienceNFT",
        args: [connectedAddress, BigInt(experience.id)],
      });

      alert(`NFT claimed successfully for ${experience.name}!`);
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

  // If club not found, show 404
  if (!clubsLoading && !currentClub) {
    return (
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 max-w-6xl w-full text-center">
          <h1 className="text-4xl font-bold mb-4">Club not found</h1>
          <p className="text-lg mb-8">The club you are looking for does not exist.</p>
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // If experience not found, show 404
  if (!experience) {
    return (
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 max-w-6xl w-full text-center">
          <h1 className="text-4xl font-bold mb-4">Experience not found</h1>
          <p className="text-lg mb-8">The experience you are looking for does not exist.</p>
          <Link href={`/${club}`} className="btn btn-primary">
            Back to {currentClub?.name}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Link href={`/${club}`} className="btn btn-ghost mb-4">
          ← Back to {currentClub?.name}
        </Link>
        <h1 className="text-4xl font-bold mb-4">{experience.name}</h1>
        <p className="text-lg text-base-content/70 mb-8">Complete all tasks to unlock your exclusive NFT</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {showResults ? (
          <ExperienceResults
            experience={experience}
            userProgress={userProgress}
            onBackToExperience={handleBackToExperience}
            onClaimNFT={handleClaimNFT}
            claiming={claiming}
            connectedAddress={connectedAddress}
          />
        ) : showClaimButton ? (
          <div className="bg-base-100 rounded-lg p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4">Experience Completed!</h2>
              <p className="text-base-content/70 mb-6">
                Congratulations! You have completed all tasks. Now you can claim your exclusive NFT.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleShowResults} className="btn btn-outline btn-lg">
                  📊 View Results
                </button>
                <button
                  onClick={handleClaimNFT}
                  disabled={claiming || !connectedAddress}
                  className="btn btn-primary btn-lg"
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
              </div>

              <div className="text-center text-sm text-base-content/70">
                {connectedAddress
                  ? "Your NFT will be uniquely generated and stored on the blockchain."
                  : "Connect your wallet to claim your NFT"}
              </div>
            </div>
          </div>
        ) : (
          <ExperienceQuiz experience={experience} onExperienceCompleted={handleExperienceCompleted} />
        )}
      </div>
    </div>
  );
};

const ExperiencePage: NextPage<PageProps> = async ({ params }) => {
  const { club, id } = await params;
  return <ExperiencePageClient club={club} id={id} />;
};

export default ExperiencePage;
