import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "~~/services/experienceService";

// POST /api/experiences/[experienceId]/claim-nft - Claim NFT reward for completed experience
export async function POST(request: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
  try {
    const { experienceId: experienceIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const { userAddress } = await request.json();

    if (!userAddress) {
      return NextResponse.json({ error: "Missing userAddress" }, { status: 400 });
    }

    console.log("🎁 API: Claiming NFT reward for user:", userAddress, "experience:", experienceId);

    // Check if user has completed the experience
    const userProgress = experienceService.getUserProgress(userAddress, experienceId);

    if (!userProgress || !userProgress.experienceCompleted) {
      return NextResponse.json(
        {
          error: "Experience not completed yet",
          details: "You need to complete all tasks before claiming the NFT reward",
        },
        { status: 400 },
      );
    }

    // Check if user has already claimed
    if (userProgress.lastRewardClaimDate) {
      return NextResponse.json(
        {
          error: "Reward already claimed",
          details: "You have already claimed the NFT reward for this experience",
        },
        { status: 400 },
      );
    }

    // Update the user progress to mark reward as claimed
    const success = experienceService.claimNFTReward(userAddress, experienceId);

    if (success) {
      console.log("✅ API: NFT reward claimed successfully for user:", userAddress);
      return NextResponse.json({
        success: true,
        message: "NFT reward claimed successfully",
        timestamp: Date.now(),
      });
    } else {
      return NextResponse.json(
        {
          error: "Failed to claim NFT reward",
          details: "There was an error processing your claim",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ API Error claiming NFT reward:", error);
    return NextResponse.json(
      {
        error: "Failed to claim NFT reward",
        details: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
