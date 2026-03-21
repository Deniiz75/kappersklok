import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kk_customer")?.value;
    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, SECRET);
    const email = payload.customerEmail as string;
    if (!email) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    return NextResponse.json({ email });
  } catch {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
}
