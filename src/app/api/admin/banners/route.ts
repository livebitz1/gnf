import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";
import { HeroBannerRecord } from "@/lib/db/mockDb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/admin/banners - Fetch all hero banners
export async function GET() {
  try {
    const banners = await DataStore.getBanners();
    return NextResponse.json(
      {
        success: true,
        banners,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    const banners = await DataStore.getBanners();
    return NextResponse.json(
      {
        success: true,
        banners,
      },
      { headers: corsHeaders }
    );
  }
}

// POST /api/admin/banners - Create new or update existing hero banner
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bannerId = body.id || "banner-" + Date.now();

    const bannerRecord: HeroBannerRecord = {
      id: bannerId,
      title: (body.title || "Featured Tournament").trim(),
      subtitle: (body.subtitle || "").trim(),
      game: (body.game || "VALORANT").trim(),
      imageUrl: (body.imageUrl || "").trim(),
      ctaColor: (body.ctaColor || "#FF2E93").trim(),
      ctaText: (body.ctaText || "Join Tournament").trim(),
      targetTournamentId: (body.targetTournamentId || "").trim(),
      targetUrl: (body.targetUrl || "").trim(),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      displayOrder: Number(body.displayOrder ?? 0),
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const updatedBanners = await DataStore.saveBanner(bannerRecord);

    return NextResponse.json(
      {
        success: true,
        banner: bannerRecord,
        banners: updatedBanners,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save hero banner" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PATCH /api/admin/banners - Toggle active status or reorder
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Banner ID is required" }, { status: 400, headers: corsHeaders });
    }

    const updates: Partial<HeroBannerRecord> = {};
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (displayOrder !== undefined) updates.displayOrder = Number(displayOrder);

    const updatedBanners = await DataStore.updateBannerPartial(id, updates);

    return NextResponse.json(
      {
        success: true,
        banners: updatedBanners,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to patch banner" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/admin/banners - Delete a hero banner
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
      return NextResponse.json({ success: false, error: "Banner ID is required" }, { status: 400, headers: corsHeaders });
    }

    const updatedBanners = await DataStore.deleteBanner(id);

    return NextResponse.json(
      {
        success: true,
        message: "Banner deleted successfully",
        banners: updatedBanners,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete banner" },
      { status: 500, headers: corsHeaders }
    );
  }
}
