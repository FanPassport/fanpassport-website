import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "~~/services/experienceService";

// POST /api/experiences/[experienceId]/start - Start an experience for a user
export async function POST(request: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
  try {
    const { experienceId: experienceIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const { userAddress } = await request.json();

    if (!userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 });
    }

    // Start the experience
    const success = experienceService.startExperience(userAddress, experienceId);

    if (!success) {
      return NextResponse.json({ error: "Failed to start experience" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting experience:", error);
    return NextResponse.json({ error: "Failed to start experience" }, { status: 500 });
  }
}
