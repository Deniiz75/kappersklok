"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cancelAppointment } from "@/lib/booking-actions";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/hero-banner";

export default function AnnulerenPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleCancel() {
    if (!token) return;
    setStatus("loading");
    const result = await cancelAppointment(token);
    if (result.success) {
      setStatus("success");
    } else {
      setError(result.error || "Er ging iets mis.");
      setStatus("error");
    }
  }

  if (!token) {
    return (
      <>
        <HeroBanner title="Afspraak annuleren" />
        <section className="py-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <p className="text-muted-foreground">Ongeldige link. Gebruik de link uit uw bevestigingsmail.</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <HeroBanner title="Afspraak annuleren" />
      <section className="py-16">
        <div className="mx-auto max-w-md px-4 text-center">
          {status === "success" ? (
            <div className="rounded-lg border border-gold/30 bg-gold/5 p-6">
              <p className="font-heading text-lg font-bold">Afspraak geannuleerd</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Uw afspraak is succesvol geannuleerd. U kunt altijd een nieuwe afspraak maken.
              </p>
            </div>
          ) : status === "error" ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
              <p className="font-heading text-lg font-bold text-destructive">Niet gelukt</p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-6">
              <p className="font-heading text-lg font-bold">Weet u het zeker?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                U staat op het punt uw afspraak te annuleren. Dit kan niet ongedaan worden gemaakt.
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button variant="outline" className="border-border" onClick={() => window.history.back()}>
                  Terug
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={status === "loading"}
                  className="bg-destructive/80 text-foreground hover:bg-destructive"
                >
                  {status === "loading" ? "Annuleren..." : "Ja, annuleer afspraak"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
