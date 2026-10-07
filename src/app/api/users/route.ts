import { NextRequest, NextResponse } from "next/server";
import { DataStore } from "@/lib/db/dataStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeUserId = (searchParams.get("excludeUserId") || "").trim();
    const excludeGamertag = (searchParams.get("excludeGamertag") || "").trim().toLowerCase();

    const users = await DataStore.getUsers();
    const registrations = await DataStore.getRegistrations();

    // Build real player list from registered users & tournament registrations
    const playerMap = new Map<string, any>();

    for (const u of users) {
      if (u.gamertag) {
        playerMap.set(u.gamertag.toLowerCase(), {
          id: u.id,
          gamertag: u.gamertag,
          fullName: u.fullName || u.gamertag,
          avatarUrl: u.avatarUrl || "",
          bio: u.bio || "GNF Esports Player",
          primaryGame: "VALORANT",
          rankTier: "Unranked",
          winRate: u.winRate ?? 0,
          matchesPlayed: u.matchesPlayed ?? 0,
          cupsWon: u.cupsWon ?? 0,
          isOnline: true,
        });
      }
    }

    for (const r of registrations) {
      const tag = r.captainIgn || r.teamName || r.userGamertag;
      if (tag && !playerMap.has(tag.toLowerCase())) {
        playerMap.set(tag.toLowerCase(), {
          id: r.userId || `player-${tag.toLowerCase().replace(/\s+/g, "-")}`,
          gamertag: tag,
          fullName: tag,
          avatarUrl: "",
          bio: `${r.gameType || "Esports"} Captain • ${r.teamName || "Squad Leader"}`,
          primaryGame: r.gameType || "VALORANT",
          rankTier: r.rankTier || "Unranked",
          winRate: 0,
          matchesPlayed: 0,
          cupsWon: 0,
          isOnline: true,
        });
      }
    }

    // Never list the requesting user as a player they could add/friend.
    const players = Array.from(playerMap.values()).filter((p) => {
      if (excludeUserId && p.id === excludeUserId) return false;
      if (excludeGamertag && p.gamertag.toLowerCase() === excludeGamertag) return false;
      return true;
    });

    return NextResponse.json({ success: true, players });
  } catch (error: any) {
    console.error("Error fetching community users:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
