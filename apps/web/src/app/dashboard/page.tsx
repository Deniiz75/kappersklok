import { getSession } from "@/lib/auth";
import { getShopByUserId, getAppointmentsForShop, supabase } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AdminSearch } from "@/components/admin-search";
import { ButtonLink } from "@/components/button-link";
import { MiniTimeline } from "@/components/mini-timeline";
import {
  CalendarDays, Users, Scissors, TrendingUp, Store, MessageSquare,
  ShieldCheck, CreditCard, Star, UserSearch, ArrowRight, Plus, Monitor, Settings,
} from "lucide-react";

export const dynamic = "force-dynamic";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

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

    const [{ data: recentShops }, { data: recentAppointments }, { data: recentReviews }] = await Promise.all([
      supabase.from("Shop").select("id, name, city, status, createdAt").order("createdAt", { ascending: false }).limit(3),
      supabase.from("Appointment").select("id, customerName, date, startTime, status, shop:Shop(name)").order("createdAt", { ascending: false }).limit(3),
      supabase.from("Review").select("id, customerName, rating, approved, createdAt, shop:Shop(name)").order("createdAt", { ascending: false }).limit(3),
    ]);

    return (
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="mt-1 text-muted-foreground">Beheer het Kappersklok platform</p>

        <div className="mt-5"><AdminSearch /></div>

        <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="border-border hover:border-foreground/20 transition-colors h-full">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
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

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Nieuwe shops</h2>
              <Link href="/dashboard/shops" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">Alles <ArrowRight className="h-2.5 w-2.5" /></Link>
            </div>
            <div className="space-y-2">
              {(recentShops || []).map((shop) => (
                <Link key={shop.id} href={`/dashboard/shops/${shop.id}`} className="flex items-center justify-between rounded-lg border border-border bg-white p-2.5 hover:border-foreground/20 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{shop.name}</p>
                    <p className="text-[10px] text-muted-foreground">{shop.city}</p>
                  </div>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] shrink-0 ${
                    shop.status === "ACTIVE" ? "bg-[#2ECC71]/10 text-[#2ECC71]"
                      : shop.status === "PENDING" ? "bg-amber-500/10 text-amber-600"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {shop.status === "ACTIVE" ? "Actief" : shop.status === "PENDING" ? "Wachtend" : "Geblokkeerd"}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Laatste afspraken</h2>
              <Link href="/dashboard/alle-afspraken" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">Alles <ArrowRight className="h-2.5 w-2.5" /></Link>
            </div>
            <div className="space-y-2">
              {(recentAppointments || []).map((apt) => {
                const shop = apt.shop as unknown as { name: string } | null;
                return (
                  <div key={apt.id} className="rounded-lg border border-border bg-white p-2.5">
                    <p className="text-xs font-medium truncate">{apt.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">{shop?.name} — {apt.date} {apt.startTime}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Laatste reviews</h2>
              <Link href="/dashboard/reviews" className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">Alles <ArrowRight className="h-2.5 w-2.5" /></Link>
            </div>
            <div className="space-y-2">
              {(recentReviews || []).map((rev) => {
                const shop = rev.shop as unknown as { name: string } | null;
                return (
                  <div key={rev.id} className="rounded-lg border border-border bg-white p-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium truncate">{rev.customerName}</p>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-2.5 w-2.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
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

  // ══════════ BARBER DASHBOARD ══════════

  const shop = await getShopByUserId(session.userId);
  if (!shop) redirect("/");

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = await getAppointmentsForShop(shop.id, today);
  const allAppointments = await getAppointmentsForShop(shop.id);
  const upcoming = allAppointments.filter((a) => a.date >= today && a.status === "CONFIRMED");

  // Analytics: this month's appointments
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthApts = allAppointments.filter((a) => a.date >= firstOfMonth);
  const monthCompleted = monthApts.filter((a) => a.status === "COMPLETED");

  // Top services
  const serviceCounts: Record<string, number> = {};
  monthApts.forEach((a) => {
    const name = (a as unknown as { service?: { name: string } | null }).service?.name || "Overig";
    serviceCounts[name] = (serviceCounts[name] || 0) + 1;
  });
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const maxServiceCount = topServices[0]?.[1] || 1;

  // Average rating
  const { data: shopReviews } = await supabase
    .from("Review")
    .select("rating")
    .eq("shopId", shop.id)
    .eq("approved", true);
  const avgRating = shopReviews && shopReviews.length > 0
    ? (shopReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / shopReviews.length).toFixed(1)
    : "—";

  const greeting = getGreeting();
  const firstName = (shop as unknown as { contactName: string }).contactName?.split(" ")[0] || "";

  return (
    <div>
      {/* Welcome back */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{greeting}, {firstName}!</h1>
        <p className="mt-1 text-muted-foreground">
          Vandaag {todayAppointments.length} afspra{todayAppointments.length === 1 ? "ak" : "ken"} · {upcoming.length} komende
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <ButtonLink
          href="/dashboard/afspraken"
          className="bg-foreground text-white hover:bg-foreground/90 font-medium rounded-full text-sm px-5 py-2.5"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Afspraken
        </ButtonLink>
        <ButtonLink
          href="/dashboard/digibox"
          className="bg-white border border-border text-foreground hover:bg-muted font-medium rounded-full text-sm px-5 py-2.5"
        >
          <Monitor className="h-4 w-4 mr-1.5" />
          Digi-box
        </ButtonLink>
        <ButtonLink
          href="/dashboard/diensten"
          className="bg-white border border-border text-foreground hover:bg-muted font-medium rounded-full text-sm px-5 py-2.5 hidden sm:inline-flex"
        >
          <Settings className="h-4 w-4 mr-1.5" />
          Diensten
        </ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Mini timeline */}
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold">Vandaag</h2>
                <Link href="/dashboard/afspraken" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Bekijk alles <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="px-2 py-2 max-h-[400px] overflow-auto">
                <MiniTimeline appointments={todayAppointments} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Analytics */}
        <div className="space-y-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{monthApts.length}</p>
                <p className="text-xs text-muted-foreground">Afspraken deze maand</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{avgRating}</p>
                <div className="flex justify-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.round(Number(avgRating) || 0) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Beoordeling</p>
              </CardContent>
            </Card>
          </div>

          {/* Top services */}
          <Card className="border-border">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">Populaire diensten</h3>
              {topServices.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nog geen data</p>
              ) : (
                <div className="space-y-3">
                  {topServices.map(([name, count]) => (
                    <div key={name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-foreground font-medium">{name}</span>
                        <span className="text-muted-foreground">{count}x</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground"
                          style={{ width: `${(count / maxServiceCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card className="border-border">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">Overzicht</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Actieve kappers</span>
                  <span className="font-semibold">{shop.barbers.filter((b: { active: boolean }) => b.active).length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Scissors className="h-3.5 w-3.5" /> Diensten</span>
                  <span className="font-semibold">{shop.services.filter((s: { active: boolean }) => s.active).length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> Komende afspraken</span>
                  <span className="font-semibold">{upcoming.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
