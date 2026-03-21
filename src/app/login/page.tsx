"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { Scissors, User, Mail, Lock, ArrowRight, CalendarDays, Star, Clock } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "klant" ? "klant" : "kapper";
  const urlError = searchParams.get("error");
  const [tab, setTab] = useState<"kapper" | "klant">(initialTab);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size={48} className="mx-auto" />
          <h1 className="mt-4 font-heading text-2xl font-bold">
            Inloggen bij <span className="text-gold">Kappersklok</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kies hieronder hoe u wilt inloggen
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-xl border border-border bg-surface/50 p-1">
          <button
            onClick={() => setTab("kapper")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === "kapper"
                ? "bg-gold/10 text-gold shadow-sm border border-gold/30"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Scissors className="h-4 w-4" />
            Kappers
          </button>
          <button
            onClick={() => setTab("klant")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === "klant"
                ? "bg-gold/10 text-gold shadow-sm border border-gold/30"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <User className="h-4 w-4" />
            Klanten
          </button>
        </div>

        {/* Kapper login */}
        {tab === "kapper" && (
          <div className="rounded-2xl border border-border bg-surface/30 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
                <Scissors className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Kapperspaneel</h2>
                <p className="text-xs text-muted-foreground">Beheer uw zaak en afspraken</p>
              </div>
            </div>

            <form action="/api/login" method="POST" className="space-y-4">
              <div>
                <label htmlFor="kapper-email" className="mb-1 block text-xs font-medium text-muted-foreground">
                  E-mailadres
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="kapper-email"
                    name="email"
                    type="email"
                    required
                    placeholder="uw@email.nl"
                    className="border-border/50 bg-background/50 pl-10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="kapper-password" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Wachtwoord
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="kapper-password"
                    name="password"
                    type="password"
                    required
                    placeholder="Uw wachtwoord"
                    className="border-border/50 bg-background/50 pl-10"
                  />
                </div>
              </div>
              {urlError === "invalid" && tab === "kapper" && (
                <p className="text-sm text-destructive">Onjuist e-mailadres of wachtwoord.</p>
              )}
              <Button type="submit" className="w-full h-11 bg-gold text-background hover:bg-gold-hover font-semibold">
                Inloggen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Nog geen account?{" "}
              <a href="/registreren/aanmelden" className="text-gold hover:underline">Registreer uw zaak</a>
            </p>
          </div>
        )}

        {/* Klant login */}
        {tab === "klant" && (
          <div className="rounded-2xl border border-border bg-surface/30 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
                <User className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Mijn afspraken</h2>
                <p className="text-xs text-muted-foreground">Bekijk en beheer uw afspraken</p>
              </div>
            </div>

            <form action="/api/klant-login" method="POST" className="space-y-4">
              <div>
                <label htmlFor="klant-email" className="mb-1 block text-xs font-medium text-muted-foreground">
                  E-mailadres waarmee u heeft geboekt
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="klant-email"
                    name="email"
                    type="email"
                    required
                    placeholder="uw@email.nl"
                    className="border-border/50 bg-background/50 pl-10"
                  />
                </div>
              </div>
              {urlError === "notfound" && tab === "klant" && (
                <p className="text-sm text-destructive">Geen afspraken gevonden voor dit e-mailadres.</p>
              )}
              {urlError === "missing" && tab === "klant" && (
                <p className="text-sm text-destructive">Vul uw e-mailadres in.</p>
              )}
              <Button type="submit" className="w-full h-11 bg-gold text-background hover:bg-gold-hover font-semibold">
                Bekijk mijn afspraken
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-5 rounded-xl border border-border/30 bg-background/30 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Wat kunt u doen?</p>
              <div className="space-y-2">
                {[
                  { icon: CalendarDays, text: "Uw komende afspraken bekijken" },
                  { icon: Clock, text: "Afspraakgeschiedenis inzien" },
                  { icon: Star, text: "Reviews achterlaten" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <item.icon className="h-3.5 w-3.5 text-gold shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Geen account nodig — gebruik het e-mailadres van uw boeking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
