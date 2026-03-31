import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SignJWT } from "jose";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let email = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = body.email;
    } else {
      const formData = await req.formData();
      email = formData.get("email") as string;
    }

    if (!email) {
      if (!contentType.includes("application/json")) {
        return NextResponse.redirect(new URL("/login?tab=klant&error=missing", req.url));
      }
      return NextResponse.json({ success: false, error: "Vul uw e-mailadres in." }, { status: 400 });
    }

    // Check if this email has any appointments
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: appointments, error } = await supabase
      .from("Appointment")
      .select("id")
      .eq("customerEmail", email.toLowerCase().trim())
      .limit(1);

    if (error || !appointments || appointments.length === 0) {
      if (!contentType.includes("application/json")) {
        return NextResponse.redirect(new URL("/login?tab=klant&error=notfound", req.url));
      }
      return NextResponse.json({ success: false, error: "Geen afspraken gevonden voor dit e-mailadres." }, { status: 404 });
    }

    // Create a customer session token
    const token = await new SignJWT({
      customerEmail: email.toLowerCase().trim(),
      role: "CUSTOMER",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET);

    const redirectUrl = new URL("/mijn-afspraken", req.url);

    if (!contentType.includes("application/json")) {
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set("kk_customer", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("kk_customer", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Er ging iets mis." }, { status: 500 });
  }
}
