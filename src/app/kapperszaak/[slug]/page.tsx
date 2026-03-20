import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShopBySlug } from "@/lib/db";
import { HeroBanner } from "@/components/hero-banner";
import { MapPin, Phone, Instagram } from "lucide-react";

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

export default async function KapperszaakPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);

  if (!shop) notFound();

  const address = [shop.street, shop.houseNumber].filter(Boolean).join(" ");
  const location = [address, shop.postalCode, shop.city].filter(Boolean).join(", ");

  return (
    <>
      <HeroBanner title={shop.name} subtitle={shop.city || undefined} />
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-lg border border-border bg-surface p-8">
            <h2 className="font-heading text-2xl font-bold">{shop.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Eigenaar: {shop.contactName}
            </p>

            <div className="mt-6 space-y-3">
              {location && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span className="text-muted-foreground">{location}</span>
                </div>
              )}
              {shop.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-gold" />
                  <a href={`tel:${shop.phone}`} className="text-muted-foreground hover:text-foreground">
                    {shop.phone}
                  </a>
                </div>
              )}
              {shop.instagram && (
                <div className="flex items-center gap-3 text-sm">
                  <Instagram className="h-4 w-4 shrink-0 text-gold" />
                  <a
                    href={`https://instagram.com/${shop.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    @{shop.instagram.replace("@", "")}
                  </a>
                </div>
              )}
            </div>

            {shop.barbers.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
                  Kappers ({shop.barbers.length})
                </h3>
                <ul className="mt-3 space-y-2">
                  {shop.barbers.map((barber: { id: string; name: string }) => (
                    <li
                      key={barber.id}
                      className="rounded-md border border-border bg-background px-4 py-2 text-sm"
                    >
                      {barber.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
