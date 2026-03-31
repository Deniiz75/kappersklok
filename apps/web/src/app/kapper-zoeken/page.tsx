import type { Metadata } from "next";
import Link from "next/link";
import { getActiveShopsWithBarbers } from "@/lib/db";
import { SearchBar } from "@/components/search-bar";
import { HeroBanner } from "@/components/hero-banner";
import { ShopMonogram } from "@/components/shop-monogram";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { MapPin, Users, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kapper Zoeken",
  description:
    "Vind een kapper bij jou in de buurt. Bekijk alle aangesloten kappers en barbershops op Kappersklok.",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function KapperZoekenPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const allShops = await getActiveShopsWithBarbers();

  const query = q?.toLowerCase().trim() || "";
  const shops = query
    ? allShops.filter(
        (s) =>
          s.city?.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query)
      )
    : allShops;

  const cities = [...new Set(allShops.map((s) => s.city).filter(Boolean))].sort();

  return (
    <>
      <HeroBanner
        title={query ? `Kappers in "${q}"` : "Vind jouw kapper"}
        subtitle={`${shops.length} ${query ? "resultaten" : "kappers door heel Nederland"}`}
      />

      <section className="py-8">
        <div className="mx-auto max-w-xl px-4">
          <SearchBar />
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto max-w-6xl px-4">
          {/* City chips */}
          <StaggerContainer stagger={0.03} className="mb-10 flex flex-wrap justify-center gap-2">
            {cities.map((city) => {
              const count = allShops.filter((s) => s.city === city).length;
              const isActive = query === city?.toLowerCase();
              return (
                <StaggerItem key={city}>
                  <Link
                    href={isActive ? "/kapper-zoeken" : `/kapper-zoeken?q=${encodeURIComponent(city!)}`}
                    className={`rounded-full border px-3 py-1 text-xs transition-all duration-200 hover:scale-105 ${
                      isActive
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border bg-surface text-muted-foreground hover:border-gold/30"
                    }`}
                  >
                    {city}
                    <span className="ml-1 text-gold">{count}</span>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {shops.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                Geen kappers gevonden{query ? ` voor "${q}"` : ""}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Probeer een andere stad of bekijk alle kappers
              </p>
            </div>
          ) : (
            <StaggerContainer stagger={0.04} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shops.map((shop) => (
                <StaggerItem key={shop.id}>
                <Link
                  href={`/kapperszaak/${shop.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 card-hover block"
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
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-gold group-hover:translate-x-1" />
                  </div>
                </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>
    </>
  );
}
