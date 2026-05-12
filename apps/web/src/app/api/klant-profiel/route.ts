import { NextResponse } from "next/server";
import { getCustomerEmail } from "@/lib/auth";

export async function GET() {
  const email = await getCustomerEmail();
  if (!email) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  return NextResponse.json({ email });
}
