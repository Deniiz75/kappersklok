"use client";

import { useState } from "react";
import { registerShop } from "@/lib/actions";
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

interface Step1Data {
  language: string;
  contactName: string;
  shopName: string;
  kvkNumber: string;
  country: string;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  phone: string;
  privatePhone: string;
  email: string;
  instagram: string;
  howFoundUs: string;
}

export default function AanmeldenPage() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  function handleStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value || "";
    setStep1Data({
      language: get("language"),
      contactName: get("contact_name"),
      shopName: get("shopname"),
      kvkNumber: get("kvknumber"),
      country: get("country"),
      street: get("street"),
      houseNumber: get("house"),
      city: get("city"),
      postalCode: get("postal"),
      phone: get("shopnumber"),
      privatePhone: get("private_phone"),
      email: get("email"),
      instagram: get("instagram"),
      howFoundUs: get("how_find_us"),
    });
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!step1Data) return;
    setStatus("loading");

    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value || "";

    const data = {
      ...step1Data,
      digibox: get("digibox") === "1",
      privateDomain: get("private_domain") === "1" ? "ja" : undefined,
      barbersCount: parseInt(get("barbers")) || 4,
      welcomePackage: get("welcome") === "1",
    };

    const result = await registerShop(data);
    if (result.success) {
      setStatus("success");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  if (status === "success") {
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
          <div className="mb-8 flex items-center justify-center gap-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    step >= s ? "bg-gold text-background" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div className={`h-0.5 w-12 ${step > 1 ? "bg-gold" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="mb-6 text-center">
              <span className="text-3xl font-bold text-gold">&euro;29</span>
              <span className="text-muted-foreground">/maand</span>
              <p className="mt-1 text-sm text-muted-foreground">+ &euro;30 eenmalig</p>
            </div>

            {status === "error" && (
              <p className="mb-4 text-sm text-destructive text-center">{error}</p>
            )}

            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-4">
                <Field label="Taal">
                  <Select name="language" defaultValue={step1Data?.language}>
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
                  <Input name="contact_name" placeholder="Voer uw naam in" required defaultValue={step1Data?.contactName} className="border-border bg-background" />
                </Field>
                <Field label="Bedrijfsnaam">
                  <Input name="shopname" placeholder="Voer bedrijfsnaam in" required defaultValue={step1Data?.shopName} className="border-border bg-background" />
                </Field>
                <Field label="KVK nummer">
                  <Input name="kvknumber" placeholder="Uw KVK nummer" defaultValue={step1Data?.kvkNumber} className="border-border bg-background" />
                </Field>
                <Field label="Land">
                  <Select name="country" defaultValue={step1Data?.country}>
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
                    <Input name="street" placeholder="Straatnaam" defaultValue={step1Data?.street} className="border-border bg-background" />
                  </Field>
                  <Field label="Huisnummer">
                    <Input name="house" placeholder="Nr." defaultValue={step1Data?.houseNumber} className="border-border bg-background" />
                  </Field>
                  <Field label="Stad">
                    <Input name="city" placeholder="Stad" defaultValue={step1Data?.city} className="border-border bg-background" />
                  </Field>
                  <Field label="Postcode">
                    <Input name="postal" placeholder="Postcode" defaultValue={step1Data?.postalCode} className="border-border bg-background" />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Telefoon (bedrijf)">
                    <Input name="shopnumber" type="tel" placeholder="Telefoonnummer" defaultValue={step1Data?.phone} className="border-border bg-background" />
                  </Field>
                  <Field label="Telefoon (privé)">
                    <Input name="private_phone" type="tel" placeholder="Privé nummer" defaultValue={step1Data?.privatePhone} className="border-border bg-background" />
                  </Field>
                </div>
                <Field label="E-mailadres">
                  <Input name="email" type="email" placeholder="E-mail" required defaultValue={step1Data?.email} className="border-border bg-background" />
                </Field>
                <Field label="Instagram">
                  <Input name="instagram" placeholder="@gebruikersnaam" defaultValue={step1Data?.instagram} className="border-border bg-background" />
                </Field>
                <Field label="Hoe heeft u ons gevonden?">
                  <Input name="how_find_us" defaultValue={step1Data?.howFoundUs} className="border-border bg-background" />
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
                    <SelectTrigger className="border-border bg-background"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ja</SelectItem>
                      <SelectItem value="0">Nee</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Privé-domein">
                  <Select name="private_domain">
                    <SelectTrigger className="border-border bg-background"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ja</SelectItem>
                      <SelectItem value="0">Nee</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Aantal kappers">
                  <Select name="barbers">
                    <SelectTrigger className="border-border bg-background"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
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
                    <SelectTrigger className="border-border bg-background"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ja</SelectItem>
                      <SelectItem value="0">Nee</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <p className="text-xs text-muted-foreground">
                  Door te registreren ga ik akkoord met de{" "}
                  <a href="/voorwaarden" className="text-gold hover:underline">algemene voorwaarden</a>{" "}
                  en <a href="/privacy" className="text-gold hover:underline">privacy policy</a> van Kappersklok.
                </p>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 border-border">
                    Terug
                  </Button>
                  <Button type="submit" disabled={status === "loading"} className="flex-1 bg-gold text-background hover:bg-gold-hover font-semibold">
                    {status === "loading" ? "Registreren..." : "Voltooi registratie"}
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
