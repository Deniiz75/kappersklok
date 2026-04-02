import { getSession } from "@/lib/auth";
import { getShopByUserId } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  let shopName: string | null = null;
  if (session.role === "BARBER") {
    const shop = await getShopByUserId(session.userId);
    shopName = shop?.name ?? null;
  }

  return NextResponse.json({
    userId: session.userId,
    email: session.email,
    role: session.role,
    shopName,
  });
}
