// Cloudflare D1 SQL Client
//
// Two paths, tried in order:
// 1. Native D1 binding (set up in wrangler.toml as `DB`) — used automatically
//    once this runs as an actual deployed Cloudflare Worker. Secure: no
//    account-wide API token involved at all, scoped to just this database.
// 2. REST API fallback — used for local `next dev`, where there is no Workers
//    runtime to provide a binding. Needs CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN.
import { getCloudflareContext } from "@opennextjs/cloudflare";

const D1_DATABASE_NAME = "gamernotfound";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
let cachedDbId: string | null = null;
let isRestD1Available: boolean | null = null;
let lastFailureTime = 0;
const FAILURE_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown before retrying CF D1 if unreachable

async function getD1Binding(): Promise<any | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as any)?.DB ?? null;
  } catch {
    // Not running inside the Workers runtime (e.g. local `next dev`) — no binding available.
    return null;
  }
}

async function queryViaBinding<T = any>(
  binding: any,
  sql: string,
  params: any[]
): Promise<{ success: boolean; results: T[]; error?: string }> {
  try {
    const stmt = params.length ? binding.prepare(sql).bind(...params) : binding.prepare(sql);
    const res = await stmt.all();
    return { success: true, results: (res?.results as T[]) || [] };
  } catch (err: any) {
    return { success: false, results: [], error: err?.message || "D1 binding query failed" };
  }
}

// Initialize or get the Cloudflare D1 Database ID (REST fallback path only)
export async function getOrCreateD1Database(): Promise<string | null> {
  if (cachedDbId) return cachedDbId;
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) return null;

  // Circuit breaker: if recent failure occurred, skip immediately to avoid lag
  if (isRestD1Available === false && Date.now() - lastFailureTime < FAILURE_COOLDOWN_MS) {
    return null;
  }

  try {
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
      const existing = listData.result.find((d: any) => d.name === D1_DATABASE_NAME);
      if (existing) {
        cachedDbId = existing.uuid;
        isRestD1Available = true;
        return cachedDbId;
      }
    }

    // Create if not found (should not normally happen — the database is expected to pre-exist)
    const createController = new AbortController();
    const createTimeoutId = setTimeout(() => createController.abort(), 1500);

    const createRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: D1_DATABASE_NAME }),
      signal: createController.signal,
    });
    clearTimeout(createTimeoutId);

    const createData = await createRes.json();
    if (createData.success && createData.result) {
      cachedDbId = createData.result.uuid;
      isRestD1Available = true;
      return cachedDbId;
    }
  } catch {
    isRestD1Available = false;
    lastFailureTime = Date.now();
  }
  return null;
}

async function queryViaRest<T = any>(
  sql: string,
  params: any[]
): Promise<{ success: boolean; results: T[]; error?: string }> {
  if (isRestD1Available === false && Date.now() - lastFailureTime < FAILURE_COOLDOWN_MS) {
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
      body: JSON.stringify({ sql, params }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.result?.[0]?.results) {
      return { success: true, results: data.result[0].results };
    }
    return { success: false, results: [] };
  } catch {
    isRestD1Available = false;
    lastFailureTime = Date.now();
    return { success: false, results: [] };
  }
}

// Execute a SQL query against Cloudflare D1 — binding first, REST fallback second.
export async function executeD1Query<T = any>(
  sql: string,
  params: any[] = []
): Promise<{ success: boolean; results: T[]; error?: string }> {
  const binding = await getD1Binding();
  if (binding) {
    return queryViaBinding<T>(binding, sql, params);
  }
  return queryViaRest<T>(sql, params);
}
