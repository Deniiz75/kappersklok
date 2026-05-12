import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
  CUSTOMER_COOKIE_NAME,
  type AdminBarberSession,
  type CustomerSession,
} from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/dashboard")) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token
      ? await verifySessionToken<AdminBarberSession>(token)
      : null;
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (path.startsWith("/mijn-afspraken")) {
    const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const session = token
      ? await verifySessionToken<CustomerSession>(token)
      : null;
    if (!session) {
      return NextResponse.redirect(new URL("/login?tab=klant", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/mijn-afspraken/:path*"],
};
