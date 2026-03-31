"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, TrendingUp, AlertCircle, Check } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  description: string;
  status: string;
  period: string;
  paidAt: string;
  shop: { name: string; city: string | null } | null;
}

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default function BetalingenPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PAID" | "PENDING" | "FAILED">("ALL");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    async function load() {
      // Get all payments with shop name
      let query = supabase
        .from("Payment")
        .select("id, amount, description, status, period, paidAt, shop:Shop(name, city)")
        .order("paidAt", { ascending: false });

      if (filter !== "ALL") {
        query = query.eq("status", filter);
      }

      const { data } = await query;
      setPayments((data as unknown as Payment[]) || []);

      // Stats
      const { data: allPayments } = await supabase.from("Payment").select("amount, status");
      if (allPayments) {
        const paid = allPayments.filter((p) => p.status === "PAID");
        const pending = allPayments.filter((p) => p.status === "PENDING");
        setStats({
          total: allPayments.length,
          paid: paid.length,
          pending: pending.length,
          revenue: paid.reduce((sum, p) => sum + p.amount, 0),
        });
      }
      setLoading(false);
    }
    load();
  }, [filter]);

  const statCards = [
    { label: "Totale omzet", value: formatPrice(stats.revenue), icon: TrendingUp },
    { label: "Betaald", value: String(stats.paid), icon: Check },
    { label: "Openstaand", value: String(stats.pending), icon: AlertCircle },
    { label: "Totaal transacties", value: String(stats.total), icon: CreditCard },
  ];

  const filters = [
    { value: "ALL" as const, label: "Alle" },
    { value: "PAID" as const, label: "Betaald" },
    { value: "PENDING" as const, label: "Openstaand" },
    { value: "FAILED" as const, label: "Mislukt" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Betalingen</h1>
      <p className="mt-1 text-muted-foreground">Overzicht van alle betalingen en abonnementen</p>

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
      ) : (
        <div className="mt-4 space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  p.status === "PAID" ? "bg-gold/10" : p.status === "PENDING" ? "bg-yellow-500/10" : "bg-destructive/10"
                }`}>
                  <CreditCard className={`h-4 w-4 ${
                    p.status === "PAID" ? "text-gold" : p.status === "PENDING" ? "text-yellow-500" : "text-destructive"
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {p.shop?.name || "Onbekend"}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">{p.period}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  p.status === "PAID" ? "bg-gold/10 text-gold"
                    : p.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {p.status === "PAID" ? "Betaald" : p.status === "PENDING" ? "Open" : "Mislukt"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
