"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroBanner } from "@/components/hero-banner";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-center text-xl font-bold">Inloggen</h2>

      {/* Direct HTML form POST — no JavaScript needed */}
      <form action="/api/login" method="POST" className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            E-mail adres
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="border-border bg-background"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Wachtwoord
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="border-border bg-background"
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">
            Onjuist e-mailadres of wachtwoord.
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-gold text-background hover:bg-gold-hover font-semibold"
        >
          Log in
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <HeroBanner title="Inloggen" />
      <section className="py-16">
        <div className="mx-auto max-w-sm px-4">
          <Suspense fallback={<div className="rounded-lg border border-border bg-surface p-6 text-center text-muted-foreground">Laden...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
