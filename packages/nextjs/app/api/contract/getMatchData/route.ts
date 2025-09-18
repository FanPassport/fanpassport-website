import { NextRequest, NextResponse } from "next/server";
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

// POST /api/contract/getMatchData - Get match data for a specific MatchNFT token
export async function POST(request: NextRequest) {
  let body: any = undefined;
  try {
    body = await request.json();
    const { tokenId, chainId } = body;

    if (!tokenId) {
      console.error("❌ Token ID is required");
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 });
    }

    console.log(`🔍 Getting match data for token ID: ${tokenId}`);

    // Get the MatchNFT contract address and ABI
    const resolvedChainId: number = Number(chainId ?? process.env.NEXT_PUBLIC_CHAIN_ID ?? localhost.id);
    console.log(`🔎 Resolved chainId: ${resolvedChainId} (requested=${chainId})`);

    const contracts = (deployedContracts as any)[resolvedChainId];
    if (!contracts || !contracts.MatchNFT) {
      console.error(`❌ MatchNFT contract not found for chain ${resolvedChainId}`);
      return NextResponse.json({ error: "MatchNFT contract not found for chain " + resolvedChainId }, { status: 400 });
    }

    // Get the correct chain configuration
    const targetChain = supportedChains[resolvedChainId as keyof typeof supportedChains];
    if (!targetChain) {
      console.error(`❌ Chain ${resolvedChainId} not supported`);
      return NextResponse.json({ error: `Chain ${resolvedChainId} not supported` }, { status: 400 });
    }

    // Create a public client for the specific chain
    const publicClient = createPublicClient({
      chain: targetChain as any,
      transport: http(targetChain.rpcUrls.default.http[0]),
    });

    const contractAddress = contracts.MatchNFT.address;
    const contractAbi = contracts.MatchNFT.abi;

    console.log(`📋 MatchNFT contract address (chain ${resolvedChainId}): ${contractAddress}`);
    console.log(`🔗 Using RPC endpoint: ${targetChain.rpcUrls.default.http[0]}`);

    // Call the getMatchData function on the smart contract
    const matchData = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "getMatchData",
      args: [BigInt(tokenId)],
    });

    console.log(`✅ Match data for token ${tokenId}:`, matchData);

    // Cast to any because viem returns unknown-typed tuple; keep minimal change for CI
    const md: any = matchData;

    // Convert the tuple response to a more readable format
    const formattedMatchData = {
      matchId: md[0],
      competition: md[1],
      kickoff: md[2],
      venue: md[3],
      hometeam: md[4],
      awayteam: md[5],
      score: md[6],
      status: md[7],
    };

    return NextResponse.json({
      tokenId: parseInt(tokenId),
      ...formattedMatchData,
    });
  } catch (error: any) {
    console.error("❌ Error getting match data:", error);

    // Handle specific contract errors
    if (error?.message?.includes("Token does not exist") || error?.shortMessage?.includes("0x7e273289")) {
      return NextResponse.json({ error: "Token does not exist" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to get match data",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
