import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "~~/services/experienceService";

// GET /api/experiences/[experienceId]/rewards - Get available rewards for an experience
export async function GET(request: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
  try {
    const { experienceId: experienceIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const userAddress = request.nextUrl.searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json({ error: "Missing userAddress" }, { status: 400 });
    }

    const rewards = experienceService.getAvailableRewards(userAddress, experienceId);
    return NextResponse.json({ rewards });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
  }
}

// POST /api/experiences/[experienceId]/rewards - Claim rewards for an experience
export async function POST(request: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
  try {
    const { experienceId: experienceIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const { userAddress, taskId } = await request.json();

    if (!userAddress || taskId === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const success = experienceService.claimReward(userAddress, experienceId, taskId);

    if (success) {
      return NextResponse.json({ success: true, message: "Reward claimed" });
    } else {
      return NextResponse.json({ error: "Failed to claim reward" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error claiming reward:", error);
    return NextResponse.json({ error: "Failed to claim reward" }, { status: 500 });
  }
}
