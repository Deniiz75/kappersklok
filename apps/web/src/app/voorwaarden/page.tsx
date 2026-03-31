import type { Metadata } from "next";
import { HeroBanner } from "@/components/hero-banner";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden",
  description: "Algemene voorwaarden van Kappersklok. Lees de voorwaarden voor het gebruik van onze diensten.",
};

const articles = [
  {
    title: "Artikel 1 — Definities",
    paragraphs: [
      "In deze Algemene Voorwaarden worden de hiernavolgende termen in de navolgende betekenis gebruikt, tenzij uitdrukkelijk anders is aangegeven.",
      "Kappersklok: Een online platform waarop Kappers zich kunnen laten inschrijven en waar Gebruikers een afspraak kunnen boeken bij een Kapper naar keuze. Kappersklok fungeert als tussenpersoon en brengt hierdoor aanbod en vraag bij elkaar.",
      "Overeenkomst: Iedere Overeenkomst gesloten tussen Kappersklok en de Gebruiker, gericht op dienstverlening.",
      "Gebruiker: De natuurlijke persoon die gebruik maakt van de Website voor het boeken van een Afspraak.",
      "Kapper: De natuurlijke persoon of rechtspersoon die gebruik maakt van de Website voor het verkopen van zijn/haar diensten.",
      "Website: Het platform van Kappersklok waarop aanbod en vraag bij elkaar wordt gebracht, inclusief de mobiele applicatie.",
    ],
  },
  {
    title: "Artikel 2 — Toepasselijkheid",
    paragraphs: [
      "Deze Algemene Voorwaarden zijn van toepassing op iedere aanbieding van Kappersklok, iedere Overeenkomst tussen Kappersklok en een Kapper en op het gebruik van de Website door een Gebruiker.",
      "Afwijkingen van deze Algemene Voorwaarden zijn slechts geldig indien deze schriftelijk en uitdrukkelijk zijn overeengekomen.",
    ],
  },
  {
    title: "Artikel 3 — Aanbod van de Kapper",
    paragraphs: [
      "Het Aanbod van de Kapper(s) wordt door Kappersklok gepubliceerd op de Website, op basis van de door de Kapper aangeleverde informatie. Kappersklok is niet aansprakelijk voor de inhoud en geldigheid van het Aanbod.",
      "Kappersklok is slechts de tussenpersoon bij de totstandkoming van de Overeenkomst tussen de Gebruiker en de Kapper.",
    ],
  },
  {
    title: "Artikel 4 — Totstandkoming overeenkomst",
    paragraphs: [
      "De overeenkomst komt tot stand op het moment dat Gebruiker de Afspraak definitief maakt.",
      "Kappersklok zal een elektronische bevestiging versturen aan de Gebruiker.",
    ],
  },
  {
    title: "Artikel 5 — Annulering of wijziging",
    paragraphs: [
      "Een Gebruiker kan de Afspraak tot 24 uur voor aanvang annuleren, tenzij anders overeengekomen.",
      "De Kapper heeft het recht om de Afspraak te annuleren indien de Gebruiker onjuiste gegevens heeft verstrekt.",
    ],
  },
  {
    title: "Artikel 6 — Betaling",
    paragraphs: [
      "De Gebruiker is verplicht om de Kapper te betalen voor de Afspraak, conform de gekozen diensten.",
      "Kappersklok is geautoriseerd om namens de Kapper de betaling in ontvangst te nemen.",
    ],
  },
  {
    title: "Artikel 7 — Gebruik van de Website",
    paragraphs: [
      "De Gebruiker heeft een zelfstandige verantwoordelijkheid voor het gebruik van de Website.",
      "Het is verboden om de inhoud van de Website te kopiëren zonder toestemming van Kappersklok.",
      "Kappersklok is niet aansprakelijk voor schade door onjuiste of onvolledige gegevens van de Gebruiker.",
    ],
  },
  {
    title: "Artikel 8 — Beschikbaarheid Website",
    paragraphs: [
      "Kappersklok spant zich in om de Website ononderbroken aan te bieden, doch staat niet in voor volledige beschikbaarheid.",
      "Kappersklok is niet verantwoordelijk voor de levering van kappersdiensten door de Kappers.",
    ],
  },
  {
    title: "Artikel 9 — Notice and Takedown",
    paragraphs: [
      "Bij (mogelijke) strafbare handelingen is Kappersklok gerechtigd aangifte te doen en gegevens aan bevoegde instanties te overhandigen.",
    ],
  },
  {
    title: "Artikel 10 — Beperking aansprakelijkheid",
    paragraphs: [
      "Kappersklok is niet aansprakelijk bij overmacht. Indien aansprakelijk, is deze beperkt tot maximaal €250.",
    ],
  },
  {
    title: "Artikel 11 — Vrijwaring en verjaringstermijn",
    paragraphs: [
      "De Gebruiker vrijwaart Kappersklok voor aanspraken van derden. Aanspraken vervallen na een half jaar.",
    ],
  },
  {
    title: "Artikel 12 — Verwerking persoonsgegevens",
    paragraphs: [
      "Kappersklok handelt in overeenstemming met de privacy wet- en regelgeving. Verwerking vindt uitsluitend plaats in het kader van de dienstverlening.",
    ],
  },
  {
    title: "Artikel 13 — Klachten",
    paragraphs: [
      "Klachten dienen binnen 7 dagen gemeld te worden via info@kappersklok.nl. Kappersklok reageert inhoudelijk binnen 7 dagen.",
    ],
  },
  {
    title: "Artikel 14 — Wijzigingen",
    paragraphs: [
      "Kappersklok mag deze Algemene Voorwaarden wijzigen. Wijzigingen gelden ook voor bestaande overeenkomsten.",
    ],
  },
  {
    title: "Artikel 15 — Toepasselijk recht",
    paragraphs: [
      "Op alle rechtsbetrekkingen is uitsluitend Nederlands recht van toepassing.",
    ],
  },
];

export default function VoorwaardenPage() {
  return (
    <>
      <HeroBanner title="Algemene Voorwaarden" />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="space-y-8">
            {articles.map((article) => (
              <div key={article.title}>
                <h2 className="text-lg font-bold">{article.title}</h2>
                {article.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="mt-2 text-sm text-muted-foreground leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
