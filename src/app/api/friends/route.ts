import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "";

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId parameter" }, { status: 400 });
    }

    const data = await DataStore.getFriendships(userId);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Error in GET /api/friends:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "SEND_REQUEST") {
      const {
        senderId,
        senderGamertag,
        senderAvatar,
        senderBio,
        senderWinRate,
        senderCupsWon,
        receiverId,
        receiverGamertag,
        receiverAvatar,
        receiverBio,
        receiverWinRate,
        receiverCupsWon,
      } = body;

      if (!senderGamertag || !receiverGamertag) {
        return NextResponse.json({ success: false, error: "Missing required sender/receiver gamertags" }, { status: 400 });
      }

      const res = await DataStore.sendFriendRequest({
        senderId: senderId || "user-unknown",
        senderGamertag,
        senderAvatar,
        senderBio,
        senderWinRate,
        senderCupsWon,
        receiverId: receiverId || "user-unknown",
        receiverGamertag,
        receiverAvatar,
        receiverBio,
        receiverWinRate,
        receiverCupsWon,
      });

      return NextResponse.json(res);
    }

    if (action === "RESPOND_REQUEST") {
      const { requestId, decision } = body; // decision: 'ACCEPT' | 'DECLINE' | 'CANCEL'
      if (!requestId || !decision) {
        return NextResponse.json({ success: false, error: "Missing requestId or decision" }, { status: 400 });
      }

      const res = await DataStore.respondFriendRequest(requestId, decision);
      return NextResponse.json(res);
    }

    if (action === "REMOVE_FRIEND") {
      const { userId, friendId } = body;
      if (!userId || !friendId) {
        return NextResponse.json({ success: false, error: "Missing userId or friendId" }, { status: 400 });
      }

      const res = await DataStore.removeFriendship(userId, friendId);
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in POST /api/friends:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
