import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, pushToken } = body;

    if (!userId || !pushToken) {
      return NextResponse.json(
        { success: false, error: "userId and pushToken are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    await DataStore.updateUserPushToken(userId, pushToken);

    return NextResponse.json(
      { success: true, message: "Push token registered successfully" },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update push token" },
      { status: 500, headers: corsHeaders }
    );
  }
}
