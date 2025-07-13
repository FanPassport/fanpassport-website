import { NextRequest, NextResponse } from "next/server";

// GET /api/nft/[tokenId]/owner - Get the owner of a specific NFT
export async function GET(request: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  try {
    const { tokenId } = await params;

    // In a real implementation, you would call the smart contract here
    // For now, we'll return a mock response
    // You would need to implement the actual contract call using ethers.js or similar

    return NextResponse.json({
      tokenId: parseInt(tokenId),
      owner: "0x0000000000000000000000000000000000000000", // Mock address
    });
  } catch (error) {
    console.error("Error getting NFT owner:", error);
    return NextResponse.json({ error: "Failed to get NFT owner" }, { status: 500 });
  }
}
