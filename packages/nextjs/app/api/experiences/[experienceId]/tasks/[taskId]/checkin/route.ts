import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "~~/services/experienceService";

// POST /api/experiences/[experienceId]/tasks/[taskId]/checkin - Complete a check-in task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ experienceId: string; taskId: string }> },
) {
  try {
    const { experienceId: experienceIdParam, taskId: taskIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const taskId = parseInt(taskIdParam);
    const { userAddress } = await request.json();

    if (!userAddress) {
      return NextResponse.json({ error: "Missing userAddress" }, { status: 400 });
    }

    const success = experienceService.completeCheckInTask(userAddress, experienceId, taskId);

    if (success) {
      return NextResponse.json({ success: true, message: "Check-in completed" });
    } else {
      return NextResponse.json({ error: "Failed to complete check-in" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error completing check-in:", error);
    return NextResponse.json({ error: "Failed to complete check-in" }, { status: 500 });
  }
}
