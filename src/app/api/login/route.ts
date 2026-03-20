import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Vul alle velden in." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: user, error } = await supabase
      .from("User")
      .select("id, email, passwordHash, role")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, error: "Onjuist e-mailadres of wachtwoord." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Onjuist e-mailadres of wachtwoord." }, { status: 401 });
    }

    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("14d")
      .sign(SECRET);

    const response = NextResponse.json({ success: true });
    response.cookies.set("kk_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Er ging iets mis." }, { status: 500 });
  }
}
