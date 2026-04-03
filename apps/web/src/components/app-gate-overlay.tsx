"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppGateOverlayProps {
  shopName: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  onClose: () => void;
}

export function AppGateOverlay({ shopName, appStoreUrl, playStoreUrl, onClose }: AppGateOverlayProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/app-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Er ging iets mis");
      }
    } catch {
      setError("Er ging iets mis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
              <Smartphone className="h-7 w-7 text-foreground" />
            </div>

            <h2 className="text-xl font-bold text-foreground">
              Boek via de app
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Download de Kappersklok app om een afspraak te maken bij{" "}
              <span className="font-semibold text-foreground">{shopName}</span>
            </p>

            {/* Store buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              {appStoreUrl && (
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-white hover:bg-foreground/90 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  App Store
                </a>
              )}
              {playStoreUrl && (
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-white hover:bg-foreground/90 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                  Google Play
                </a>
              )}
            </div>

            {/* No links yet — coming soon */}
            {!appStoreUrl && !playStoreUrl && (
              <div className="mt-6 rounded-xl bg-muted p-4">
                <p className="text-sm font-medium text-foreground">Binnenkort beschikbaar</p>
                <p className="text-xs text-muted-foreground mt-1">De app wordt binnenkort gelanceerd</p>
              </div>
            )}

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">of</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email notify */}
            {submitted ? (
              <div className="flex items-center justify-center gap-2 text-[#2ECC71]">
                <CheckCircle className="h-5 w-5" />
                <p className="text-sm font-medium">We sturen je een bericht wanneer de app klaar is!</p>
              </div>
            ) : (
              <form onSubmit={handleNotify}>
                <p className="text-sm text-muted-foreground mb-3">
                  Ontvang een melding wanneer de app beschikbaar is
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="je@email.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-foreground transition-colors"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-foreground text-white hover:bg-foreground/90 rounded-xl px-5"
                  >
                    {loading ? "..." : "Meld aan"}
                  </Button>
                </div>
                {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
