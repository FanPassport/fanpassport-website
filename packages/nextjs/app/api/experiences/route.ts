import { NextRequest, NextResponse } from "next/server";
import { hybridExperienceService } from "~~/services/hybridExperienceService";

// GET /api/experiences - Get all experiences with user status
export async function GET(request: NextRequest) {
  try {
    const userAddress = request.nextUrl.searchParams.get("userAddress");
    const clubId = request.nextUrl.searchParams.get("clubId");

    let experiences = await hybridExperienceService.getExperiences();

    // Filter experiences by club if clubId is provided
    if (clubId) {
      experiences = experiences.filter(experience => experience.clubId === clubId);
    }

    if (!userAddress) {
      return NextResponse.json({ experiences });
    }

    // Get user progress for all experiences
    const experiencesWithStatus = await Promise.all(
      experiences.map(async experience => {
        const userProgress = await hybridExperienceService.getUserProgress(userAddress, experience.id);

        return {
          ...experience,
          userProgress: {
            experienceStarted: userProgress?.experienceStarted || false,
            experienceCompleted: userProgress?.experienceCompleted || false,
            completedTasks: userProgress?.completedTasks?.length || 0,
            totalTasks: experience.tasks.length,
            availableRewards: userProgress?.rewards
              ? Object.values(userProgress.rewards).filter(r => !r.claimed).length
              : 0,
            lastRewardClaimDate: userProgress?.rewards
              ? Math.max(
                  ...Object.values(userProgress.rewards)
                    .filter(r => r.claimed && r.claimedAt)
                    .map(r => r.claimedAt!),
                )
              : null,
          },
        };
      }),
    );

    return NextResponse.json({ experiences: experiencesWithStatus });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}

// POST /api/experiences - Start an experience
export async function POST(request: NextRequest) {
  try {
    const { userAddress, experienceId } = await request.json();

    if (!userAddress || !experienceId) {
      return NextResponse.json({ error: "Missing userAddress or experienceId" }, { status: 400 });
    }

    const success = await hybridExperienceService.startExperience(userAddress, experienceId);

    if (success) {
      return NextResponse.json({ success: true, message: "Experience started" });
    } else {
      return NextResponse.json({ error: "Failed to start experience" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error starting experience:", error);
    return NextResponse.json({ error: "Failed to start experience" }, { status: 500 });
  }
}
