import { NextRequest, NextResponse } from "next/server";
import { clubService } from "~~/services/clubService";

// GET /api/clubs - Get all clubs
export async function GET() {
  try {
    const clubs = clubService.getAllClubs();
    const currentClub = clubService.getCurrentClub();

    return NextResponse.json({
      clubs,
      currentClub,
      defaultClub: clubService.getDefaultClub(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch clubs" }, { status: 500 });
  }
}

// POST /api/clubs - Set current club
export async function POST(request: NextRequest) {
  try {
    const { clubId } = await request.json();

    if (!clubId) {
      return NextResponse.json({ error: "Missing clubId" }, { status: 400 });
    }

    const success = clubService.setCurrentClub(clubId);

    if (success) {
      const currentClub = clubService.getCurrentClub();
      return NextResponse.json({
        success: true,
        message: "Club updated",
        currentClub,
      });
    } else {
      return NextResponse.json({ error: "Invalid club ID" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to update club" }, { status: 500 });
  }
}
