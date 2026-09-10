import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";
import { UserRecord } from "@/lib/db/mockDb";
import { verifyPassword, signJwt, hashPassword } from "@/lib/auth/jwt";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, username, emailOrUsername } = body;

    const identifier = (email || username || emailOrUsername || "").toLowerCase().trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email/username and password" },
        { status: 400, headers: corsHeaders }
      );
    }

    const foundUser: UserRecord | null = await DataStore.findUser(identifier);

    if (!foundUser) {
      return NextResponse.json(
        { success: false, error: "No account found with this email or username. Please sign up first." },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, foundUser.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect password. Please try again." },
        { status: 401, headers: corsHeaders }
      );
    }

    // Generate signed JWT token
    const token = await signJwt({
      userId: foundUser.id,
      email: foundUser.email,
      gamertag: foundUser.gamertag,
      role: foundUser.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          gamertag: foundUser.gamertag,
          fullName: foundUser.fullName,
          bio: foundUser.bio || "",
          avatarUrl: foundUser.avatarUrl || "",
          coins: foundUser.coins,
          winRate: foundUser.winRate,
          matchesPlayed: foundUser.matchesPlayed,
          cupsWon: foundUser.cupsWon,
          role: foundUser.role,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Login failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
