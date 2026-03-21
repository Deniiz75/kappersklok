import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/button-link";
import { Logo } from "@/components/logo";
import {
  CalendarDays,
  Clock,
  MapPin,
  Scissors,
  Star,
  User,
  ArrowRight,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react";

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

  const totalSpent = all
    .filter((a) => a.status !== "CANCELLED")
    .reduce((sum, a) => sum + (a.service?.price || 0), 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-sm font-semibold">Kappersklok</span>
          </Link>
          <form action="/api/klant-logout" method="POST">
            <button type="submit" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-3.5 w-3.5" />
              Uitloggen
            </button>
          </form>
        </div>
      </div>

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
              <p className="text-2xl font-bold">{all.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Totaal</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-surface">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uitgegeven</p>
            </CardContent>
          </Card>
        </div>

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
                    <div className="flex">
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
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-surface/30 px-4 py-3"
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
                  <div className="shrink-0 text-right">
                    {apt.status === "CANCELLED" ? (
                      <span className="text-xs text-destructive/60">Geannuleerd</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{apt.service ? formatPrice(apt.service.price) : ""}</span>
                    )}
                  </div>
                </div>
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
