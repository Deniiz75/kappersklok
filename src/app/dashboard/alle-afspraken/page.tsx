"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, TrendingUp, XCircle, CheckCircle } from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  status: string;
  createdAt: string;
  shop: { name: string } | null;
  barber: { name: string } | null;
  service: { name: string; price: number } | null;
}

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

export default function AlleAfsprakenPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"ALL" | "CONFIRMED" | "CANCELLED" | "COMPLETED">("ALL");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, revenue: 0 });

  useEffect(() => {
    async function load() {
      let query = supabase
        .from("Appointment")
        .select("id, date, startTime, endTime, customerName, customerEmail, customerPhone, status, createdAt, shop:Shop(name), barber:Barber(name), service:Service(name, price)")
        .order("date", { ascending: false })
        .order("startTime", { ascending: false })
        .limit(100);

      if (filter !== "ALL") {
        query = query.eq("status", filter);
      }

      const { data } = await query;
      setAppointments((data as unknown as Appointment[]) || []);

      // Stats
      const { data: all } = await supabase.from("Appointment").select("status, service:Service(price)");
      if (all) {
        const confirmed = all.filter((a) => a.status === "CONFIRMED");
        const cancelled = all.filter((a) => a.status === "CANCELLED");
        const rev = confirmed.reduce((sum, a) => sum + ((a.service as unknown as { price: number })?.price || 0), 0);
        setStats({ total: all.length, confirmed: confirmed.length, cancelled: cancelled.length, revenue: rev });
      }
      setLoading(false);
    }
    load();
  }, [filter]);

  const statCards = [
    { label: "Totaal afspraken", value: String(stats.total), icon: CalendarDays },
    { label: "Bevestigd", value: String(stats.confirmed), icon: CheckCircle },
    { label: "Geannuleerd", value: String(stats.cancelled), icon: XCircle },
    { label: "Omzet (bevestigd)", value: formatPrice(stats.revenue), icon: TrendingUp },
  ];

  const filters = [
    { value: "ALL" as const, label: "Alle" },
    { value: "CONFIRMED" as const, label: "Bevestigd" },
    { value: "CANCELLED" as const, label: "Geannuleerd" },
    { value: "COMPLETED" as const, label: "Voltooid" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Alle Afspraken</h1>
      <p className="mt-1 text-muted-foreground">Platform-breed overzicht van alle geboekte afspraken</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border bg-surface">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                <stat.icon className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              filter === f.value
                ? "bg-gold/10 text-gold border border-gold"
                : "bg-surface border border-border text-muted-foreground hover:border-gold/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Laden...</p>
      ) : appointments.length === 0 ? (
        <Card className="mt-6 border-border bg-surface">
          <CardContent className="p-6 text-center text-muted-foreground">Geen afspraken gevonden.</CardContent>
        </Card>
      ) : (
        <div className="mt-4 space-y-2">
          {appointments.map((apt) => {
            const d = new Date(apt.date);
            const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
            return (
              <div key={apt.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-center shrink-0 w-14">
                    <p className="text-sm font-bold font-mono text-gold">{apt.startTime}</p>
                    <p className="text-[10px] text-muted-foreground">{dayLabel}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{apt.customerName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {apt.shop?.name} — {apt.service?.name} — {apt.barber?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {apt.service?.price && (
                    <span className="text-sm font-semibold">{formatPrice(apt.service.price)}</span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    apt.status === "CONFIRMED" ? "bg-gold/10 text-gold"
                      : apt.status === "CANCELLED" ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {apt.status === "CONFIRMED" ? "Bevestigd" : apt.status === "CANCELLED" ? "Geannuleerd" : apt.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
