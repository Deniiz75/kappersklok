import { getSession } from "@/lib/auth";
import { getShopByUserId, getAppointmentsForShop } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, Scissors, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const shop = await getShopByUserId(session.userId);
  if (!shop) redirect("/");

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = await getAppointmentsForShop(shop.id, today);
  const allAppointments = await getAppointmentsForShop(shop.id);

  const confirmed = allAppointments.filter((a) => a.status === "CONFIRMED");
  const upcoming = confirmed.filter(
    (a) => new Date(a.date) >= new Date(today)
  );

  const stats = [
    {
      label: "Afspraken vandaag",
      value: todayAppointments.length,
      icon: CalendarDays,
    },
    {
      label: "Komende afspraken",
      value: upcoming.length,
      icon: TrendingUp,
    },
    {
      label: "Actieve kappers",
      value: shop.barbers.filter((b: { active: boolean }) => b.active).length,
      icon: Users,
    },
    {
      label: "Diensten",
      value: shop.services.filter((s: { active: boolean }) => s.active).length,
      icon: Scissors,
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">
        Welkom, {shop.contactName}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Dashboard van {shop.name}
      </p>

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

      {/* Today's appointments */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Afspraken vandaag</h2>
        {todayAppointments.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Geen afspraken vandaag.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-gold">
                    {apt.startTime}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{apt.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.service?.name} — {apt.barber?.name}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    apt.status === "CONFIRMED"
                      ? "bg-gold/10 text-gold"
                      : apt.status === "CANCELLED"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {apt.status === "CONFIRMED" ? "Bevestigd" : apt.status === "CANCELLED" ? "Geannuleerd" : apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
