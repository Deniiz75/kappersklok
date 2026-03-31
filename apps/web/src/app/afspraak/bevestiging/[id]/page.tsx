import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ShopMonogram } from "@/components/shop-monogram";
import {
  Check,
  CalendarDays,
  Clock,
  MapPin,
  Scissors,
  User,
  CalendarPlus,
  Navigation,
  ArrowRight,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
const monthNames = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;
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
      <style>{`
        @keyframes confirmFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes confirmScale {
          0% { opacity: 0; transform: scale(0.5); }
          60% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes confirmCheck {
          0% { stroke-dashoffset: 24; opacity: 0; }
          40% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes confirmPulse {
          0%, 100% { opacity: 0.06; transform: scale(1); }
          50% { opacity: 0.12; transform: scale(1.05); }
        }
        @keyframes confirmGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .confirm-reveal { animation: confirmFadeUp 0.7s ease-out both; }
        .confirm-reveal-1 { animation-delay: 0.1s; }
        .confirm-reveal-2 { animation-delay: 0.25s; }
        .confirm-reveal-3 { animation-delay: 0.4s; }
        .confirm-reveal-4 { animation-delay: 0.55s; }
        .confirm-reveal-5 { animation-delay: 0.7s; }
        .confirm-icon { animation: confirmScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both; }
        .confirm-check { animation: confirmCheck 0.4s ease-out 0.5s both; stroke-dasharray: 24; stroke-dashoffset: 24; }
        .confirm-pulse { animation: confirmPulse 3s ease-in-out infinite; }
        .confirm-glow { animation: confirmGlow 2s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0c0c10 0%, #08080a 40%)" }}>
        {/* Radial glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="confirm-pulse absolute left-1/2 top-[15%] -translate-x-1/2 h-[500px] w-[600px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(212,168,83,0.08), transparent 70%)" }} />
        </div>

        <div className="relative mx-auto max-w-lg px-4 pb-16 pt-12 sm:pt-20">

          {/* ── Celebration Header ── */}
          <div className="text-center">
            {/* Animated checkmark */}
            <div className="confirm-icon relative mx-auto mb-6 h-20 w-20 sm:h-24 sm:w-24">
              {/* Outer glow ring */}
              <div className="confirm-glow absolute inset-0 rounded-full" style={{ boxShadow: "0 0 40px 8px rgba(212,168,83,0.15)" }} />
              {/* Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-gold/30" />
              <div className="absolute inset-1 rounded-full border border-gold/10" />
              {/* Fill */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gold/[0.08]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="sm:h-10 sm:w-10">
                  <path className="confirm-check" d="M5 13l4 4L19 7" stroke="#d4a853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <div className="confirm-reveal confirm-reveal-1">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold/60">Bevestiging</p>
              <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Uw afspraak is <span className="text-gold">bevestigd</span>
              </h1>
              <p className="mt-2 text-sm text-white/40">
                Beste {appointment.customerName}, alles staat klaar voor u.
              </p>
            </div>
          </div>

          {/* ── Ornamental divider ── */}
          <div className="confirm-reveal confirm-reveal-2 my-8 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/[0.06]" />
            <div className="h-1 w-1 rotate-45 bg-gold/30" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/[0.06]" />
          </div>

          {/* ── Shop identity ── */}
          <div className="confirm-reveal confirm-reveal-2 mb-6 flex items-center justify-center gap-3">
            <ShopMonogram name={appointment.shop?.name || ""} size={44} />
            <div>
              <Link href={`/kapperszaak/${appointment.shop?.slug}`} className="font-heading text-lg font-bold transition-colors hover:text-gold">
                {appointment.shop?.name}
              </Link>
              {appointment.shop?.city && (
                <p className="flex items-center gap-1 text-xs text-white/30">
                  <MapPin className="h-3 w-3" />
                  {appointment.shop.city}
                </p>
              )}
            </div>
          </div>

          {/* ── Appointment Details Card ── */}
          <div className="confirm-reveal confirm-reveal-3 overflow-hidden rounded-2xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
            {/* Gold top accent */}
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg, transparent, #d4a853, transparent)" }} />

            <div className="p-5 sm:p-6">
              {/* Detail rows */}
              <div className="space-y-0">
                {/* Service */}
                <div className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.02]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/[0.07]">
                    <Scissors className="h-4 w-4 text-gold/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{appointment.service?.name}</p>
                    <p className="text-xs text-white/30">{appointment.service?.duration} min</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-gold">{appointment.service ? formatPrice(appointment.service.price) : ""}</span>
                </div>

                <div className="mx-3 h-px bg-white/[0.04]" />

                {/* Date */}
                <div className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.02]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/[0.07]">
                    <CalendarDays className="h-4 w-4 text-gold/70" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{formatDate(appointment.date)}</p>
                    <p className="text-xs text-white/30">Datum</p>
                  </div>
                </div>

                <div className="mx-3 h-px bg-white/[0.04]" />

                {/* Time */}
                <div className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.02]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/[0.07]">
                    <Clock className="h-4 w-4 text-gold/70" />
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-sm font-semibold">{appointment.startTime} <span className="text-white/20">—</span> {appointment.endTime}</p>
                    <p className="text-xs text-white/30">Tijdstip</p>
                  </div>
                </div>

                {appointment.barber && (
                  <>
                    <div className="mx-3 h-px bg-white/[0.04]" />

                    {/* Barber */}
                    <div className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.02]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/[0.07]">
                        <User className="h-4 w-4 text-gold/70" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{appointment.barber.name}</p>
                        <p className="text-xs text-white/30">Uw kapper</p>
                      </div>
                    </div>
                  </>
                )}

                {location && (
                  <>
                    <div className="mx-3 h-px bg-white/[0.04]" />

                    {/* Location */}
                    <div className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.02]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/[0.07]">
                        <MapPin className="h-4 w-4 text-gold/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{location}</p>
                        <p className="text-xs text-white/30">Locatie</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="confirm-reveal confirm-reveal-4 mt-6 space-y-2.5">
            {/* Primary: Google Calendar */}
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-gold px-5 py-3.5 text-sm font-bold text-background transition-all hover:shadow-[0_0_30px_-5px_rgba(212,168,83,0.4)] hover:-translate-y-0.5"
            >
              <CalendarPlus className="h-4 w-4" />
              Toevoegen aan agenda
              <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </a>

            {/* Secondary row */}
            <div className="flex gap-2.5">
              {location && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/60 transition-all hover:border-gold/20 hover:text-white/80 hover:bg-white/[0.04]"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Route
                </a>
              )}
              <Link
                href="/mijn-afspraken"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/60 transition-all hover:border-gold/20 hover:text-white/80 hover:bg-white/[0.04]"
              >
                Mijn afspraken
              </Link>
            </div>
          </div>

          {/* ── Footer note ── */}
          <div className="confirm-reveal confirm-reveal-5 mt-10 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/[0.04]" />
              <div className="h-0.5 w-0.5 rotate-45 bg-white/10" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/[0.04]" />
            </div>
            <p className="text-xs text-white/20 leading-relaxed">
              Een bevestiging is naar uw e-mailadres verzonden.<br />
              Wijzigen of annuleren kan tot 2 uur van tevoren.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
