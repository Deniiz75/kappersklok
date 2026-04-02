import Link from "next/link";
import {
  Search, CalendarDays, Scissors, Star, ArrowRight, MapPin, ChevronRight,
  Smartphone, CheckCircle,
} from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/search-bar";
import { ShopMonogram } from "@/components/shop-monogram";
import { getActiveShopsWithBarbers } from "@/lib/db";
import { OrganizationSchema } from "@/components/json-ld";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { LiveCounter } from "@/components/live-counter";
import { ProductMockup } from "@/components/product-mockup";
import { FeatureShowcase } from "@/components/feature-showcase";
import { FAQSection } from "@/components/faq-section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const steps = [
  { icon: Search, title: "Zoek", description: "Vind een kapper bij jou in de buurt" },
  { icon: CalendarDays, title: "Boek", description: "Kies een datum en tijd die jou uitkomt" },
  { icon: Scissors, title: "Knip", description: "Ga naar je kapper en geniet van de service" },
];

const testimonials = [
  { name: "Mohammed B.", shop: "Barbershop Qlippers", text: "Sinds we Kappersklok gebruiken zijn no-shows met 70% gedaald. Onze klanten vinden het heel makkelijk.", stars: 5 },
  { name: "Achraf E.", shop: "Chaci Barbershop", text: "De Digi-box is geweldig. Klanten zien direct wie er aan de beurt is, geen discussies meer.", stars: 5 },
  { name: "Dennis K.", shop: "Man Cave Barbers", text: "Eindelijk een systeem dat werkt zonder ingewikkelde setup. Binnen 10 minuten online!", stars: 5 },
];

const stats = [
  { value: "53+", label: "Kappers" },
  { value: "10.000+", label: "Afspraken" },
  { value: "4.9", label: "Beoordeling" },
  { value: "70%", label: "Minder no-shows" },
];

export default async function Home() {
  const allShops = await getActiveShopsWithBarbers();
  const featuredShops = allShops.slice(0, 12);

  return (
    <>
      <OrganizationSchema />

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 md:pt-20 md:pb-12">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Boek jouw kapper{" "}
                <br className="hidden sm:block" />
                bij jou in de buurt
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Ontdek de best beoordeelde kappers in Nederland en boek direct online
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="mt-8">
                <SearchBar />
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="mt-4">
                <LiveCounter />
              </div>
            </FadeIn>
          </div>

          {/* Product mockup */}
          <FadeIn delay={0.3}>
            <div className="mt-12 md:mt-16">
              <ProductMockup />
            </div>
          </FadeIn>
        </div>

        {/* Subtle gradient bottom edge */}
        <div className="h-24 gradient-accent-bottom" />
      </section>

      {/* ══════════ STATS ══════════ */}
      <section className="bg-white py-12 border-y border-border">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-foreground md:text-4xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ KAPPERS CAROUSEL ══════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
              Beste kappers bij jou in de buurt
            </h2>
            <p className="text-center text-muted-foreground mt-2">
              Ontdek {allShops.length}+ kappers door heel Nederland
            </p>
          </FadeIn>
        </div>

        <div className="mt-10 overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-4 md:px-[max(1rem,calc((100vw-72rem)/2+1rem))] pb-4">
            {featuredShops.map((shop) => (
              <Link
                key={shop.id}
                href={`/kapperszaak/${shop.slug}`}
                className="group flex-shrink-0 w-[240px] rounded-xl border border-border bg-white overflow-hidden card-hover"
              >
                <div className="relative h-36 bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                  <ShopMonogram name={shop.name} size={64} />
                  <div className="absolute top-3 right-3 rounded-full bg-[#2ECC71]/10 border border-[#2ECC71]/20 px-2 py-0.5">
                    <span className="text-[10px] font-medium text-[#2ECC71] flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2ECC71]" />
                      Open
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-foreground/70 transition-colors truncate">
                    {shop.name}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`h-3 w-3 ${j < Math.round(shop.avgRating || 0) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
                      ))}
                    </div>
                    {shop.reviewCount > 0 && <span>({shop.reviewCount})</span>}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />{shop.city || "Nederland"}
                    </span>
                    <span className="text-xs font-medium text-foreground flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Bekijk <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 mt-6 text-center">
          <ButtonLink href="/kapper-zoeken" className="bg-foreground text-white hover:bg-foreground/90 font-medium rounded-full px-6">
            Bekijk alle kappers <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </section>

      {/* ══════════ HOE HET WERKT ══════════ */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
              Hoe het werkt
            </h2>
            <p className="text-center text-muted-foreground mt-2">In 3 simpele stappen naar jouw kapper</p>
          </FadeIn>
          <StaggerContainer className="mt-12 grid gap-8 md:grid-cols-3" stagger={0.1}>
            {steps.map((step, i) => (
              <StaggerItem key={step.title}>
                <div className="relative flex flex-col items-center text-center">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed border-border" />
                  )}
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-white">
                    <step.icon className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2ECC71] text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">{step.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ══════════ FEATURES SHOWCASE ══════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
              Alles wat je nodig hebt
            </h2>
            <p className="text-center text-muted-foreground mt-2">
              Kappersklok biedt een compleet pakket voor jouw kapperszaak
            </p>
          </FadeIn>
          <div className="mt-16">
            <FeatureShowcase />
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
              Wat kappers zeggen
            </h2>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border bg-white">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground">
                      <span className="text-xs font-bold text-white">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.shop}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
              Veelgestelde vragen
            </h2>
          </FadeIn>
          <div className="mt-12">
            <FAQSection />
          </div>
        </div>
      </section>

      {/* ══════════ APP DOWNLOAD ══════════ */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
            <div className="flex flex-col items-center gap-10 p-8 md:flex-row md:p-14">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 mb-4">
                  <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Binnenkort beschikbaar</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                  Download onze app
                </h2>
                <p className="mt-3 text-muted-foreground max-w-md">
                  Maak afspraken nog sneller via de Kappersklok app. Beschikbaar voor iOS en Android.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                  <Button variant="outline" className="h-12 gap-2 border-border px-5 rounded-xl">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                    Google Play
                  </Button>
                  <Button variant="outline" className="h-12 gap-2 border-border px-5 rounded-xl">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    App Store
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="phone-mockup">
                  <div className="phone-mockup-screen">
                    <div className="flex flex-col h-full bg-white p-4">
                      <div className="text-center pt-6 pb-4">
                        <div className="mx-auto h-10 w-10 rounded-full bg-foreground flex items-center justify-center mb-2">
                          <Scissors className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-[10px] font-bold tracking-wider">KAPPERSKLOK</p>
                      </div>
                      <div className="rounded-lg bg-muted px-3 py-2 mb-3">
                        <p className="text-[8px] text-muted-foreground">Zoek een kapper...</p>
                      </div>
                      <div className="space-y-2 flex-1">
                        {["Barber Kings", "Chaci", "Ace Barbers"].map((name) => (
                          <div key={name} className="rounded-lg border border-border p-2 flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-foreground flex items-center justify-center shrink-0">
                              <span className="text-[7px] font-bold text-white">{name[0]}</span>
                            </div>
                            <div>
                              <p className="text-[8px] font-semibold">{name}</p>
                              <p className="text-[6px] text-muted-foreground">Open · 4.9 ★</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER CTA ══════════ */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-accent opacity-[0.03]" />
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Start vandaag met Kappersklok
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Registreer uw kapperszaak en laat klanten eenvoudig online afspraken maken. Vanaf slechts &euro;29 per maand.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <ButtonLink
                href="/registreren"
                size="lg"
                className="bg-foreground text-white hover:bg-foreground/90 font-medium text-base px-8 rounded-full"
              >
                Kapperszaak registreren <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href="/kapper-zoeken"
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted text-base px-8 rounded-full"
              >
                Kapper zoeken
              </ButtonLink>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
