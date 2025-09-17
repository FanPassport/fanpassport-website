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

interface Match {
  id: string;
  status: string;
  competition: string;
  kickoff: string;
  venue: string;
  hometeam: string;
  awayteam: string;
  score: string | null;
  ticket?: string;
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
  const [matches, setMatches] = useState<Match[]>([]);
  const { clubs, loading: clubsLoading } = useClub();

  // Scaffold-ETH hook for writing to contract
  const { writeContractAsync: writeExperienceNFTAsync } = useScaffoldWriteContract({
    contractName: "ExperienceNFT",
  });

  // Hook for MatchNFT contract (we'll add this to external contracts)
  const { writeContractAsync: writeMatchNFTAsync } = useScaffoldWriteContract({
    contractName: "MatchNFT",
  });

  // Find the current club based on the URL parameter
  const currentClub = clubs.find(clubData => clubData.id === club);

  // Filter matches for this club
  const clubMatches = matches.filter(match => match.hometeam === club || match.awayteam === club);

  // Load experiences and user progress
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load experiences for this club
        const response = await fetch("/data/experiences.json");
        const data = await response.json();
        const clubExperiences = data.experiences.filter((exp: Experience) => exp.clubId === club);
        setExperiences(clubExperiences);

        // Load matches data
        const matchesResponse = await fetch("/data/matches.json");
        const matchesData = await matchesResponse.json();
        setMatches(matchesData.matches);

        // Load user progress for each experience (only if wallet connected)
        if (connectedAddress) {
          const progressData: Record<number, UserProgress> = {};
          for (const experience of clubExperiences) {
            const progress = await hybridExperienceService.getUserProgress(connectedAddress, experience.id);
            if (progress) {
              progressData[experience.id] = progress;
            }
          }
          setUserProgress(progressData);
        }
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

  const handleClaimMatchNFT = async (match: Match) => {
    if (!connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    // Check if match is finished
    if (match.status !== "finished") {
      alert("You can only claim NFTs for finished matches!");
      return;
    }

    setClaiming(true);
    try {
      console.log(`Claiming match NFT for ${match.id}`);

      // Generate a simple token URI (in production, this would point to IPFS or similar)
      const tokenURI = `https://example.com/metadata/${match.id}`;

      // Call the smart contract to mint match NFT
      await writeMatchNFTAsync({
        functionName: "mintMatchNFT",
        args: [
          connectedAddress,
          match.id,
          match.competition,
          match.kickoff,
          match.venue,
          match.hometeam,
          match.awayteam,
          match.score || "",
          match.status,
          tokenURI,
        ],
      });

      alert(`Match NFT claimed successfully for ${match.hometeam.toUpperCase()} vs ${match.awayteam.toUpperCase()}!`);
    } catch (error) {
      console.error("Error claiming match NFT:", error);
      alert("Error claiming match NFT. Please try again.");
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

      {/* Matches Section */}
      {clubMatches.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Matches</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clubMatches.map(match => {
              const kickoffDate = new Date(match.kickoff);

              return (
                <div key={match.id} className="bg-base-100 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-center mb-4">
                    <div className="text-sm text-base-content/70 mb-2">
                      {match.competition.replace("-", " ").toUpperCase()} • {kickoffDate.getDate()}{" "}
                      {kickoffDate.toLocaleDateString("en-US", { month: "short" })} {kickoffDate.getFullYear()}
                    </div>
                    <div className="text-lg font-semibold mb-2">
                      {match.hometeam.toUpperCase()} vs {match.awayteam.toUpperCase()}
                    </div>
                    <div className="text-sm text-base-content/70">
                      {kickoffDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {match.venue}
                    </div>
                  </div>

                  <div className="text-center">
                    {match.status === "finished" ? (
                      <div className="text-xl font-bold text-success mb-4">{match.score}</div>
                    ) : (
                      <div className="text-lg font-semibold text-primary mb-4">
                        {match.status === "scheduled" ? "Scheduled" : match.status}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-center">
                      {match.status === "scheduled" && match.ticket ? (
                        <a
                          href={match.ticket}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          🎫 Get Tickets
                        </a>
                      ) : match.status === "finished" ? (
                        <button
                          onClick={() => handleClaimMatchNFT(match)}
                          disabled={claiming || !connectedAddress}
                          className="btn btn-secondary btn-sm"
                        >
                          {claiming ? (
                            <>
                              <div className="loading loading-spinner loading-sm"></div>
                              Claiming...
                            </>
                          ) : !connectedAddress ? (
                            "🔗 Connect Wallet"
                          ) : (
                            "🏆 Claim Match NFT"
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                <div className="text-center space-y-2">
                  {isCompleted ? (
                    <>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link
                          href={`/${club}/experiences/${experience.id}?view=results`}
                          className="btn btn-outline flex-1"
                        >
                          📊 View Results
                        </Link>
                        <button
                          onClick={() => handleClaimNFT(experience.id)}
                          disabled={claiming || !connectedAddress}
                          className="btn btn-success flex-1"
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
                    </>
                  ) : connectedAddress ? (
                    <Link href={`/${club}/experiences/${experience.id}`} className="btn btn-primary w-full">
                      🚀 Start Experience
                    </Link>
                  ) : (
                    <button disabled className="btn btn-primary w-full">
                      🔗 Connect Wallet
                    </button>
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
