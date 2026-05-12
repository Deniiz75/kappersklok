import Link from "next/link";
import { Smartphone, ArrowRight, Scissors } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { OrganizationSchema } from "@/components/json-ld";
import { FadeIn } from "@/components/motion";

export const metadata = {
  title: "Kappersklok — Boekingssoftware voor kappers",
  description:
    "Voor kappers: online afspraken, klantbeheer en facturatie in één systeem. Voor klanten: binnenkort beschikbaar in de app.",
};

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 py-20 md:py-28">
          <FadeIn>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-medium text-gold">
                <Scissors className="h-3 w-3" />
                Boekingssoftware voor kappers
              </span>
              <h1 className="mt-6 font-heading text-4xl font-bold leading-tight md:text-6xl">
                Uw kapperszaak,{" "}
                <span className="text-gold">slim georganiseerd</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
                Online boekingen, klantadministratie en uw eigen dashboard.
                Klanten boeken straks via onze mobiele app — u beheert alles
                vanuit één plek.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonLink
                  href="/registreren"
                  className="h-12 rounded-full bg-foreground px-7 text-sm font-semibold text-white hover:bg-foreground/90"
                >
                  Sluit uw zaak aan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ButtonLink>
                <Link
                  href="/informatie"
                  className="inline-flex h-12 items-center px-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Hoe het werkt
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-border bg-surface/30 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/5">
            <Smartphone className="h-6 w-6 text-gold" />
          </div>
          <h2 className="mt-6 font-heading text-3xl font-bold">
            Bent u klant?{" "}
            <span className="text-gold">De app komt eraan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Boekingen, herinneringen en uw afspraken — alles op uw telefoon.
            Laat uw e-mailadres achter en wij sturen u bericht zodra de app
            beschikbaar is in de App Store en Google Play.
          </p>

          <form
            action="/api/app-notify"
            method="POST"
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="uw@e-mail.nl"
              className="h-11 flex-1 rounded-full border border-border bg-background px-5 text-sm placeholder:text-muted-foreground focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 rounded-full bg-gold px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Houd mij op de hoogte
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Geen spam — alleen één bericht zodra de app live is.
          </p>
        </div>
      </section>
    </>
  );
}
