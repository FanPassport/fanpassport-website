import { NextRequest, NextResponse } from "next/server";

// GET /api/nft/[tokenId]/experience - Get the experience ID for a specific NFT
export async function GET(request: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  try {
    const { tokenId } = await params;

    // In a real implementation, you would call the smart contract here
    // For now, we'll return a mock response
    // You would need to implement the actual contract call using ethers.js or similar

    return NextResponse.json({
      tokenId: parseInt(tokenId),
      experienceId: parseInt(tokenId), // Mock: experience ID = token ID for simplicity
    });
  } catch (error) {
    console.error("Error getting NFT experience ID:", error);
    return NextResponse.json({ error: "Failed to get NFT experience ID" }, { status: 500 });
  }
}
