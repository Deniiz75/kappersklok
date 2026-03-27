import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShopBySlug } from "@/lib/db";
import { LocalBusinessSchema } from "@/components/json-ld";
import { ShopMonogram } from "@/components/shop-monogram";
import { BookingWizard } from "@/components/booking-wizard";
import { ReviewSection } from "@/components/review-section";
import { FavoriteButton } from "@/components/favorite-button";
import { FadeIn } from "@/components/motion";
import { MapPin, Phone, Instagram, Clock, Star, Scissors } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) return { title: "Kapper niet gevonden" };
  return {
    title: shop.name,
    description: `Maak een afspraak bij ${shop.name} in ${shop.city || "Nederland"}. Online boeken via Kappersklok.`,
  };
}

const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
const shortDays = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default async function KapperszaakPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  const address = [shop.street, shop.houseNumber].filter(Boolean).join(" ");
  const location = [address, shop.postalCode, shop.city].filter(Boolean).join(", ");
  const today = new Date().getDay();

  return (
    <>
      <LocalBusinessSchema
        name={shop.name}
        city={shop.city}
        street={shop.street}
        postalCode={shop.postalCode}
        phone={shop.phone}
        slug={slug}
      />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-background/80 to-background" />
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,168,83,0.06), transparent)" }} />

        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-12 sm:pb-10 sm:pt-16">
          {/* Shop identity */}
          <div className="flex flex-col items-center text-center">
            <FadeIn>
              <ShopMonogram name={shop.name} size={80} className="sm:hidden" />
              <ShopMonogram name={shop.name} size={100} className="hidden sm:block" />
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {shop.name}
              </h1>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                {shop.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gold/70" />
                    {shop.city}
                  </span>
                )}
                {shop.avgRating > 0 && (
                  <>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      <span className="font-semibold text-foreground">{shop.avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground/60">({shop.reviews.length})</span>
                    </span>
                  </>
                )}
                {shop.barbers.length > 0 && (
                  <>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1">
                      <Scissors className="h-3.5 w-3.5 text-gold/70" />
                      {shop.barbers.length} kapper{shop.barbers.length !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>
            </FadeIn>

            {/* Contact pills */}
            <FadeIn delay={0.2}>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
                    <MapPin className="h-3 w-3 text-gold/60" />
                    {location}
                  </span>
                )}
                {shop.phone && (
                  <a href={`tel:${shop.phone}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:border-gold/20 hover:text-foreground">
                    <Phone className="h-3 w-3 text-gold/60" />
                    {shop.phone}
                  </a>
                )}
                {shop.instagram && (
                  <a href={`https://instagram.com/${shop.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:border-gold/20 hover:text-foreground">
                    <Instagram className="h-3 w-3 text-gold/60" />
                    @{shop.instagram.replace("@", "")}
                  </a>
                )}
                <FavoriteButton shopId={shop.id} />
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Bottom fade line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </section>

      {/* ── Main Content ── */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-6 lg:grid-cols-5">

            {/* ── Left Column: Info ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Opening hours */}
              {shop.businessHours.length > 0 && (
                <FadeIn delay={0.1}>
                  <div className="rounded-2xl border border-white/[0.06] p-5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10">
                        <Clock className="h-3.5 w-3.5 text-gold" />
                      </div>
                      <h3 className="text-sm font-semibold">Openingstijden</h3>
                    </div>
                    <div className="space-y-1">
                      {shop.businessHours.map((h: { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }) => {
                        const isToday = h.dayOfWeek === today;
                        return (
                          <div
                            key={h.dayOfWeek}
                            className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors ${
                              isToday ? "bg-gold/8 text-foreground" : ""
                            }`}
                          >
                            <span className={`flex items-center gap-2 ${isToday ? "font-semibold" : "text-muted-foreground"}`}>
                              <span className="w-5 text-center font-mono text-[10px] text-gold/50">{shortDays[h.dayOfWeek]}</span>
                              {dayNames[h.dayOfWeek]}
                              {isToday && <span className="rounded-full bg-gold/20 px-1.5 py-px text-[9px] font-bold text-gold">NU</span>}
                            </span>
                            <span className={h.closed ? "text-muted-foreground/40" : `font-mono ${isToday ? "text-gold font-semibold" : ""}`}>
                              {h.closed ? "Gesloten" : `${h.openTime} – ${h.closeTime}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Services */}
              {shop.services.length > 0 && (
                <FadeIn delay={0.2}>
                  <div className="rounded-2xl border border-white/[0.06] p-5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10">
                        <Scissors className="h-3.5 w-3.5 text-gold" />
                      </div>
                      <h3 className="text-sm font-semibold">Diensten</h3>
                    </div>
                    <div className="space-y-1">
                      {shop.services.map((s: { id: string; name: string; duration: number; price: number }) => (
                        <div key={s.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/[0.02]">
                          <div className="min-w-0">
                            <span className="font-medium">{s.name}</span>
                            <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/50">
                              <Clock className="h-2.5 w-2.5" />{s.duration}min
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-sm font-semibold text-gold">{formatPrice(s.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Barbers */}
              {shop.barbers.length > 0 && (
                <FadeIn delay={0.3}>
                  <div className="rounded-2xl border border-white/[0.06] p-5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10">
                        <Star className="h-3.5 w-3.5 text-gold" />
                      </div>
                      <h3 className="text-sm font-semibold">Kappers</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {shop.barbers.map((barber: { id: string; name: string }) => (
                        <div
                          key={barber.id}
                          className="flex items-center gap-2.5 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-gold/15 hover:bg-gold/[0.03]"
                        >
                          <ShopMonogram name={barber.name} size={28} />
                          <span className="text-sm font-medium truncate">{barber.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>

            {/* ── Right Column: Booking + Reviews ── */}
            <div className="lg:col-span-3 space-y-6">
              <FadeIn delay={0.15} direction="right">
                <BookingWizard
                  shopId={shop.id}
                  shopName={shop.name}
                  services={shop.services}
                  barbers={shop.barbers}
                  businessHours={shop.businessHours}
                />
              </FadeIn>

              <FadeIn delay={0.25} direction="right">
                <ReviewSection
                  shopId={shop.id}
                  reviews={shop.reviews}
                  avgRating={shop.avgRating}
                />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
