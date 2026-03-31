import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CalendarDays,
  Heart,
  Star,
  MapPin,
  Scissors,
  Euro,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function formatPrice(cents: number) {
  return `\u20AC${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default async function KlantDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: customer } = await supabase.from("Customer").select("*").eq("id", id).single();
  if (!customer) notFound();

  // Fetch all related data in parallel
  const [{ data: appointments }, { data: favorites }, { data: reviews }] = await Promise.all([
    supabase
      .from("Appointment")
      .select("id, date, startTime, status, customerName, notes, shop:Shop(name, slug), barber:Barber(name), service:Service(name, price, duration)")
      .eq("customerEmail", customer.email)
      .order("date", { ascending: false })
      .limit(50),
    supabase
      .from("Favorite")
      .select("id, shopId, shop:Shop(name, slug, city)")
      .eq("customerEmail", customer.email),
    supabase
      .from("Review")
      .select("id, rating, comment, createdAt, shop:Shop(name, slug)")
      .eq("customerEmail", customer.email)
      .order("createdAt", { ascending: false }),
  ]);

  const allApts = (appointments || []) as unknown as Array<{
    id: string; date: string; startTime: string; status: string; customerName: string; notes: string | null;
    shop: { name: string; slug: string } | null; barber: { name: string } | null; service: { name: string; price: number; duration: number } | null;
  }>;

  const totalSpent = allApts.filter((a) => a.status !== "CANCELLED").reduce((s, a) => s + (a.service?.price || 0), 0);
  const completedCount = allApts.filter((a) => a.status !== "CANCELLED").length;

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-gold/10 text-gold",
    CANCELLED: "bg-destructive/10 text-destructive",
    COMPLETED: "bg-green-500/10 text-green-500",
    NO_SHOW: "bg-muted text-muted-foreground",
  };

  return (
    <div>
      <Link href="/dashboard/klanten" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Terug naar klanten
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10">
          <User className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold">{customer.name || customer.email}</h1>
          <p className="text-xs text-muted-foreground">Klant sinds {formatDate(customer.createdAt)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-border bg-surface">
          <CardContent className="p-3 text-center">
            <CalendarDays className="mx-auto h-4 w-4 text-gold/60 mb-1" />
            <p className="text-lg font-bold">{completedCount}</p>
            <p className="text-[10px] text-muted-foreground">Afspraken</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="p-3 text-center">
            <Euro className="mx-auto h-4 w-4 text-gold/60 mb-1" />
            <p className="text-lg font-bold">{formatPrice(totalSpent)}</p>
            <p className="text-[10px] text-muted-foreground">Besteed</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="p-3 text-center">
            <Heart className="mx-auto h-4 w-4 text-gold/60 mb-1" />
            <p className="text-lg font-bold">{(favorites || []).length}</p>
            <p className="text-[10px] text-muted-foreground">Favorieten</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="p-3 text-center">
            <Star className="mx-auto h-4 w-4 text-gold/60 mb-1" />
            <p className="text-lg font-bold">{(reviews || []).length}</p>
            <p className="text-[10px] text-muted-foreground">Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact info */}
      <Card className="border-border bg-surface mb-6">
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Gegevens</h3>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.name && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{customer.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointments */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Afspraken ({allApts.length})
          </h3>
          <div className="space-y-2">
            {allApts.slice(0, 20).map((apt) => (
              <div key={apt.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium">{apt.service?.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      <Link href={`/dashboard/shops`} className="hover:text-gold">{apt.shop?.name}</Link> — {apt.barber?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(apt.date)} {apt.startTime}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {apt.service && <span className="text-[10px] font-semibold">{formatPrice(apt.service.price)}</span>}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${statusColors[apt.status] || ""}`}>{apt.status}</span>
                  </div>
                </div>
              </div>
            ))}
            {allApts.length === 0 && <p className="text-xs text-muted-foreground">Geen afspraken.</p>}
          </div>
        </div>

        <div className="space-y-6">
          {/* Favorites */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Favorieten ({(favorites || []).length})
            </h3>
            <div className="space-y-2">
              {(favorites || []).map((fav) => {
                const shop = fav.shop as unknown as { name: string; slug: string; city: string | null } | null;
                return (
                  <Link key={fav.id} href={`/kapperszaak/${shop?.slug}`} className="flex items-center gap-2 rounded-lg border border-border bg-surface p-2.5 hover:border-gold/30 transition-colors">
                    <Heart className="h-3.5 w-3.5 text-gold shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{shop?.name}</p>
                      {shop?.city && <p className="text-[10px] text-muted-foreground">{shop.city}</p>}
                    </div>
                  </Link>
                );
              })}
              {(favorites || []).length === 0 && <p className="text-xs text-muted-foreground">Geen favorieten.</p>}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Reviews ({(reviews || []).length})
            </h3>
            <div className="space-y-2">
              {(reviews || []).map((r) => {
                const shop = r.shop as unknown as { name: string; slug: string } | null;
                return (
                  <div key={r.id} className="rounded-lg border border-border bg-surface p-2.5">
                    <div className="flex items-center justify-between">
                      <Link href={`/kapperszaak/${shop?.slug}`} className="text-xs font-medium hover:text-gold transition-colors">{shop?.name}</Link>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-2.5 w-2.5 ${i < r.rating ? "fill-gold text-gold" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="mt-1 text-[10px] text-muted-foreground">{r.comment}</p>}
                    <p className="text-[9px] text-muted-foreground/60 mt-1">{formatDate(r.createdAt)}</p>
                  </div>
                );
              })}
              {(reviews || []).length === 0 && <p className="text-xs text-muted-foreground">Geen reviews.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
