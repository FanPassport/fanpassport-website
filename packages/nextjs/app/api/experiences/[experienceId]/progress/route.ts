import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "~~/services/experienceService";

// GET /api/experiences/[experienceId]/progress - Get user progress for an experience
export async function GET(request: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
  try {
    const { experienceId: experienceIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const userAddress = request.nextUrl.searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json({ error: "Missing userAddress" }, { status: 400 });
    }

    const userProgress = experienceService.getUserProgress(userAddress, experienceId);
    return NextResponse.json(userProgress);
  } catch {
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

// POST /api/experiences/[experienceId]/progress - Complete a task
export async function POST(request: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
  try {
    const { experienceId: experienceIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const { userAddress, taskId, taskType, data } = await request.json();

    console.log("Task completion request:", {
      experienceId,
      userAddress,
      taskId,
      taskType,
      data,
    });

    if (!userAddress || taskId === undefined || !taskType) {
      console.error("Missing required fields:", { userAddress, taskId, taskType });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let success = false;

    switch (taskType) {
      case "QUIZ":
        success = experienceService.completeQuizTask(userAddress, experienceId, taskId, data);
        break;
      case "QR_CODE":
        success = experienceService.completeQRCodeTask(userAddress, experienceId, taskId, data);
        break;
      case "CHECK_IN":
        success = experienceService.completeCheckInTask(userAddress, experienceId, taskId);
        break;
      case "PHOTO":
        success = experienceService.completePhotoTask(userAddress, experienceId, taskId);
        break;
      default:
        console.error("Invalid task type:", taskType);
        return NextResponse.json({ error: "Invalid task type" }, { status: 400 });
    }

    console.log("Task completion result:", { success, taskType, taskId });

    if (success) {
      return NextResponse.json({ success: true, message: "Task completed" });
    } else {
      return NextResponse.json({ error: "Failed to complete task" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 });
  }
}
