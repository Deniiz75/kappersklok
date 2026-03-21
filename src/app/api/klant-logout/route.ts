import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(new URL("/login?tab=klant", process.env.NEXT_PUBLIC_SUPABASE_URL ? "https://kappersklok.vercel.app" : "http://localhost:3000"));
  response.cookies.delete("kk_customer");
  return response;
}
