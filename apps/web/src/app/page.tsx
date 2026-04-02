import Link from "next/link";
import {
  Search, CalendarDays, Scissors, Bell, RefreshCw, Monitor, Tablet, Globe,
  ShieldCheck, Star, ArrowRight, MapPin, ChevronRight,
  Smartphone, Users, CheckCircle,
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
import { TestimonialSlider } from "@/components/testimonial-slider";

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

      {/* ══════════ DARK HERO SECTION — Neon Tech Dark ══════════ */}
      <section className="relative overflow-hidden bg-[#0D0D0D] noise-overlay">
        {/* Pulse rings — signature animatie */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pulse-ring pulse-ring-1 h-[200px] w-[200px] md:h-[300px] md:w-[300px]" />
          <div className="pulse-ring pulse-ring-2 h-[200px] w-[200px] md:h-[300px] md:w-[300px]" />
          <div className="pulse-ring pulse-ring-3 h-[200px] w-[200px] md:h-[300px] md:w-[300px]" />
        </div>

        {/* Subtle radial glow behind center content */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(46,204,113,0.04)_0%,transparent_60%)]" />

        <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="text-center">
            <FadeIn>
              <p className="text-white/40 text-sm tracking-widest uppercase mb-3">Welkom bij</p>
              <div className="neon-text-glow">
                <h1 className="font-heading text-4xl font-bold tracking-tight text-gradient-gold md:text-6xl lg:text-7xl">
                  KAPPERSKLOK
                </h1>
              </div>
              <div className="mx-auto mt-4 w-20 neon-divider" />
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="mx-auto mt-8 max-w-2xl">
                <SearchBar />
              </div>
            </FadeIn>
          </div>

          {/* Stats in hero */}
          <FadeIn delay={0.3}>
            <div className="mx-auto mt-10 max-w-3xl">
              <div className="neon-divider mb-8" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <stat.icon className="mx-auto h-5 w-5 text-[#2ECC71]/60 mb-2" />
                    <p className="text-2xl font-bold text-white md:text-3xl">{stat.value}</p>
                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Testimonial slider met neon styling */}
          <FadeIn delay={0.4}>
            <div className="mx-auto mt-10 max-w-lg [--foreground:#fff] [--muted-foreground:rgba(255,255,255,0.5)] [--surface:rgba(255,255,255,0.03)] [--border:rgba(46,204,113,0.2)] [--gold:#B8923F]">
              <TestimonialSlider testimonials={testimonials} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ WHITE BODY ══════════ */}

      {/* ── Beste in de regio ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <h2 className="text-center font-heading text-2xl font-bold text-[#1A1A1A] tracking-wide md:text-3xl">
              BESTE IN DE REGIO
            </h2>
          </FadeIn>
        </div>

        <div className="mt-10 overflow-x-auto scrollbar-hide">
          <div className="flex gap-5 px-4 md:px-[max(1rem,calc((100vw-72rem)/2+1rem))] pb-4">
            {featuredShops.map((shop) => (
              <Link
                key={shop.id}
                href={`/kapperszaak/${shop.slug}`}
                className="group flex-shrink-0 w-[240px] rounded-xl border border-border bg-white overflow-hidden transition-all hover:shadow-lg hover:shadow-black/8 card-hover"
              >
                <div className="relative h-36 bg-gradient-to-br from-[#F5F3EF] to-[#E8E5E0] flex items-center justify-center">
                  <ShopMonogram name={shop.name} size={64} />
                  <div className="absolute top-3 right-3 rounded-full bg-[#2ECC71]/10 border border-[#2ECC71]/20 px-2 py-0.5">
                    <span className="text-[10px] font-medium text-[#2ECC71] flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2ECC71]" />
                      Open
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-[#1A1A1A] group-hover:text-[#B8923F] transition-colors truncate">
                    {shop.name}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-[#6B6B6B]">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`h-3 w-3 ${j < Math.round(shop.avgRating || 0) ? "fill-[#B8923F] text-[#B8923F]" : "fill-[#E5E5E3] text-[#E5E5E3]"}`} />
                      ))}
                    </div>
                    {shop.reviewCount > 0 && <span>({shop.reviewCount})</span>}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                      <MapPin className="h-3 w-3" />{shop.city || "Nederland"}
                    </span>
                    <span className="text-xs font-semibold text-[#2ECC71] flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Bekijk <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 mt-6 text-center">
          <ButtonLink href="/kapper-zoeken" className="bg-[#2ECC71] text-white hover:bg-[#27AE60] font-semibold px-6">
            Bekijk alle {allShops.length} kappers <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </section>

      {/* ── Hoe het werkt ── */}
      <section className="bg-[#F7F7F5] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <h2 className="text-center font-heading text-2xl font-bold text-[#1A1A1A] tracking-wide md:text-3xl">
              HOE HET WERKT
            </h2>
            <p className="text-center text-[#6B6B6B] mt-2">In 3 simpele stappen naar jouw kapper</p>
          </FadeIn>
          <StaggerContainer className="mt-12 grid gap-8 md:grid-cols-3" stagger={0.15}>
            {steps.map((step, i) => (
              <StaggerItem key={step.title}>
                <div className="relative flex flex-col items-center text-center">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed border-[#E5E5E3]" />
                  )}
                  <ScaleIn delay={i * 0.1}>
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2ECC71]/10 border border-[#2ECC71]/20">
                      <step.icon className="h-7 w-7 text-[#2ECC71]" />
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2ECC71] text-xs font-bold text-white">
                        {i + 1}
                      </span>
                    </div>
                  </ScaleIn>
                  <h3 className="mt-5 text-xl font-bold text-[#1A1A1A]">{step.title}</h3>
                  <p className="mt-2 text-[#6B6B6B] text-sm">{step.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white py-12 border-y border-border">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-6 w-6 text-[#B8923F] mb-2" />
                <p className="text-3xl font-bold text-[#1A1A1A]">{stat.value}</p>
                <p className="text-xs text-[#6B6B6B] mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[#F7F7F5] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <h2 className="text-center font-heading text-2xl font-bold text-[#1A1A1A] tracking-wide md:text-3xl">
              ALLES WAT JE NODIG HEBT
            </h2>
            <p className="text-center text-[#6B6B6B] mt-2">Kappersklok biedt een compleet pakket voor jouw kapperszaak</p>
          </FadeIn>
          <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="border-border bg-white transition-all hover:shadow-lg hover:shadow-black/5 h-full">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2ECC71]/10 border border-[#2ECC71]/20">
                      <feature.icon className="h-6 w-6 text-[#2ECC71]" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-[#1A1A1A]">{feature.title}</h3>
                    <p className="mt-2 text-sm text-[#6B6B6B] leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <h2 className="text-center font-heading text-2xl font-bold text-[#1A1A1A] tracking-wide md:text-3xl">
              WAT KAPPERS ZEGGEN
            </h2>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <Card key={t.name} className="border-border bg-[#F7F7F5]">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#B8923F] text-[#B8923F]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A]">
                      <span className="text-xs font-bold text-white">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{t.name}</p>
                      <p className="text-xs text-[#6B6B6B]">{t.shop}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Download ── */}
      <section className="bg-[#F7F7F5] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
            <div className="flex flex-col items-center gap-10 p-8 md:flex-row md:p-14">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#2ECC71]/20 bg-[#2ECC71]/5 px-3 py-1 mb-4">
                  <Smartphone className="h-3.5 w-3.5 text-[#2ECC71]" />
                  <span className="text-xs font-medium text-[#2ECC71]">Binnenkort beschikbaar</span>
                </div>
                <h2 className="font-heading text-3xl font-bold text-[#1A1A1A] md:text-4xl">
                  Download onze app
                </h2>
                <p className="mt-3 text-[#6B6B6B] max-w-md">
                  Maak afspraken nog sneller via de Kappersklok app. Beschikbaar voor iOS en Android.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                  <Button variant="outline" className="h-12 gap-2 border-border hover:border-[#1A1A1A] px-5">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                    Google Play
                  </Button>
                  <Button variant="outline" className="h-12 gap-2 border-border hover:border-[#1A1A1A] px-5">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    App Store
                  </Button>
                </div>
              </div>
              {/* Phone mockup */}
              <div className="hidden md:block">
                <div className="phone-mockup">
                  <div className="phone-mockup-screen">
                    <div className="flex flex-col h-full bg-[#1A1A1A] p-4">
                      <div className="text-center pt-6 pb-4">
                        <div className="mx-auto h-12 w-12 rounded-full bg-[#B8923F]/20 flex items-center justify-center mb-2">
                          <Scissors className="h-5 w-5 text-[#B8923F]" />
                        </div>
                        <p className="text-[10px] font-bold text-white tracking-wider">KAPPERSKLOK</p>
                      </div>
                      <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 mb-3">
                        <p className="text-[8px] text-white/40">Zoek een kapper...</p>
                      </div>
                      <div className="space-y-2 flex-1">
                        {["Barber Kings", "Chaci", "Ace Barbers"].map((name) => (
                          <div key={name} className="rounded-lg bg-white/5 border border-white/10 p-2 flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-[#B8923F]/15 flex items-center justify-center shrink-0">
                              <span className="text-[7px] font-bold text-[#B8923F]">{name[0]}</span>
                            </div>
                            <div>
                              <p className="text-[8px] font-semibold text-white">{name}</p>
                              <p className="text-[6px] text-white/40">Open · 4.9 ★</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-around pt-3 border-t border-white/10 mt-2">
                        {[Search, CalendarDays, Star, Users].map((Icon, i) => (
                          <Icon key={i} className={`h-3.5 w-3.5 ${i === 0 ? "text-[#2ECC71]" : "text-white/30"}`} />
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

      {/* ── CTA ── */}
      <section className="bg-[#1A1A1A] py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <FadeIn>
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Start vandaag met Kappersklok
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              Registreer uw kapperszaak en laat klanten eenvoudig online afspraken maken. Vanaf slechts &euro;29 per maand.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <ButtonLink
                href="/registreren"
                size="lg"
                className="bg-[#2ECC71] text-white hover:bg-[#27AE60] font-semibold text-base px-8"
              >
                Kapperszaak registreren <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href="/kapper-zoeken"
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-base px-8"
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
