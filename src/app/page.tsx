import Link from "next/link";
import {
  Search,
  CalendarDays,
  Scissors,
  Bell,
  RefreshCw,
  Monitor,
  Tablet,
  Globe,
  ShieldCheck,
  Star,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/section-heading";
import { Logo } from "@/components/logo";
import { ShopMonogram } from "@/components/shop-monogram";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const steps = [
  { icon: Search, title: "Zoek", description: "Vind een kapper bij jou in de buurt" },
  { icon: CalendarDays, title: "Boek", description: "Kies een datum en tijd die jou uitkomt" },
  { icon: Scissors, title: "Knip", description: "Ga naar je kapper en geniet van de service" },
];

const features = [
  { icon: Bell, title: "Notificaties", description: "Ontvang notificaties wanneer er afspraken worden gemaakt. Klanten krijgen herinneringen om no-shows te voorkomen." },
  { icon: RefreshCw, title: "Vaste Afspraken", description: "Stel vaste afspraken in die iedere week of 2 weken automatisch herhaald worden." },
  { icon: Monitor, title: "Digi-box", description: "Sluit onze Digi-box aan op uw tv en zie duidelijk wie er wanneer aan de beurt is." },
  { icon: Tablet, title: "Self-desk", description: "Klanten plannen de volgende afspraak via de grote touchscreen voordat ze de zaak verlaten." },
  { icon: Globe, title: "Eigen Website", description: "Integreer Kappersklok in uw eigen website of gebruik een privé-domein." },
  { icon: ShieldCheck, title: "Privacy", description: "Privacy wordt gerespecteerd, oude data wordt automatisch verwijderd. Optioneel maandelijks rapport." },
];

const testimonials = [
  { name: "Mohammed B.", shop: "Barbershop Qlippers", text: "Sinds we Kappersklok gebruiken zijn no-shows met 70% gedaald. Onze klanten vinden het heel makkelijk.", stars: 5 },
  { name: "Achraf E.", shop: "Chaci Barbershop", text: "De Digi-box is geweldig. Klanten zien direct wie er aan de beurt is, geen discussies meer.", stars: 5 },
  { name: "Dennis K.", shop: "Man Cave Barbers", text: "Eindelijk een systeem dat werkt zonder ingewikkelde setup. Binnen 10 minuten online!", stars: 5 },
];

export default async function Home() {
  const allShops = await prisma.shop.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, city: true },
  });

  const featuredShops = allShops.slice(0, 12);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Vind jouw kapper{" "}
            <span className="text-gold">in enkele seconden</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Makkelijk en snel een afspraak maken bij jouw lokale kapper. Zonder
            registratie, zonder gedoe.
          </p>
          <div className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <Input
              type="text"
              placeholder="Voer je stad in..."
              className="h-12 border-border bg-surface text-foreground placeholder:text-muted-foreground"
            />
            <ButtonLink
              href="/kapper-zoeken"
              className="h-12 bg-gold px-6 text-background hover:bg-gold-hover font-semibold whitespace-nowrap"
            >
              <Search className="mr-2 h-4 w-4" />
              Vind mijn kapper
            </ButtonLink>
          </div>

          {/* Trust counter */}
          <p className="mt-8 text-sm text-muted-foreground">
            Al <span className="font-semibold text-gold">{allShops.length}+</span> kappers aangesloten door heel Nederland
          </p>
        </div>
      </section>

      {/* Scrolling logo marquee */}
      <section className="border-t border-b border-border bg-surface/50 py-6 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-track">
            {[...allShops, ...allShops].map((shop, i) => (
              <Link
                key={`${shop.id}-${i}`}
                href={`/kapperszaak/${shop.slug}`}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-3 py-2 transition-colors hover:border-gold/30"
              >
                <ShopMonogram name={shop.name} size={28} />
                <span className="text-xs text-muted-foreground whitespace-nowrap">{shop.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hoe het werkt */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading title="Hoe het werkt" subtitle="In 3 simpele stappen naar jouw kapper" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold bg-gold/10">
                  <step.icon className="h-7 w-7 text-gold" />
                </div>
                <span className="mt-4 text-sm font-semibold text-gold">Stap {i + 1}</span>
                <h3 className="mt-1 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured kappers */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            title="Populaire kappers"
            subtitle="Ontdek onze aangesloten kappers"
          />
          <div className="mt-12 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featuredShops.map((shop) => (
              <Link
                key={shop.id}
                href={`/kapperszaak/${shop.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center transition-all hover:border-gold/40 hover:bg-surface/80"
              >
                <ShopMonogram name={shop.name} size={48} />
                <span className="text-xs font-medium truncate w-full group-hover:text-gold transition-colors">
                  {shop.name}
                </span>
                {shop.city && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" />
                    {shop.city}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <ButtonLink
              href="/kapper-zoeken"
              variant="outline"
              className="border-border hover:border-gold/40"
            >
              Bekijk alle {allShops.length} kappers
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading title="Alles wat je nodig hebt" subtitle="Kappersklok biedt een compleet pakket voor jouw kapperszaak" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-background transition-colors hover:border-gold/30">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-gold" />
                  <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading title="Wat kappers zeggen" subtitle="Sluit je aan bij tevreden kappers door heel Nederland" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border bg-surface">
                <CardContent className="p-6">
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.shop}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-background p-8 md:flex-row md:p-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-heading text-3xl font-bold md:text-4xl">Download onze app</h2>
              <p className="mt-3 text-muted-foreground">
                Maak afspraken nog sneller via de Kappersklok app. Beschikbaar voor iOS en Android.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4 md:justify-start">
                <Button variant="outline" className="h-12 border-border bg-surface hover:bg-muted">Google Play</Button>
                <Button variant="outline" className="h-12 border-border bg-surface hover:bg-muted">App Store</Button>
              </div>
            </div>
            <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-gold/5 border border-gold/20">
              <Logo size={120} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">Start vandaag met Kappersklok</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Registreer uw kapperszaak en laat klanten eenvoudig online afspraken maken. Vanaf slechts &euro;29 per maand.
          </p>
          <ButtonLink
            href="/registreren"
            size="lg"
            className="mt-8 bg-gold text-background hover:bg-gold-hover font-semibold text-base px-8"
          >
            Start vandaag
            <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
