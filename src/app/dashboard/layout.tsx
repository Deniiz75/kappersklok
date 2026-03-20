import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getShopByUserId } from "@/lib/db";
import { Logo } from "@/components/logo";
import { Wordmark } from "@/components/wordmark";
import {
  CalendarDays,
  Scissors as ScissorsIcon,
  Clock,
  Settings,
  MessageSquare,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overzicht", icon: LayoutDashboard },
  { href: "/dashboard/afspraken", label: "Afspraken", icon: CalendarDays },
  { href: "/dashboard/diensten", label: "Diensten", icon: ScissorsIcon },
  { href: "/dashboard/instellingen", label: "Instellingen", icon: Settings },
  { href: "/dashboard/berichten", label: "Berichten", icon: MessageSquare },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const shop = await getShopByUserId(session.userId);
  if (!shop) redirect("/");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <Logo size={28} />
          <Wordmark size="sm" />
        </div>
        <div className="p-3">
          <div className="mb-4 rounded-lg bg-gold/5 border border-gold/20 p-3">
            <p className="text-sm font-semibold truncate">{shop.name}</p>
            <p className="text-xs text-muted-foreground truncate">{shop.city}</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-4 left-0 w-64 px-3">
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Uitloggen
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-sm font-semibold">{shop.name}</span>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-surface md:hidden">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground"
            >
              <item.icon className="h-4 w-4" />
              <span className="truncate">{item.label.slice(0, 8)}</span>
            </Link>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
