import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "~~/services/experienceService";

// POST /api/experiences/[experienceId]/tasks/[taskId]/qrcode - Complete a QR code task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ experienceId: string; taskId: string }> },
) {
  try {
    const { experienceId: experienceIdParam, taskId: taskIdParam } = await params;
    const experienceId = parseInt(experienceIdParam);
    const taskId = parseInt(taskIdParam);
    const { userAddress, qrHash } = await request.json();

    if (!userAddress || !qrHash) {
      return NextResponse.json({ error: "Missing userAddress or qrHash" }, { status: 400 });
    }

    const success = experienceService.completeQRCodeTask(userAddress, experienceId, taskId, qrHash);

    if (success) {
      return NextResponse.json({ success: true, message: "QR code completed" });
    } else {
      return NextResponse.json({ error: "Failed to complete QR code" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error completing QR code:", error);
    return NextResponse.json({ error: "Failed to complete QR code" }, { status: 500 });
  }
}
