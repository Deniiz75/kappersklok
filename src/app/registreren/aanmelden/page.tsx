"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HeroBanner } from "@/components/hero-banner";

export default function AanmeldenPage() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  if (done) {
    return (
      <>
        <HeroBanner title="Kapperszaak registreren" />
        <section className="py-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <span className="text-3xl">&#10003;</span>
            </div>
            <h2 className="mt-6 font-heading text-2xl font-bold">
              Registratie succesvol!
            </h2>
            <p className="mt-3 text-muted-foreground">
              Bedankt voor uw registratie, wij zullen zo spoedig mogelijk contact
              met u opnemen. Houd uw mailbox in de gaten!
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <HeroBanner title="Kapperszaak registreren" />
      <section className="py-16">
        <div className="mx-auto max-w-xl px-4">
          {/* Progress */}
          <div className="mb-8 flex items-center justify-center gap-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    step >= s
                      ? "bg-gold text-background"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div
                    className={`h-0.5 w-12 ${
                      step > 1 ? "bg-gold" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="mb-6 text-center">
              <span className="text-3xl font-bold text-gold">&euro;29</span>
              <span className="text-muted-foreground">/maand</span>
              <p className="mt-1 text-sm text-muted-foreground">
                + &euro;30 eenmalig
              </p>
            </div>

            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-4">
                <Field label="Taal">
                  <Select name="language">
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue placeholder="Kies taal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nl_NL">Nederlands</SelectItem>
                      <SelectItem value="en_US">English</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Uw naam">
                  <Input name="contact_name" placeholder="Voer uw naam in" required className="border-border bg-background" />
                </Field>
                <Field label="Bedrijfsnaam">
                  <Input name="shopname" placeholder="Voer bedrijfsnaam in" required className="border-border bg-background" />
                </Field>
                <Field label="KVK nummer">
                  <Input name="kvknumber" placeholder="Uw KVK nummer" className="border-border bg-background" />
                </Field>
                <Field label="Land">
                  <Select name="country">
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue placeholder="Kies land" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nederland">Nederland</SelectItem>
                      <SelectItem value="Belgie">België</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Straat">
                    <Input name="street" placeholder="Straatnaam" className="border-border bg-background" />
                  </Field>
                  <Field label="Huisnummer">
                    <Input name="house" placeholder="Nr." className="border-border bg-background" />
                  </Field>
                  <Field label="Stad">
                    <Input name="city" placeholder="Stad" className="border-border bg-background" />
                  </Field>
                  <Field label="Postcode">
                    <Input name="postal" placeholder="Postcode" className="border-border bg-background" />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Telefoon (bedrijf)">
                    <Input name="shopnumber" type="tel" placeholder="Telefoonnummer" className="border-border bg-background" />
                  </Field>
                  <Field label="Telefoon (privé)">
                    <Input name="private_phone" type="tel" placeholder="Privé nummer" className="border-border bg-background" />
                  </Field>
                </div>
                <Field label="E-mailadres">
                  <Input name="email" type="email" placeholder="E-mail" required className="border-border bg-background" />
                </Field>
                <Field label="Instagram">
                  <Input name="instagram" placeholder="@gebruikersnaam" className="border-border bg-background" />
                </Field>
                <Field label="Hoe heeft u ons gevonden?">
                  <Input name="how_find_us" className="border-border bg-background" />
                </Field>
                <Button type="submit" className="w-full bg-gold text-background hover:bg-gold-hover font-semibold">
                  Ga verder
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleStep2} className="space-y-4">
                <Field label="Digi-box">
                  <Select name="digibox">
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue placeholder="Selecteer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ja</SelectItem>
                      <SelectItem value="0">Nee</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Privé-domein">
                  <Select name="private_domain">
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue placeholder="Selecteer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ja</SelectItem>
                      <SelectItem value="0">Nee</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Aantal kappers">
                  <Select name="barbers">
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue placeholder="Selecteer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Welkomstpakket (flyers + raamsticker)">
                  <Select name="welcome">
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue placeholder="Selecteer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ja</SelectItem>
                      <SelectItem value="0">Nee</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <p className="text-xs text-muted-foreground">
                  Door te registreren ga ik akkoord met de{" "}
                  <a href="/voorwaarden" className="text-gold hover:underline">
                    algemene voorwaarden
                  </a>{" "}
                  en{" "}
                  <a href="/privacy" className="text-gold hover:underline">
                    privacy policy
                  </a>{" "}
                  van Kappersklok.
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-border"
                  >
                    Terug
                  </Button>
                  <Button type="submit" className="flex-1 bg-gold text-background hover:bg-gold-hover font-semibold">
                    Voltooi registratie
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
