import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";
import { GameRecord } from "@/lib/db/mockDb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/admin/games
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "1" || searchParams.get("activeOnly") === "true";

    const gamesList = await DataStore.getGames();
    const tourneys = await DataStore.getTournaments();

    // Attach dynamic live lobby counts
    const gamesWithCounts = gamesList.map((g) => {
      const gNameLower = g.name.toLowerCase();
      const gTagLower = g.tag.toLowerCase();
      const count = tourneys.filter((t) => {
        const gt = (t.gameType || "").toLowerCase();
        return gt.includes(gNameLower) || gt.includes(gTagLower);
      }).length;

      return {
        ...g,
        liveCount: count,
      };
    });

    const finalGames = activeOnly
      ? gamesWithCounts.filter((g) => g.isActive)
      : gamesWithCounts;

    return NextResponse.json(
      {
        success: true,
        games: finalGames,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    const games = await DataStore.getGames();
    return NextResponse.json(
      {
        success: true,
        games,
      },
      { headers: corsHeaders }
    );
  }
}

// POST /api/admin/games - Create new Game
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.tag) {
      return NextResponse.json(
        { success: false, error: "Name and Tag are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const currentGames = await DataStore.getGames();
    const newGame: GameRecord = {
      id: body.id || ("game-" + Date.now()),
      name: body.name.trim(),
      tag: body.tag.trim().toUpperCase(),
      color: body.color || "#6366F1",
      cardBg: body.cardBg || "#F9FAFB",
      borderColor: body.borderColor || "#E5E7EB",
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      displayOrder: Number(body.displayOrder) || (currentGames.length + 1),
      createdAt: new Date().toISOString(),
    };

    const updatedGames = await DataStore.saveGame(newGame);

    return NextResponse.json(
      {
        success: true,
        game: newGame,
        games: updatedGames,
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

// PATCH /api/admin/games - Toggle active or update game
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive, name, tag, color, cardBg, borderColor, displayOrder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Game ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const currentGames = await DataStore.getGames();
    const existing = currentGames.find((g) => g.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404, headers: corsHeaders });
    }

    const updatedGame: GameRecord = {
      ...existing,
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(tag !== undefined ? { tag: tag.trim().toUpperCase() } : {}),
      ...(color !== undefined ? { color } : {}),
      ...(cardBg !== undefined ? { cardBg } : {}),
      ...(borderColor !== undefined ? { borderColor } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      ...(displayOrder !== undefined ? { displayOrder: Number(displayOrder) } : {}),
    };

    const updatedGames = await DataStore.saveGame(updatedGame);

    return NextResponse.json(
      {
        success: true,
        games: updatedGames,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update game" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/admin/games?id=...
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Game ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedGames = await DataStore.deleteGame(id);

    return NextResponse.json(
      {
        success: true,
        deletedId: id,
        games: updatedGames,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
