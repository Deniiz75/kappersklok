import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("kk_session")?.value;
  const customerSession = request.cookies.get("kk_customer")?.value;

  if (request.nextUrl.pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/mijn-afspraken") && !customerSession) {
    return NextResponse.redirect(new URL("/login?tab=klant", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/mijn-afspraken/:path*"],
};
