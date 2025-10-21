"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface Club {
  id: string;
  name: string;
  shortName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo: string;
}

interface NFT {
  tokenId: number;
  experienceId: number;
  name: string;
  image: string;
  description: string;
  owner: string;
  clubId: string;
  club?: Club;
}

const MarketplacePage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [allNFTs, setAllNFTs] = useState<NFT[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [useContractImages] = useState(true);

  // Get total supply of NFTs
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "ExperienceNFT",
    functionName: "totalSupply",
  });

  // Load clubs data
  useEffect(() => {
    const loadClubsIDY3247384 = async () => {
      console.log(`🔄 Loading clubs data...`);
      try {
        const response = await fetch("/data/clubs.json");
        const data = await response.json();
        console.log(`📋 Loaded clubs data:`, data);
        console.log(
          `🏆 Found ${data.clubs.length} clubs:`,
          data.clubs.map((c: any) => ({ id: c.id, name: c.name })),
        );
        setClubs(data.clubs);
      } catch (error) {
        console.error(`❌ Error loading clubs:`, error);
        setError("Failed to load clubs data");
      }
    };

    loadClubsIDY3247384();
  }, []);

  // Load all NFTs with improved error handling and retry mechanism
  useEffect(() => {
    const loadAllNFTs = async () => {
      console.log(
        `🔄 loadAllNFTs called with totalSupply: ${totalSupply}, clubs loaded: ${clubs.length}, retry: ${retryCount}`,
      );

      if (!totalSupply || totalSupply === 0n) {
        console.log(`⚠️ No totalSupply or totalSupply is 0, setting empty NFTs array`);
        setAllNFTs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const nfts: NFT[] = [];

      try {
        // Load experiences data to get club mapping
        console.log(`📚 Loading experiences data...`);
        const experiencesResponse = await fetch("/data/experiences.json");
        const experiencesData = await experiencesResponse.json();
        const experiences = experiencesData.experiences;
        console.log(`📚 Loaded ${experiences.length} experiences`);

        // Get all NFTs using the new efficient API
        console.log(`🎯 Total supply: ${Number(totalSupply)}, will load all NFTs at once`);

        const response = await fetch("/api/contract/getAllNFTs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const { nfts: contractNFTs } = await response.json();
          console.log(`📊 Received ${contractNFTs.length} NFTs from contract`);

          // Process each NFT from the contract
          for (const contractNFT of contractNFTs) {
            try {
              const { tokenId, experienceId, owner } = contractNFT;
              console.log(`🔍 Processing NFT #${tokenId} with experienceId ${experienceId} owned by ${owner}`);

              // Get metadata from smart contract (same as MetaMask)
              const metadataResponse = await fetch(`/api/contract/getNFTMetadata/${tokenId}`);
              let contractMetadata = null;

              if (metadataResponse.ok) {
                contractMetadata = await metadataResponse.json();
                console.log(`📄 Contract metadata for NFT #${tokenId}:`, contractMetadata);
              } else {
                console.warn(`⚠️ Could not get contract metadata for NFT #${tokenId}, using fallback`);
              }

              // Find the experience and its club for additional info
              const experience = experiences.find((exp: any) => exp.id === experienceId);
              console.log(`🎯 Found experience for ID ${experienceId}:`, experience);

              const clubId = experience?.clubId || "unknown";
              console.log(`🏆 Club ID from experience: ${clubId}`);

              console.log(
                `📋 Available clubs:`,
                clubs.map(c => ({ id: c.id, name: c.name })),
              );
              const club = clubs.find(c => c.id === clubId);
              console.log(`🏆 Found club for ID ${clubId}:`, club);

              // Use contract metadata if available and useContractImages is true, otherwise fallback to generated metadata
              const metadata =
                contractMetadata && useContractImages
                  ? contractMetadata
                  : {
                      name: `${club?.name || "Unknown Club"} - Experience #${experienceId}`,
                      description: `NFT reward for completing ${experience?.name || `experience #${experienceId}`}`,
                      image: generateNFTImage(experienceId, club),
                    };

              console.log(`📝 Final metadata for NFT #${tokenId}:`, metadata);

              nfts.push({
                tokenId,
                experienceId,
                name: metadata.name,
                description: metadata.description,
                image: metadata.image,
                owner: owner,
                clubId: clubId,
                club: club,
              });

              console.log(`✅ Successfully processed NFT #${tokenId}`);
            } catch (error) {
              console.error(`❌ Error processing NFT ${contractNFT.tokenId}:`, error);
              // Continue with other NFTs even if one fails
            }
          }
        } else {
          const errorData = await response.json();
          console.error(`❌ API error getting all NFTs:`, errorData);
          setError("Failed to load NFTs from contract. Please try refreshing the page.");
        }
      } catch (error) {
        console.error(`❌ Error loading all NFTs:`, error);
        setError("Failed to load NFTs. Please check your connection and try again.");
      }

      console.log(`✅ Loaded ${nfts.length} NFTs total out of ${Number(totalSupply)} expected`);

      if (nfts.length === 0 && Number(totalSupply) > 0) {
        setError("No NFTs found despite total supply indicating they should exist. Please try refreshing.");
      }

      setAllNFTs(nfts);
      setLoading(false);
    };

    loadAllNFTs();
  }, [totalSupply, clubs, retryCount, useContractImages]);

  // Retry function
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };

  // Generate NFT image with club logo
  const generateNFTImage = (experienceId: number, club?: Club) => {
    console.log(`🔍 generateNFTImage called for experienceId: ${experienceId}, club:`, club);

    if (!club) {
      console.log(`⚠️ FALLBACK: No club found for experience ${experienceId}, using generic image`);
      // Fallback to generic image
      const genericSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
          <rect width="400" height="400" fill="#333"/>
          <text x="200" y="200" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">Experience #${experienceId}</text>
          <text x="200" y="350" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.8">Fan Passport</text>
        </svg>
      `;
      const encodedSvg = btoa(unescape(encodeURIComponent(genericSvg)));
      console.log(`📄 Generated fallback image for experience ${experienceId}`);
      return `data:image/svg+xml;base64,${encodedSvg}`;
    }

    console.log(`✅ Using club data for ${club.shortName} (${club.id})`);
    console.log(`🎨 Club colors:`, club.colors);

    // Create SVG with club colors and logo
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="grad-${club.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${club.colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${club.colors.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#grad-${club.id})"/>
        <circle cx="200" cy="150" r="60" fill="${club.colors.accent}" opacity="0.3"/>
        <text x="200" y="200" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">${club.shortName}</text>
        <text x="200" y="230" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">Experience #${experienceId}</text>
        <text x="200" y="350" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.8">Fan Passport</text>
      </svg>
    `;

    // Properly encode the SVG for base64
    const encodedSvg = btoa(unescape(encodeURIComponent(svg)));
    console.log(`🎨 Generated custom image for club ${club.shortName}, experience ${experienceId}`);
    console.log(`📄 Image data: data:image/svg+xml;base64,${encodedSvg.substring(0, 100)}...`);

    return `data:image/svg+xml;base64,${encodedSvg}`;
  };

  // Regenerate NFT metadata for existing tokens
  const regenerateNFTMetadata = async (tokenId: number) => {
    try {
      console.log(`🔄 Starting regeneration for NFT #${tokenId}`);

      // Get the current NFT
      const nft = allNFTs.find(n => n.tokenId === tokenId);
      if (!nft) {
        console.error(`❌ NFT with token ID ${tokenId} not found`);
        return;
      }

      console.log(`📋 Current NFT data:`, nft);

      // Load experiences data to get updated club mapping
      const experiencesResponse = await fetch("/data/experiences.json");
      const experiencesData = await experiencesResponse.json();
      const experiences = experiencesData.experiences;

      console.log(`📚 Loaded ${experiences.length} experiences from experiences.json`);
      console.log(`🔍 Looking for experience with ID: ${nft.experienceId}`);

      // Find the experience and its club
      const experience = experiences.find((exp: any) => exp.id === nft.experienceId);
      console.log(`🎯 Found experience:`, experience);

      const clubId = experience?.clubId || "unknown";
      console.log(`🏆 Club ID from experience: ${clubId}`);

      console.log(
        `📋 Available clubs:`,
        clubs.map(c => ({ id: c.id, name: c.name })),
      );
      const club = clubs.find(c => c.id === clubId);
      console.log(`🏆 Found club:`, club);

      // Generate new metadata
      const newMetadata = {
        name: `${club?.name || "Unknown Club"} - Experience #${nft.experienceId}`,
        description: `NFT reward for completing ${experience?.name || `experience #${nft.experienceId}`}`,
        image: generateNFTImage(nft.experienceId, club),
        attributes: [
          {
            trait_type: "Club",
            value: club?.name || "Unknown",
          },
          {
            trait_type: "Experience ID",
            value: nft.experienceId,
          },
          {
            trait_type: "Token ID",
            value: tokenId,
          },
          {
            trait_type: "Collection",
            value: "Fan Passport",
          },
        ],
      };

      console.log(`📝 Generated new metadata:`, newMetadata);

      // Update the NFT in the local state
      const updatedNFTs = allNFTs.map(n =>
        n.tokenId === tokenId
          ? {
              ...n,
              name: newMetadata.name,
              description: newMetadata.description,
              image: newMetadata.image,
              clubId: clubId,
              club: club,
            }
          : n,
      );

      setAllNFTs(updatedNFTs);
      console.log(`✅ Successfully regenerated metadata for NFT #${tokenId}`);

      // Here you could also save the metadata to IPFS or your backend
      // await saveMetadataToIPFS(tokenId, newMetadata);
    } catch (error) {
      console.error(`❌ Error regenerating NFT ${tokenId}:`, error);
    }
  };

  // Regenerate all NFT metadata
  const regenerateAllNFTs = async () => {
    console.log("Starting regeneration of all NFTs...");

    for (const nft of allNFTs) {
      await regenerateNFTMetadata(nft.tokenId);
      // Add a small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log("Completed regeneration of all NFTs");
  };

  // Filter NFTs based on current filter
  const filteredNFTs =
    filter === "mine" && connectedAddress
      ? allNFTs.filter(nft => nft.owner?.toLowerCase() === connectedAddress?.toLowerCase())
      : allNFTs;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">NFT Marketplace</h1>
        <p className="text-lg text-base-content/70 mb-6">Discover all Fan Passport NFTs from the community</p>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6 max-w-2xl mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Error Loading NFTs</h3>
              <div className="text-xs">{error}</div>
            </div>
            <button onClick={handleRetry} className="btn btn-sm btn-outline">
              🔄 Retry
            </button>
          </div>
        )}

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`btn ${filter === "all" ? "btn-primary" : "btn-outline"}`}
          >
            All NFTs ({allNFTs.length})
          </button>
          {isConnected && (
            <button
              onClick={() => setFilter("mine")}
              className={`btn ${filter === "mine" ? "btn-primary" : "btn-outline"}`}
            >
              My NFTs ({allNFTs.filter(nft => nft.owner?.toLowerCase() === connectedAddress?.toLowerCase()).length})
            </button>
          )}
        </div>

        {/* Debug Info */}
        {/* <div className="text-sm text-base-content/60 mb-4">
          Total Supply: {totalSupply?.toString() || "Loading..."} | 
          Loaded NFTs: {allNFTs.length} | 
          Retry Count: {retryCount} |
          <label className="flex items-center gap-2 ml-4">
            <input
              type="checkbox"
              checked={useContractImages}
              onChange={(e) => setUseContractImages(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span>Use Contract Images (MetaMask style)</span>
          </label>
        </div> */}

        {/* Regeneration Controls */}
        {allNFTs.length > 0 && (
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={regenerateAllNFTs}
              className="btn btn-secondary btn-sm"
              title="Regenerate all NFT metadata with new club logos"
            >
              🔄 Regenerate All NFTs
            </button>
            <button
              onClick={() => {
                const myNFTs = allNFTs.filter(nft => nft.owner?.toLowerCase() === connectedAddress?.toLowerCase());
                myNFTs.forEach(nft => regenerateNFTMetadata(nft.tokenId));
              }}
              className="btn btn-accent btn-sm"
              title="Regenerate your NFT metadata"
              disabled={!isConnected}
            >
              🎨 Update My NFTs
            </button>
          </div>
        )}

        {isConnected && (
          <div className="text-sm text-base-content/70">
            Connected: <Address address={connectedAddress} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : filteredNFTs.length === 0 ? (
        <div className="text-center">
          <div className="bg-base-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-xl font-bold mb-2">No NFTs Available</h2>
            <p className="text-base-content/70 mb-4">
              {filter === "mine"
                ? "You don&apos;t own any NFTs yet. Complete experiences to earn exclusive NFTs!"
                : "No NFTs have been minted yet. Be the first to complete an experience!"}
            </p>
            <Link href="/psg" className="btn btn-primary">
              Explore Experiences
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-primary/20 backdrop-blur-sm">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-24 h-24 bg-secondary rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-1/3 w-20 h-20 bg-accent rounded-full blur-xl"></div>
              </div>

              {/* Stats Content */}
              <div className="relative z-10 stats stats-vertical lg:stats-horizontal shadow-xl bg-base-100/80 backdrop-blur-sm border-0">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-base-content/70">Total NFTs</div>
                  <div className="stat-value text-primary">{allNFTs.length}</div>
                  <div className="stat-desc text-base-content/60">Minted on the platform</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-base-content/70">Unique Owners</div>
                  <div className="stat-value text-secondary">
                    {new Set(allNFTs.map(nft => nft.owner?.toLowerCase())).size}
                  </div>
                  <div className="stat-desc text-base-content/60">Active collectors</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-accent">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-base-content/70">Experiences</div>
                  <div className="stat-value text-accent">{new Set(allNFTs.map(nft => nft.experienceId)).size}</div>
                  <div className="stat-desc text-base-content/60">Different experiences</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNFTs.map(nft => (
              <div
                key={nft.tokenId}
                className="bg-base-100 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow flex flex-col"
              >
                <div className="text-center mb-4">
                  {/* NFT Image Container - Perfect Square */}
                  <div className="nft-image-container mb-4">
                    {/* Generated NFT Image */}
                    <img
                      src={nft.image}
                      alt={`NFT ${nft.tokenId}`}
                      className="nft-image"
                      onError={e => {
                        // Fallback to emoji if image fails to load
                        console.log(`Image failed to load for NFT ${nft.tokenId}:`, nft.image);
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback = target.parentElement?.querySelector(".nft-image-fallback") as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                      onLoad={() => {
                        console.log(`Image loaded successfully for NFT ${nft.tokenId}`);
                      }}
                    />

                    {/* Fallback Emoji - Only shows if image fails */}
                    <div
                      className="nft-image-fallback fallback-emoji"
                      style={{
                        display: "none",
                        background: nft.club
                          ? `linear-gradient(135deg, ${nft.club.colors.primary}, ${nft.club.colors.secondary})`
                          : "linear-gradient(135deg, #666, #999)",
                      }}
                    >
                      {nft.club?.shortName === "PSG"
                        ? "🔴"
                        : nft.club?.shortName === "MON"
                          ? "⚪"
                          : nft.club?.shortName === "BAR"
                            ? "🔵"
                            : nft.club?.shortName === "ACM"
                              ? "🔴"
                              : nft.club?.shortName === "JUV"
                                ? "⚫"
                                : nft.club?.shortName === "NAP"
                                  ? "🟢"
                                  : "🎖️"}
                    </div>

                    {/* Club Badge */}
                    {nft.club && (
                      <div
                        className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white z-10"
                        style={{ backgroundColor: nft.club.colors.accent }}
                      >
                        {nft.club.shortName}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-2">{nft.name}</h3>
                  <p className="text-sm text-base-content/70 mb-2">{nft.description}</p>

                  {/* Club Info */}
                  {nft.club && (
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: nft.club.colors.primary }}></div>
                      <span className="text-xs font-medium text-base-content/70">{nft.club.name}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-base-content/60">
                    <span>Token #{nft.tokenId}</span>
                    <span>Exp #{nft.experienceId}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Token ID:</span>
                    <span className="font-mono">{nft.tokenId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Experience ID:</span>
                    <span className="font-mono">{nft.experienceId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Owner:</span>
                    <Address address={nft.owner} />
                  </div>
                  {isConnected && nft.owner?.toLowerCase() === connectedAddress?.toLowerCase() && (
                    <div className="flex items-center gap-2">
                      <div className="badge badge-success">Yours</div>
                      <button
                        onClick={() => regenerateNFTMetadata(nft.tokenId)}
                        className="btn btn-xs btn-outline"
                        title="Regenerate this NFT with new club logo"
                      >
                        🔄
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MarketplacePage;
