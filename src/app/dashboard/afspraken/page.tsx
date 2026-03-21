"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/db";
import { barberUpdateAppointmentStatus, barberCancelAppointment } from "@/lib/barber-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle, Search, X, UserX, Check, Clock } from "lucide-react";

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
  shopId: string;
  barber: { name: string } | null;
  service: { name: string; price: number } | null;
}

function formatPrice(cents: number) {
  return `\u20AC${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

type FilterValue = "ALL" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export default function AfsprakenPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({ today: 0, week: 0, confirmed: 0 });

  // Load shop for current user
  useEffect(() => {
    async function loadShop() {
      const { data: session } = await supabase.auth.getSession();
      // We use a direct query to get the shop for this user's cookie-based session
      // The server actions handle auth, but for client-side queries we need the shopId
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const me = await res.json();

      const { data: shop } = await supabase
        .from("Shop")
        .select("id, name")
        .eq("userId", me.userId)
        .single();

      if (shop) {
        setShopId(shop.id);
        setShopName(shop.name);
      }
    }
    loadShop();
  }, []);

  const loadAppointments = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);

    let query = supabase
      .from("Appointment")
      .select("id, date, startTime, endTime, customerName, customerEmail, customerPhone, status, notes, shopId, barber:Barber(name), service:Service(name, price)")
      .eq("shopId", shopId)
      .order("date", { ascending: false })
      .order("startTime", { ascending: false });

    if (filter !== "ALL") query = query.eq("status", filter);
    if (search) query = query.ilike("customerName", `%${search}%`);

    const { data } = await query;
    setAppointments((data as unknown as Appointment[]) || []);

    // Calculate stats
    const today = new Date().toISOString().split("T")[0];
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekEnd = weekFromNow.toISOString().split("T")[0];

    const { data: allApts } = await supabase
      .from("Appointment")
      .select("date, status")
      .eq("shopId", shopId)
      .eq("status", "CONFIRMED");

    if (allApts) {
      const todayCount = allApts.filter((a) => a.date === today).length;
      const weekCount = allApts.filter((a) => a.date >= today && a.date <= weekEnd).length;
      setStats({ today: todayCount, week: weekCount, confirmed: allApts.length });
    }

    setLoading(false);
  }, [shopId, filter, search]);

  useEffect(() => {
    if (shopId) loadAppointments();
  }, [shopId, filter, loadAppointments]);

  async function handleAction(id: string, action: "completed" | "no_show" | "cancel") {
    setActionLoading(id);
    if (action === "cancel") {
      await barberCancelAppointment(id);
    } else {
      const status = action === "completed" ? "COMPLETED" : "NO_SHOW";
      await barberUpdateAppointmentStatus(id, status);
    }
    setExpanded(null);
    setActionLoading(null);
    loadAppointments();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadAppointments();
  }

  const statCards = [
    { label: "Vandaag", value: String(stats.today), icon: CalendarDays },
    { label: "Deze week", value: String(stats.week), icon: Clock },
    { label: "Bevestigd totaal", value: String(stats.confirmed), icon: CheckCircle },
  ];

  const filters: { value: FilterValue; label: string }[] = [
    { value: "ALL", label: "Alle" },
    { value: "CONFIRMED", label: "Bevestigd" },
    { value: "COMPLETED", label: "Voltooid" },
    { value: "CANCELLED", label: "Geannuleerd" },
    { value: "NO_SHOW", label: "No-show" },
  ];

  const statusLabels: Record<string, string> = {
    CONFIRMED: "Bevestigd",
    CANCELLED: "Geannuleerd",
    COMPLETED: "Voltooid",
    NO_SHOW: "No-show",
  };
  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-gold/10 text-gold",
    CANCELLED: "bg-destructive/10 text-destructive",
    COMPLETED: "bg-green-500/10 text-green-500",
    NO_SHOW: "bg-muted text-muted-foreground",
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Afspraken</h1>
      <p className="mt-1 text-muted-foreground">
        Beheer alle afspraken van {shopName || "je salon"}
      </p>

      {/* Stats */}
      <div className="mt-5 grid gap-3 grid-cols-3">
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

      {/* Search */}
      <form onSubmit={handleSearch} className="mt-5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op klantnaam..."
          className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
        />
      </form>

      {/* Filter tabs */}
      <div className="mt-3 flex gap-2 flex-wrap">
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

      {/* Appointments list */}
      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Laden...</p>
      ) : appointments.length === 0 ? (
        <Card className="mt-6 border-border bg-surface">
          <CardContent className="p-6 text-center text-muted-foreground">
            Geen afspraken gevonden.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 space-y-2">
          {appointments.map((apt) => {
            const d = new Date(apt.date);
            const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
            const isExpanded = expanded === apt.id;
            const isLoading = actionLoading === apt.id;

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
                      <p className="text-xs text-muted-foreground truncate">
                        {apt.service?.name} — {apt.barber?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {apt.service?.price != null && (
                      <span className="text-sm font-semibold">{formatPrice(apt.service.price)}</span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[apt.status] || ""}`}>
                      {statusLabels[apt.status] || apt.status}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border bg-muted/10 p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Email:</span> {apt.customerEmail}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Telefoon:</span>{" "}
                        {apt.customerPhone || "\u2014"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tijd:</span> {apt.startTime} -{" "}
                        {apt.endTime}
                      </div>
                      {apt.notes && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Notitie:</span> {apt.notes}
                        </div>
                      )}
                    </div>
                    {apt.status === "CONFIRMED" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleAction(apt.id, "completed")}
                          className="h-7 bg-gold/10 text-gold hover:bg-gold/20 text-xs px-2"
                        >
                          <Check className="h-3 w-3 mr-1" /> Afgerond
                        </Button>
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleAction(apt.id, "no_show")}
                          variant="outline"
                          className="h-7 text-xs px-2 border-border"
                        >
                          <UserX className="h-3 w-3 mr-1" /> No-show
                        </Button>
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleAction(apt.id, "cancel")}
                          variant="outline"
                          className="h-7 text-xs px-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-3 w-3 mr-1" /> Annuleer
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
