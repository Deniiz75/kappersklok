import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/button-link";
import { getFavorites } from "@/lib/customer-actions";
import {
  CalendarDays,
  Clock,
  MapPin,
  Scissors,
  Star,
  User,
  Heart,
  ArrowRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bell,
} from "lucide-react";
import { WaitlistActions } from "@/components/waitlist-actions";

export const dynamic = "force-dynamic";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

async function getCustomerEmail(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kk_customer")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return (payload.customerEmail as string) || null;
  } catch {
    return null;
  }
}

const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default async function MijnAfsprakenPage() {
  const email = await getCustomerEmail();
  if (!email) redirect("/login?tab=klant");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  const { data: appointments } = await supabase
    .from("Appointment")
    .select("id, date, startTime, endTime, customerName, status, cancelToken, notes, shop:Shop(name, slug, city), barber:Barber(name), service:Service(name, duration, price)")
    .eq("customerEmail", email)
    .order("date", { ascending: false })
    .order("startTime", { ascending: false });

  const today = new Date().toISOString().split("T")[0];
  const all = (appointments || []) as unknown as Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    customerName: string;
    status: string;
    cancelToken: string | null;
    notes: string | null;
    shop: { name: string; slug: string; city: string | null } | null;
    barber: { name: string } | null;
    service: { name: string; duration: number; price: number } | null;
  }>;

  const upcoming = all.filter((a) => a.date >= today && a.status === "CONFIRMED");
  const past = all.filter((a) => a.date < today || a.status !== "CONFIRMED");

  const completed = all.filter((a) => a.status !== "CANCELLED");
  const totalSpent = completed.reduce((sum, a) => sum + (a.service?.price || 0), 0);

  // Extended stats
  const barberCounts: Record<string, { name: string; count: number }> = {};
  const serviceCounts: Record<string, { name: string; count: number }> = {};
  for (const a of completed) {
    if (a.barber?.name) {
      const key = a.barber.name;
      barberCounts[key] = barberCounts[key] || { name: key, count: 0 };
      barberCounts[key].count++;
    }
    if (a.service?.name) {
      const key = a.service.name;
      serviceCounts[key] = serviceCounts[key] || { name: key, count: 0 };
      serviceCounts[key].count++;
    }
  }
  const topBarber = Object.values(barberCounts).sort((a, b) => b.count - a.count)[0];
  const topService = Object.values(serviceCounts).sort((a, b) => b.count - a.count)[0];
  const avgSpent = completed.length > 0 ? Math.round(totalSpent / completed.length) : 0;

  // Fetch favorites
  const favorites = await getFavorites(email);

  // Check which past appointments already have reviews
  const pastIds = past.filter((a) => a.status !== "CANCELLED" && a.date < today).map((a) => a.id);
  const { data: existingReviews } = pastIds.length > 0
    ? await supabase.from("Review").select("appointmentId").in("appointmentId", pastIds)
    : { data: [] };
  const reviewedIds = new Set((existingReviews || []).map((r: { appointmentId: string }) => r.appointmentId));

  // Fetch waitlist entries
  const { data: waitlistEntries } = await supabase
    .from("WaitlistEntry")
    .select("id, date, status, notifiedAt, createdAt, shop:Shop(name, slug), barber:Barber(name), service:Service(name, duration, price)")
    .eq("customerEmail", email)
    .in("status", ["WAITING", "NOTIFIED"])
    .gte("date", today)
    .order("date", { ascending: true });

  const waitlist = (waitlistEntries || []) as unknown as Array<{
    id: string;
    date: string;
    status: string;
    notifiedAt: string | null;
    createdAt: string;
    shop: { name: string; slug: string } | null;
    barber: { name: string } | null;
    service: { name: string; duration: number; price: number } | null;
  }>;

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Welcome */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
            <User className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">Mijn afspraken</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <Card className="border-border bg-surface">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-gold">{upcoming.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Komend</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-surface">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{completed.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Bezoeken</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-surface">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uitgegeven</p>
            </CardContent>
          </Card>
        </div>

        {/* Extended stats */}
        {completed.length > 2 && (
          <div className="mb-8 grid grid-cols-3 gap-3">
            {topBarber && (
              <Card className="border-border bg-surface">
                <CardContent className="p-3 text-center">
                  <Scissors className="mx-auto h-4 w-4 text-gold/60 mb-1" />
                  <p className="text-xs font-semibold truncate">{topBarber.name}</p>
                  <p className="text-[10px] text-muted-foreground">{topBarber.count}x bezocht</p>
                </CardContent>
              </Card>
            )}
            {topService && (
              <Card className="border-border bg-surface">
                <CardContent className="p-3 text-center">
                  <Star className="mx-auto h-4 w-4 text-gold/60 mb-1" />
                  <p className="text-xs font-semibold truncate">{topService.name}</p>
                  <p className="text-[10px] text-muted-foreground">{topService.count}x geboekt</p>
                </CardContent>
              </Card>
            )}
            <Card className="border-border bg-surface">
              <CardContent className="p-3 text-center">
                <Clock className="mx-auto h-4 w-4 text-gold/60 mb-1" />
                <p className="text-xs font-semibold">{formatPrice(avgSpent)}</p>
                <p className="text-[10px] text-muted-foreground">Gem. per bezoek</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              <Heart className="h-4 w-4" />
              Mijn favorieten ({favorites.length})
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {favorites.map((fav) => {
                const shop = fav.shop as unknown as { name: string; slug: string; city: string | null } | null;
                return (
                  <div key={fav.id} className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">{shop?.name}</p>
                      {shop?.city && <p className="text-[10px] text-muted-foreground">{shop.city}</p>}
                    </div>
                    <ButtonLink
                      href={`/kapperszaak/${shop?.slug}`}
                      className="bg-gold text-background hover:bg-gold-hover font-semibold text-[10px] px-2.5 py-1 h-auto"
                    >
                      Boek
                    </ButtonLink>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Waitlist */}
        {waitlist.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold mb-4">
              <Bell className="h-4 w-4" />
              Wachtlijst ({waitlist.length})
            </h2>
            <div className="space-y-3">
              {waitlist.map((entry) => (
                <Card key={entry.id} className="border-border bg-surface overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className={`flex w-20 shrink-0 flex-col items-center justify-center border-r py-4 ${
                        entry.status === "NOTIFIED" ? "bg-green-500/5 border-green-500/10" : "bg-gold/5 border-gold/10"
                      }`}>
                        <Bell className={`h-5 w-5 ${entry.status === "NOTIFIED" ? "text-green-500" : "text-gold/60"}`} />
                        <span className="text-[10px] text-muted-foreground mt-1">
                          {new Date(entry.date).getDate()} {monthNames[new Date(entry.date).getMonth()]}
                        </span>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold">{entry.service?.name}</p>
                            <div className="mt-1 space-y-0.5">
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />{entry.shop?.name}
                              </p>
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Scissors className="h-3 w-3 shrink-0" />{entry.barber?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {entry.status === "NOTIFIED" ? (
                              <>
                                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
                                  Plek beschikbaar!
                                </span>
                                <Link
                                  href={`/kapperszaak/${entry.shop?.slug}`}
                                  className="text-[10px] font-semibold text-gold hover:text-gold-hover transition-colors"
                                >
                                  Nu boeken →
                                </Link>
                              </>
                            ) : (
                              <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
                                Wachtend
                              </span>
                            )}
                            <WaitlistActions entryId={entry.id} customerEmail={email} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold mb-4">
            <CalendarDays className="h-4 w-4" />
            Komende afspraken ({upcoming.length})
          </h2>

          {upcoming.length === 0 ? (
            <Card className="border-border bg-surface">
              <CardContent className="p-8 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">Geen komende afspraken</p>
                <ButtonLink href="/kapper-zoeken" className="mt-4 bg-gold text-background hover:bg-gold-hover font-semibold text-xs">
                  Boek een afspraak <ArrowRight className="ml-1 h-3 w-3" />
                </ButtonLink>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <Card key={apt.id} className="border-border bg-surface overflow-hidden">
                  <CardContent className="p-0">
                    <Link href={`/mijn-afspraken/${apt.id}`} className="flex hover:bg-surface/80 transition-colors">
                      {/* Date sidebar */}
                      <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-gold/5 border-r border-gold/10 py-4">
                        <span className="text-2xl font-bold text-gold font-mono">{apt.startTime}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(apt.date).getDate()} {monthNames[new Date(apt.date).getMonth()]}
                        </span>
                      </div>
                      {/* Details */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold">{apt.service?.name}</p>
                            <div className="mt-1 space-y-0.5">
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <Link href={`/kapperszaak/${apt.shop?.slug}`} className="hover:text-gold transition-colors">
                                  {apt.shop?.name}
                                </Link>
                              </p>
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Scissors className="h-3 w-3 shrink-0" />{apt.barber?.name}
                              </p>
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 shrink-0" />{apt.service?.duration} min — {apt.service ? formatPrice(apt.service.price) : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
                              Bevestigd
                            </span>
                            <div className="flex gap-2">
                              <Link
                                href={`/afspraak/herplannen?id=${apt.id}`}
                                className="text-[10px] text-muted-foreground hover:text-gold transition-colors"
                              >
                                Herplannen
                              </Link>
                              {apt.cancelToken && (
                                <Link
                                  href={`/afspraak/annuleren?token=${apt.cancelToken}`}
                                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  Annuleren
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past appointments */}
        {past.length > 0 && (
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              Geschiedenis ({past.length})
            </h2>
            <div className="space-y-2">
              {past.slice(0, 20).map((apt) => (
                <Link
                  key={apt.id}
                  href={`/mijn-afspraken/${apt.id}`}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-surface/30 px-4 py-3 hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {apt.status === "CANCELLED" ? (
                      <XCircle className="h-4 w-4 shrink-0 text-destructive/50" />
                    ) : (
                      <CheckCircle className="h-4 w-4 shrink-0 text-gold/50" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm truncate">
                        {apt.service?.name}
                        <span className="text-muted-foreground"> bij </span>
                        {apt.shop?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(apt.date)} — {apt.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {apt.status === "CANCELLED" ? (
                      <span className="text-xs text-destructive/60">Geannuleerd</span>
                    ) : (
                      <>
                        {apt.date < today && !reviewedIds.has(apt.id) && (
                          <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] text-gold flex items-center gap-1">
                            <Star className="h-2.5 w-2.5" /> Review
                          </span>
                        )}
                        {apt.date < today && apt.shop && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <RefreshCw className="h-2.5 w-2.5" /> Opnieuw
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{apt.service ? formatPrice(apt.service.price) : ""}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Book new */}
        <div className="mt-10 rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 to-transparent p-6 text-center">
          <h3 className="font-heading text-lg font-bold">Nieuwe afspraak maken?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Zoek een kapper en boek direct online</p>
          <ButtonLink href="/kapper-zoeken" className="mt-4 bg-gold text-background hover:bg-gold-hover font-semibold">
            Kapper zoeken <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
