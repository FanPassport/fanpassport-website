import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: localhost,
  transport: http(),
});

// GET /api/contract/getNFTMetadata/[tokenId] - Get NFT metadata from smart contract
export async function GET(request: Request, { params }: { params: Promise<{ tokenId: string }> }) {
  try {
    const { tokenId } = await params;
    const tokenIdNumber = parseInt(tokenId);

    console.log(`🔍 Getting metadata for token ID: ${tokenIdNumber}`);

    // Get the contract address and ABI (check if ExperienceNFT exists on localhost)
    const experienceContract = (deployedContracts as any)[31337]?.ExperienceNFT;
    if (!experienceContract) {
      return NextResponse.json({ error: "ExperienceNFT contract not found on localhost" }, { status: 404 });
    }

    const contractAddress = experienceContract.address;
    const contractAbi = experienceContract.abi;

    console.log(`📋 Contract address: ${contractAddress}`);

    // Call the tokenURI function on the smart contract
    const tokenURI = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "tokenURI",
      args: [BigInt(tokenIdNumber)],
    });

    console.log(`📄 Token URI: ${tokenURI}`);

    // The tokenURI is base64 encoded JSON, decode it
    const base64Data = (tokenURI as string).replace("data:application/json;base64,", "");
    const jsonString = Buffer.from(base64Data, "base64").toString("utf-8");
    const metadata = JSON.parse(jsonString);

    console.log(`✅ Decoded metadata:`, metadata);

    return NextResponse.json(metadata);
  } catch (error) {
    const { tokenId } = await params;
    console.error(`❌ Error getting NFT metadata for token ${tokenId}:`, error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("ERC721: URI query for nonexistent token")) {
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
        error: "Failed to get NFT metadata from contract",
        details: "An unexpected error occurred while reading from the blockchain",
      },
      { status: 500 },
    );
  }
}
