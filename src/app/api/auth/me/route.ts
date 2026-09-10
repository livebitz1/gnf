import { NextResponse } from "next/server";
import { UserRecord } from "@/lib/db/mockDb";
import { DataStore } from "@/lib/db/dataStore";
import { verifyJwt } from "@/lib/auth/jwt";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing Bearer token" },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.split(" ")[1];
    const { valid, payload, error } = await verifyJwt(token);

    if (!valid || !payload) {
      return NextResponse.json(
        { success: false, error: error || "Unauthorized: Invalid JWT token" },
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = payload.userId;
    let user: UserRecord | null = await DataStore.findUser(userId);

    if (!user && payload.email) {
      user = await DataStore.findUser(payload.email);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found" },
        { status: 401, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          gamertag: user.gamertag,
          fullName: user.fullName,
          bio: user.bio || "",
          avatarUrl: user.avatarUrl || "",
          coins: user.coins,
          winRate: user.winRate,
          matchesPlayed: user.matchesPlayed,
          cupsWon: user.cupsWon,
          role: user.role,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch profile" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    let targetUserId = "";
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const { valid, payload } = await verifyJwt(token);
      if (valid && payload) {
        targetUserId = payload.userId;
      }
    }

    const body = await request.json().catch(() => ({}));
    const { bio, avatarUrl, userId, gamertag, fullName } = body;

    const finalUserId = targetUserId || userId;
    if (!finalUserId) {
      return NextResponse.json(
        { success: false, error: "User identification required" },
        { status: 400, headers: corsHeaders }
      );
    }

    let user = await DataStore.findUser(finalUserId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (typeof bio === "string") {
      user.bio = bio.trim();
    }
    if (typeof avatarUrl === "string") {
      user.avatarUrl = avatarUrl.trim();
    }
    if (typeof fullName === "string" && fullName.trim()) {
      user.fullName = fullName.trim();
    }
    if (typeof gamertag === "string" && gamertag.trim()) {
      user.gamertag = gamertag.trim();
    }

    await DataStore.saveUser(user);

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user.id,
          email: user.email,
          gamertag: user.gamertag,
          fullName: user.fullName,
          bio: user.bio || "",
          avatarUrl: user.avatarUrl || "",
          coins: user.coins,
          winRate: user.winRate,
          matchesPlayed: user.matchesPlayed,
          cupsWon: user.cupsWon,
          role: user.role,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update profile" },
      { status: 500, headers: corsHeaders }
    );
  }
}
