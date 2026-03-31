import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let email = "";
    let password = "";

    // Support both JSON (fetch) and form data (HTML form)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } else {
      const formData = await req.formData();
      email = formData.get("email") as string;
      password = formData.get("password") as string;
    }

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
      // For form submissions, redirect back with error
      if (!contentType.includes("application/json")) {
        return NextResponse.redirect(new URL("/login?error=invalid", req.url));
      }
      return NextResponse.json({ success: false, error: "Onjuist e-mailadres of wachtwoord." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      if (!contentType.includes("application/json")) {
        return NextResponse.redirect(new URL("/login?error=invalid", req.url));
      }
      return NextResponse.json({ success: false, error: "Onjuist e-mailadres of wachtwoord." }, { status: 401 });
    }

    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("14d")
      .sign(SECRET);

    // For form submissions, redirect to dashboard
    if (!contentType.includes("application/json")) {
      const response = NextResponse.redirect(new URL("/dashboard", req.url));
      response.cookies.set("kk_session", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 14,
        path: "/",
      });
      return response;
    }

    // For JSON fetch
    const response = NextResponse.json({ success: true });
    response.cookies.set("kk_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Er ging iets mis." }, { status: 500 });
  }
}
