import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createClient } from "@supabase/supabase-js";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

export async function GET(req: NextRequest) {
  const debug: Record<string, unknown> = {};

  // 1. Check env vars
  debug.envCheck = {
    JWT_SECRET: process.env.JWT_SECRET ? "SET (" + process.env.JWT_SECRET.length + " chars)" : "MISSING",
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
    SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
  };

  // 2. Check cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kk_session")?.value;
    debug.cookie = token ? "EXISTS (" + token.length + " chars)" : "MISSING";

    // 3. Verify JWT
    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET);
        debug.jwt = { valid: true, userId: payload.userId, role: payload.role, email: payload.email };
      } catch (e) {
        debug.jwt = { valid: false, error: String(e) };
      }
    }
  } catch (e) {
    debug.cookieError = String(e);
  }

  // 4. Test Supabase connection
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    const { count, error } = await sb.from("Shop").select("*", { count: "exact", head: true });
    debug.supabase = error ? { error: error.message } : { connected: true, shopCount: count };
  } catch (e) {
    debug.supabase = { error: String(e) };
  }

  return NextResponse.json(debug, { status: 200 });
}
