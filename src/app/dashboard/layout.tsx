import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getShopByUserId } from "@/lib/db";
import { Logo } from "@/components/logo";
import { Wordmark } from "@/components/wordmark";
import { MobileNav } from "@/components/mobile-nav";
import {
  CalendarDays,
  Scissors as ScissorsIcon,
  Settings,
  MessageSquare,
  LogOut,
  LayoutDashboard,
  Store,
  Users,
  ShieldCheck,
  CreditCard,
  Star,
} from "lucide-react";

const barberNav = [
  { href: "/dashboard", label: "Overzicht", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/dashboard/afspraken", label: "Afspraken", shortLabel: "Afspraken", icon: CalendarDays },
  { href: "/dashboard/diensten", label: "Diensten", shortLabel: "Diensten", icon: ScissorsIcon },
  { href: "/dashboard/instellingen", label: "Instellingen", shortLabel: "Instelling", icon: Settings },
];

const adminNav = [
  { href: "/dashboard", label: "Overzicht", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/dashboard/shops", label: "Kapperszaken", shortLabel: "Shops", icon: Store },
  { href: "/dashboard/betalingen", label: "Betalingen", shortLabel: "Betaling", icon: CreditCard },
  { href: "/dashboard/alle-afspraken", label: "Alle afspraken", shortLabel: "Afspraken", icon: CalendarDays },
  { href: "/dashboard/reviews", label: "Reviews beheer", shortLabel: "Reviews", icon: Star },
  { href: "/dashboard/berichten", label: "Berichten", shortLabel: "Berichten", icon: MessageSquare },
  { href: "/dashboard/gebruikers", label: "Gebruikers", shortLabel: "Users", icon: Users },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = session.role === "ADMIN";
  const shop = isAdmin ? null : await getShopByUserId(session.userId);

  if (!isAdmin && !shop) redirect("/");

  const navItems = isAdmin ? adminNav : barberNav;
  const label = isAdmin ? "Beheerder" : shop?.name || "";
  const sublabel = isAdmin ? "Admin Panel" : shop?.city || "";

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <Logo size={28} />
          <Wordmark size="sm" />
        </div>
        <div className="flex-1 p-3">
          <div className="mb-4 rounded-xl bg-gold/5 border border-gold/20 p-3">
            <div className="flex items-center gap-2">
              {isAdmin && <ShieldCheck className="h-4 w-4 text-gold shrink-0" />}
              <p className="text-sm font-semibold truncate">{label}</p>
            </div>
            <p className="text-xs text-muted-foreground truncate">{sublabel}</p>
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-border p-3">
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Uitloggen
            </button>
          </form>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo size={26} />
            <div className="flex flex-col leading-none">
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[10px] text-muted-foreground">{sublabel}</span>
            </div>
          </Link>
          {isAdmin && (
            <div className="flex h-6 items-center gap-1 rounded-full bg-gold/10 px-2">
              <ShieldCheck className="h-3 w-3 text-gold" />
              <span className="text-[10px] font-medium text-gold">Admin</span>
            </div>
          )}
        </header>

        {/* Mobile bottom nav */}
        <MobileNav items={navItems} />

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
