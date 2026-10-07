import { NextResponse } from "next/server";
import { signJwt } from "@/lib/auth/jwt";

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
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredPassword) {
      // Fail closed: no default/fallback password. The operator must set one.
      return NextResponse.json(
        { success: false, error: "Admin login is not configured on this server." },
        { status: 503, headers: corsHeaders }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password || password !== configuredPassword) {
      return NextResponse.json(
        { success: false, error: "Incorrect admin password." },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = await signJwt({ role: "ADMIN" }, 86400 * 7);

    return NextResponse.json({ success: true, token }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Login failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
