import Link from "next/link";
import { supabase } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { UserSearch, Users, Heart, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function KlantenPage({ searchParams }: Props) {
  const { q } = await searchParams;

  let query = supabase.from("Customer").select("id, email, name, phone, createdAt").order("createdAt", { ascending: false });
  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  }
  const { data: customers, count: totalCount } = await query.limit(100);

  // Stats
  const { count: customerCount } = await supabase.from("Customer").select("*", { count: "exact", head: true });
  const { count: favCount } = await supabase.from("Favorite").select("customerEmail", { count: "exact", head: true });

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count: newThisMonth } = await supabase.from("Customer").select("*", { count: "exact", head: true }).gte("createdAt", firstOfMonth);

  // Get appointment counts per customer email
  const customerEmails = (customers || []).map((c) => c.email);
  const { data: aptCounts } = customerEmails.length > 0
    ? await supabase.from("Appointment").select("customerEmail").in("customerEmail", customerEmails)
    : { data: [] };

  const emailCounts: Record<string, number> = {};
  for (const a of aptCounts || []) {
    emailCounts[a.customerEmail] = (emailCounts[a.customerEmail] || 0) + 1;
  }

  const stats = [
    { label: "Totaal klanten", value: customerCount || 0, icon: Users },
    { label: "Met favorieten", value: favCount || 0, icon: Heart },
    { label: "Nieuw deze maand", value: newThisMonth || 0, icon: CalendarDays },
  ];

  return (
    <div>
      <div className="flex items-center gap-2">
        <UserSearch className="h-5 w-5 text-gold" />
        <h1 className="font-heading text-2xl font-bold">Klanten</h1>
      </div>
      <p className="mt-1 text-muted-foreground">Alle klanten op het platform</p>

      {/* Stats */}
      <div className="mt-5 grid gap-3 grid-cols-3">
        {stats.map((stat) => (
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
      <form className="mt-5">
        <div className="relative">
          <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Zoek op naam of email..."
            className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
          />
        </div>
      </form>

      {/* Customer list */}
      <div className="mt-5 space-y-2">
        {(customers || []).length === 0 ? (
          <Card className="border-border bg-surface">
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              {q ? `Geen klanten gevonden voor "${q}"` : "Nog geen klanten."}
            </CardContent>
          </Card>
        ) : (
          (customers || []).map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/klanten/${c.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 hover:border-gold/30 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.name || c.email}</p>
                <p className="text-[10px] text-muted-foreground">{c.email} {c.phone ? `— ${c.phone}` : ""}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-semibold">{emailCounts[c.email] || 0}</p>
                  <p className="text-[9px] text-muted-foreground">afspraken</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{formatDate(c.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
