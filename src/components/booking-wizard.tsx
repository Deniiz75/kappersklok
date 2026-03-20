"use client";

import { useState } from "react";
import { createAppointment } from "@/lib/booking-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShopMonogram } from "@/components/shop-monogram";
import { Check, CalendarDays, User, Scissors, Clock } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface BarberItem {
  id: string;
  name: string;
}

interface BusinessHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

interface BookingWizardProps {
  shopId: string;
  shopName: string;
  services: Service[];
  barbers: BarberItem[];
  businessHours: BusinessHour[];
}

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

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
    current += 15; // 15 min intervals
  }
  return slots;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function BookingWizard({ shopId, shopName, services, barbers, businessHours }: BookingWizardProps) {
  const [step, setStep] = useState(0); // 0=closed, 1=service, 2=barber, 3=datetime, 4=details, 5=done
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [appointmentId, setAppointmentId] = useState("");

  const selectedService = services.find((s) => s.id === serviceId);

  // Generate next 14 days
  const dates: { value: string; label: string; dayOfWeek: number }[] = [];
  const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const hours = businessHours.find((h) => h.dayOfWeek === dow);
    if (hours && !hours.closed) {
      dates.push({
        value: d.toISOString().split("T")[0],
        label: `${dayNames[dow]} ${d.getDate()}/${d.getMonth() + 1}`,
        dayOfWeek: dow,
      });
    }
  }

  const selectedDate = dates.find((d) => d.value === date);
  const hours = selectedDate ? businessHours.find((h) => h.dayOfWeek === selectedDate.dayOfWeek) : null;
  const timeSlots = hours && selectedService
    ? generateTimeSlots(hours.openTime, hours.closeTime, selectedService.duration)
    : [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedService) return;
    setStatus("loading");

    const form = e.currentTarget;
    const result = await createAppointment({
      shopId,
      barberId,
      serviceId,
      date,
      startTime: time,
      endTime: addMinutes(time, selectedService.duration),
      customerName: (form.elements.namedItem("name") as HTMLInputElement).value,
      customerEmail: (form.elements.namedItem("email") as HTMLInputElement).value,
      customerPhone: (form.elements.namedItem("phone") as HTMLInputElement).value || undefined,
      notes: (form.elements.namedItem("notes") as HTMLInputElement).value || undefined,
    });

    if (result.success) {
      setAppointmentId(result.appointmentId);
      setStep(5);
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  if (step === 0) {
    return (
      <Button
        onClick={() => setStep(1)}
        className="w-full bg-gold text-background hover:bg-gold-hover font-semibold"
      >
        <CalendarDays className="mr-2 h-4 w-4" />
        Afspraak maken
      </Button>
    );
  }

  if (step === 5) {
    return (
      <div className="rounded-lg border border-gold/30 bg-gold/5 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
          <Check className="h-6 w-6 text-gold" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold">Afspraak geboekt!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Uw afspraak bij {shopName} is bevestigd.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {selectedService?.name} — {date} om {time}
        </p>
        <Button
          onClick={() => { setStep(0); setServiceId(""); setBarberId(""); setDate(""); setTime(""); setStatus("idle"); }}
          variant="outline"
          className="mt-4 border-border"
        >
          Nieuwe afspraak
        </Button>
      </div>
    );
  }

  const stepLabels = ["Dienst", "Kapper", "Datum & Tijd", "Gegevens"];

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      {/* Progress */}
      <div className="mb-5 flex items-center justify-between">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step > i ? "bg-gold text-background" : step === i + 1 ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">{label}</span>
            {i < 3 && <div className={`mx-1 h-px w-4 sm:w-8 ${step > i + 1 ? "bg-gold" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Service */}
      {step === 1 && (
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Scissors className="h-4 w-4 text-gold" /> Kies een dienst</h3>
          <div className="mt-3 space-y-2">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => { setServiceId(svc.id); setStep(2); }}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-gold/40"
              >
                <div>
                  <p className="text-sm font-medium">{svc.name}</p>
                  <p className="text-xs text-muted-foreground">{svc.duration} min</p>
                </div>
                <span className="text-sm font-semibold text-gold">{formatPrice(svc.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Barber */}
      {step === 2 && (
        <div>
          <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-gold" /> Kies een kapper</h3>
          <div className="mt-3 grid gap-2 grid-cols-2">
            {barbers.map((b) => (
              <button
                key={b.id}
                onClick={() => { setBarberId(b.id); setStep(3); }}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-4 transition-colors hover:border-gold/40"
              >
                <ShopMonogram name={b.name} size={40} />
                <span className="text-sm font-medium">{b.name}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="mt-3 text-xs text-muted-foreground hover:text-gold">← Terug</button>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div>
          <h3 className="font-semibold flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" /> Kies datum & tijd</h3>

          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Datum</p>
            <div className="flex flex-wrap gap-2">
              {dates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => { setDate(d.value); setTime(""); }}
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
                    onClick={() => { setTime(t); setStep(4); }}
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
          <button onClick={() => setStep(2)} className="mt-3 text-xs text-muted-foreground hover:text-gold">← Terug</button>
        </div>
      )}

      {/* Step 4: Customer details */}
      {step === 4 && (
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> Uw gegevens</h3>
          <div className="mt-2 rounded-lg bg-gold/5 border border-gold/20 p-3 text-xs">
            <p><span className="text-muted-foreground">Dienst:</span> {selectedService?.name} ({selectedService?.duration} min)</p>
            <p><span className="text-muted-foreground">Kapper:</span> {barbers.find((b) => b.id === barberId)?.name}</p>
            <p><span className="text-muted-foreground">Datum:</span> {date} om {time}</p>
            <p><span className="text-muted-foreground">Prijs:</span> {selectedService ? formatPrice(selectedService.price) : ""}</p>
          </div>

          {status === "error" && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Naam *</label>
              <Input name="name" required placeholder="Uw naam" className="border-border bg-background text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">E-mail *</label>
              <Input name="email" type="email" required placeholder="E-mail" className="border-border bg-background text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Telefoon</label>
              <Input name="phone" type="tel" placeholder="Optioneel" className="border-border bg-background text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Opmerking</label>
              <Input name="notes" placeholder="Optioneel" className="border-border bg-background text-sm" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1 border-border text-sm">
                Terug
              </Button>
              <Button type="submit" disabled={status === "loading"} className="flex-1 bg-gold text-background hover:bg-gold-hover font-semibold text-sm">
                {status === "loading" ? "Boeken..." : "Bevestig afspraak"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
