import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";

// Define chain configurations
const supportedChains = {
  31337: {
    id: 31337,
    name: "Localhost 8545",
    nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" },
    rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
  },
  88882: {
    id: 88882,
    name: "Chiliz Spicy Testnet",
    nativeCurrency: { decimals: 18, name: "CHZ", symbol: "CHZ" },
    rpcUrls: { default: { http: ["https://spicy-rpc.chiliz.com"] } },
  },
  88888: {
    id: 88888,
    name: "Chiliz Chain",
    nativeCurrency: { decimals: 18, name: "CHZ", symbol: "CHZ" },
    rpcUrls: { default: { http: ["https://rpc.ankr.com/chiliz"] } },
  },
};

// POST /api/contract/getAllNFTs - Get all NFTs with their owners
export async function POST() {
  try {
    console.log("🔄 Getting all NFTs from contract...");

    // Resolve chainId (prefer env then localhost)
    const resolvedChainId: number = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? localhost.id);
    console.log(
      `🔎 Resolved chainId for getAllNFTs: ${resolvedChainId} (NEXT_PUBLIC_CHAIN_ID=${process.env.NEXT_PUBLIC_CHAIN_ID ?? "undefined"})`,
    );

    // Get the contract address and ABI for the resolved chain
    const contracts = (deployedContracts as any)[resolvedChainId];
    if (!contracts || !contracts.ExperienceNFT) {
      console.error(`❌ No deployed ExperienceNFT contract found for chain ${resolvedChainId}`);
      return NextResponse.json(
        { error: `No deployed ExperienceNFT contract found for chain ${resolvedChainId}` },
        { status: 500 },
      );
    }

    // Get the correct chain configuration
    const targetChain = supportedChains[resolvedChainId as keyof typeof supportedChains];
    if (!targetChain) {
      console.error(`❌ Chain ${resolvedChainId} not supported`);
      return NextResponse.json({ error: `Chain ${resolvedChainId} not supported` }, { status: 500 });
    }

    // Create a public client for the specific chain
    const publicClient = createPublicClient({
      chain: targetChain as any,
      transport: http(targetChain.rpcUrls.default.http[0]),
    });

    const contractAddress = contracts.ExperienceNFT.address;
    const contractAbi = contracts.ExperienceNFT.abi;

    console.log(`📋 Contract address (chain ${resolvedChainId}): ${contractAddress}`);
    console.log(`🔗 Using RPC endpoint: ${targetChain.rpcUrls.default.http[0]}`);

    // Get total supply first
    const totalSupply = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "totalSupply",
      args: [],
    });

    console.log(`📊 Total supply: ${totalSupply}`);

    if (totalSupply === 0n) {
      console.log("⚠️ No NFTs minted yet");
      return NextResponse.json({
        totalSupply: 0,
        nfts: [],
      });
    }

    const nfts = [];
    const totalSupplyNumber = Number(totalSupply);

    // Get all NFTs
    for (let tokenId = 1; tokenId <= totalSupplyNumber; tokenId++) {
      try {
        console.log(`🔍 Processing NFT #${tokenId}...`);

        // Get owner of this token
        const owner = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractAbi,
          functionName: "ownerOf",
          args: [BigInt(tokenId)],
        });

        // Get experience ID for this token
        const experienceId = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractAbi,
          functionName: "getExperienceId",
          args: [BigInt(tokenId)],
        });

        console.log(`✅ NFT #${tokenId}: owner=${owner}, experienceId=${experienceId}`);

        nfts.push({
          tokenId,
          experienceId: Number(experienceId),
          owner: owner as string,
        });
      } catch (error) {
        console.error(`❌ Error getting NFT ${tokenId}:`, error);
        // Continue with other NFTs even if one fails
      }
    }

    console.log(`✅ Successfully loaded ${nfts.length} NFTs out of ${totalSupplyNumber} total`);

    return NextResponse.json({
      totalSupply: totalSupplyNumber,
      nfts,
    });
  } catch (error) {
    console.error("❌ Error getting all NFTs from contract:", error);
    return NextResponse.json(
      {
        error: "Failed to get NFTs from contract",
        details: "An unexpected error occurred while reading from the blockchain",
      },
      { status: 500 },
    );
  }
}
