import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { ShopDetailTabs } from "@/components/shop-detail-tabs";
import { ShopActions } from "./actions";
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Globe,
  Calendar,
  ExternalLink,
  Star,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

function formatPrice(cents: number) {
  return `\u20AC${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

export default async function ShopDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab = "overzicht" } = await searchParams;

  const { data: shop } = await supabase.from("Shop").select("*").eq("id", id).single();
  if (!shop) notFound();

  // Fetch related data based on tab
  const [{ data: barbers }, { data: services }, { data: hours }, { data: user }] = await Promise.all([
    supabase.from("Barber").select("*").eq("shopId", id).order("name"),
    supabase.from("Service").select("*").eq("shopId", id).order("sortOrder"),
    supabase.from("BusinessHours").select("*").eq("shopId", id).order("dayOfWeek"),
    shop.userId ? supabase.from("User").select("id, email, role, createdAt").eq("id", shop.userId).single() : { data: null },
  ]);

  const address = [shop.street, shop.houseNumber].filter(Boolean).join(" ");
  const location = [address, shop.postalCode, shop.city].filter(Boolean).join(", ");

  const statusConfig: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Actief", cls: "bg-gold/10 text-gold" },
    PENDING: { label: "Wachtend", cls: "bg-yellow-500/10 text-yellow-500" },
    SUSPENDED: { label: "Geblokkeerd", cls: "bg-destructive/10 text-destructive" },
  };
  const status = statusConfig[shop.status] || statusConfig.PENDING;

  return (
    <div>
      {/* Header */}
      <Link href="/dashboard/shops" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Terug naar kapperszaken
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/10">
            <Store className="h-5 w-5 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-bold">{shop.name}</h1>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${status.cls}`}>{status.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{shop.contactName} — {shop.city || "Geen stad"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ShopActions shopId={id} currentStatus={shop.status} slug={shop.slug} />
        </div>
      </div>

      {/* Tabs */}
      <ShopDetailTabs shopId={id} />

      <div className="mt-5">
        {/* Tab: Overzicht */}
        {tab === "overzicht" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border bg-surface">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Bedrijfsgegevens</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { icon: Mail, label: "Email", value: shop.email },
                    { icon: Phone, label: "Telefoon", value: shop.phone },
                    { icon: Phone, label: "Prive telefoon", value: shop.privatePhone },
                    { icon: MapPin, label: "Adres", value: location || null },
                    { icon: Instagram, label: "Instagram", value: shop.instagram },
                    { icon: Globe, label: "KvK", value: shop.kvkNumber },
                    { icon: Globe, label: "Taal", value: shop.language },
                    { icon: Calendar, label: "Aangemeld", value: formatDate(shop.createdAt) },
                  ].map((field) => (
                    <div key={field.label} className="flex items-start gap-2">
                      <field.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase">{field.label}</span>
                        <p className="text-xs">{field.value || <span className="text-muted-foreground/50">Niet ingevuld</span>}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-surface">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Instellingen</h3>
                <div className="space-y-1.5 text-xs">
                  <p><span className="text-muted-foreground">Max kappers:</span> {shop.barbersCount}</p>
                  <p><span className="text-muted-foreground">Welkomstpakket:</span> {shop.welcomePackage ? "Ja" : "Nee"}</p>
                  <p><span className="text-muted-foreground">Digibox:</span> {shop.digibox ? "Ja" : "Nee"}</p>
                  <p><span className="text-muted-foreground">Eigen domein:</span> {shop.privateDomain || "Geen"}</p>
                  <p><span className="text-muted-foreground">Slug:</span> <code className="text-[10px] bg-muted px-1 rounded">{shop.slug}</code></p>
                </div>

                {user && (
                  <>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gold pt-2">Gekoppeld account</h3>
                    <div className="space-y-1.5 text-xs">
                      <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
                      <p><span className="text-muted-foreground">Rol:</span> {user.role}</p>
                      <p><span className="text-muted-foreground">Aangemeld:</span> {formatDate(user.createdAt)}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Kappers */}
        {tab === "kappers" && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{(barbers || []).length} kappers</h3>
            {(barbers || []).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                <div>
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground">Aangemaakt: {formatDate(b.createdAt)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${b.active ? "bg-gold/10 text-gold" : "bg-muted text-muted-foreground"}`}>
                  {b.active ? "Actief" : "Inactief"}
                </span>
              </div>
            ))}
            {(barbers || []).length === 0 && <p className="text-sm text-muted-foreground">Geen kappers.</p>}
          </div>
        )}

        {/* Tab: Diensten */}
        {tab === "diensten" && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{(services || []).length} diensten</h3>
            {(services || []).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.duration} min</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gold">{formatPrice(s.price)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${s.active ? "bg-gold/10 text-gold" : "bg-muted text-muted-foreground"}`}>
                    {s.active ? "Actief" : "Inactief"}
                  </span>
                </div>
              </div>
            ))}
            {(services || []).length === 0 && <p className="text-sm text-muted-foreground">Geen diensten.</p>}
          </div>
        )}

        {/* Tab: Openingstijden */}
        {tab === "uren" && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="text-sm font-semibold mb-3">Openingstijden</h3>
            <div className="space-y-2">
              {dayNames.map((day, i) => {
                const h = (hours || []).find((hr: { dayOfWeek: number }) => hr.dayOfWeek === i);
                return (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{day}</span>
                    <span className={h && !h.closed ? "font-mono" : "text-muted-foreground"}>
                      {h ? (h.closed ? "Gesloten" : `${h.openTime} - ${h.closeTime}`) : "Niet ingesteld"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Afspraken */}
        {tab === "afspraken" && <ShopAppointmentsTab shopId={id} />}

        {/* Tab: Reviews */}
        {tab === "reviews" && <ShopReviewsTab shopId={id} />}

        {/* Tab: Betalingen */}
        {tab === "betalingen" && <ShopPaymentsTab shopId={id} />}
      </div>
    </div>
  );
}

// Sub-components for data-heavy tabs
async function ShopAppointmentsTab({ shopId }: { shopId: string }) {
  const { data: appointments } = await supabase
    .from("Appointment")
    .select("id, date, startTime, endTime, customerName, customerEmail, customerPhone, status, notes, barber:Barber(name), service:Service(name, price)")
    .eq("shopId", shopId)
    .order("date", { ascending: false })
    .order("startTime", { ascending: false })
    .limit(50);

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-gold/10 text-gold",
    CANCELLED: "bg-destructive/10 text-destructive",
    COMPLETED: "bg-green-500/10 text-green-500",
    NO_SHOW: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{(appointments || []).length} afspraken</h3>
      {(appointments || []).map((apt) => {
        const barber = apt.barber as unknown as { name: string } | null;
        const service = apt.service as unknown as { name: string; price: number } | null;
        return (
          <div key={apt.id} className="rounded-lg border border-border bg-surface p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{apt.customerName}</p>
                <p className="text-[10px] text-muted-foreground">{apt.customerEmail} {apt.customerPhone ? `— ${apt.customerPhone}` : ""}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{service?.name} bij {barber?.name} — {formatDate(apt.date)} {apt.startTime}</p>
                {apt.notes && <p className="text-[10px] text-muted-foreground/60 mt-0.5">Notitie: {apt.notes}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {service && <span className="text-xs font-semibold">{formatPrice(service.price)}</span>}
                <span className={`rounded-full px-2 py-0.5 text-[9px] ${statusColors[apt.status] || ""}`}>{apt.status}</span>
              </div>
            </div>
          </div>
        );
      })}
      {(appointments || []).length === 0 && <p className="text-sm text-muted-foreground">Geen afspraken.</p>}
    </div>
  );
}

async function ShopReviewsTab({ shopId }: { shopId: string }) {
  const { data: reviews } = await supabase
    .from("Review")
    .select("id, customerName, customerEmail, rating, comment, approved, createdAt")
    .eq("shopId", shopId)
    .order("createdAt", { ascending: false });

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{(reviews || []).length} reviews</h3>
      {(reviews || []).map((r) => (
        <div key={r.id} className="rounded-lg border border-border bg-surface p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-gold text-gold" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-xs font-medium">{r.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{formatDate(r.createdAt)}</span>
              {!r.approved && <span className="rounded-full bg-yellow-500/10 px-1.5 py-0.5 text-[9px] text-yellow-500">Wacht</span>}
            </div>
          </div>
          {r.comment && <p className="mt-1 text-xs text-muted-foreground">{r.comment}</p>}
        </div>
      ))}
      {(reviews || []).length === 0 && <p className="text-sm text-muted-foreground">Geen reviews.</p>}
    </div>
  );
}

async function ShopPaymentsTab({ shopId }: { shopId: string }) {
  const { data: payments } = await supabase
    .from("Payment")
    .select("id, amount, description, status, period, paidAt, createdAt")
    .eq("shopId", shopId)
    .order("createdAt", { ascending: false });

  const statusColors: Record<string, string> = {
    PAID: "bg-gold/10 text-gold",
    PENDING: "bg-yellow-500/10 text-yellow-500",
    FAILED: "bg-destructive/10 text-destructive",
    REFUNDED: "bg-muted text-muted-foreground",
  };

  const total = (payments || []).filter((p) => p.status === "PAID").reduce((s: number, p: { amount: number }) => s + p.amount, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{(payments || []).length} betalingen — Totaal: {formatPrice(total)}</h3>
      </div>
      {(payments || []).map((p) => (
        <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
          <div>
            <p className="text-sm font-medium">{p.description}</p>
            <p className="text-[10px] text-muted-foreground">Periode: {p.period}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-semibold">{formatPrice(p.amount)}</span>
            <span className={`rounded-full px-2 py-0.5 text-[9px] ${statusColors[p.status] || ""}`}>{p.status}</span>
          </div>
        </div>
      ))}
      {(payments || []).length === 0 && <p className="text-sm text-muted-foreground">Geen betalingen.</p>}
    </div>
  );
}
