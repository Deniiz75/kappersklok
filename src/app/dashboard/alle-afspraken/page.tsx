"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/db";
import { adminCancelAppointment, updateAppointmentStatus } from "@/lib/admin-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, TrendingUp, XCircle, CheckCircle, Search, X, UserX, Check } from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  status: string;
  notes: string | null;
  shop: { name: string } | null;
  barber: { name: string } | null;
  service: { name: string; price: number } | null;
}

function formatPrice(cents: number) {
  return `\u20AC${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

export default function AlleAfsprakenPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"ALL" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, revenue: 0 });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  async function load() {
    setLoading(true);
    let query = supabase
      .from("Appointment")
      .select("id, date, startTime, endTime, customerName, customerEmail, customerPhone, status, notes, shop:Shop(name), barber:Barber(name), service:Service(name, price)")
      .order("date", { ascending: false })
      .order("startTime", { ascending: false })
      .range(0, (page + 1) * PAGE_SIZE - 1);

    if (filter !== "ALL") query = query.eq("status", filter);
    if (search) query = query.or(`customerName.ilike.%${search}%,customerEmail.ilike.%${search}%`);

    const { data } = await query;
    setAppointments((data as unknown as Appointment[]) || []);

    // Stats (only once)
    const { data: all } = await supabase.from("Appointment").select("status, service:Service(price)");
    if (all) {
      const confirmed = all.filter((a) => a.status === "CONFIRMED");
      const cancelled = all.filter((a) => a.status === "CANCELLED");
      const rev = confirmed.reduce((sum, a) => sum + ((a.service as unknown as { price: number })?.price || 0), 0);
      setStats({ total: all.length, confirmed: confirmed.length, cancelled: cancelled.length, revenue: rev });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter, page]);

  async function handleAction(id: string, action: "cancel" | "no_show" | "completed") {
    if (action === "cancel") {
      await adminCancelAppointment(id);
    } else if (action === "no_show") {
      await updateAppointmentStatus(id, "NO_SHOW");
    } else {
      await updateAppointmentStatus(id, "COMPLETED");
    }
    load();
    setExpanded(null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    load();
  }

  const statCards = [
    { label: "Totaal", value: String(stats.total), icon: CalendarDays },
    { label: "Bevestigd", value: String(stats.confirmed), icon: CheckCircle },
    { label: "Geannuleerd", value: String(stats.cancelled), icon: XCircle },
    { label: "Omzet", value: formatPrice(stats.revenue), icon: TrendingUp },
  ];

  const filters = [
    { value: "ALL" as const, label: "Alle" },
    { value: "CONFIRMED" as const, label: "Bevestigd" },
    { value: "CANCELLED" as const, label: "Geannuleerd" },
    { value: "COMPLETED" as const, label: "Voltooid" },
    { value: "NO_SHOW" as const, label: "No-show" },
  ];

  const statusLabels: Record<string, string> = { CONFIRMED: "Bevestigd", CANCELLED: "Geannuleerd", COMPLETED: "Voltooid", NO_SHOW: "No-show" };
  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-gold/10 text-gold",
    CANCELLED: "bg-destructive/10 text-destructive",
    COMPLETED: "bg-green-500/10 text-green-500",
    NO_SHOW: "bg-muted text-muted-foreground",
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Alle Afspraken</h1>
      <p className="mt-1 text-muted-foreground">Platform-breed overzicht</p>

      <div className="mt-5 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border bg-surface">
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                <stat.icon className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + filters */}
      <form onSubmit={handleSearch} className="mt-5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op klantnaam of email..."
          className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
        />
      </form>

      <div className="mt-3 flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(0); }}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              filter === f.value ? "bg-gold/10 text-gold border border-gold" : "bg-surface border border-border text-muted-foreground hover:border-gold/30"
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
            const isExpanded = expanded === apt.id;
            return (
              <div key={apt.id} className="rounded-lg border border-border bg-surface overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : apt.id)}
                  className="flex w-full flex-col gap-2 p-3 text-left sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-center shrink-0 w-14">
                      <p className="text-sm font-bold font-mono text-gold">{apt.startTime}</p>
                      <p className="text-[10px] text-muted-foreground">{dayLabel}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{apt.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{apt.shop?.name} — {apt.service?.name} — {apt.barber?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {apt.service?.price != null && <span className="text-sm font-semibold">{formatPrice(apt.service.price)}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[apt.status] || ""}`}>
                      {statusLabels[apt.status] || apt.status}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border bg-muted/10 p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Email:</span> {apt.customerEmail}</div>
                      <div><span className="text-muted-foreground">Telefoon:</span> {apt.customerPhone || "—"}</div>
                      <div><span className="text-muted-foreground">Tijd:</span> {apt.startTime} - {apt.endTime}</div>
                      {apt.notes && <div className="col-span-2"><span className="text-muted-foreground">Notitie:</span> {apt.notes}</div>}
                    </div>
                    {apt.status === "CONFIRMED" && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => handleAction(apt.id, "completed")} className="h-7 bg-gold/10 text-gold hover:bg-gold/20 text-xs px-2">
                          <Check className="h-3 w-3 mr-1" /> Afgerond
                        </Button>
                        <Button size="sm" onClick={() => handleAction(apt.id, "no_show")} variant="outline" className="h-7 text-xs px-2 border-border">
                          <UserX className="h-3 w-3 mr-1" /> No-show
                        </Button>
                        <Button size="sm" onClick={() => handleAction(apt.id, "cancel")} variant="outline" className="h-7 text-xs px-2 border-destructive/30 text-destructive hover:bg-destructive/10">
                          <X className="h-3 w-3 mr-1" /> Annuleer
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {appointments.length >= (page + 1) * PAGE_SIZE && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full rounded-lg border border-border bg-surface py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Laad meer...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
