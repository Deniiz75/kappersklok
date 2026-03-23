"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { Wordmark } from "@/components/wordmark";
import { CreditCard, ArrowRight, Loader2, LogOut } from "lucide-react";

export function PaymentGate({ shopId, shopName }: { shopId: string; shopName: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId, shopName }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || "Er ging iets mis.");
        setLoading(false);
      }
    } catch {
      setError("Er ging iets mis. Probeer het later opnieuw.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo size={32} />
          <Wordmark size="sm" />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 mb-6">
            <CreditCard className="h-7 w-7 text-gold" />
          </div>

          <h1 className="font-heading text-2xl font-bold">
            Activeer <span className="text-gold">{shopName}</span>
          </h1>

          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Betaal eenmalig om uw kapperszaak te activeren op Kappersklok.
            Na betaling kunt u direct aan de slag.
          </p>

          <div className="mt-6 rounded-xl bg-gold/5 border border-gold/20 p-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-heading text-3xl font-bold text-gold">&euro;59</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              &euro;30 eenmalig + &euro;29 eerste maand (excl. btw)
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 font-semibold text-background transition-colors hover:bg-gold-hover disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Betaal &amp; activeer
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-muted-foreground/50">
            <span>iDEAL</span>
            <span>&bull;</span>
            <span>Bancontact</span>
            <span>&bull;</span>
            <span>Creditcard</span>
          </div>
        </div>

        <form action="/api/logout" method="POST" className="mt-6">
          <button type="submit" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-3 w-3" />
            Uitloggen
          </button>
        </form>
      </div>
    </div>
  );
}
