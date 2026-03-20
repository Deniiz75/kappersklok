"use client";

import type { Metadata } from "next";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HeroBanner } from "@/components/hero-banner";
import { SectionHeading } from "@/components/section-heading";

const faqItems = [
  {
    question: "Hoe kan ik mijn afspraak wijzigen en/of annuleren?",
    answer:
      "Bij het maken van de afspraak heeft u een bevestigingsmail ontvangen. In deze mail ziet u een knop om uw afspraak te wijzigen/annuleren. U kunt deze knop gebruiken tot 2 uur voor de afspraak. Als u de afspraak heeft gemaakt via de mobiele app kunt u de afspraak direct via de app wijzigen/annuleren.",
  },
  {
    question: "Ik wil mijn afspraak annuleren maar het is te laat, wat moet ik doen?",
    answer:
      "U zou contact op moeten nemen met uw kapper om netjes de reden door te geven van wijziging/annulering, de kapper kan de afspraak dan verwijderen. Hierna kunt u eventueel een nieuwe afspraak maken.",
  },
  {
    question: "Moet ik me registreren om een afspraak te maken?",
    answer: "U hoeft zich niet te registreren om een afspraak te maken.",
  },
  {
    question:
      "Moet ik per se mijn naam/telefoonnummer/e-mailadres invoeren bij het maken van een afspraak?",
    answer:
      "U dient uw juiste gegevens op te geven. Als de kappers contact willen/moeten opnemen zullen zij deze gegevens gebruiken. Als u foutieve gegevens invult kan uw kapper mogelijk de afspraak annuleren.",
  },
  {
    question: "Hoe weet de kapper dat ik een afspraak heb gemaakt?",
    answer:
      "De kappers werken met de agenda van Kappersklok. Wanneer u een afspraak maakt krijgen zij dit automatisch te zien in hun agenda.",
  },
  {
    question: "Hoe kan ik mijn eigen kapperszaak registreren?",
    answer:
      'Ga naar de pagina "Kapperszaak Registreren" via het menu bovenaan of bezoek de registratiepagina direct.',
  },
  {
    question: "Mijn IP-adres is geblokkeerd, wat moet ik doen?",
    answer:
      "Neem contact op met uw kapper en vraag of de blokkering opgeheven kan worden.",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <HeroBanner title="Contact" />

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <Accordion className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-sm hover:text-gold">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-xl px-4">
          <SectionHeading
            title="Verstuur ons een bericht"
            subtitle="Staat uw vraag er niet bij?"
          />

          {submitted ? (
            <div className="mt-8 rounded-lg border border-gold/30 bg-gold/5 p-6 text-center">
              <p className="font-semibold text-gold">Bericht verzonden!</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We nemen zo snel mogelijk contact met u op.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium">
                    Naam
                  </label>
                  <Input
                    id="name"
                    name="name"
                    required
                    className="border-border bg-background"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                    Telefoon
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="border-border bg-background"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  E-mailadres
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
                <label htmlFor="message" className="mb-1 block text-sm font-medium">
                  Bericht
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="border-border bg-background"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gold text-background hover:bg-gold-hover font-semibold"
              >
                Verstuur bericht
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Let op: u verstuurt hiermee een bericht naar Kappersklok en niet naar uw kapper.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
