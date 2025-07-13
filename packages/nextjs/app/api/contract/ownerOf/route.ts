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
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 });
    }

    // Get the contract address and ABI
    const contractAddress = deployedContracts[31337].ExperienceNFT.address;
    const contractAbi = deployedContracts[31337].ExperienceNFT.abi;

    // Call the ownerOf function on the smart contract
    const owner = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });

    return NextResponse.json({
      tokenId: parseInt(tokenId),
      owner: owner as string,
    });
  } catch (error) {
    console.error("Error getting NFT owner from contract:", error);
    return NextResponse.json({ error: "Failed to get NFT owner from contract" }, { status: 500 });
  }
}
