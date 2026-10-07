import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";
import { sendExpoPushNotification } from "@/lib/pushService";
import { requireAdmin } from "@/lib/auth/requireAuth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get("game") || undefined;
    const tokens = await DataStore.getAllPushTokens(gameType);

    return NextResponse.json(
      {
        success: true,
        registeredDeviceCount: tokens.length,
        gameFilter: gameType || "ALL",
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to load push token metrics",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const title = (body.title || "").trim();
    const message = (body.message || body.body || "").trim();
    const gameType = body.gameType || "ALL";
    const customData = body.customData || {};

    if (!title || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Both Notification Title and Message are required.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const tokens = await DataStore.getAllPushTokens(gameType);

    if (tokens.length === 0) {
      return NextResponse.json(
        {
          success: true,
          recipientCount: 0,
          delivered: false,
          message: "No registered hardware device tokens found yet. Notifications will deliver automatically once devices connect.",
        },
        { headers: corsHeaders }
      );
    }

    const dispatchResult = await sendExpoPushNotification({
      to: tokens,
      title: title,
      body: message,
      sound: "default",
      channelId: "gnf_tournament_alerts",
      priority: "high",
      data: {
        type: "ADMIN_BROADCAST",
        gameType: gameType,
        timestamp: new Date().toISOString(),
        ...customData,
      },
    });

    return NextResponse.json(
      {
        success: true,
        recipientCount: tokens.length,
        delivered: dispatchResult,
        title,
        message,
        gameType,
        dispatchedAt: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Broadcast notification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error dispatching push broadcast.",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
