import { supabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ongeldig e-mailadres" }, { status: 400 });
  }

  const { error } = await supabase
    .from("AppNotifySubscriber")
    .upsert({ email }, { onConflict: "email" });

  if (error) {
    return NextResponse.json({ error: "Kon niet opslaan" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
