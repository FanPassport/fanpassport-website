"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface NFT {
  tokenId: number;
  experienceId: number;
  name: string;
  image: string;
  description: string;
}

const GalleryPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user's NFT balance
  const { data: userBalance } = useScaffoldReadContract({
    contractName: "ExperienceNFT",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Get total supply to know how many NFTs exist
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "ExperienceNFT",
    functionName: "totalSupply",
  });

  // Load user's NFTs
  useEffect(() => {
    const loadUserNFTs = async () => {
      if (!connectedAddress || !isConnected || !userBalance || !totalSupply) {
        setUserNFTs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const nfts: NFT[] = [];

      try {
        // Get all NFTs and check which ones belong to the user
        for (let tokenId = 1; tokenId <= Number(totalSupply); tokenId++) {
          try {
            // Get owner of this token on-chain using a direct contract call
            const response = await fetch("/api/contract/ownerOf", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ tokenId }),
            });

            if (response.ok) {
              const { owner } = await response.json();

              // Check if this NFT belongs to the user
              if (owner?.toLowerCase() === connectedAddress?.toLowerCase()) {
                // Get experience ID for this token (experienceId = tokenId for simplicity)
                const experienceId = tokenId;

                // Generate NFT metadata
                const metadata = {
                  name: `Experience #${experienceId} - Token #${tokenId}`,
                  description: `NFT reward for completing experience #${experienceId}`,
                  image: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwMDAiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RXhwZXJpZW5jZSAj${experienceId}</dGV4dD48L3N2Zz4=`,
                };

                nfts.push({
                  tokenId,
                  experienceId,
                  name: metadata.name,
                  image: metadata.image,
                  description: metadata.description,
                });
              }
            }
          } catch (error) {
            console.error(`Error loading NFT ${tokenId}:`, error);
          }
        }
      } catch (error) {
        console.error("Error loading user NFTs:", error);
      }

      setUserNFTs(nfts);
      setLoading(false);
    };

    loadUserNFTs();
  }, [connectedAddress, isConnected, userBalance, totalSupply]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">My NFT Gallery</h1>
          <p className="text-lg text-base-content/70 mb-8">Connect your wallet to view your NFT collection</p>
          <div className="bg-base-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
            <p className="text-base-content/70">Please connect your wallet to view your NFT collection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">My NFT Gallery</h1>
        <p className="text-lg text-base-content/70 mb-4">Your exclusive FanAI Passport NFT collection</p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sm text-base-content/70">Connected:</span>
          <Address address={connectedAddress} />
        </div>
        <div className="text-sm text-base-content/70">Total NFTs: {userBalance ? Number(userBalance) : 0}</div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : userNFTs.length === 0 ? (
        <div className="text-center">
          <div className="bg-base-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-xl font-bold mb-2">No NFTs Yet</h2>
            <p className="text-base-content/70 mb-4">
              You haven&apos;t collected any NFTs yet. Complete experiences to earn exclusive NFTs!
            </p>
            <Link href="/psg" className="btn btn-primary">
              Explore Experiences
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {userNFTs.map(nft => (
            <div key={nft.tokenId} className="bg-base-100 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-4xl">🎖️</div>
                </div>
                <h3 className="text-lg font-bold mb-2">{nft.name}</h3>
                <p className="text-sm text-base-content/70 mb-2">{nft.description}</p>
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
                  <Address address={connectedAddress} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
