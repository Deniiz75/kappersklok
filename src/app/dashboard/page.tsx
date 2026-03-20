import { getSession } from "@/lib/auth";
import { getShopByUserId, getAppointmentsForShop, supabase } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, Scissors, TrendingUp, Store, MessageSquare, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = session.role === "ADMIN";

  if (isAdmin) {
    // Admin overview
    const { count: shopCount } = await supabase.from("Shop").select("*", { count: "exact", head: true });
    const { count: activeShops } = await supabase.from("Shop").select("*", { count: "exact", head: true }).eq("status", "ACTIVE");
    const { count: pendingShops } = await supabase.from("Shop").select("*", { count: "exact", head: true }).eq("status", "PENDING");
    const { count: userCount } = await supabase.from("User").select("*", { count: "exact", head: true });
    const { count: messageCount } = await supabase.from("ContactMessage").select("*", { count: "exact", head: true }).eq("read", false);
    const { count: appointmentCount } = await supabase.from("Appointment").select("*", { count: "exact", head: true }).eq("status", "CONFIRMED");

    const stats = [
      { label: "Totaal kapperszaken", value: shopCount || 0, icon: Store },
      { label: "Actieve zaken", value: activeShops || 0, icon: ShieldCheck },
      { label: "Wachtend op goedkeuring", value: pendingShops || 0, icon: TrendingUp },
      { label: "Gebruikers", value: userCount || 0, icon: Users },
      { label: "Ongelezen berichten", value: messageCount || 0, icon: MessageSquare },
      { label: "Bevestigde afspraken", value: appointmentCount || 0, icon: CalendarDays },
    ];

    // Recent shops
    const { data: recentShops } = await supabase
      .from("Shop")
      .select("id, name, city, status, createdAt")
      .order("createdAt", { ascending: false })
      .limit(5);

    return (
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-gold" />
          <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="mt-1 text-muted-foreground">Beheer het Kappersklok platform</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <h2 className="text-lg font-semibold">Recente registraties</h2>
          <div className="mt-3 space-y-2">
            {(recentShops || []).map((shop) => (
              <div key={shop.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                <div>
                  <p className="text-sm font-medium">{shop.name}</p>
                  <p className="text-xs text-muted-foreground">{shop.city}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  shop.status === "ACTIVE" ? "bg-gold/10 text-gold"
                    : shop.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {shop.status === "ACTIVE" ? "Actief" : shop.status === "PENDING" ? "Wachtend" : "Geblokkeerd"}
                </span>
              </div>
            ))}
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
