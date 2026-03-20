"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroBanner } from "@/components/hero-banner";

export default function LoginPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <HeroBanner title="Inloggen" />
      <section className="py-16">
        <div className="mx-auto max-w-sm px-4">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-center text-xl font-bold">Inloggen</h2>

            {submitted ? (
              <div className="mt-6 rounded-lg border border-gold/30 bg-gold/5 p-4 text-center">
                <p className="font-semibold text-gold">Binnenkort beschikbaar</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Het kapperspaneel wordt momenteel ontwikkeld. Neem contact met
                  ons op voor meer informatie.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium">
                    E-mail adres
                  </label>
                  <Input
                    id="email"
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
                    type="password"
                    required
                    className="border-border bg-background"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-muted-foreground">Blijf ingelogd</span>
                  </label>
                  <span className="text-muted-foreground">Wachtwoord vergeten?</span>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gold text-background hover:bg-gold-hover font-semibold"
                >
                  Log in
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
