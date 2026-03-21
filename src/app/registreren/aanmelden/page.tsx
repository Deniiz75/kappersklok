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
import { Logo } from "@/components/logo";
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Lock,
  Instagram,
  HelpCircle,
  Monitor,
  Globe,
  Users,
  Gift,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";

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
  password: string;
  instagram: string;
  howFoundUs: string;
}

const stepInfo = [
  { num: 1, title: "Bedrijfsgegevens", desc: "Uw zaak en contactinformatie" },
  { num: 2, title: "Uw pakket", desc: "Kies uw opties en extras" },
];

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
      password: get("password"),
      instagram: get("instagram"),
      howFoundUs: get("how_find_us"),
    });
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative mx-auto mb-8">
            <div className="absolute inset-0 mx-auto h-24 w-24 rounded-full bg-gold/20 blur-xl" />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/10">
              <Check className="h-8 w-8 text-gold" strokeWidth={3} />
            </div>
          </div>
          <h1 className="font-heading text-3xl font-bold">
            Welkom bij <span className="text-gold">Kappersklok</span>
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Uw kapperszaak is succesvol geregistreerd. Wij nemen zo spoedig
            mogelijk contact met u op om alles in te richten.
          </p>
          <div className="mt-8 rounded-xl border border-gold/20 bg-gold/5 p-4">
            <p className="text-sm text-gold font-medium">Wat gebeurt er nu?</p>
            <div className="mt-3 space-y-2 text-left">
              {["Wij controleren uw gegevens", "U ontvangt een bevestigingsmail", "Uw zaak wordt geactiveerd"].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/10 text-[10px] font-bold text-gold">{i + 1}</div>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <a href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm text-gold hover:underline">
            Ga naar uw dashboard <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border bg-surface/50 py-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <Logo size={44} className="mx-auto" />
          <h1 className="mt-4 font-heading text-2xl font-bold md:text-3xl">
            Registreer uw kapperszaak
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Binnen enkele minuten online afspraken ontvangen
          </p>

          {/* Progress bar */}
          <div className="mx-auto mt-8 max-w-xs">
            <div className="flex items-center justify-between">
              {stepInfo.map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                        step > s.num
                          ? "bg-gold text-background"
                          : step === s.num
                            ? "bg-gold/20 text-gold ring-2 ring-gold/50"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                    </div>
                    <span className={`mt-1.5 text-[10px] font-medium ${step >= s.num ? "text-gold" : "text-muted-foreground"}`}>
                      {s.title}
                    </span>
                  </div>
                  {i < stepInfo.length - 1 && (
                    <div className={`mx-3 mb-5 h-0.5 w-16 rounded transition-colors duration-300 ${step > 1 ? "bg-gold" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-lg px-4">
          {/* Pricing badge */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-3xl font-bold text-gold">&euro;29</span>
              <span className="text-sm text-muted-foreground">/maand</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-xs text-muted-foreground">
              + &euro;30 eenmalig<br />
              <span className="text-gold">Maandelijks opzegbaar</span>
            </div>
          </div>

          {status === "error" && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-6">
              {/* Section: Taal */}
              <FormSection icon={<Globe className="h-4 w-4" />} title="Taal">
                <Select name="language" defaultValue={step1Data?.language}>
                  <SelectTrigger className="border-border/50 bg-background/50">
                    <SelectValue placeholder="Kies uw taal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nl_NL">Nederlands</SelectItem>
                    <SelectItem value="en_US">English</SelectItem>
                  </SelectContent>
                </Select>
              </FormSection>

              {/* Section: Persoonlijk */}
              <FormSection icon={<User className="h-4 w-4" />} title="Uw gegevens">
                <Field label="Volledige naam">
                  <Input name="contact_name" placeholder="Jan de Vries" required defaultValue={step1Data?.contactName} className="border-border/50 bg-background/50" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="E-mailadres">
                    <Input name="email" type="email" placeholder="jan@kapper.nl" required defaultValue={step1Data?.email} className="border-border/50 bg-background/50" />
                  </Field>
                  <Field label="Wachtwoord">
                    <Input name="password" type="password" placeholder="Min. 6 tekens" required minLength={6} className="border-border/50 bg-background/50" />
                  </Field>
                </div>
              </FormSection>

              {/* Section: Bedrijf */}
              <FormSection icon={<Building2 className="h-4 w-4" />} title="Bedrijfsinformatie">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Bedrijfsnaam">
                    <Input name="shopname" placeholder="Kapsalon Royal" required defaultValue={step1Data?.shopName} className="border-border/50 bg-background/50" />
                  </Field>
                  <Field label="KVK nummer">
                    <Input name="kvknumber" placeholder="12345678" defaultValue={step1Data?.kvkNumber} className="border-border/50 bg-background/50" />
                  </Field>
                </div>
                <Select name="country" defaultValue={step1Data?.country}>
                  <SelectTrigger className="border-border/50 bg-background/50">
                    <SelectValue placeholder="Kies land" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nederland">Nederland</SelectItem>
                    <SelectItem value="Belgie">België</SelectItem>
                  </SelectContent>
                </Select>
              </FormSection>

              {/* Section: Adres */}
              <FormSection icon={<MapPin className="h-4 w-4" />} title="Adres">
                <div className="grid gap-3 grid-cols-3">
                  <div className="col-span-2">
                    <Field label="Straat">
                      <Input name="street" placeholder="Hoofdstraat" defaultValue={step1Data?.street} className="border-border/50 bg-background/50" />
                    </Field>
                  </div>
                  <Field label="Nr.">
                    <Input name="house" placeholder="42" defaultValue={step1Data?.houseNumber} className="border-border/50 bg-background/50" />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Postcode">
                    <Input name="postal" placeholder="1234 AB" defaultValue={step1Data?.postalCode} className="border-border/50 bg-background/50" />
                  </Field>
                  <Field label="Stad">
                    <Input name="city" placeholder="Amsterdam" defaultValue={step1Data?.city} className="border-border/50 bg-background/50" />
                  </Field>
                </div>
              </FormSection>

              {/* Section: Contact */}
              <FormSection icon={<Phone className="h-4 w-4" />} title="Telefoonnummers">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Bedrijfsnummer">
                    <Input name="shopnumber" type="tel" placeholder="020-1234567" defaultValue={step1Data?.phone} className="border-border/50 bg-background/50" />
                  </Field>
                  <Field label="Privénummer">
                    <Input name="private_phone" type="tel" placeholder="06-12345678" defaultValue={step1Data?.privatePhone} className="border-border/50 bg-background/50" />
                  </Field>
                </div>
              </FormSection>

              {/* Section: Extra */}
              <FormSection icon={<Instagram className="h-4 w-4" />} title="Extra (optioneel)">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Instagram">
                    <Input name="instagram" placeholder="@uwkapper" defaultValue={step1Data?.instagram} className="border-border/50 bg-background/50" />
                  </Field>
                  <Field label="Hoe gevonden?">
                    <Input name="how_find_us" placeholder="Google, vriend..." defaultValue={step1Data?.howFoundUs} className="border-border/50 bg-background/50" />
                  </Field>
                </div>
              </FormSection>

              <Button type="submit" className="w-full h-11 bg-gold text-background hover:bg-gold-hover font-semibold text-sm">
                Ga verder naar pakketkeuze
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-6">
              <FormSection icon={<Sparkles className="h-4 w-4" />} title="Kies uw opties">
                <OptionCard
                  icon={<Monitor className="h-5 w-5" />}
                  title="Digi-box"
                  description="TV-scherm in uw zaak met wachtrijinformatie"
                  name="digibox"
                />
                <OptionCard
                  icon={<Globe className="h-5 w-5" />}
                  title="Privé-domein"
                  description="Uw eigen URL: uwzaak.kappersklok.nl"
                  name="private_domain"
                />
                <OptionCard
                  icon={<Gift className="h-5 w-5" />}
                  title="Welkomstpakket"
                  description="Flyers en raamsticker voor uw kapperszaak"
                  name="welcome"
                />
              </FormSection>

              <FormSection icon={<Users className="h-4 w-4" />} title="Aantal kappers">
                <Select name="barbers" defaultValue="4">
                  <SelectTrigger className="border-border/50 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 kappers (standaard)</SelectItem>
                    <SelectItem value="6">6 kappers</SelectItem>
                    <SelectItem value="8">8 kappers</SelectItem>
                    <SelectItem value="10">10 kappers</SelectItem>
                  </SelectContent>
                </Select>
              </FormSection>

              {/* Summary */}
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                <p className="text-xs font-medium text-gold uppercase tracking-wider">Samenvatting</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Bedrijf</span>
                    <span className="text-foreground font-medium">{step1Data?.shopName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact</span>
                    <span className="text-foreground">{step1Data?.contactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>E-mail</span>
                    <span className="text-foreground">{step1Data?.email}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gold/10 flex justify-between font-medium">
                    <span>Maandelijks</span>
                    <span className="text-gold">&euro;29,00</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Door te registreren gaat u akkoord met de{" "}
                <a href="/voorwaarden" className="text-gold hover:underline">algemene voorwaarden</a>{" "}
                en <a href="/privacy" className="text-gold hover:underline">privacy policy</a>.
              </p>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex-1 h-11 border-border/50">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Terug
                </Button>
                <Button type="submit" disabled={status === "loading"} className="flex-1 h-11 bg-gold text-background hover:bg-gold-hover font-semibold">
                  {status === "loading" ? "Registreren..." : "Voltooi registratie"}
                  {status !== "loading" && <Check className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function FormSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/40 bg-surface/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/10 text-gold">
          {icon}
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function OptionCard({ icon, title, description, name }: { icon: React.ReactNode; title: string; description: string; name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/30 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Select name={name} defaultValue="0">
        <SelectTrigger className="w-20 border-border/50 bg-background/50 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Ja</SelectItem>
          <SelectItem value="0">Nee</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
