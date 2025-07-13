import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "~~/services/experienceService";

// POST /api/experiences/[experienceId]/tasks/[taskId]/quiz - Complete a quiz task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ experienceId: string; taskId: string }> },
) {
  try {
    const { experienceId: experienceIdParam, taskId: taskIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const taskId = parseInt(taskIdParam);
    const { userAddress, answer } = await request.json();

    if (!userAddress || !answer) {
      return NextResponse.json({ error: "Missing userAddress or answer" }, { status: 400 });
    }

    const success = experienceService.completeQuizTask(userAddress, experienceId, taskId, answer);

    if (success) {
      return NextResponse.json({ success: true, message: "Quiz completed" });
    } else {
      return NextResponse.json({ error: "Failed to complete quiz" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error completing quiz:", error);
    return NextResponse.json({ error: "Failed to complete quiz" }, { status: 500 });
  }
}
