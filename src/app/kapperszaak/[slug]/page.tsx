import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShopBySlug } from "@/lib/db";
import { HeroBanner } from "@/components/hero-banner";
import { LocalBusinessSchema } from "@/components/json-ld";
import { ShopMonogram } from "@/components/shop-monogram";
import { BookingWizard } from "@/components/booking-wizard";
import { MapPin, Phone, Instagram, Clock, Euro } from "lucide-react";

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

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default async function KapperszaakPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  const address = [shop.street, shop.houseNumber].filter(Boolean).join(" ");
  const location = [address, shop.postalCode, shop.city].filter(Boolean).join(", ");

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
      <HeroBanner title={shop.name} subtitle={shop.city || undefined} />

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left column — info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="flex items-center gap-4">
                  <ShopMonogram name={shop.name} size={56} />
                  <div>
                    <h2 className="font-heading text-lg font-bold">{shop.name}</h2>
                    <p className="text-sm text-muted-foreground">{shop.contactName}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {location && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span className="text-muted-foreground">{location}</span>
                    </div>
                  )}
                  {shop.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 shrink-0 text-gold" />
                      <a href={`tel:${shop.phone}`} className="text-muted-foreground hover:text-foreground">{shop.phone}</a>
                    </div>
                  )}
                  {shop.instagram && (
                    <div className="flex items-center gap-3 text-sm">
                      <Instagram className="h-4 w-4 shrink-0 text-gold" />
                      <a href={`https://instagram.com/${shop.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        @{shop.instagram.replace("@", "")}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Business hours */}
              {shop.businessHours.length > 0 && (
                <div className="rounded-lg border border-border bg-surface p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">Openingstijden</h3>
                  <div className="mt-3 space-y-1.5">
                    {shop.businessHours.map((h: { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }) => (
                      <div key={h.dayOfWeek} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{dayNames[h.dayOfWeek]}</span>
                        <span className={h.closed ? "text-muted-foreground" : "font-mono"}>
                          {h.closed ? "Gesloten" : `${h.openTime} - ${h.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {shop.services.length > 0 && (
                <div className="rounded-lg border border-border bg-surface p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">Diensten</h3>
                  <div className="mt-3 space-y-2">
                    {shop.services.map((s: { id: string; name: string; duration: number; price: number }) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span>{s.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground flex items-center gap-0.5 inline-flex">
                            <Clock className="h-3 w-3" />{s.duration}min
                          </span>
                        </div>
                        <span className="font-semibold text-gold">{formatPrice(s.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column — booking */}
            <div className="lg:col-span-3">
              <BookingWizard
                shopId={shop.id}
                shopName={shop.name}
                services={shop.services}
                barbers={shop.barbers}
                businessHours={shop.businessHours}
              />

              {/* Barbers */}
              {shop.barbers.length > 0 && (
                <div className="mt-6 rounded-lg border border-border bg-surface p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
                    Kappers ({shop.barbers.length})
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {shop.barbers.map((barber: { id: string; name: string }) => (
                      <div
                        key={barber.id}
                        className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
                      >
                        <ShopMonogram name={barber.name} size={28} />
                        <span className="text-sm">{barber.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
