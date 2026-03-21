import { getSession } from "@/lib/auth";
import { getShopByUserId, getAppointmentsForShop, supabase } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AdminSearch } from "@/components/admin-search";
import { CalendarDays, Users, Scissors, TrendingUp, Store, MessageSquare, ShieldCheck, CreditCard, Star, UserSearch, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let session;
  try {
    session = await getSession();
  } catch {
    redirect("/login");
  }
  if (!session) redirect("/login");

  const isAdmin = session.role === "ADMIN";

  if (isAdmin) {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // All stats in parallel
    const [
      { count: shopCount },
      { count: activeShops },
      { count: customerCount },
      { count: monthAppointments },
      { data: monthPayments },
      { count: pendingPayments },
      { count: messageCount },
      { count: monthReviews },
    ] = await Promise.all([
      supabase.from("Shop").select("*", { count: "exact", head: true }),
      supabase.from("Shop").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
      supabase.from("Customer").select("*", { count: "exact", head: true }),
      supabase.from("Appointment").select("*", { count: "exact", head: true }).gte("date", firstOfMonth),
      supabase.from("Payment").select("amount").eq("status", "PAID").eq("period", currentPeriod),
      supabase.from("Payment").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      supabase.from("ContactMessage").select("*", { count: "exact", head: true }).eq("read", false),
      supabase.from("Review").select("*", { count: "exact", head: true }).gte("createdAt", new Date(now.getFullYear(), now.getMonth(), 1).toISOString()),
    ]);

    const monthRevenue = (monthPayments || []).reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

    const stats = [
      { label: "Kapperszaken", value: shopCount || 0, icon: Store, href: "/dashboard/shops" },
      { label: "Actieve zaken", value: activeShops || 0, icon: ShieldCheck, href: "/dashboard/shops" },
      { label: "Klanten", value: customerCount || 0, icon: UserSearch, href: "/dashboard/klanten" },
      { label: "Afspraken deze maand", value: monthAppointments || 0, icon: CalendarDays, href: "/dashboard/alle-afspraken" },
      { label: "Omzet deze maand", value: `€${(monthRevenue / 100).toFixed(0)}`, icon: CreditCard, href: "/dashboard/betalingen" },
      { label: "Openstaand", value: pendingPayments || 0, icon: TrendingUp, href: "/dashboard/betalingen" },
      { label: "Ongelezen berichten", value: messageCount || 0, icon: MessageSquare, href: "/dashboard/berichten" },
      { label: "Reviews deze maand", value: monthReviews || 0, icon: Star, href: "/dashboard/reviews" },
    ];

    // Recent activity (last 8 items from multiple tables)
    const [{ data: recentShops }, { data: recentAppointments }, { data: recentReviews }] = await Promise.all([
      supabase.from("Shop").select("id, name, city, status, createdAt").order("createdAt", { ascending: false }).limit(3),
      supabase.from("Appointment").select("id, customerName, date, startTime, status, shop:Shop(name)").order("createdAt", { ascending: false }).limit(3),
      supabase.from("Review").select("id, customerName, rating, approved, createdAt, shop:Shop(name)").order("createdAt", { ascending: false }).limit(3),
    ]);

    // Revenue last 6 months
    const revenueMonths: { label: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = d.toLocaleDateString("nl-NL", { month: "short" });
      const { data: pms } = await supabase.from("Payment").select("amount").eq("status", "PAID").eq("period", period);
      const total = (pms || []).reduce((s: number, p: { amount: number }) => s + p.amount, 0);
      revenueMonths.push({ label: monthLabel, amount: total });
    }
    const maxRevenue = Math.max(...revenueMonths.map((r) => r.amount), 1);

    return (
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="mt-1 text-muted-foreground">Beheer het Kappersklok platform</p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-5">
          <AdminSearch />
        </div>

        {/* KPI Cards */}
        <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="border-border bg-surface hover:border-gold/30 transition-colors h-full">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                    <stat.icon className="h-4 w-4 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold truncate">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold">Omzet laatste 6 maanden</h2>
          <div className="mt-3 flex items-end gap-2 h-32 rounded-lg border border-border bg-surface p-4">
            {revenueMonths.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex justify-center">
                  <div
                    className="w-full max-w-8 rounded-t bg-gold/60 transition-all"
                    style={{ height: `${Math.max((m.amount / maxRevenue) * 80, 4)}px` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Recent shops */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Nieuwe shops</h2>
              <Link href="/dashboard/shops" className="text-[10px] text-gold hover:underline flex items-center gap-0.5">Alles <ArrowRight className="h-2.5 w-2.5" /></Link>
            </div>
            <div className="space-y-2">
              {(recentShops || []).map((shop) => (
                <Link key={shop.id} href={`/dashboard/shops/${shop.id}`} className="flex items-center justify-between rounded-lg border border-border bg-surface p-2.5 hover:border-gold/30 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{shop.name}</p>
                    <p className="text-[10px] text-muted-foreground">{shop.city}</p>
                  </div>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] shrink-0 ${
                    shop.status === "ACTIVE" ? "bg-gold/10 text-gold"
                      : shop.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {shop.status === "ACTIVE" ? "Actief" : shop.status === "PENDING" ? "Wachtend" : "Geblokkeerd"}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent appointments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Laatste afspraken</h2>
              <Link href="/dashboard/alle-afspraken" className="text-[10px] text-gold hover:underline flex items-center gap-0.5">Alles <ArrowRight className="h-2.5 w-2.5" /></Link>
            </div>
            <div className="space-y-2">
              {(recentAppointments || []).map((apt) => {
                const shop = apt.shop as unknown as { name: string } | null;
                return (
                  <div key={apt.id} className="rounded-lg border border-border bg-surface p-2.5">
                    <p className="text-xs font-medium truncate">{apt.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">{shop?.name} — {apt.date} {apt.startTime}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Laatste reviews</h2>
              <Link href="/dashboard/reviews" className="text-[10px] text-gold hover:underline flex items-center gap-0.5">Alles <ArrowRight className="h-2.5 w-2.5" /></Link>
            </div>
            <div className="space-y-2">
              {(recentReviews || []).map((rev) => {
                const shop = rev.shop as unknown as { name: string } | null;
                return (
                  <div key={rev.id} className="rounded-lg border border-border bg-surface p-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium truncate">{rev.customerName}</p>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-2.5 w-2.5 ${i < rev.rating ? "fill-gold text-gold" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{shop?.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Barber dashboard
  const shop = await getShopByUserId(session.userId);
  if (!shop) redirect("/");

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = await getAppointmentsForShop(shop.id, today);
  const allAppointments = await getAppointmentsForShop(shop.id);
  const upcoming = allAppointments.filter((a) => a.date >= today && a.status === "CONFIRMED");

  const stats = [
    { label: "Afspraken vandaag", value: todayAppointments.length, icon: CalendarDays },
    { label: "Komende afspraken", value: upcoming.length, icon: TrendingUp },
    { label: "Actieve kappers", value: shop.barbers.filter((b: { active: boolean }) => b.active).length, icon: Users },
    { label: "Diensten", value: shop.services.filter((s: { active: boolean }) => s.active).length, icon: Scissors },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Welkom, {shop.contactName}</h1>
      <p className="mt-1 text-muted-foreground">Dashboard van {shop.name}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-surface">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                <stat.icon className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Afspraken vandaag</h2>
        {todayAppointments.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Geen afspraken vandaag.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-gold">{apt.startTime}</span>
                  <div>
                    <p className="text-sm font-medium">{apt.customerName}</p>
                    <p className="text-xs text-muted-foreground">{apt.service?.name} — {apt.barber?.name}</p>
                  </div>
                </div>
                <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold">Bevestigd</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
