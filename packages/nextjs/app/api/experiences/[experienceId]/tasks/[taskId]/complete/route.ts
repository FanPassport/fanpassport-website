import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "~~/services/experienceService";

// POST /api/experiences/[experienceId]/tasks/[taskId]/complete - Complete a task for a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ experienceId: string; taskId: string }> },
) {
  try {
    const { experienceId: experienceIdParam, taskId: taskIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const taskId = parseInt(taskIdParam);
    const { userAddress, answer } = await request.json();

    if (!userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 });
    }

    // Get the task to determine its type
    const task = experienceService.getTask(experienceId, taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let success = false;

    // Complete task based on its type
    switch (task.taskType) {
      case "QUIZ":
        success = experienceService.completeQuizTask(userAddress, experienceId, taskId, answer);
        break;
      case "QR_CODE":
        success = experienceService.completeQRCodeTask(userAddress, experienceId, taskId, answer);
        break;
      case "CHECK_IN":
        success = experienceService.completeCheckInTask(userAddress, experienceId, taskId);
        break;
      case "PHOTO":
        success = experienceService.completePhotoTask(userAddress, experienceId, taskId);
        break;
      default:
        return NextResponse.json({ error: "Unknown task type" }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to complete task" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 });
  }
}
