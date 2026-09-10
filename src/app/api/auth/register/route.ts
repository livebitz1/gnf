import { NextResponse } from "next/server";
import { UserRecord } from "@/lib/db/mockDb";
import { DataStore } from "@/lib/db/dataStore";
import { hashPassword, signJwt } from "@/lib/auth/jwt";

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
    const { email, password, gamertag, fullName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanGamertag = (gamertag || cleanEmail.split("@")[0] || "Player").trim();

    // 1. Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Password length check
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Gamertag length check
    if (cleanGamertag.length < 3) {
      return NextResponse.json(
        { success: false, error: "Gamertag must be at least 3 characters long" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 4. Check existing email
    const existingEmail = await DataStore.findUser(cleanEmail);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409, headers: corsHeaders }
      );
    }

    // 5. Check existing gamertag
    const existingGamertag = await DataStore.findUser(cleanGamertag);
    if (existingGamertag) {
      return NextResponse.json(
        { success: false, error: "This gamertag is already taken. Please choose another." },
        { status: 409, headers: corsHeaders }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = "user-" + Date.now();

    const newUser: UserRecord = {
      id: userId,
      email: cleanEmail,
      passwordHash,
      gamertag: cleanGamertag,
      fullName: fullName || cleanGamertag,
      bio: "",
      avatarUrl: "",
      coins: 500, // Welcome bonus
      winRate: 0,
      matchesPlayed: 0,
      cupsWon: 0,
      role: "USER",
      createdAt: new Date().toISOString(),
    };

    // Save to DataStore (disk + D1 sync)
    await DataStore.saveUser(newUser);

    // Generate JWT token
    const token = await signJwt({
      userId: newUser.id,
      email: newUser.email,
      gamertag: newUser.gamertag,
      role: newUser.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          gamertag: newUser.gamertag,
          fullName: newUser.fullName,
          bio: "",
          avatarUrl: "",
          coins: newUser.coins,
          winRate: newUser.winRate,
          matchesPlayed: newUser.matchesPlayed,
          cupsWon: newUser.cupsWon,
          role: newUser.role,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Registration failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
