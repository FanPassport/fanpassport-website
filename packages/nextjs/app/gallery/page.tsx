"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface ExperienceNFT {
  type: "experience";
  tokenId: number;
  experienceId: number;
  name: string;
  image: string;
  description: string;
}

interface MatchNFT {
  type: "match";
  tokenId: number;
  matchId: string;
  name: string;
  image: string;
  description: string;
  competition: string;
  kickoff: string;
  venue: string;
  hometeam: string;
  awayteam: string;
  score: string;
  status: string;
}

type NFT = ExperienceNFT | MatchNFT;

const GalleryPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();

  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadNonce, setReloadNonce] = useState(0);
  const formatKickoff = (kickoffRaw?: string) => {
    if (!kickoffRaw) return "";
    try {
      const kd = new Date(kickoffRaw);
      if (isNaN(kd.getTime())) return kickoffRaw;
      return `${kd.getDate()} ${kd.toLocaleDateString("en-US", { month: "short" })} ${kd.getFullYear()} ${kd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return kickoffRaw;
    }
  };
  const [currentChainId, setCurrentChainId] = useState<number | undefined>(undefined);
  const [debugBalanceResult, setDebugBalanceResult] = useState<any>(null);
  // Get the current chain from the account hook and ensure target network is synced
  const { chain } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  // Improved fallback logic: use target network, then env var, then testnet as last resort
  const getFallbackChainId = () => {
    // First priority: target network from scaffold config
    if (targetNetwork?.id) {
      return targetNetwork.id;
    }
    // Second priority: environment variable
    const envChainId = process.env.NEXT_PUBLIC_CHAIN_ID;
    if (envChainId) {
      const parsed = parseInt(envChainId, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    // Last resort: Chiliz testnet (current behavior)
    return 88882;
  };

  const fallbackChainId = getFallbackChainId();

  const {
    data: clientMatchBalance,
    isError: clientMatchError,
    isLoading: clientMatchLoading,
    error: clientMatchErrorObj,
  } = useScaffoldReadContract({
    contractName: "MatchNFT" as const,
    functionName: "balanceOf" as const,
    args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
    enabled: !!connectedAddress,
    chainId: chain?.id || (fallbackChainId as any),
  } as any);

  const { data: deployedMatchContract } = useDeployedContractInfo({
    contractName: "MatchNFT" as any,
    chainId: chain?.id || (fallbackChainId as any),
  });

  // ExperienceNFT
  const { data: expUserBalance } = useScaffoldReadContract({
    contractName: "ExperienceNFT" as const,
    functionName: "balanceOf" as const,
    args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
    enabled: !!connectedAddress,
    chainId: chain?.id || (fallbackChainId as any),
  } as any);
  const { data: expTotalSupply } = useScaffoldReadContract({
    contractName: "ExperienceNFT" as const,
    functionName: "totalSupply" as const,
    chainId: chain?.id || (fallbackChainId as any),
  } as any);

  // MatchNFT balance for connected user
  const { data: matchUserBalance } = useScaffoldReadContract({
    contractName: "MatchNFT" as const,
    functionName: "balanceOf" as const,
    args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
    enabled: !!connectedAddress,
    chainId: chain?.id || (fallbackChainId as any),
  } as any);
  const { data: matchTotalSupply } = useScaffoldReadContract({
    contractName: "MatchNFT" as const,
    functionName: "totalSupply" as const,
    chainId: chain?.id || (fallbackChainId as any),
  } as any);

  // Load both ExperienceNFTs and MatchNFTs
  useEffect(() => {
    const loadUserNFTs = async () => {
      if (!connectedAddress || !isConnected) {
        setUserNFTs([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const nfts: NFT[] = [];

      console.log(`🔍 Loading NFTs for user: ${connectedAddress}`);
      console.log(`📊 ExpTotalSupply: ${expTotalSupply}, MatchTotalSupply: ${matchTotalSupply}`);

      // Determine chainId for API calls (read from window.ethereum if available)
      let runtimeChainId: number | undefined = undefined;
      try {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const hexChain = await (window as any).ethereum.request({ method: "eth_chainId" });
          runtimeChainId = parseInt(hexChain, 16);
        }
      } catch {
        console.warn("Could not detect chainId from provider, falling back to default");
      }
      console.log(`🔗 Detected chainId: ${runtimeChainId}`);
      setCurrentChainId(runtimeChainId);

      // ExperienceNFTs
      if (expTotalSupply && Number(expTotalSupply) > 0) {
        for (let tokenId = 1; tokenId <= Number(expTotalSupply); tokenId++) {
          try {
            const response = await fetch("/api/contract/ownerOf", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tokenId, contractName: "ExperienceNFT", chainId: runtimeChainId }),
            });
            if (response.ok) {
              const { owner } = await response.json();
              if (owner?.toLowerCase() === connectedAddress?.toLowerCase()) {
                const experienceId = tokenId;
                const metadata = {
                  name: `Experience #${experienceId} - Token #${tokenId}`,
                  description: `NFT reward for completing experience #${experienceId}`,
                  image: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwMDAiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RXhwZXJpZW5jZSAj${experienceId}</dGV4dD48L3N2Zz4=`,
                };
                nfts.push({
                  type: "experience",
                  tokenId,
                  experienceId,
                  name: metadata.name,
                  image: metadata.image,
                  description: metadata.description,
                });
              }
            }
          } catch (error: any) {
            // Only log error if it's not a "token doesn't exist" error
            if (!error?.message?.includes("0x7e273289")) {
              console.error(`Error loading ExperienceNFT ${tokenId}:`, error);
            }
          }
        }
      }

      // MatchNFTs - use efficient enumeration
      if (matchUserBalance && Number(matchUserBalance) > 0) {
        console.log(`🏟️ User has ${matchUserBalance} MatchNFTs, loading them...`);

        // Get all token IDs owned by the user efficiently
        for (let index = 0; index < Number(matchUserBalance); index++) {
          try {
            console.log(`🔍 Getting MatchNFT at index ${index}...`);

            // Get the token ID at this index for the user
            const tokenIdResp = await fetch("/api/contract/tokenOfOwnerByIndex", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                owner: connectedAddress,
                index: index,
                contractName: "MatchNFT",
                chainId: runtimeChainId,
              }),
            });

            if (!tokenIdResp.ok) {
              console.error(`Failed to get token at index ${index}`);
              continue;
            }

            const { tokenId } = await tokenIdResp.json();
            console.log(`✅ User owns MatchNFT token ${tokenId} at index ${index}`);

            // Fetch match data for this token
            const matchDataResp = await fetch("/api/contract/getMatchData", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tokenId, chainId: runtimeChainId }),
            });
            let matchData = null;
            try {
              if (!matchDataResp.ok) {
                const txt = await matchDataResp.text();
                console.error(`getMatchData failed for token ${tokenId}: ${matchDataResp.status} ${txt}`);
              } else {
                matchData = await matchDataResp.json();
                // Normalize tuple/array responses (some RPC clients may return the tuple as an array)
                try {
                  if (matchData && !matchData.matchId && Array.isArray(matchData) && matchData.length >= 8) {
                    matchData = {
                      matchId: matchData[0],
                      competition: matchData[1],
                      kickoff: matchData[2],
                      venue: matchData[3],
                      hometeam: matchData[4],
                      awayteam: matchData[5],
                      score: matchData[6],
                      status: matchData[7],
                    } as any;
                  }
                } catch {
                  // ignore normalization errors
                }
              }
            } catch (e) {
              console.error(`Error parsing getMatchData response for token ${tokenId}:`, e);
            }

            // Fetch tokenURI
            const tokenURIResp = await fetch("/api/contract/tokenURI", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tokenId, contractName: "MatchNFT", chainId: runtimeChainId }),
            });
            let tokenURI = "";
            try {
              if (!tokenURIResp.ok) {
                const txt = await tokenURIResp.text();
                console.error(`tokenURI fetch failed for token ${tokenId}: ${tokenURIResp.status} ${txt}`);
              } else {
                const data = await tokenURIResp.json();
                tokenURI = data.tokenURI;
              }
            } catch (e) {
              console.error(`Error parsing tokenURI response for token ${tokenId}:`, e);
            }

            // If tokenURI is missing or points to example.com (placeholder), try to load local metadata from public/data/matches.json
            let localMetadata = null;
            try {
              const isPlaceholder = !tokenURI || tokenURI.includes("example.com") || tokenURI.trim() === "";
              if (isPlaceholder) {
                try {
                  const matchesResp = await fetch("/data/matches.json");
                  if (matchesResp.ok) {
                    const matchesJson = await matchesResp.json();
                    // Prefer lookup by on-chain matchId
                    let found = null;
                    if (matchData?.matchId) {
                      found = (matchesJson.matches || []).find((m: any) => m.id === matchData.matchId);
                      if (found) {
                        localMetadata = found;
                        console.log(`Loaded local metadata for matchId ${matchData.matchId}:`, found);
                      }
                    }
                    // If on-chain matchData missing, try to extract id from tokenURI
                    if (!localMetadata && tokenURI) {
                      try {
                        const last = tokenURI.split("/").pop() || "";
                        const idFromURI = last.replace(/\.json$/i, "");
                        if (idFromURI) {
                          const found2 = (matchesJson.matches || []).find((m: any) => m.id === idFromURI);
                          if (found2) {
                            localMetadata = found2;
                            console.log(`Loaded local metadata for id extracted from tokenURI ${idFromURI}:`, found2);
                          }
                        }
                      } catch {
                        // ignore
                      }
                    }
                  }
                } catch (e) {
                  console.warn("Failed to load local matches.json metadata", e);
                }
              }
            } catch (e) {
              console.error("Error while attempting local metadata fallback", e);
            }
            // Try to decode / resolve tokenURI to get metadata (image, name, description)
            let image = "";
            let metadataName = matchData?.matchId ? `Match #${matchData.matchId}` : `Match Token #${tokenId}`;
            let metadataDescription = matchData?.competition || "";

            try {
              if (tokenURI) {
                // data:application/json;base64,...
                if (tokenURI.startsWith("data:application/json;base64,")) {
                  const b64 = tokenURI.replace("data:application/json;base64,", "");
                  const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
                  image = json.image || json.image_url || "";
                  metadataName = json.name || metadataName;
                  metadataDescription = json.description || metadataDescription;
                } else if (tokenURI.startsWith("data:image/")) {
                  // raw image data
                  image = tokenURI;
                } else {
                  // handle ipfs:// URIs
                  let resolved = tokenURI;
                  if (tokenURI.startsWith("ipfs://")) {
                    const cid = tokenURI.replace("ipfs://", "");
                    resolved = `https://ipfs.io/ipfs/${cid}`;
                  }

                  // Try fetching the JSON metadata
                  try {
                    const metaResp = await fetch(resolved, { method: "GET" });
                    if (metaResp.ok) {
                      const json = await metaResp.json();
                      image = json.image || json.image_url || "";
                      metadataName = json.name || metadataName;
                      metadataDescription = json.description || metadataDescription;
                      // If image is IPFS path, resolve it
                      if (image && image.startsWith("ipfs://")) {
                        image = `https://ipfs.io/ipfs/${image.replace("ipfs://", "")}`;
                      }
                    } else {
                      // Not JSON; maybe tokenURI is direct image URL
                      if (resolved.match(/\.(png|jpg|jpeg|svg|webp)$/i)) {
                        image = resolved;
                      }
                    }
                  } catch {
                    // ignore metadata fetch errors, fallback to tokenURI as image
                    if (resolved.match(/\.(png|jpg|jpeg|svg|webp)$/i)) {
                      image = resolved;
                    }
                  }
                }
              }
            } catch (e) {
              console.warn("Failed to parse tokenURI metadata", e);
            }

            const assembled: MatchNFT = {
              type: "match",
              tokenId: Number(tokenId),
              matchId: matchData?.matchId || localMetadata?.id || "",
              name: localMetadata?.name || metadataName,
              image: image || localMetadata?.image || "",
              description: localMetadata?.description || metadataDescription,
              competition: matchData?.competition || localMetadata?.competition || "",
              kickoff: matchData?.kickoff || localMetadata?.kickoff || "",
              venue: matchData?.venue || localMetadata?.venue || "",
              hometeam: matchData?.hometeam || localMetadata?.hometeam || "",
              awayteam: matchData?.awayteam || localMetadata?.awayteam || "",
              score: matchData?.score || localMetadata?.score || "",
              status: matchData?.status || localMetadata?.status || "",
            };
            nfts.push(assembled);
          } catch (error) {
            console.error(`Error loading MatchNFT at index ${index}:`, error);
          }
        }
      }

      console.log(`🎯 Final NFTs loaded: ${nfts.length}`, nfts);
      setUserNFTs(nfts);
      setLoading(false);
    };
    loadUserNFTs();
  }, [connectedAddress, isConnected, expUserBalance, expTotalSupply, matchUserBalance, matchTotalSupply, reloadNonce]);

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
        <p className="text-lg text-base-content/70 mb-4">Your exclusive Fan Passport NFT collection</p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sm text-base-content/70">Connected:</span>
          <Address address={connectedAddress} />
          <span className="text-xs text-base-content/50">Chain: {currentChainId ?? "unknown"}</span>
        </div>
        <div className="text-sm text-base-content/70 space-y-1">
          <div>
            ExperienceNFTs: {expUserBalance ? Number(expUserBalance) : 0} | MatchNFTs (enumerated):{" "}
            {userNFTs.filter(nft => nft.type === "match").length}
          </div>
          <div className="text-xs opacity-70">
            On-chain Match balance: {matchUserBalance ? Number(matchUserBalance) : 0}
          </div>
          <div>
            <button className="btn btn-xs btn-outline" disabled={loading} onClick={() => setReloadNonce(n => n + 1)}>
              {loading ? "Loading..." : "Reload NFTs"}
            </button>
            <button
              className="btn btn-xs btn-outline ml-2"
              onClick={async () => {
                try {
                  const resp = await fetch("/api/contract/debugBalance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      owner: connectedAddress,
                      contractName: "MatchNFT",
                      chainId: currentChainId ?? fallbackChainId,
                    }),
                  });
                  const data = await resp.json();
                  setDebugBalanceResult(data);
                } catch (e) {
                  setDebugBalanceResult({ error: String(e) });
                }
              }}
            >
              Server Debug Balance
            </button>
          </div>
        </div>
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
              You haven&apos;t collected any NFTs yet. Complete experiences or claim match NFTs!
            </p>
            <Link href="/psg" className="btn btn-primary">
              Explore Experiences
            </Link>
            {matchUserBalance && Number(matchUserBalance) > 0 && (
              <div className="mt-4 text-warning text-xs">
                On-chain MatchNFT balance is {Number(matchUserBalance)} but none enumerated. Try Reload NFTs.
              </div>
            )}
            {debugBalanceResult && (
              <pre className="mt-4 text-xs whitespace-pre-wrap">{JSON.stringify(debugBalanceResult, null, 2)}</pre>
            )}
            <div className="mt-4 text-xs">
              <div>
                <strong>Client Hook Debug:</strong>
              </div>
              <div>clientMatchLoading: {String(clientMatchLoading)}</div>
              <div>clientMatchError: {String(clientMatchError)}</div>
              <div>clientMatchBalance: {clientMatchBalance ? Number(clientMatchBalance) : "undefined"}</div>
              {clientMatchErrorObj && (
                <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(clientMatchErrorObj, null, 2)}</pre>
              )}
              <div>deployedMatchContract: {deployedMatchContract ? deployedMatchContract.address : "undefined"}</div>
              <div>Current chain?.id: {chain?.id}</div>
              <div>Target network ID: {targetNetwork.id}</div>
              <div>Fallback chain ID: {fallbackChainId}</div>
              <div>Connected address: {connectedAddress}</div>
              <div>Hook enabled: {!!connectedAddress ? "true" : "false"}</div>
              <div>Contracts object exists: {contracts ? "Yes" : "No"}</div>
              <div>
                Chain {fallbackChainId} in contracts: {contracts && (contracts as any)[fallbackChainId] ? "Yes" : "No"}
              </div>
              <div>
                MatchNFT in chain {fallbackChainId}:{" "}
                {contracts && (contracts as any)[fallbackChainId]?.MatchNFT ? "Yes" : "No"}
              </div>
              {deployedMatchContract && (
                <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(deployedMatchContract, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {userNFTs.map(nft => (
            <div
              key={nft.type + nft.tokenId}
              className="bg-base-100 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-center mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-4xl">{nft.type === "experience" ? "🎖️" : "🏟️"}</div>
                </div>
                <h3 className="text-lg font-bold mb-2">{nft.name}</h3>
                <p className="text-sm text-base-content/70 mb-2">{nft.description}</p>
                <div className="flex justify-between text-xs text-base-content/60">
                  <span>Token #{nft.tokenId}</span>
                  {nft.type === "experience" ? (
                    <span>Exp #{nft.experienceId}</span>
                  ) : (
                    <span>Match #{(nft as MatchNFT).matchId}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Token ID:</span>
                  <span className="font-mono">{nft.tokenId}</span>
                </div>
                {nft.type === "experience" ? (
                  <div className="flex justify-between text-sm">
                    <span>Experience ID:</span>
                    <span className="font-mono">{(nft as ExperienceNFT).experienceId}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Match ID:</span>
                      <span className="font-mono">{(nft as MatchNFT).matchId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Competition:</span>
                      <span className="font-mono">{(nft as MatchNFT).competition}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Kickoff:</span>
                      <span className="font-mono">{formatKickoff((nft as MatchNFT).kickoff)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Venue:</span>
                      <span className="font-mono">{(nft as MatchNFT).venue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Teams:</span>
                      <span className="font-mono">
                        {(nft as MatchNFT).hometeam} vs {(nft as MatchNFT).awayteam}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Score:</span>
                      <span className="font-mono">{(nft as MatchNFT).score}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
