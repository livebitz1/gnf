import { NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";
import { RegistrationRecord } from "@/lib/db/mockDb";
import { sendExpoPushNotification } from "@/lib/pushService";
import { requireUser, requireAdmin } from "@/lib/auth/requireAuth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  // Full registration records include private data (room credentials, rosters,
  // contact handles) once approved, so any caller must at least be signed in —
  // not necessarily an admin, since players legitimately fetch this list to
  // find their own registrations (filtered client-side by userId).
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const game = searchParams.get("game");

  try {
    const allRegs = await DataStore.getRegistrations();
    let filtered = [...allRegs];
    if (status && status !== "ALL") {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (game && game !== "ALL") {
      filtered = filtered.filter((r) => r.gameType === game);
    }

    return NextResponse.json(
      {
        success: true,
        count: filtered.length,
        registrations: filtered,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    const allRegs = await DataStore.getRegistrations();
    return NextResponse.json(
      {
        success: true,
        count: allRegs.length,
        registrations: allRegs,
      },
      { headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const newReg: RegistrationRecord = {
      id: body.id || "reg-" + Date.now(),
      tournamentId: body.tournamentId || "",
      tournamentTitle: body.tournamentTitle || "Tournament",
      gameType: body.gameType || "VALORANT",
      userId: body.userId || "guest",
      userGamertag: body.userGamertag || "Player",
      teamName: body.teamName || "Team",
      teamTag: body.teamTag || "",
      captainIgn: body.captainIgn || "",
      captainGameId: body.captainGameId || "",
      rankTier: body.rankTier || "",
      roster: body.roster || [],
      contactHandle: body.contactHandle || "",
      contactType: body.contactType || "DISCORD",
      deviceInfo: body.deviceInfo || "",
      pushToken: body.pushToken || "",
      status: body.status || "PENDING_APPROVAL",
      rejectionReason: body.rejectionReason || "",
      roomId: body.roomId || "",
      roomPass: body.roomPass || "",
      serverInfo: body.serverInfo || "",
      createdAt: new Date().toISOString(),
      reviewedAt: body.reviewedAt || "",
      reviewedBy: body.reviewedBy || "",
    };

    const updatedRegs = await DataStore.saveRegistration(newReg);

    return NextResponse.json(
      { success: true, registration: newReg, registrations: updatedRegs },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid payload" },
      { status: 400, headers: corsHeaders }
    );
  }
}

// Update / Approve / Reject Registration Status
export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { id, status, roomId, roomPass, rejectionReason, reviewedBy } = body;

    const allRegs = await DataStore.getRegistrations();
    const existing = allRegs.find((r) => r.id === id);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404, headers: corsHeaders });
    }

    const updatedReg: RegistrationRecord = {
      ...existing,
      status: status || existing.status,
      roomId: roomId !== undefined ? roomId : existing.roomId,
      roomPass: roomPass !== undefined ? roomPass : existing.roomPass,
      rejectionReason: rejectionReason !== undefined ? rejectionReason : existing.rejectionReason,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewedBy || "GNF_Admin",
    };

    const updatedRegs = await DataStore.saveRegistration(updatedReg);

    // If squad is APPROVED, send Expo Push Notification to player's lock screen
    if (status === "APPROVED") {
      (async () => {
        try {
          const user = await DataStore.findUser(existing.userId);
          const targetToken = existing.pushToken || user?.pushToken;

          if (targetToken) {
            await sendExpoPushNotification({
              to: targetToken,
              title: `🎉 SQUAD APPROVED: ${updatedReg.teamName || updatedReg.captainIgn || "Squad"}`,
              body: `Your squad is locked in for ${updatedReg.tournamentTitle}! Official Room ID: ${updatedReg.roomId || "Ready"} & Pass unlocked.`,
              data: {
                tournamentId: updatedReg.tournamentId,
                roomId: updatedReg.roomId,
                roomPass: updatedReg.roomPass,
                screen: "tournament",
              },
              priority: "high",
              sound: "default",
            });
          }
        } catch (pushErr) {
          console.warn("Push notification dispatch error:", pushErr);
        }
      })();
    }

    return NextResponse.json(
      { success: true, registration: updatedReg, registrations: updatedRegs },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Delete Registration
export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Registration ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedRegs = await DataStore.deleteRegistration(id);

    return NextResponse.json(
      { success: true, message: `Registration ${id} deleted successfully`, registrations: updatedRegs },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}

