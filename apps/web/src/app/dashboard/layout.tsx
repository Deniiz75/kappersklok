import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getShopByUserId } from "@/lib/db";
import { Logo } from "@/components/logo";
import { Wordmark } from "@/components/wordmark";
import { MobileNav } from "@/components/mobile-nav";
import { PaymentGate } from "@/components/payment-gate";
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
  BarChart3,
  UserSearch,
  Monitor,
} from "lucide-react";

const barberNav = [
  { href: "/dashboard", label: "Overzicht", shortLabel: "Home", icon: LayoutDashboard, iconName: "LayoutDashboard" },
  { href: "/dashboard/afspraken", label: "Afspraken", shortLabel: "Afspraken", icon: CalendarDays, iconName: "CalendarDays" },
  { href: "/dashboard/diensten", label: "Diensten", shortLabel: "Diensten", icon: ScissorsIcon, iconName: "Scissors" },
  { href: "/dashboard/digibox", label: "Digi-box", shortLabel: "Digi-box", icon: Monitor, iconName: "Monitor" },
  { href: "/dashboard/instellingen", label: "Instellingen", shortLabel: "Instelling", icon: Settings, iconName: "Settings" },
];

const adminNav = [
  { href: "/dashboard", label: "Overzicht", shortLabel: "Home", icon: LayoutDashboard, iconName: "LayoutDashboard" },
  { href: "/dashboard/shops", label: "Kapperszaken", shortLabel: "Shops", icon: Store, iconName: "Store" },
  { href: "/dashboard/klanten", label: "Klanten", shortLabel: "Klanten", icon: UserSearch, iconName: "UserSearch" },
  { href: "/dashboard/alle-afspraken", label: "Afspraken", shortLabel: "Afspraken", icon: CalendarDays, iconName: "CalendarDays" },
  { href: "/dashboard/betalingen", label: "Betalingen", shortLabel: "Betaling", icon: CreditCard, iconName: "CreditCard" },
  { href: "/dashboard/reviews", label: "Reviews", shortLabel: "Reviews", icon: Star, iconName: "Star" },
  { href: "/dashboard/berichten", label: "Berichten", shortLabel: "Berichten", icon: MessageSquare, iconName: "MessageSquare" },
  { href: "/dashboard/gebruikers", label: "Gebruikers", shortLabel: "Users", icon: Users, iconName: "Users" },
  { href: "/dashboard/analytics", label: "Analytics", shortLabel: "Analytics", icon: BarChart3, iconName: "BarChart3" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await getSession();
  } catch {
    redirect("/login");
  }
  if (!session) redirect("/login");

  const isAdmin = session.role === "ADMIN";
  let shop: { id: string; name: string; city: string | null; status: string } | null = null;
  if (!isAdmin) {
    try {
      shop = await getShopByUserId(session.userId);
    } catch {
      /* shop stays null */
    }
    if (!shop) redirect("/");
  }

  if (!isAdmin && shop && shop.status === "PENDING") {
    return <PaymentGate shopId={shop.id} shopName={shop.name} />;
  }

  const navItems = isAdmin ? adminNav : barberNav;
  const label = isAdmin ? "Beheerder" : shop?.name || "";
  const sublabel = isAdmin ? "Admin Panel" : shop?.city || "";

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — clean white */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <Logo size={28} />
          <Wordmark size="sm" />
        </div>

        <div className="flex-1 px-3 py-4">
          {/* Shop/admin info */}
          <div className="mb-5 rounded-xl bg-muted px-4 py-3">
            <div className="flex items-center gap-2">
              {isAdmin && <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />}
              <p className="text-sm font-semibold text-foreground truncate">{label}</p>
            </div>
            {sublabel && <p className="text-xs text-muted-foreground truncate mt-0.5">{sublabel}</p>}
          </div>

          {/* Navigation */}
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="border-t border-border px-3 py-3">
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Uitloggen
            </button>
          </form>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col bg-muted/30">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo size={26} />
            <div className="flex flex-col leading-none">
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[10px] text-muted-foreground">{sublabel}</span>
            </div>
          </Link>
          {isAdmin && (
            <div className="flex h-6 items-center gap-1 rounded-full bg-muted px-2">
              <ShieldCheck className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">Admin</span>
            </div>
          )}
        </header>

        {/* Mobile bottom nav */}
        <MobileNav items={navItems.map(({ href, label, shortLabel, iconName }) => ({ href, label, shortLabel, iconName }))} />

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
