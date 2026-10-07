import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";
import { TournamentRecord } from "@/lib/db/mockDb";
import { sendExpoPushNotification } from "@/lib/pushService";
import { requireAdmin } from "@/lib/auth/requireAuth";

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
        tournaments: tournaments || [],
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("GET tournaments route error:", err);
    return NextResponse.json(
      {
        success: true,
        tournaments: [],
      },
      { headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

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

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedTourneys = await DataStore.updateTournamentPartial(id, updates);
    const updatedTourney = updatedTourneys.find((t) => t.id === id);

    // If tournament was marked LIVE, send lock-screen push notification to all registered squads
    if (updates.status === "LIVE" && updatedTourney) {
      (async () => {
        try {
          const allRegs = await DataStore.getRegistrations();
          const targetRegs = allRegs.filter((r) => r.tournamentId === id || r.tournamentTitle === updatedTourney.title);
          const allUsers = await DataStore.getUsers();

          const tokens = new Set<string>();
          for (const reg of targetRegs) {
            if (reg.pushToken) tokens.add(reg.pushToken);
            const user = allUsers.find((u) => u.id === reg.userId);
            if (user?.pushToken) tokens.add(user.pushToken);
          }

          if (tokens.size > 0) {
            await sendExpoPushNotification({
              to: Array.from(tokens),
              title: `🔥 TOURNAMENT IS LIVE: ${updatedTourney.title}`,
              body: `Match lobby is open! Connect to the tournament room now.`,
              data: {
                tournamentId: id,
                screen: "tournament",
              },
              priority: "high",
              sound: "default",
            });
          }
        } catch (err) {
          console.warn("Live push notification error:", err);
        }
      })();
    }

    return NextResponse.json(
      {
        success: true,
        tournaments: updatedTourneys,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

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
