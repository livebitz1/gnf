import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";
import { TournamentRecord } from "@/lib/db/mockDb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const tournaments = await DataStore.getTournaments();
    return NextResponse.json(
      {
        success: true,
        tournaments,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    const tournaments = await DataStore.getTournaments();
    return NextResponse.json(
      {
        success: true,
        tournaments,
      },
      { headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTourney: TournamentRecord = {
      id: body.id || "tourney-" + Date.now(),
      title: body.title || "New Tournament",
      subtitle: body.subtitle || "",
      gameType: body.gameType || "VALORANT",
      prizePool: body.prizePool || "₹50,000",
      firstPrize: body.firstPrize || "₹25,000",
      secondPrize: body.secondPrize || "₹15,000",
      thirdPrize: body.thirdPrize || "₹10,000",
      entryFee: body.entryFee || "FREE ENTRY",
      maxSlots: Number(body.maxSlots) || 32,
      filledSlots: Number(body.filledSlots) || 0,
      region: body.region || "Mumbai (India)",
      status: body.status || "OPEN",
      matchStartTime: body.matchStartTime || "06:00 PM Today",
    };

    const updatedTourneys = await DataStore.saveTournament(newTourney);

    return NextResponse.json(
      {
        success: true,
        tournament: newTourney,
        tournaments: updatedTourneys,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid payload" },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedTourneys = await DataStore.deleteTournament(id);

    return NextResponse.json(
      { success: true, deletedId: id, tournaments: updatedTourneys },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
