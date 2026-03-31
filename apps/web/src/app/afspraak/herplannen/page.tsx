"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAppointmentForReschedule, rescheduleAppointment } from "@/lib/booking-actions";
import { getShopBusinessHours, getShopBarbers } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/hero-banner";
import { CalendarDays, Clock, ArrowLeft, Check, MapPin, Scissors } from "lucide-react";

function generateTimeSlots(open: string, close: string, duration: number): string[] {
  const slots: string[] = [];
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  let current = oh * 60 + om;
  const end = ch * 60 + cm;

  while (current + duration <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += 15;
  }
  return slots;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

interface AppointmentData {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  shopId: string;
  barberId: string;
  serviceId: string;
  customerEmail: string;
  status: string;
  shop: { name: string; slug: string } | null;
  barber: { name: string } | null;
  service: { name: string; duration: number; price: number } | null;
}

interface BusinessHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const dayNamesFull = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

export default function HerplannenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get("id");

  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!appointmentId) return;
    async function load() {
      const apt = await getAppointmentForReschedule(appointmentId!);
      if (!apt || apt.status !== "CONFIRMED") {
        setLoading(false);
        return;
      }
      setAppointment(apt as unknown as AppointmentData);
      const hours = await getShopBusinessHours(apt.shopId);
      setBusinessHours(hours as BusinessHour[]);
      setLoading(false);
    }
    load();
  }, [appointmentId]);

  if (!appointmentId) {
    return (
      <>
        <HeroBanner title="Afspraak herplannen" />
        <section className="py-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <p className="text-muted-foreground">Ongeldige link.</p>
          </div>
        </section>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <HeroBanner title="Afspraak herplannen" />
        <section className="py-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="animate-pulse space-y-3">
              <div className="mx-auto h-4 w-48 rounded bg-muted" />
              <div className="mx-auto h-4 w-32 rounded bg-muted" />
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!appointment) {
    return (
      <>
        <HeroBanner title="Afspraak herplannen" />
        <section className="py-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <p className="text-muted-foreground">Afspraak niet gevonden of al geannuleerd.</p>
          </div>
        </section>
      </>
    );
  }

  // Generate next 14 days (only open days)
  const dates: { value: string; label: string; dayOfWeek: number }[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const hours = businessHours.find((h) => h.dayOfWeek === dow);
    if (hours && !hours.closed) {
      dates.push({
        value: d.toISOString().split("T")[0],
        label: `${dayNames[dow]} ${d.getDate()} ${monthNames[d.getMonth()]}`,
        dayOfWeek: dow,
      });
    }
  }

  const selectedDate = dates.find((d) => d.value === date);
  const hours = selectedDate ? businessHours.find((h) => h.dayOfWeek === selectedDate.dayOfWeek) : null;
  const duration = appointment.service?.duration || 30;
  const timeSlots = hours ? generateTimeSlots(hours.openTime, hours.closeTime, duration) : [];

  async function handleReschedule() {
    if (!date || !time) return;
    setStatus("loading");
    const result = await rescheduleAppointment({
      appointmentId: appointment!.id,
      date,
      startTime: time,
      endTime: addMinutes(time, duration),
    });
    if (result.success) {
      setStatus("success");
    } else {
      setError(result.error || "Er ging iets mis.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <>
        <HeroBanner title="Afspraak herplannen" />
        <section className="py-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="rounded-lg border border-gold/30 bg-gold/5 p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                <Check className="h-6 w-6 text-gold" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold">Afspraak verplaatst!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Uw afspraak bij {appointment.shop?.name} is verplaatst naar:
              </p>
              <p className="mt-1 text-sm font-semibold">
                {(() => {
                  const d = new Date(date);
                  return `${dayNamesFull[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;
                })()} om {time}
              </p>
              <Button
                onClick={() => router.push("/mijn-afspraken")}
                className="mt-4 bg-gold text-background hover:bg-gold-hover font-semibold"
              >
                Naar mijn afspraken
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  const currentDate = new Date(appointment.date);
  const currentFormatted = `${dayNamesFull[currentDate.getDay()]} ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;

  return (
    <>
      <HeroBanner title="Afspraak herplannen" />
      <section className="py-8">
        <div className="mx-auto max-w-lg px-4">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Terug
          </button>

          {/* Current appointment info */}
          <div className="rounded-lg border border-border bg-surface p-4 mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Huidige afspraak</p>
            <p className="text-sm font-semibold">{appointment.service?.name}</p>
            <div className="mt-1.5 space-y-1">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {appointment.shop?.name}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Scissors className="h-3 w-3" /> {appointment.barber?.name}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" /> {currentFormatted} om {appointment.startTime}
              </p>
            </div>
          </div>

          {/* New date & time selection */}
          <div className="rounded-lg border border-gold/20 bg-surface p-5">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-gold" /> Kies nieuwe datum & tijd
            </h3>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Datum</p>
              <div className="flex flex-wrap gap-2">
                {dates.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => { setDate(d.value); setTime(""); setStatus("idle"); setError(""); }}
                    className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                      date === d.value ? "border-gold bg-gold/10 text-gold" : "border-border bg-background hover:border-gold/30"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {date && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Tijd</p>
                <div className="flex flex-wrap gap-1.5">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTime(t); setStatus("idle"); setError(""); }}
                      className={`rounded border px-2 py-1 text-xs font-mono transition-colors ${
                        time === t ? "border-gold bg-gold/10 text-gold" : "border-border bg-background hover:border-gold/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {status === "error" && (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            )}

            {date && time && (
              <div className="mt-5 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-border text-sm"
                >
                  Annuleer
                </Button>
                <Button
                  onClick={handleReschedule}
                  disabled={status === "loading"}
                  className="flex-1 bg-gold text-background hover:bg-gold-hover font-semibold text-sm"
                >
                  {status === "loading" ? "Verplaatsen..." : "Bevestig nieuwe tijd"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
