// Cloudflare D1 SQL & Edge Service Client
// Account ID: 8b4cf30cd85d25da2d64bd3e7f54b74d

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
let cachedDbId: string | null = null;
let isD1Available: boolean | null = null;
let lastFailureTime = 0;
const FAILURE_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown before retrying CF D1 if unreachable

// Initialize or get the Cloudflare D1 Database ID
export async function getOrCreateD1Database(): Promise<string | null> {
  if (cachedDbId) return cachedDbId;
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) return null;

  // Circuit breaker: if recent failure occurred, skip immediately to avoid lag
  if (isD1Available === false && Date.now() - lastFailureTime < FAILURE_COOLDOWN_MS) {
    return null;
  }

  try {
    // 1. List databases with 1500ms timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const listRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database`, {
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const listData = await listRes.json();
    if (listData.success && listData.result) {
      const existing = listData.result.find((d: any) => d.name === "gnf_esports_db");
      if (existing) {
        cachedDbId = existing.uuid;
        isD1Available = true;
        if (!schemaInitialized) {
          await initD1Schema(cachedDbId!);
        }
        return cachedDbId;
      }
    }

    // 2. Create if not found
    const createController = new AbortController();
    const createTimeoutId = setTimeout(() => createController.abort(), 1500);

    const createRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "gnf_esports_db" }),
      signal: createController.signal,
    });
    clearTimeout(createTimeoutId);

    const createData = await createRes.json();
    if (createData.success && createData.result) {
      cachedDbId = createData.result.uuid;
      isD1Available = true;
      await initD1Schema(cachedDbId!);
      return cachedDbId;
    }
  } catch {
    // Silently mark D1 unavailable and trigger circuit breaker
    isD1Available = false;
    lastFailureTime = Date.now();
  }
  return null;
}

// Execute SQL Query directly against Cloudflare D1 HTTP API
export async function executeD1Query<T = any>(
  sql: string,
  params: any[] = []
): Promise<{ success: boolean; results: T[]; error?: string }> {
  // If D1 is known to be offline/unreachable, return immediately in 0ms
  if (isD1Available === false && Date.now() - lastFailureTime < FAILURE_COOLDOWN_MS) {
    return { success: false, results: [] };
  }

  try {
    const dbId = await getOrCreateD1Database();
    if (!dbId || !CF_ACCOUNT_ID || !CF_API_TOKEN) {
      return { success: false, results: [] };
    }

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${dbId}/query`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: sql,
        params: params,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.result?.[0]?.results) {
      return { success: true, results: data.result[0].results };
    }
    return {
      success: false,
      results: [],
    };
  } catch {
    isD1Available = false;
    lastFailureTime = Date.now();
    return { success: false, results: [] };
  }
}

// Initialize tables if needed
let schemaInitialized = false;

export async function initD1Schema(dbId: string) {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      game_type TEXT NOT NULL,
      prize_pool TEXT NOT NULL,
      first_prize TEXT,
      second_prize TEXT,
      third_prize TEXT,
      entry_fee TEXT DEFAULT 'FREE ENTRY',
      max_slots INTEGER DEFAULT 32,
      filled_slots INTEGER DEFAULT 0,
      region TEXT DEFAULT 'Mumbai (India)',
      status TEXT DEFAULT 'OPEN',
      match_start_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL,
      tournament_title TEXT NOT NULL,
      game_type TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_gamertag TEXT NOT NULL,
      team_name TEXT NOT NULL,
      team_tag TEXT,
      captain_ign TEXT NOT NULL,
      captain_game_id TEXT NOT NULL,
      rank_tier TEXT,
      roster_json TEXT,
      contact_handle TEXT NOT NULL,
      contact_type TEXT NOT NULL,
      device_info TEXT,
      status TEXT DEFAULT 'PENDING_APPROVAL',
      rejection_reason TEXT,
      room_id TEXT,
      room_pass TEXT,
      server_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      reviewed_by TEXT
    );

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tag TEXT NOT NULL,
      color TEXT NOT NULL,
      card_bg TEXT,
      border_color TEXT,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hero_banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      game TEXT NOT NULL,
      image_url TEXT NOT NULL,
      cta_color TEXT DEFAULT '#FF2E93',
      cta_text TEXT DEFAULT 'Join Tournament',
      target_tournament_id TEXT,
      target_url TEXT,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS live_matches (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      stage TEXT NOT NULL,
      game_type TEXT NOT NULL,
      team1_name TEXT NOT NULL,
      team1_tag TEXT NOT NULL,
      team1_color TEXT DEFAULT '#6366F1',
      team2_name TEXT NOT NULL,
      team2_tag TEXT NOT NULL,
      team2_color TEXT DEFAULT '#FF2E93',
      stream_url TEXT NOT NULL,
      viewer_count TEXT DEFAULT '1,420 Watching',
      is_live INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      gamertag TEXT NOT NULL,
      full_name TEXT,
      coins INTEGER DEFAULT 1000,
      win_rate INTEGER DEFAULT 70,
      matches_played INTEGER DEFAULT 0,
      cups_won INTEGER DEFAULT 0,
      role TEXT DEFAULT 'USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS champions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      player_name TEXT NOT NULL,
      game TEXT NOT NULL,
      image_url TEXT NOT NULL,
      achievement TEXT,
      badge_text TEXT,
      badge_color TEXT DEFAULT '#F59E0B',
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${dbId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: schemaSql }),
    });
    schemaInitialized = true;
  } catch (err) {
    console.warn("Schema initialization notice:", err);
  }
}
