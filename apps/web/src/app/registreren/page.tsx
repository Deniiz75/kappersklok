import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  RefreshCw,
  Monitor,
  Tablet,
  Globe,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { HeroBanner } from "@/components/hero-banner";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Registreren",
  description:
    "Registreer uw kapperszaak bij Kappersklok. Complete pakket vanaf €29 per maand. Onbeperkt afspraken, notificaties en meer.",
};

const features = [
  {
    icon: Bell,
    title: "Notificaties",
    description:
      "Ontvang notificaties wanneer er afspraken worden gemaakt. Klanten ontvangen herinneringen om no-shows te voorkomen.",
  },
  {
    icon: RefreshCw,
    title: "Vaste Afspraken",
    description:
      "Stel vaste afspraken in die iedere week of 2 weken automatisch herhaald worden.",
  },
  {
    icon: Monitor,
    title: "Digi-box",
    description:
      "Sluit onze Digi-box aan op uw tv en zie duidelijk wie er wanneer aan de beurt is.",
  },
  {
    icon: Tablet,
    title: "Self-desk",
    description:
      "Klanten plannen hun volgende afspraak via de touchscreen voordat ze de zaak verlaten.",
  },
  {
    icon: Globe,
    title: "Eigen Website",
    description:
      "Integreer Kappersklok in uw eigen website of gebruik een privé-domein (voorbeeld.kappersklok.nl).",
  },
  {
    icon: ShieldCheck,
    title: "Privacy",
    description:
      "Privacy wordt gerespecteerd, oude data wordt automatisch verwijderd. Optioneel maandelijks rapport.",
  },
];

const pricingFeatures = [
  "Onbeperkt aantal afspraken",
  "Onbeperkt aantal notificaties",
  "Vaste afspraken functionaliteit",
  "Integratie met eigen website",
  "Maandelijkse rapport functionaliteit",
  "Maandelijks opzegbaar",
];

export default function RegistrerenPage() {
  return (
    <>
      <HeroBanner title="Waarom Kappersklok?" subtitle="Laat het ons uitleggen" />

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <ButtonLink
              href="/registreren/aanmelden"
              size="lg"
              className="bg-gold text-background hover:bg-gold-hover font-semibold text-base px-8"
            >
              Start vandaag voor &euro;29
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-surface">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-gold" />
                  <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-lg px-4">
          <Card className="border-2 border-gold bg-background">
            <CardContent className="p-8">
              <h3 className="text-center font-heading text-2xl font-bold">
                Complete Pakket
              </h3>
              <div className="mt-4 text-center">
                <span className="text-4xl font-bold text-gold">&euro;29</span>
                <span className="text-muted-foreground">/maand</span>
              </div>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                + &euro;30 eenmalig
              </p>
              <ul className="mt-6 space-y-3">
                {pricingFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href="/registreren/aanmelden"
                className="mt-8 w-full bg-gold text-background hover:bg-gold-hover font-semibold"
              >
                Registreer uw zaak
                <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
            </CardContent>
          </Card>

          <div className="mt-8">
            <SectionHeading title="Betaling en voorwaarden" />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Er wordt maandelijks gefactureerd in de eerste drie dagen van iedere
              maand. De facturen kunnen per (internet)bankieren overgemaakt worden
              of digitaal betaald worden. Alle genoemde prijzen zijn exclusief btw.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
