import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/button-link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Scissors,
  Star,
  ArrowLeft,
  RefreshCw,
  XCircle,
  Euro,
  FileText,
  CheckCircle,
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
  return `\u20AC${(cents / 100).toFixed(2).replace(".", ",")}`;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AfspraakDetailPage({ params }: Props) {
  const { id } = await params;
  const email = await getCustomerEmail();
  if (!email) redirect("/login?tab=klant");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  const { data: apt } = await supabase
    .from("Appointment")
    .select("id, date, startTime, endTime, customerName, customerEmail, customerPhone, status, cancelToken, notes, createdAt, shop:Shop(id, name, slug, city, street, houseNumber, postalCode, phone), barber:Barber(name), service:Service(name, duration, price)")
    .eq("id", id)
    .single();

  if (!apt || apt.customerEmail !== email) notFound();

  const appointment = apt as unknown as {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    status: string;
    cancelToken: string | null;
    notes: string | null;
    createdAt: string;
    shop: { id: string; name: string; slug: string; city: string | null; street: string | null; houseNumber: string | null; postalCode: string | null; phone: string | null } | null;
    barber: { name: string } | null;
    service: { name: string; duration: number; price: number } | null;
  };

  const today = new Date().toISOString().split("T")[0];
  const isPast = appointment.date < today;
  const isConfirmed = appointment.status === "CONFIRMED";
  const isCancelled = appointment.status === "CANCELLED";

  // Check if review already exists for this appointment
  const { data: existingReview } = await supabase
    .from("Review")
    .select("id")
    .eq("appointmentId", id)
    .limit(1);

  const hasReview = existingReview && existingReview.length > 0;

  const address = [appointment.shop?.street, appointment.shop?.houseNumber].filter(Boolean).join(" ");
  const location = [address, appointment.shop?.postalCode, appointment.shop?.city].filter(Boolean).join(", ");

  const statusConfig = {
    CONFIRMED: { label: "Bevestigd", color: "bg-gold/10 text-gold", icon: CheckCircle },
    CANCELLED: { label: "Geannuleerd", color: "bg-destructive/10 text-destructive", icon: XCircle },
    COMPLETED: { label: "Afgerond", color: "bg-green-500/10 text-green-500", icon: CheckCircle },
    NO_SHOW: { label: "No-show", color: "bg-muted text-muted-foreground", icon: XCircle },
  };

  const statusInfo = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.CONFIRMED;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/mijn-afspraken"
        className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Terug naar overzicht
      </Link>

      {/* Status banner */}
      <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${statusInfo.color}`}>
        <StatusIcon className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{statusInfo.label}</p>
          <p className="text-xs opacity-75">
            {isPast && isConfirmed ? "Deze afspraak is afgelopen" : ""}
            {!isPast && isConfirmed ? `${formatDate(appointment.date)} om ${appointment.startTime}` : ""}
            {isCancelled ? "Deze afspraak is geannuleerd" : ""}
          </p>
        </div>
      </div>

      {/* Main details */}
      <Card className="border-border bg-surface mb-4">
        <CardContent className="p-5 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Dienst</p>
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-gold shrink-0" />
              <p className="text-sm font-semibold">{appointment.service?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Datum</p>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gold shrink-0" />
                <p className="text-sm">{formatDate(appointment.date)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tijd</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold shrink-0" />
                <p className="text-sm font-mono">{appointment.startTime} - {appointment.endTime}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Kapper</p>
              <p className="text-sm">{appointment.barber?.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Prijs</p>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-gold shrink-0" />
                <p className="text-sm font-semibold">{appointment.service ? formatPrice(appointment.service.price) : ""}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Duur</p>
            <p className="text-sm">{appointment.service?.duration} minuten</p>
          </div>

          {appointment.notes && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Notities</p>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{appointment.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shop info */}
      {appointment.shop && (
        <Card className="border-border bg-surface mb-4">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Kapperszaak</p>
            <Link href={`/kapperszaak/${appointment.shop.slug}`} className="group">
              <p className="text-sm font-semibold group-hover:text-gold transition-colors">{appointment.shop.name}</p>
            </Link>
            {location && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" /> {location}
              </p>
            )}
            {appointment.shop.phone && (
              <a href={`tel:${appointment.shop.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 hover:text-foreground">
                <Clock className="h-3 w-3" /> {appointment.shop.phone}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {!isPast && isConfirmed && (
          <>
            <ButtonLink
              href={`/afspraak/herplannen?id=${appointment.id}`}
              className="w-full bg-gold text-background hover:bg-gold-hover font-semibold justify-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Herplannen
            </ButtonLink>
            {appointment.cancelToken && (
              <ButtonLink
                href={`/afspraak/annuleren?token=${appointment.cancelToken}`}
                className="w-full border border-destructive/30 text-destructive hover:bg-destructive/5 justify-center"
              >
                <XCircle className="mr-2 h-4 w-4" /> Annuleren
              </ButtonLink>
            )}
          </>
        )}

        {isPast && !isCancelled && !hasReview && (
          <ButtonLink
            href={`/mijn-afspraken/review/${appointment.id}`}
            className="w-full bg-gold text-background hover:bg-gold-hover font-semibold justify-center"
          >
            <Star className="mr-2 h-4 w-4" /> Review achterlaten
          </ButtonLink>
        )}

        {isPast && hasReview && (
          <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-center">
            <p className="text-xs text-gold flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" /> U heeft al een review achtergelaten
            </p>
          </div>
        )}

        {isPast && !isCancelled && appointment.shop && (
          <ButtonLink
            href={`/kapperszaak/${appointment.shop.slug}?service=${appointment.service?.name}&barber=${appointment.barber?.name}`}
            className="w-full border border-border text-foreground hover:bg-surface justify-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Opnieuw boeken
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
