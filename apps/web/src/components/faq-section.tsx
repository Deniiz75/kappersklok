"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Wat kost Kappersklok?",
    answer: "Kappersklok is beschikbaar vanaf €29 per maand. Er zijn geen verborgen kosten of langetermijncontracten. Je kunt op elk moment opzeggen.",
  },
  {
    question: "Hoe werkt het boeken voor klanten?",
    answer: "Klanten zoeken een kapper bij hun in de buurt, kiezen een datum en tijd, en boeken direct online. Geen account nodig — in minder dan 30 seconden geboekt.",
  },
  {
    question: "Kan ik mijn bestaande afspraken importeren?",
    answer: "Ja, je kunt eenvoudig je bestaande klantgegevens en afspraken overzetten naar Kappersklok. Ons team helpt je graag bij de migratie.",
  },
  {
    question: "Wat is de Digi-box?",
    answer: "De Digi-box is een uniek scherm dat je in je kapperszaak hangt. Klanten zien direct wie er aan de beurt is — geen discussies meer over de volgorde.",
  },
  {
    question: "Helpt Kappersklok tegen no-shows?",
    answer: "Ja! Klanten ontvangen automatische herinneringen via e-mail. Kappers die Kappersklok gebruiken rapporteren gemiddeld 70% minder no-shows.",
  },
  {
    question: "Is er een app beschikbaar?",
    answer: "De Kappersklok app voor iOS en Android is binnenkort beschikbaar. Klanten kunnen nu al via de mobiele website boeken.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="divide-y divide-border">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left"
            >
              <span className="text-base font-medium text-foreground pr-4">{faq.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === i ? "max-h-40 pb-5" : "max-h-0"
              }`}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
