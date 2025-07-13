import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: localhost,
  transport: http(),
});

// POST /api/contract/ownerOf - Get the owner of a specific NFT from the blockchain
export async function POST(request: NextRequest) {
  try {
    const { tokenId } = await request.json();

    if (!tokenId) {
      console.error("❌ Token ID is required");
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 });
    }

    console.log(`🔍 Getting owner for token ID: ${tokenId}`);

    // Get the contract address and ABI
    const contractAddress = deployedContracts[31337].ExperienceNFT.address;
    const contractAbi = deployedContracts[31337].ExperienceNFT.abi;

    console.log(`📋 Contract address: ${contractAddress}`);

    // Call the ownerOf function on the smart contract
    const owner = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });

    console.log(`✅ Owner for token ${tokenId}: ${owner}`);

    return NextResponse.json({
      tokenId: parseInt(tokenId),
      owner: owner as string,
    });
  } catch (error) {
    console.error(
      `❌ Error getting NFT owner from contract for token ${request.json ? (await request.json()).tokenId : "unknown"}:`,
      error,
    );

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("ERC721: owner query for nonexistent token")) {
        return NextResponse.json(
          {
            error: "Token does not exist",
            details: "The specified token ID has not been minted yet",
          },
          { status: 404 },
        );
      }

      if (error.message.includes("execution reverted")) {
        return NextResponse.json(
          {
            error: "Contract execution failed",
            details: "The smart contract call failed. The token might not exist or the contract might be paused.",
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to get NFT owner from contract",
        details: "An unexpected error occurred while reading from the blockchain",
      },
      { status: 500 },
    );
  }
}
