import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";
import { ChampionRecord } from "@/lib/db/mockDb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/admin/champions - Fetch all 1:1 champion cards
export async function GET() {
  try {
    const champions = await DataStore.getChampions();
    return NextResponse.json(
      {
        success: true,
        champions,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    const champions = await DataStore.getChampions();
    return NextResponse.json(
      {
        success: true,
        champions,
      },
      { headers: corsHeaders }
    );
  }
}

// POST /api/admin/champions - Create or update champion card
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const championId = body.id || "champ-" + Date.now();

    const champRecord: ChampionRecord = {
      id: championId,
      title: (body.title || "Weekly Champion").trim(),
      playerName: (body.playerName || body.gamertag || "@Champion").trim(),
      game: (body.game || "VALORANT").trim(),
      imageUrl: (body.imageUrl || "").trim(),
      achievement: (body.achievement || "").trim(),
      badgeText: (body.badgeText || "CHAMPION").trim(),
      badgeColor: (body.badgeColor || "#F59E0B").trim(),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      displayOrder: Number(body.displayOrder ?? 0),
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const updatedChampions = await DataStore.saveChampion(champRecord);

    return NextResponse.json(
      {
        success: true,
        champion: champRecord,
        champions: updatedChampions,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save champion card" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PATCH /api/admin/champions - Toggle active status or reorder
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Champion ID is required" }, { status: 400, headers: corsHeaders });
    }

    const updates: Partial<ChampionRecord> = {};
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (displayOrder !== undefined) updates.displayOrder = Number(displayOrder);

    const updatedChampions = await DataStore.updateChampionPartial(id, updates);

    return NextResponse.json(
      {
        success: true,
        champions: updatedChampions,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to patch champion" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/admin/champions - Delete a champion card
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
      return NextResponse.json({ success: false, error: "Champion ID is required" }, { status: 400, headers: corsHeaders });
    }

    const updatedChampions = await DataStore.deleteChampion(id);

    return NextResponse.json(
      {
        success: true,
        message: "Champion deleted successfully",
        champions: updatedChampions,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete champion" },
      { status: 500, headers: corsHeaders }
    );
  }
}
