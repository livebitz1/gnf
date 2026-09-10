import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";
import { LiveMatchRecord } from "@/lib/db/mockDb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/admin/live-match - Fetch all live VS match cards
export async function GET() {
  try {
    const liveMatches = await DataStore.getLiveMatches();
    return NextResponse.json(
      {
        success: true,
        liveMatches,
        liveMatch: liveMatches[0] || null,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    const liveMatches = await DataStore.getLiveMatches();
    return NextResponse.json(
      {
        success: true,
        liveMatches,
        liveMatch: liveMatches[0] || null,
      },
      { headers: corsHeaders }
    );
  }
}

// POST /api/admin/live-match - Create new or update existing live VS card
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const matchId = body.id || `live-vs-${Date.now()}`;

    const updatedRecord: LiveMatchRecord = {
      id: matchId,
      title: (body.title || "Valorant • Finals").trim(),
      stage: (body.stage || "Map 1: Ascent").trim(),
      gameType: (body.gameType || "VALORANT").trim(),
      team1Name: (body.team1Name || "Team 1").trim(),
      team1Tag: (body.team1Tag || "T1").trim(),
      team1Color: (body.team1Color || "#6366F1").trim(),
      team2Name: (body.team2Name || "Team 2").trim(),
      team2Tag: (body.team2Tag || "T2").trim(),
      team2Color: (body.team2Color || "#FF2E93").trim(),
      streamUrl: (body.streamUrl || "https://www.youtube.com").trim(),
      viewerCount: (body.viewerCount || "1,420 Watching").trim(),
      isLive: body.isLive !== undefined ? Boolean(body.isLive) : true,
      updatedAt: new Date().toISOString(),
    };

    const updatedMatches = await DataStore.saveLiveMatch(updatedRecord);

    return NextResponse.json(
      {
        success: true,
        liveMatches: updatedMatches,
        liveMatch: updatedRecord,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save live match" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PATCH /api/admin/live-match - Partial update (e.g. toggle live state)
export async function PATCH(request: Request) {
  return POST(request);
}

// DELETE /api/admin/live-match - Delete a live match card
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    let id = url.searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Match ID is required" }, { status: 400, headers: corsHeaders });
    }

    const updatedMatches = await DataStore.deleteLiveMatch(id);

    return NextResponse.json(
      {
        success: true,
        message: "Live match deleted successfully",
        liveMatches: updatedMatches,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete live match" },
      { status: 500, headers: corsHeaders }
    );
  }
}

