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
  ChevronRight,
  Clock,
  Quote,
  Smartphone,
  Users,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { SearchBar } from "@/components/search-bar";
import { Logo } from "@/components/logo";
import { ShopMonogram } from "@/components/shop-monogram";
import { getActiveShopsWithBarbers } from "@/lib/db";
import { OrganizationSchema } from "@/components/json-ld";
import { FadeIn, StaggerContainer, StaggerItem, ScaleIn } from "@/components/motion";

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
  { name: "Yusuf A.", shop: "Herenkapper De Stijl", text: "Mijn klanten en ik zijn gewend aan Kappersklok, wij kunnen niet meer zonder.", stars: 5 },
  { name: "Emre D.", shop: "HairQuality", text: "Het is heel handig omdat het tijd en moeite bespaart. Klanten bepalen zelf hun dag en tijd.", stars: 5 },
];

const stats = [
  { value: "53+", label: "Kappers", icon: Scissors },
  { value: "10K+", label: "Afspraken", icon: CalendarDays },
  { value: "4.9", label: "Beoordeling", icon: Star },
  { value: "70%", label: "Minder no-shows", icon: CheckCircle },
];

export default async function Home() {
  const allShops = await getActiveShopsWithBarbers();
  const featuredShops = allShops.slice(0, 12);
  const cities = [...new Set(allShops.map((s) => s.city).filter(Boolean))].sort();

  return (
    <>
      <OrganizationSchema />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-grid-pattern">
        {/* Decorative floating elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[15%] h-80 w-80 rounded-full bg-gold/4 blur-[100px]" />
          <div className="absolute right-[5%] bottom-[10%] h-64 w-64 rounded-full bg-gold/3 blur-[80px]" />
          <div className="absolute right-[15%] top-[20%] animate-float-slow opacity-[0.04]">
            <Scissors className="h-32 w-32 text-gold" />
          </div>
          <div className="absolute left-[8%] bottom-[25%] animate-float-reverse opacity-[0.03]">
            <CalendarDays className="h-24 w-24 text-gold" />
          </div>
          <div className="absolute right-[25%] bottom-[15%] animate-float-slow opacity-[0.03]" style={{ animationDelay: "3s" }}>
            <Clock className="h-20 w-20 text-gold" />
          </div>
          {/* Decorative clock circle */}
          <div className="absolute left-[50%] top-[8%] -translate-x-1/2 opacity-[0.02]">
            <div className="h-[500px] w-[500px] rounded-full border border-gold animate-spin-slow" />
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-20 md:pt-32 md:pb-24">
          <div className="text-center">
            <FadeIn>
              <p className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-xs font-medium text-gold tracking-wide uppercase mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                </span>
                Online afspraken voor kappers
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="font-heading text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                Welkom bij{" "}
                <span className="text-gradient-gold">Kappersklok</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Makkelijk en snel een afspraak maken bij jouw lokale kapper.
                Zonder registratie, zonder gedoe.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mx-auto mt-8 max-w-2xl">
                <SearchBar />
              </div>
            </FadeIn>

            {/* City chips */}
            <FadeIn delay={0.4}>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {cities.slice(0, 10).map((city) => (
                  <Link
                    key={city}
                    href={`/kapper-zoeken?q=${encodeURIComponent(city!)}`}
                    className="rounded-full border border-border/50 bg-surface/30 px-3 py-1 text-xs text-muted-foreground transition-all hover:border-gold/30 hover:text-gold hover:bg-gold/5"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Stats bar */}
          <FadeIn delay={0.5}>
            <div className="mx-auto mt-14 max-w-3xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="group relative rounded-xl border border-border/50 bg-surface/30 backdrop-blur-sm p-4 text-center transition-all hover:border-gold/30 hover:bg-gold/5 glow-gold-sm">
                    <stat.icon className="mx-auto h-5 w-5 text-gold/60 mb-2 group-hover:text-gold transition-colors" />
                    <p className="text-2xl font-bold text-gradient-gold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Testimonial */}
          <FadeIn delay={0.6}>
            <div className="mx-auto mt-10 max-w-xl">
              <div className="rounded-xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6">
                <Quote className="h-5 w-5 text-gold/40 mb-3" />
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;{testimonials[0].text}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 animate-pulse-gold">
                    <span className="text-xs font-bold text-gold">{testimonials[0].name[0]}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{testimonials[0].name}</p>
                    <p className="text-xs text-muted-foreground">{testimonials[0].shop}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Bottom gradient fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface/50 to-transparent" />
      </section>

      {/* ── Scrolling logo marquee ── */}
      <section className="border-t border-b border-border bg-surface/50 py-5 overflow-hidden">
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

      {/* ── Beste in de regio ── */}
      <section className="relative bg-dots-pattern py-16 overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-gold/3 blur-[80px]" />

        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <div className="flex items-end justify-between mb-8">
              <SectionHeading title="Beste in de regio" subtitle="Ontdek onze aangesloten kappers" />
              <ButtonLink href="/kapper-zoeken" variant="outline" className="hidden sm:inline-flex border-border hover:border-gold/40 text-sm">
                Bekijk alle <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </ButtonLink>
            </div>
          </FadeIn>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-4 md:px-[max(1rem,calc((100vw-72rem)/2+1rem))] pb-4">
            {featuredShops.map((shop) => (
              <Link
                key={shop.id}
                href={`/kapperszaak/${shop.slug}`}
                className="group flex-shrink-0 w-[260px] rounded-xl border border-border bg-surface overflow-hidden transition-all hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5 card-hover"
              >
                <div className="relative h-36 bg-gradient-to-br from-surface via-background to-surface flex items-center justify-center">
                  <ShopMonogram name={shop.name} size={64} />
                  <div className="absolute top-3 right-3 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5">
                    <span className="text-[10px] font-medium text-green-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      Open
                    </span>
                  </div>
                  {/* Decorative corner */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gold/30 via-gold/10 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm group-hover:text-gold transition-colors truncate">
                    {shop.name}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    {shop.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{shop.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />{shop.barbers.length} kappers
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-gold/60 text-gold/60" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Bekijk <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 mt-4 sm:hidden">
          <ButtonLink href="/kapper-zoeken" variant="outline" className="w-full border-border hover:border-gold/40">
            Bekijk alle {allShops.length} kappers <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </section>

      {/* ── Hoe het werkt ── */}
      <section className="relative py-20 bg-diagonal-lines">
        <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gold/3 blur-[80px]" />

        <div className="relative mx-auto max-w-6xl px-4">
          <FadeIn>
            <SectionHeading title="Hoe het werkt" subtitle="In 3 simpele stappen naar jouw kapper" />
          </FadeIn>
          <StaggerContainer className="mt-12 grid gap-8 md:grid-cols-3" stagger={0.15}>
            {steps.map((step, i) => (
              <StaggerItem key={step.title}>
                <div className="relative flex flex-col items-center text-center">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed border-gold/20" />
                  )}
                  <ScaleIn delay={i * 0.1}>
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 glow-gold-sm">
                      <step.icon className="h-7 w-7 text-gold" />
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-background">
                        {i + 1}
                      </span>
                    </div>
                  </ScaleIn>
                  <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">{step.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Appointment preview card */}
          <FadeIn delay={0.5}>
            <div className="mx-auto mt-16 max-w-md">
              <div className="rounded-xl border border-gold/20 bg-surface/80 backdrop-blur-sm p-5 glow-gold">
                <div className="flex items-center gap-2 text-xs text-gold mb-3">
                  <CalendarDays className="h-4 w-4" />
                  <span className="font-medium">Voorbeeld afspraak</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-background/80 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                        <Scissors className="h-4 w-4 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Haarsnit</p>
                        <p className="text-xs text-muted-foreground">30 min</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gold">&euro;25,00</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-background/80 p-3 text-center">
                      <Clock className="h-4 w-4 text-gold/60 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Vandaag</p>
                      <p className="text-sm font-semibold">14:30</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-background/80 p-3 text-center">
                      <MapPin className="h-4 w-4 text-gold/60 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Locatie</p>
                      <p className="text-sm font-semibold">Amsterdam</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gold/10 border border-gold/20 p-3 text-center">
                    <CheckCircle className="h-4 w-4 text-gold mx-auto mb-1" />
                    <p className="text-xs font-medium text-gold">Afspraak bevestigd</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative border-t border-border bg-surface py-20 noise-overlay">
        <div className="relative mx-auto max-w-6xl px-4 z-10">
          <FadeIn>
            <SectionHeading title="Alles wat je nodig hebt" subtitle="Kappersklok biedt een compleet pakket voor jouw kapperszaak" />
          </FadeIn>
          <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="border-border bg-background transition-all hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 h-full card-hover">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
                      <feature.icon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative py-20 bg-grid-pattern">
        <div className="pointer-events-none absolute right-[10%] top-[20%] h-48 w-48 rounded-full bg-gold/3 blur-[80px]" />

        <div className="relative mx-auto max-w-6xl px-4">
          <FadeIn>
            <SectionHeading title="Wat kappers zeggen" subtitle="Sluit je aan bij tevreden kappers door heel Nederland" />
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <Card key={t.name} className="border-border bg-surface transition-all hover:border-gold/20 card-hover-subtle">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <Quote className="h-4 w-4 text-gold/30 mb-2" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
                      <span className="text-xs font-bold text-gold">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.shop}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {testimonials.slice(3).map((t) => (
              <div key={t.name} className="flex items-start gap-4 rounded-xl border border-border/50 bg-surface/50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10">
                  <span className="text-xs font-bold text-gold">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground italic">&ldquo;{t.text}&rdquo;</p>
                  <p className="mt-2 text-xs font-semibold">{t.name} <span className="font-normal text-muted-foreground">— {t.shop}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Download ── */}
      <section className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-background">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/3" />
            <div className="absolute inset-0 bg-dots-pattern opacity-50" />
            <div className="relative flex flex-col items-center gap-10 p-8 md:flex-row md:p-14">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 mb-4">
                  <Smartphone className="h-3.5 w-3.5 text-gold" />
                  <span className="text-xs font-medium text-gold">Binnenkort beschikbaar</span>
                </div>
                <h2 className="font-heading text-3xl font-bold md:text-4xl">
                  Download onze app
                </h2>
                <p className="mt-3 text-muted-foreground max-w-md">
                  Maak afspraken nog sneller via de Kappersklok app. Beschikbaar voor iOS en Android.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                  <Button variant="outline" className="h-12 gap-2 border-border bg-surface hover:bg-surface/80 hover:border-gold/30 px-5 btn-shimmer">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                    Google Play
                  </Button>
                  <Button variant="outline" className="h-12 gap-2 border-border bg-surface hover:bg-surface/80 hover:border-gold/30 px-5 btn-shimmer">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    App Store
                  </Button>
                </div>
              </div>
              <div className="flex h-56 w-56 items-center justify-center rounded-3xl bg-gold/5 border border-gold/20 glow-gold">
                <Logo size={140} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-gold/10 blur-[100px]" />

        {/* Floating decorative icons */}
        <div className="pointer-events-none absolute left-[10%] top-[30%] animate-float-slow opacity-[0.06]">
          <Scissors className="h-16 w-16 text-gold" />
        </div>
        <div className="pointer-events-none absolute right-[10%] bottom-[30%] animate-float-reverse opacity-[0.06]">
          <CalendarDays className="h-16 w-16 text-gold" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <FadeIn>
            <h2 className="font-heading text-3xl font-bold md:text-5xl">
              Start vandaag met <span className="text-gradient-gold">Kappersklok</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Registreer uw kapperszaak en laat klanten eenvoudig online afspraken maken. Vanaf slechts &euro;29 per maand.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <ButtonLink
                href="/registreren"
                size="lg"
                className="bg-gold text-background hover:bg-gold-hover font-semibold text-base px-8 btn-shimmer"
              >
                Kapperszaak registreren
                <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href="/kapper-zoeken"
                size="lg"
                variant="outline"
                className="border-border hover:border-gold/40 text-base px-8"
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
