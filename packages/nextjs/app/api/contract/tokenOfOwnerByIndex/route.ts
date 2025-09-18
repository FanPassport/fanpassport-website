import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: localhost,
  transport: http(),
});

// POST /api/contract/tokenOfOwnerByIndex - Get token ID at specific index for an owner
export async function POST(request: NextRequest) {
  let body: any = undefined;
  try {
    body = await request.json();
    const { owner, index, contractName = "MatchNFT", chainId } = body;

    if (!owner || index === undefined) {
      console.error("❌ Owner and index are required");
      return NextResponse.json({ error: "Owner and index are required" }, { status: 400 });
    }

    console.log(`🔍 Getting token at index ${index} for owner ${owner} from contract: ${contractName}`);

    // Resolve chainId (prefer provided, then env, then localhost)
    const resolvedChainId: number = Number(chainId ?? process.env.NEXT_PUBLIC_CHAIN_ID ?? localhost.id);
    console.log(`🔎 Resolved chainId: ${resolvedChainId} (requested=${chainId})`);

    const contracts = (deployedContracts as any)[resolvedChainId];
    if (!contracts || !contracts[contractName as keyof typeof contracts]) {
      console.error(`❌ Contract ${contractName} not found for chain ${resolvedChainId}`);
      return NextResponse.json(
        { error: `Contract ${contractName} not found for chain ${resolvedChainId}` },
        { status: 400 },
      );
    }

    const contractAddress = contracts[contractName as keyof typeof contracts].address;
    const contractAbi = contracts[contractName as keyof typeof contracts].abi;

    console.log(`📋 Contract ${contractName} address (chain ${resolvedChainId}): ${contractAddress}`);

    // Call the tokenOfOwnerByIndex function on the smart contract
    const tokenId = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "tokenOfOwnerByIndex",
      args: [owner as `0x${string}`, BigInt(index)],
    });

    console.log(`✅ Token at index ${index} for owner ${owner}: ${tokenId}`);

    return NextResponse.json({
      owner,
      index: parseInt(index),
      tokenId: Number(tokenId),
    });
  } catch (error: any) {
    console.error("❌ Error getting token by index:", error);

    // Handle specific contract errors
    if (
      error?.message?.includes("Owner index out of bounds") ||
      error?.shortMessage?.includes("Owner index out of bounds")
    ) {
      return NextResponse.json({ error: "Index out of bounds" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to get token by index",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
