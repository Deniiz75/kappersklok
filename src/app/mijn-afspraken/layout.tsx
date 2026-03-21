import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { LogOut } from "lucide-react";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

const customerNav = [
  { href: "/mijn-afspraken", label: "Afspraken", shortLabel: "Afspraken", iconName: "CalendarDays" },
  { href: "/mijn-afspraken/reviews", label: "Reviews", shortLabel: "Reviews", iconName: "Star" },
  { href: "/mijn-afspraken/profiel", label: "Profiel", shortLabel: "Profiel", iconName: "User" },
];

export default async function KlantPortaalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email: string | null = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kk_customer")?.value;
    if (token) {
      const { payload } = await jwtVerify(token, SECRET);
      email = (payload.customerEmail as string) || null;
    }
  } catch {
    // token invalid
  }

  if (!email) redirect("/login?tab=klant");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-sm font-semibold">Kappersklok</span>
          </Link>
          <form action="/api/klant-logout" method="POST">
            <button type="submit" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-3.5 w-3.5" />
              Uitloggen
            </button>
          </form>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav
        items={customerNav}
        logoutAction="/api/klant-logout"
      />

      {/* Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
