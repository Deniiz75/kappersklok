"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { Scissors, Mail, Lock, ArrowRight } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size={48} className="mx-auto" />
          <h1 className="mt-4 font-heading text-2xl font-bold">
            Inloggen bij <span className="text-gold">Kappersklok</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Toegang tot uw kapperspaneel
          </p>
        </div>

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
            {urlError === "invalid" && (
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

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Bent u klant? Boekingen lopen via onze app —{" "}
          <a href="/" className="text-gold hover:underline">meer info</a>.
        </p>
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
