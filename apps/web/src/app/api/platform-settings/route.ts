import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { data } = await supabase.from("PlatformSetting").select("key, value");

  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
  }

  const body = await request.json();
  const entries = Object.entries(body) as [string, string][];

  for (const [key, value] of entries) {
    await supabase
      .from("PlatformSetting")
      .upsert({ key, value }, { onConflict: "key" });
  }

  return NextResponse.json({ success: true });
}
