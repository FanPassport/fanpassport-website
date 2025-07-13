import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "~~/services/experienceService";

// GET /api/experiences/[experienceId] - Get a specific experience with user progress
export async function GET(request: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
  try {
    const { experienceId: experienceIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const userAddress = request.nextUrl.searchParams.get("userAddress");
    const clubId = request.nextUrl.searchParams.get("clubId");

    // Get the experience
    const experience = experienceService.getExperience(experienceId);

    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    // Filter by clubId if provided
    if (clubId && experience.clubId !== clubId) {
      return NextResponse.json({ error: "Experience not found for this club" }, { status: 404 });
    }

    // If user address is provided, include user progress
    if (userAddress) {
      const userProgress = experienceService.getUserProgress(userAddress, experienceId);
      return NextResponse.json({
        ...experience,
        userProgress,
      });
    }

    return NextResponse.json(experience);
  } catch (error) {
    console.error("Error fetching experience:", error);
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 });
  }
}
