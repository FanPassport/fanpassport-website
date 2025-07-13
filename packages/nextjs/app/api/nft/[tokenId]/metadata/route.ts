import { NextRequest, NextResponse } from "next/server";

// GET /api/nft/[tokenId]/metadata - Get the metadata for a specific NFT
export async function GET(request: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  try {
    const { tokenId } = await params;

    // In a real implementation, you would call the smart contract's tokenURI function
    // For now, we'll return mock metadata
    // You would need to implement the actual contract call using ethers.js or similar

    const experienceId = parseInt(tokenId); // Mock: experience ID = token ID for simplicity

    return NextResponse.json({
      name: `Experience #${experienceId} - Token #${tokenId}`,
      description: `NFT reward for completing experience #${experienceId}`,
      image: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwMDAiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RXhwZXJpZW5jZSAj${experienceId}</dGV4dD48L3N2Zz4=`,
      attributes: [
        {
          trait_type: "Experience ID",
          value: experienceId.toString(),
        },
        {
          trait_type: "Token ID",
          value: tokenId,
        },
      ],
    });
  } catch (error) {
    console.error("Error getting NFT metadata:", error);
    return NextResponse.json({ error: "Failed to get NFT metadata" }, { status: 500 });
  }
}
