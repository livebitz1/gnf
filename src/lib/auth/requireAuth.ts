import { NextResponse } from "next/server";
import { verifyJwt } from "./jwt";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

export type AuthResult =
  | { ok: true; payload: any }
  | { ok: false; response: NextResponse };

/** Requires any validly-signed, unexpired session token (a logged-in player or an admin). */
export async function requireUser(request: Request): Promise<AuthResult> {
  const token = extractBearerToken(request);
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized: sign in required" },
        { status: 401, headers: corsHeaders }
      ),
    };
  }

  const { valid, payload, error } = await verifyJwt(token);
  if (!valid || !payload) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: error || "Unauthorized: invalid session" },
        { status: 401, headers: corsHeaders }
      ),
    };
  }

  return { ok: true, payload };
}

/** Requires a token issued to the admin console specifically (role === "ADMIN"). */
export async function requireAdmin(request: Request): Promise<AuthResult> {
  const result = await requireUser(request);
  if (!result.ok) return result;

  if (result.payload.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Forbidden: admin access required" },
        { status: 403, headers: corsHeaders }
      ),
    };
  }

  return result;
}
