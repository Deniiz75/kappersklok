import type { Metadata } from "next";
import Link from "next/link";
import { getActiveShopsWithBarbers } from "@/lib/db";

export const dynamic = "force-dynamic";
import { HeroBanner } from "@/components/hero-banner";
import { ShopMonogram } from "@/components/shop-monogram";
import { MapPin, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Kapper Zoeken",
  description:
    "Vind een kapper bij jou in de buurt. Bekijk alle aangesloten kappers en barbershops op Kappersklok.",
};

export default async function KapperZoekenPage() {
  const shops = await getActiveShopsWithBarbers();

  const cities = [...new Set(shops.map((s) => s.city).filter(Boolean))].sort();

  return (
    <>
      <HeroBanner
        title="Vind jouw kapper"
        subtitle={`${shops.length} kappers door heel Nederland`}
      />

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          {/* City chips */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {cities.map((city) => {
              const count = shops.filter((s) => s.city === city).length;
              return (
                <span
                  key={city}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground"
                >
                  {city}
                  <span className="ml-1 text-gold">{count}</span>
                </span>
              );
            })}
          </div>

          {/* Shop grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop, i) => (
              <Link
                key={shop.id}
                href={`/kapperszaak/${shop.slug}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all hover:border-gold/40 hover:bg-surface/80"
                style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
              >
                <div className="flex items-start gap-4">
                  <ShopMonogram name={shop.name} size={56} />
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-heading text-sm font-bold group-hover:text-gold transition-colors">
                      {shop.name}
                    </h3>
                    {shop.city && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{shop.city}</span>
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3 shrink-0" />
                      <span>{shop.barbers.length} kappers</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-gold" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
