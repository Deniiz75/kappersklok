import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ButtonLink } from "@/components/button-link";
import { HeroBanner } from "@/components/hero-banner";
import {
  Check,
  CalendarDays,
  Clock,
  MapPin,
  Scissors,
  ExternalLink,
  CalendarPlus,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
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

function generateGoogleCalendarUrl(data: {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
}) {
  const start = data.date.replace(/-/g, "") + "T" + data.startTime.replace(":", "") + "00";
  const end = data.date.replace(/-/g, "") + "T" + data.endTime.replace(":", "") + "00";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: data.title,
    dates: `${start}/${end}`,
    location: data.location,
    details: data.description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function BevestigingPage({ params }: Props) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  const { data: apt } = await supabase
    .from("Appointment")
    .select("id, date, startTime, endTime, customerName, shop:Shop(name, slug, city, street, houseNumber, postalCode), barber:Barber(name), service:Service(name, duration, price)")
    .eq("id", id)
    .single();

  if (!apt) notFound();

  const appointment = apt as unknown as {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    customerName: string;
    shop: { name: string; slug: string; city: string | null; street: string | null; houseNumber: string | null; postalCode: string | null } | null;
    barber: { name: string } | null;
    service: { name: string; duration: number; price: number } | null;
  };

  const address = [appointment.shop?.street, appointment.shop?.houseNumber].filter(Boolean).join(" ");
  const location = [address, appointment.shop?.postalCode, appointment.shop?.city].filter(Boolean).join(", ");

  const calendarUrl = generateGoogleCalendarUrl({
    title: `Kapper: ${appointment.service?.name} bij ${appointment.shop?.name}`,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    location: location || appointment.shop?.name || "",
    description: `Afspraak bij ${appointment.shop?.name}\nKapper: ${appointment.barber?.name}\nDienst: ${appointment.service?.name}`,
  });

  const mapsQuery = encodeURIComponent(location || appointment.shop?.name || "");
  const mapsUrl = `https://maps.google.com/maps?q=${mapsQuery}`;

  return (
    <>
      <HeroBanner title="Afspraak bevestigd" />
      <section className="py-8">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
              <Check className="h-7 w-7 text-gold" />
            </div>
            <h2 className="mt-4 font-heading text-xl font-bold">Afspraak geboekt!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Beste {appointment.customerName}, uw afspraak is bevestigd.
            </p>
          </div>

          {/* Details card */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <Scissors className="h-4 w-4 text-gold shrink-0" />
              <div>
                <p className="text-sm font-semibold">{appointment.service?.name}</p>
                <p className="text-xs text-muted-foreground">{appointment.service?.duration} min — {appointment.service ? formatPrice(appointment.service.price) : ""}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gold shrink-0" />
              <div>
                <Link href={`/kapperszaak/${appointment.shop?.slug}`} className="text-sm font-semibold hover:text-gold transition-colors">
                  {appointment.shop?.name}
                </Link>
                {location && <p className="text-xs text-muted-foreground">{location}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-gold shrink-0" />
              <p className="text-sm">{formatDate(appointment.date)}</p>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gold shrink-0" />
              <p className="text-sm font-mono">{appointment.startTime} - {appointment.endTime}</p>
            </div>

            {appointment.barber && (
              <div className="flex items-center gap-3">
                <Scissors className="h-4 w-4 text-gold shrink-0" />
                <p className="text-sm">Kapper: {appointment.barber.name}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-hover"
            >
              <CalendarPlus className="h-4 w-4" /> Toevoegen aan Google Agenda
            </a>

            {location && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-surface"
              >
                <ExternalLink className="h-4 w-4" /> Bekijk locatie op kaart
              </a>
            )}

            <ButtonLink
              href="/mijn-afspraken"
              className="w-full border border-border text-foreground hover:bg-surface justify-center"
            >
              Naar mijn afspraken
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
