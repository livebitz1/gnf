import fs from "fs";
import path from "path";
import {
  initialHeroBanners,
  initialChampions,
  initialGames,
  initialTournaments,
  initialLiveMatches,
  initialUsers,
  initialRegistrations,
  HeroBannerRecord,
  ChampionRecord,
  GameRecord,
  TournamentRecord,
  LiveMatchRecord,
  UserRecord,
  RegistrationRecord,
} from "./mockDb";
import { executeD1Query } from "./d1Client";

export interface DataStoreState {
  banners: HeroBannerRecord[];
  champions: ChampionRecord[];
  games: GameRecord[];
  tournaments: TournamentRecord[];
  liveMatches: LiveMatchRecord[];
  registrations: RegistrationRecord[];
  users: UserRecord[];
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "gnf_store.json");

let memoryState: DataStoreState | null = null;

function getInitialState(): DataStoreState {
  return {
    banners: [...initialHeroBanners],
    champions: [...initialChampions],
    games: [...initialGames],
    tournaments: [...initialTournaments],
    liveMatches: [...initialLiveMatches],
    registrations: [...initialRegistrations],
    users: [...initialUsers],
    lastUpdated: new Date().toISOString(),
  };
}

function loadFromDisk(): DataStoreState {
  if (memoryState) return memoryState;

  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      memoryState = {
        banners: Array.isArray(parsed.banners) ? parsed.banners : [...initialHeroBanners],
        champions: Array.isArray(parsed.champions) ? parsed.champions : [...initialChampions],
        games: Array.isArray(parsed.games) ? parsed.games : [...initialGames],
        tournaments: Array.isArray(parsed.tournaments) ? parsed.tournaments : [...initialTournaments],
        liveMatches: Array.isArray(parsed.liveMatches) ? parsed.liveMatches : [...initialLiveMatches],
        registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [...initialRegistrations],
        users: Array.isArray(parsed.users) ? parsed.users : [...initialUsers],
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
      return memoryState;
    }
  } catch (e) {
    console.warn("Notice reading persistent store from disk:", e);
  }

  memoryState = getInitialState();
  saveToDisk(memoryState);
  return memoryState;
}

function saveToDisk(state: DataStoreState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.warn("Notice writing persistent store to disk:", e);
  }
}

export const DataStore = {
  // ==========================================
  // BANNERS
  // ==========================================
  async getBanners(): Promise<HeroBannerRecord[]> {
    const state = loadFromDisk();

    // 1. Try fetching from Cloudflare D1
    try {
      const d1Res = await executeD1Query(
        "SELECT * FROM hero_banners ORDER BY display_order ASC, created_at DESC"
      );
      if (d1Res.success && Array.isArray(d1Res.results) && d1Res.results.length > 0) {
        const d1Banners: HeroBannerRecord[] = d1Res.results.map((row: any) => ({
          id: row.id,
          title: row.title || "Hero Banner",
          subtitle: row.subtitle || "",
          game: row.game || "VALORANT",
          imageUrl: row.image_url || row.imageUrl || "",
          ctaColor: row.cta_color || row.ctaColor || "#FF2E93",
          ctaText: row.cta_text || row.ctaText || "Join Tournament",
          targetTournamentId: row.target_tournament_id || row.targetTournamentId || "",
          targetUrl: row.target_url || row.targetUrl || "",
          isActive: Boolean(row.is_active === 1 || row.is_active === true || row.isActive === true || row.isActive === 1),
          displayOrder: Number(row.display_order ?? row.displayOrder ?? 0),
          createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        }));

        state.banners = d1Banners;
        saveToDisk(state);
        return state.banners;
      }
    } catch (e) {
      // D1 query notice
    }

    return state.banners;
  },

  async saveBanner(banner: HeroBannerRecord): Promise<HeroBannerRecord[]> {
    const state = loadFromDisk();
    const existingIndex = state.banners.findIndex((b) => b.id === banner.id);

    if (existingIndex >= 0) {
      state.banners[existingIndex] = banner;
    } else {
      state.banners.push(banner);
    }

    state.banners.sort((a, b) => a.displayOrder - b.displayOrder);
    saveToDisk(state);

    // Sync to Cloudflare D1 asynchronously
    executeD1Query(
      `INSERT INTO hero_banners (id, title, subtitle, game, image_url, cta_color, cta_text, target_tournament_id, target_url, is_active, display_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         subtitle = excluded.subtitle,
         game = excluded.game,
         image_url = excluded.image_url,
         cta_color = excluded.cta_color,
         cta_text = excluded.cta_text,
         target_tournament_id = excluded.target_tournament_id,
         target_url = excluded.target_url,
         is_active = excluded.is_active,
         display_order = excluded.display_order`,
      [
        banner.id,
        banner.title,
        banner.subtitle || "",
        banner.game,
        banner.imageUrl,
        banner.ctaColor,
        banner.ctaText || "Join Tournament",
        banner.targetTournamentId || "",
        banner.targetUrl || "",
        banner.isActive ? 1 : 0,
        banner.displayOrder,
        banner.createdAt,
      ]
    ).catch(() => {});

    return state.banners;
  },

  async deleteBanner(id: string): Promise<HeroBannerRecord[]> {
    const state = loadFromDisk();
    state.banners = state.banners.filter((b) => b.id !== id);
    saveToDisk(state);

    executeD1Query("DELETE FROM hero_banners WHERE id = ?", [id]).catch(() => {});
    return state.banners;
  },

  async updateBannerPartial(id: string, updates: Partial<HeroBannerRecord>): Promise<HeroBannerRecord[]> {
    const state = loadFromDisk();
    const idx = state.banners.findIndex((b) => b.id === id);
    if (idx >= 0) {
      state.banners[idx] = { ...state.banners[idx], ...updates };
      state.banners.sort((a, b) => a.displayOrder - b.displayOrder);
      saveToDisk(state);

      const banner = state.banners[idx];
      executeD1Query(
        `UPDATE hero_banners SET is_active = ?, display_order = ? WHERE id = ?`,
        [banner.isActive ? 1 : 0, banner.displayOrder, id]
      ).catch(() => {});
    }
    return state.banners;
  },

  // ==========================================
  // TOURNAMENTS
  // ==========================================
  async getTournaments(): Promise<TournamentRecord[]> {
    const state = loadFromDisk();
    try {
      const d1Res = await executeD1Query("SELECT * FROM tournaments ORDER BY created_at DESC");
      if (d1Res.success && Array.isArray(d1Res.results) && d1Res.results.length > 0) {
        state.tournaments = d1Res.results.map((row: any) => ({
          id: row.id,
          title: row.title,
          subtitle: row.subtitle || "",
          gameType: row.game_type || row.gameType || "VALORANT",
          prizePool: row.prize_pool || row.prizePool || "₹50,000",
          firstPrize: row.first_prize || row.firstPrize || "",
          secondPrize: row.second_prize || row.secondPrize || "",
          thirdPrize: row.third_prize || row.thirdPrize || "",
          entryFee: row.entry_fee || row.entryFee || "FREE ENTRY",
          maxSlots: Number(row.max_slots || row.maxSlots || 32),
          filledSlots: Number(row.filled_slots || row.filledSlots || 0),
          region: row.region || "Mumbai (India)",
          status: row.status || "OPEN",
          matchStartTime: row.match_start_time || row.matchStartTime || "06:00 PM Today",
        }));
        saveToDisk(state);
      }
    } catch (e) {}

    // Ensure filledSlots dynamically matches real-time registrations count
    const regCounts = new Map<string, number>();
    state.registrations.forEach((r) => {
      if (r.tournamentId) {
        regCounts.set(r.tournamentId, (regCounts.get(r.tournamentId) || 0) + 1);
      }
      if (r.tournamentTitle) {
        regCounts.set(r.tournamentTitle, (regCounts.get(r.tournamentTitle) || 0) + 1);
      }
    });

    state.tournaments = state.tournaments.map((t) => {
      const realCount = regCounts.get(t.id) || regCounts.get(t.title) || 0;
      return {
        ...t,
        filledSlots: Math.max(t.filledSlots || 0, realCount),
      };
    });

    return state.tournaments;
  },

  async saveTournament(tourney: TournamentRecord): Promise<TournamentRecord[]> {
    const state = loadFromDisk();
    const idx = state.tournaments.findIndex((t) => t.id === tourney.id);
    if (idx >= 0) {
      state.tournaments[idx] = tourney;
    } else {
      state.tournaments.unshift(tourney);
    }
    saveToDisk(state);

    executeD1Query(
      `INSERT INTO tournaments (
        id, title, subtitle, game_type, prize_pool, first_prize, second_prize,
        third_prize, entry_fee, max_slots, filled_slots, region, status, match_start_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        subtitle = excluded.subtitle,
        game_type = excluded.game_type,
        prize_pool = excluded.prize_pool,
        first_prize = excluded.first_prize,
        second_prize = excluded.second_prize,
        third_prize = excluded.third_prize,
        entry_fee = excluded.entry_fee,
        max_slots = excluded.max_slots,
        filled_slots = excluded.filled_slots,
        region = excluded.region,
        status = excluded.status,
        match_start_time = excluded.match_start_time`,
      [
        tourney.id,
        tourney.title,
        tourney.subtitle || "",
        tourney.gameType,
        tourney.prizePool,
        tourney.firstPrize || "",
        tourney.secondPrize || "",
        tourney.thirdPrize || "",
        tourney.entryFee || "FREE ENTRY",
        tourney.maxSlots,
        tourney.filledSlots,
        tourney.region || "Mumbai (India)",
        tourney.status,
        tourney.matchStartTime,
      ]
    ).catch(() => {});

    return state.tournaments;
  },

  async deleteTournament(id: string): Promise<TournamentRecord[]> {
    const state = loadFromDisk();
    state.tournaments = state.tournaments.filter((t) => t.id !== id);
    saveToDisk(state);
    executeD1Query("DELETE FROM tournaments WHERE id = ?", [id]).catch(() => {});
    return state.tournaments;
  },

  // ==========================================
  // GAMES
  // ==========================================
  async getGames(): Promise<GameRecord[]> {
    const state = loadFromDisk();
    try {
      const d1Res = await executeD1Query("SELECT * FROM games ORDER BY display_order ASC, created_at ASC");
      if (d1Res.success && Array.isArray(d1Res.results) && d1Res.results.length > 0) {
        state.games = d1Res.results.map((row: any) => ({
          id: row.id,
          name: row.name,
          tag: row.tag,
          color: row.color,
          cardBg: row.card_bg || row.cardBg,
          borderColor: row.border_color || row.borderColor,
          isActive: Boolean(row.is_active === 1 || row.is_active === true || row.isActive === true),
          displayOrder: Number(row.display_order ?? row.displayOrder ?? 0),
          createdAt: row.created_at || row.createdAt,
        }));
        saveToDisk(state);
      }
    } catch (e) {}
    return state.games;
  },

  async saveGame(game: GameRecord): Promise<GameRecord[]> {
    const state = loadFromDisk();
    const idx = state.games.findIndex((g) => g.id === game.id);
    if (idx >= 0) {
      state.games[idx] = game;
    } else {
      state.games.push(game);
    }
    state.games.sort((a, b) => a.displayOrder - b.displayOrder);
    saveToDisk(state);

    executeD1Query(
      `INSERT INTO games (id, name, tag, color, card_bg, border_color, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         tag = excluded.tag,
         color = excluded.color,
         card_bg = excluded.card_bg,
         border_color = excluded.border_color,
         is_active = excluded.is_active,
         display_order = excluded.display_order`,
      [
        game.id,
        game.name,
        game.tag,
        game.color,
        game.cardBg || "",
        game.borderColor || "",
        game.isActive ? 1 : 0,
        game.displayOrder,
      ]
    ).catch(() => {});

    return state.games;
  },

  async deleteGame(id: string): Promise<GameRecord[]> {
    const state = loadFromDisk();
    state.games = state.games.filter((g) => g.id !== id);
    saveToDisk(state);
    executeD1Query("DELETE FROM games WHERE id = ?", [id]).catch(() => {});
    return state.games;
  },

  // ==========================================
  // LIVE MATCHES
  // ==========================================
  async getLiveMatches(): Promise<LiveMatchRecord[]> {
    const state = loadFromDisk();
    try {
      const d1Res = await executeD1Query("SELECT * FROM live_matches ORDER BY updated_at DESC");
      if (d1Res.success && Array.isArray(d1Res.results) && d1Res.results.length > 0) {
        state.liveMatches = d1Res.results.map((row: any) => ({
          id: row.id,
          title: row.title || "Live Match",
          stage: row.stage || "Stage 1",
          gameType: row.game_type || row.gameType || "VALORANT",
          team1Name: row.team1_name || row.team1Name || "Team 1",
          team1Tag: row.team1_tag || row.team1Tag || "T1",
          team1Color: row.team1_color || row.team1Color || "#6366F1",
          team2Name: row.team2_name || row.team2Name || "Team 2",
          team2Tag: row.team2_tag || row.team2Tag || "T2",
          team2Color: row.team2_color || row.team2Color || "#FF2E93",
          streamUrl: row.stream_url || row.streamUrl || "https://www.youtube.com",
          viewerCount: row.viewer_count || row.viewerCount || "1,200 Watching",
          isLive: Boolean(row.is_live === 1 || row.is_live === true || row.isLive === true),
          updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
        }));
        saveToDisk(state);
      }
    } catch (e) {}
    return state.liveMatches;
  },

  async saveLiveMatch(match: LiveMatchRecord): Promise<LiveMatchRecord[]> {
    const state = loadFromDisk();
    const idx = state.liveMatches.findIndex((m) => m.id === match.id);
    if (idx >= 0) {
      state.liveMatches[idx] = match;
    } else {
      state.liveMatches.unshift(match);
    }
    saveToDisk(state);

    executeD1Query(
      `INSERT INTO live_matches (id, title, stage, game_type, team1_name, team1_tag, team1_color, team2_name, team2_tag, team2_color, stream_url, viewer_count, is_live, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         stage = excluded.stage,
         game_type = excluded.game_type,
         team1_name = excluded.team1_name,
         team1_tag = excluded.team1_tag,
         team1_color = excluded.team1_color,
         team2_name = excluded.team2_name,
         team2_tag = excluded.team2_tag,
         team2_color = excluded.team2_color,
         stream_url = excluded.stream_url,
         viewer_count = excluded.viewer_count,
         is_live = excluded.is_live,
         updated_at = excluded.updated_at`,
      [
        match.id,
        match.title,
        match.stage,
        match.gameType,
        match.team1Name,
        match.team1Tag,
        match.team1Color || "#6366F1",
        match.team2Name,
        match.team2Tag,
        match.team2Color || "#FF2E93",
        match.streamUrl,
        match.viewerCount,
        match.isLive ? 1 : 0,
        match.updatedAt || new Date().toISOString(),
      ]
    ).catch(() => {});

    return state.liveMatches;
  },

  async deleteLiveMatch(id: string): Promise<LiveMatchRecord[]> {
    const state = loadFromDisk();
    state.liveMatches = state.liveMatches.filter((m) => m.id !== id);
    saveToDisk(state);
    executeD1Query("DELETE FROM live_matches WHERE id = ?", [id]).catch(() => {});
    return state.liveMatches;
  },

  // ==========================================
  // REGISTRATIONS
  // ==========================================
  async getRegistrations(): Promise<RegistrationRecord[]> {
    const state = loadFromDisk();
    try {
      const d1Res = await executeD1Query("SELECT * FROM registrations ORDER BY created_at DESC");
      if (d1Res.success && Array.isArray(d1Res.results) && d1Res.results.length > 0) {
        state.registrations = d1Res.results.map((row: any) => ({
          id: row.id,
          tournamentId: row.tournament_id || row.tournamentId,
          tournamentTitle: row.tournament_title || row.tournamentTitle,
          gameType: row.game_type || row.gameType,
          userId: row.user_id || row.userId,
          userGamertag: row.user_gamertag || row.userGamertag,
          teamName: row.team_name || row.teamName,
          teamTag: row.team_tag || row.teamTag,
          captainIgn: row.captain_ign || row.captainIgn,
          captainGameId: row.captain_game_id || row.captainGameId,
          rankTier: row.rank_tier || row.rankTier,
          roster: row.roster_json ? JSON.parse(row.roster_json) : (row.roster || []),
          contactHandle: row.contact_handle || row.contactHandle,
          contactType: row.contact_type || row.contactType || "DISCORD",
          deviceInfo: row.device_info || row.deviceInfo,
          status: row.status || "PENDING_APPROVAL",
          rejectionReason: row.rejection_reason || row.rejectionReason,
          roomId: row.room_id || row.roomId,
          roomPass: row.room_pass || row.roomPass,
          serverInfo: row.server_info || row.serverInfo,
          createdAt: row.created_at || row.createdAt || new Date().toISOString(),
          reviewedAt: row.reviewed_at || row.reviewedAt,
          reviewedBy: row.reviewed_by || row.reviewedBy,
        }));
        saveToDisk(state);
      }
    } catch (e) {}
    return state.registrations;
  },

  async saveRegistration(reg: RegistrationRecord): Promise<RegistrationRecord[]> {
    const state = loadFromDisk();
    const idx = state.registrations.findIndex((r) => r.id === reg.id);
    if (idx >= 0) {
      state.registrations[idx] = reg;
    } else {
      state.registrations.unshift(reg);
    }

    // Sync filledSlots on the corresponding tournament
    const matchingCount = state.registrations.filter(
      (r) => (r.tournamentId && r.tournamentId === reg.tournamentId) || r.tournamentTitle === reg.tournamentTitle
    ).length;
    const tourneyIdx = state.tournaments.findIndex(
      (t) => t.id === reg.tournamentId || t.title === reg.tournamentTitle
    );
    if (tourneyIdx >= 0) {
      state.tournaments[tourneyIdx].filledSlots = Math.max(state.tournaments[tourneyIdx].filledSlots || 0, matchingCount);
      executeD1Query(
        "UPDATE tournaments SET filled_slots = ? WHERE id = ? OR title = ?",
        [state.tournaments[tourneyIdx].filledSlots, reg.tournamentId || "", reg.tournamentTitle || ""]
      ).catch(() => {});
    }

    saveToDisk(state);

    executeD1Query(
      `INSERT INTO registrations (
        id, tournament_id, tournament_title, game_type, user_id, user_gamertag,
        team_name, team_tag, captain_ign, captain_game_id, rank_tier, roster_json,
        contact_handle, contact_type, device_info, status, rejection_reason,
        room_id, room_pass, server_info, created_at, reviewed_at, reviewed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        rejection_reason = excluded.rejection_reason,
        room_id = excluded.room_id,
        room_pass = excluded.room_pass,
        server_info = excluded.server_info,
        reviewed_at = excluded.reviewed_at,
        reviewed_by = excluded.reviewed_by`,
      [
        reg.id,
        reg.tournamentId,
        reg.tournamentTitle,
        reg.gameType,
        reg.userId,
        reg.userGamertag,
        reg.teamName,
        reg.teamTag || "",
        reg.captainIgn,
        reg.captainGameId,
        reg.rankTier || "",
        JSON.stringify(reg.roster || []),
        reg.contactHandle,
        reg.contactType,
        reg.deviceInfo || "",
        reg.status,
        reg.rejectionReason || "",
        reg.roomId || "",
        reg.roomPass || "",
        reg.serverInfo || "",
        reg.createdAt,
        reg.reviewedAt || "",
        reg.reviewedBy || "",
      ]
    ).catch(() => {});

    return state.registrations;
  },

  async deleteRegistration(id: string): Promise<RegistrationRecord[]> {
    const state = loadFromDisk();
    const deletedReg = state.registrations.find((r) => r.id === id);
    state.registrations = state.registrations.filter((r) => r.id !== id);

    if (deletedReg) {
      const remainingCount = state.registrations.filter(
        (r) => (r.tournamentId && r.tournamentId === deletedReg.tournamentId) || r.tournamentTitle === deletedReg.tournamentTitle
      ).length;
      const tourneyIdx = state.tournaments.findIndex(
        (t) => t.id === deletedReg.tournamentId || t.title === deletedReg.tournamentTitle
      );
      if (tourneyIdx >= 0) {
        state.tournaments[tourneyIdx].filledSlots = remainingCount;
        executeD1Query(
          "UPDATE tournaments SET filled_slots = ? WHERE id = ? OR title = ?",
          [remainingCount, deletedReg.tournamentId || "", deletedReg.tournamentTitle || ""]
        ).catch(() => {});
      }
    }

    saveToDisk(state);
    executeD1Query("DELETE FROM registrations WHERE id = ?", [id]).catch(() => {});
    return state.registrations;
  },

  // ==========================================
  // USERS & AUTHENTICATION
  // ==========================================
  async getUsers(): Promise<UserRecord[]> {
    const state = loadFromDisk();
    try {
      const d1Res = await executeD1Query("SELECT * FROM users ORDER BY created_at DESC");
      if (d1Res.success && Array.isArray(d1Res.results) && d1Res.results.length > 0) {
        state.users = d1Res.results.map((row: any) => ({
          id: row.id,
          email: row.email,
          passwordHash: row.password_hash || row.passwordHash || "",
          gamertag: row.gamertag,
          fullName: row.full_name || row.fullName || row.gamertag,
          bio: row.bio || row.user_bio || "",
          avatarUrl: row.avatar_url || row.avatarUrl || row.avatar || "",
          coins: Number(row.coins ?? 0),
          winRate: Number(row.win_rate ?? row.winRate ?? 0),
          matchesPlayed: Number(row.matches_played ?? row.matchesPlayed ?? 0),
          cupsWon: Number(row.cups_won ?? row.cupsWon ?? 0),
          role: (row.role || "USER") as any,
          createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        }));
        saveToDisk(state);
      }
    } catch (e) {}

    return state.users;
  },

  async findUser(identifier: string): Promise<UserRecord | null> {
    const rawId = (identifier || "").trim();
    const cleanId = rawId.toLowerCase();
    if (!cleanId) return null;

    const state = loadFromDisk();

    // 1. Check local persistent state
    let user = state.users.find(
      (u) => u.id === rawId || u.email.toLowerCase() === cleanId || u.gamertag.toLowerCase() === cleanId
    );

    if (user) return user;

    // 2. Check D1 SQL
    try {
      const d1Res = await executeD1Query(
        "SELECT * FROM users WHERE id = ? OR LOWER(email) = ? OR LOWER(gamertag) = ?",
        [rawId, cleanId, cleanId]
      );
      if (d1Res.success && Array.isArray(d1Res.results) && d1Res.results.length > 0) {
        const row = d1Res.results[0];
        const d1User: UserRecord = {
          id: row.id,
          email: row.email,
          passwordHash: row.password_hash || row.passwordHash || "",
          gamertag: row.gamertag,
          fullName: row.full_name || row.fullName || row.gamertag,
          bio: row.bio || row.user_bio || "",
          avatarUrl: row.avatar_url || row.avatarUrl || row.avatar || "",
          coins: Number(row.coins ?? 0),
          winRate: Number(row.win_rate ?? row.winRate ?? 0),
          matchesPlayed: Number(row.matches_played ?? row.matchesPlayed ?? 0),
          cupsWon: Number(row.cups_won ?? row.cupsWon ?? 0),
          role: (row.role || "USER") as any,
          createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        };
        const existingIdx = state.users.findIndex((u) => u.id === d1User.id || u.email.toLowerCase() === d1User.email.toLowerCase());
        if (existingIdx >= 0) {
          state.users[existingIdx] = d1User;
        } else {
          state.users.push(d1User);
        }
        saveToDisk(state);
        return d1User;
      }
    } catch (e) {}

    return null;
  },

  async saveUser(user: UserRecord): Promise<UserRecord[]> {
    const state = loadFromDisk();
    const idx = state.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      state.users[idx] = user;
    } else {
      state.users.push(user);
    }
    saveToDisk(state);

    executeD1Query(
      `INSERT INTO users (id, email, password_hash, gamertag, full_name, bio, avatar_url, coins, win_rate, matches_played, cups_won, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         password_hash = excluded.password_hash,
         gamertag = excluded.gamertag,
         full_name = excluded.full_name,
         bio = excluded.bio,
         avatar_url = excluded.avatar_url,
         coins = excluded.coins,
         win_rate = excluded.win_rate,
         matches_played = excluded.matches_played,
         cups_won = excluded.cups_won,
         role = excluded.role`,
      [
        user.id,
        user.email,
        user.passwordHash,
        user.gamertag,
        user.fullName || user.gamertag,
        user.bio || "",
        user.avatarUrl || "",
        user.coins,
        user.winRate,
        user.matchesPlayed,
        user.cupsWon,
        user.role,
        user.createdAt,
      ]
    ).catch(() => {});

    return state.users;
  },

  async updateUserBio(identifier: string, bio: string): Promise<UserRecord | null> {
    const user = await this.findUser(identifier);
    if (!user) return null;
    user.bio = (bio || "").trim();
    await this.saveUser(user);
    return user;
  },

  async updateUserAvatar(identifier: string, avatarUrl: string): Promise<UserRecord | null> {
    const user = await this.findUser(identifier);
    if (!user) return null;
    user.avatarUrl = (avatarUrl || "").trim();
    await this.saveUser(user);
    return user;
  },

  // ==========================================
  // CHAMPIONS (1:1 Aspect Ratio Cards)
  // ==========================================
  async getChampions(): Promise<ChampionRecord[]> {
    const state = loadFromDisk();

    // 1. Try fetching from Cloudflare D1 SQL
    try {
      const d1Res = await executeD1Query(
        "SELECT * FROM champions ORDER BY display_order ASC, created_at DESC"
      );
      if (d1Res.success && Array.isArray(d1Res.results) && d1Res.results.length > 0) {
        const d1Champions: ChampionRecord[] = d1Res.results.map((row: any) => ({
          id: row.id,
          title: row.title || "Weekly Champion",
          playerName: row.player_name || row.playerName || "@Champion",
          game: row.game || "VALORANT",
          imageUrl: row.image_url || row.imageUrl || "",
          achievement: row.achievement || "",
          badgeText: row.badge_text || row.badgeText || "CHAMPION",
          badgeColor: row.badge_color || row.badgeColor || "#F59E0B",
          isActive: Boolean(row.is_active === 1 || row.is_active === true || row.isActive === true || row.isActive === 1),
          displayOrder: Number(row.display_order ?? row.displayOrder ?? 0),
          createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        }));

        state.champions = d1Champions;
        saveToDisk(state);
        return state.champions;
      }
    } catch (e) {
      // D1 query notice
    }

    return state.champions || [];
  },

  async saveChampion(champ: ChampionRecord): Promise<ChampionRecord[]> {
    const state = loadFromDisk();
    if (!state.champions) state.champions = [...initialChampions];
    const existingIndex = state.champions.findIndex((c) => c.id === champ.id);

    if (existingIndex >= 0) {
      state.champions[existingIndex] = champ;
    } else {
      state.champions.push(champ);
    }

    state.champions.sort((a, b) => a.displayOrder - b.displayOrder);
    saveToDisk(state);

    // Sync to Cloudflare D1 asynchronously
    executeD1Query(
      `INSERT INTO champions (id, title, player_name, game, image_url, achievement, badge_text, badge_color, is_active, display_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         player_name = excluded.player_name,
         game = excluded.game,
         image_url = excluded.image_url,
         achievement = excluded.achievement,
         badge_text = excluded.badge_text,
         badge_color = excluded.badge_color,
         is_active = excluded.is_active,
         display_order = excluded.display_order`,
      [
        champ.id,
        champ.title,
        champ.playerName,
        champ.game,
        champ.imageUrl,
        champ.achievement || "",
        champ.badgeText || "CHAMPION",
        champ.badgeColor || "#F59E0B",
        champ.isActive ? 1 : 0,
        champ.displayOrder,
        champ.createdAt || new Date().toISOString(),
      ]
    ).catch(() => {});

    return state.champions;
  },

  async deleteChampion(id: string): Promise<ChampionRecord[]> {
    const state = loadFromDisk();
    if (!state.champions) state.champions = [...initialChampions];
    state.champions = state.champions.filter((c) => c.id !== id);
    saveToDisk(state);

    executeD1Query("DELETE FROM champions WHERE id = ?", [id]).catch(() => {});
    return state.champions;
  },

  async updateChampionPartial(id: string, updates: Partial<ChampionRecord>): Promise<ChampionRecord[]> {
    const state = loadFromDisk();
    if (!state.champions) state.champions = [...initialChampions];
    const idx = state.champions.findIndex((c) => c.id === id);
    if (idx >= 0) {
      state.champions[idx] = { ...state.champions[idx], ...updates };
      state.champions.sort((a, b) => a.displayOrder - b.displayOrder);
      saveToDisk(state);

      const champ = state.champions[idx];
      executeD1Query(
        `UPDATE champions SET is_active = ?, display_order = ? WHERE id = ?`,
        [champ.isActive ? 1 : 0, champ.displayOrder, id]
      ).catch(() => {});
    }
    return state.champions;
  },
};
