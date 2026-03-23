import { NextRequest, NextResponse } from "next/server";
import { handleMollieWebhook } from "@/lib/mollie";

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const id = body.get("id") as string;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await handleMollieWebhook(id);
    return new NextResponse(null, { status: 200 });
  } catch {
    // Altijd 200 returnen — Mollie retry anders eindeloos
    return new NextResponse(null, { status: 200 });
  }
}
