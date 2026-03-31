import { supabase } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Store, Users, CalendarDays, Star, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return `\u20AC${(cents / 100).toFixed(0)}`;
}

export default async function AnalyticsPage() {
  const now = new Date();

  // Monthly data for last 12 months
  const months: { label: string; period: string; month: Date }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleDateString("nl-NL", { month: "short" }),
      period: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      month: d,
    });
  }

  // Fetch all data
  const [
    { data: shops },
    { data: customers },
    { data: appointments },
    { data: payments },
    { data: reviews },
  ] = await Promise.all([
    supabase.from("Shop").select("id, name, createdAt"),
    supabase.from("Customer").select("id, createdAt"),
    supabase.from("Appointment").select("id, date, startTime, status, serviceId, shopId, service:Service(name, price)"),
    supabase.from("Payment").select("amount, status, period"),
    supabase.from("Review").select("id, rating, shopId, createdAt, shop:Shop(name)"),
  ]);

  // Growth: items per month
  function countByMonth(items: Array<{ createdAt?: string; date?: string }>, dateField: "createdAt" | "date") {
    return months.map((m) => {
      const start = m.month;
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      return items.filter((item) => {
        const d = new Date(item[dateField] || "");
        return d >= start && d < end;
      }).length;
    });
  }

  const shopsByMonth = countByMonth(shops || [], "createdAt");
  const customersByMonth = countByMonth(customers || [], "createdAt");
  const aptsByMonth = countByMonth(appointments || [], "date");

  // Revenue per month
  const revenueByMonth = months.map((m) => {
    return (payments || [])
      .filter((p) => p.status === "PAID" && p.period === m.period)
      .reduce((s, p) => s + p.amount, 0);
  });

  // Activity: busiest days
  const dayCount = [0, 0, 0, 0, 0, 0, 0];
  const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
  for (const a of appointments || []) {
    const d = new Date(a.date);
    dayCount[d.getDay()]++;
  }

  // Activity: busiest hours
  const hourCount: Record<string, number> = {};
  for (const a of appointments || []) {
    const hour = (a.startTime || "").split(":")[0];
    if (hour) hourCount[hour] = (hourCount[hour] || 0) + 1;
  }
  const sortedHours = Object.entries(hourCount).sort((a, b) => Number(a[0]) - Number(b[0]));

  // Popular services
  const serviceCounts: Record<string, { name: string; count: number }> = {};
  for (const a of appointments || []) {
    const svc = a.service as unknown as { name: string } | null;
    if (svc?.name) {
      serviceCounts[svc.name] = serviceCounts[svc.name] || { name: svc.name, count: 0 };
      serviceCounts[svc.name].count++;
    }
  }
  const topServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // Top shops by appointments
  const shopAptCounts: Record<string, { name: string; count: number }> = {};
  for (const a of appointments || []) {
    const id = a.shopId;
    const shop = (shops || []).find((s) => s.id === id);
    if (shop) {
      shopAptCounts[id] = shopAptCounts[id] || { name: shop.name, count: 0 };
      shopAptCounts[id].count++;
    }
  }
  const topShops = Object.values(shopAptCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // Average rating
  const allRatings = (reviews || []).map((r) => r.rating);
  const avgRating = allRatings.length > 0 ? (allRatings.reduce((s, r) => s + r, 0) / allRatings.length).toFixed(1) : "—";

  // Helper: bar chart
  function BarChart({ data, labels, color = "bg-gold/60" }: { data: number[]; labels: string[]; color?: string }) {
    const max = Math.max(...data, 1);
    return (
      <div className="flex items-end gap-1.5 h-24">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[8px] text-muted-foreground">{val || ""}</span>
            <div className={`w-full rounded-t ${color} transition-all`} style={{ height: `${Math.max((val / max) * 64, 2)}px` }} />
            <span className="text-[8px] text-muted-foreground">{labels[i]}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-gold" />
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
      </div>
      <p className="mt-1 text-muted-foreground">Platform trends en statistieken</p>

      {/* Summary cards */}
      <div className="mt-5 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-surface">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{(shops || []).length}</p>
            <p className="text-[10px] text-muted-foreground">Totaal shops</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{(customers || []).length}</p>
            <p className="text-[10px] text-muted-foreground">Totaal klanten</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{(appointments || []).length}</p>
            <p className="text-[10px] text-muted-foreground">Totaal afspraken</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{avgRating}</p>
            <p className="text-[10px] text-muted-foreground">Gem. beoordeling</p>
          </CardContent>
        </Card>
      </div>

      {/* Growth charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-surface">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Store className="h-4 w-4 text-gold" /> Nieuwe shops per maand</h3>
            <BarChart data={shopsByMonth} labels={months.map((m) => m.label)} />
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Users className="h-4 w-4 text-gold" /> Nieuwe klanten per maand</h3>
            <BarChart data={customersByMonth} labels={months.map((m) => m.label)} />
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><CalendarDays className="h-4 w-4 text-gold" /> Afspraken per maand</h3>
            <BarChart data={aptsByMonth} labels={months.map((m) => m.label)} />
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><BarChart3 className="h-4 w-4 text-gold" /> Omzet per maand</h3>
            <BarChart data={revenueByMonth} labels={months.map((m) => m.label)} color="bg-green-500/60" />
          </CardContent>
        </Card>
      </div>

      {/* Activity charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-surface">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><CalendarDays className="h-4 w-4 text-gold" /> Drukste dagen</h3>
            <BarChart data={dayCount} labels={dayNames} />
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Clock className="h-4 w-4 text-gold" /> Drukste uren</h3>
            <BarChart data={sortedHours.map(([, c]) => c)} labels={sortedHours.map(([h]) => `${h}u`)} />
          </CardContent>
        </Card>
      </div>

      {/* Top lists */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-surface">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Star className="h-4 w-4 text-gold" /> Populairste diensten</h3>
            <div className="space-y-2">
              {topServices.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                    {s.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.count}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Store className="h-4 w-4 text-gold" /> Top shops op afspraken</h3>
            <div className="space-y-2">
              {topShops.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                    {s.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.count}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
