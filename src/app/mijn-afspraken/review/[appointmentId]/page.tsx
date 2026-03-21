"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAppointmentForReschedule } from "@/lib/booking-actions";
import { submitReview } from "@/lib/review-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, Check, MapPin, Scissors, CalendarDays } from "lucide-react";

const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const dayNamesFull = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

interface AppointmentData {
  id: string;
  date: string;
  startTime: string;
  shopId: string;
  customerEmail: string;
  shop: { name: string; slug: string } | null;
  barber: { name: string } | null;
  service: { name: string; duration: number; price: number } | null;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    async function load() {
      const apt = await getAppointmentForReschedule(appointmentId);
      if (!apt) {
        setLoading(false);
        return;
      }
      setAppointment(apt as unknown as AppointmentData);

      // Get customer name from profiel API
      const res = await fetch("/api/klant-profiel");
      if (res.ok) {
        const data = await res.json();
        setCustomerName(data.email.split("@")[0]);
      }
      setLoading(false);
    }
    load();
  }, [appointmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appointment) return;
    setStatus("loading");

    const result = await submitReview({
      shopId: appointment.shopId,
      customerName: customerName || "Klant",
      customerEmail: appointment.customerEmail,
      rating,
      comment: comment || undefined,
      appointmentId,
    });

    if (result.success) {
      setStatus("success");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-20 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 text-center">
        <p className="text-muted-foreground">Afspraak niet gevonden.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
            <Check className="h-6 w-6 text-gold" />
          </div>
          <h3 className="mt-4 font-heading text-lg font-bold">Bedankt voor uw review!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Uw beoordeling voor {appointment.shop?.name} is ontvangen.
          </p>
          <Button
            onClick={() => router.push("/mijn-afspraken")}
            className="mt-4 bg-gold text-background hover:bg-gold-hover font-semibold"
          >
            Naar mijn afspraken
          </Button>
        </div>
      </div>
    );
  }

  const d = new Date(appointment.date);
  const dateStr = `${dayNamesFull[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Terug
      </button>

      <h1 className="font-heading text-lg font-bold mb-4">Review achterlaten</h1>

      {/* Appointment info */}
      <div className="rounded-lg border border-border bg-surface p-4 mb-6">
        <p className="text-sm font-semibold">{appointment.service?.name}</p>
        <div className="mt-1.5 space-y-1">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {appointment.shop?.name}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Scissors className="h-3 w-3" /> {appointment.barber?.name}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" /> {dateStr} om {appointment.startTime}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">Hoe was uw ervaring?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoverRating || rating) ? "fill-gold text-gold" : "text-muted"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Uw review (optioneel)</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Vertel over uw ervaring..."
            rows={4}
            className="border-border bg-surface text-sm"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-gold text-background hover:bg-gold-hover font-semibold"
        >
          {status === "loading" ? "Verzenden..." : "Verstuur review"}
        </Button>
      </form>
    </div>
  );
}
