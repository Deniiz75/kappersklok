import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  signSessionToken,
  CUSTOMER_COOKIE_NAME,
  sessionCookieOptions,
  CUSTOMER_MAX_AGE_DAYS,
} from "@/lib/jwt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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

    const token = await signSessionToken(
      { customerEmail: email.toLowerCase().trim(), role: "CUSTOMER" },
      `${CUSTOMER_MAX_AGE_DAYS}d`,
    );
    const cookieOpts = sessionCookieOptions(60 * 60 * 24 * CUSTOMER_MAX_AGE_DAYS);

    const redirectUrl = new URL("/mijn-afspraken", req.url);

    if (!contentType.includes("application/json")) {
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set(CUSTOMER_COOKIE_NAME, token, cookieOpts);
      return response;
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(CUSTOMER_COOKIE_NAME, token, cookieOpts);
    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Er ging iets mis." }, { status: 500 });
  }
}
