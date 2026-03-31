import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info, Scissors, UserPlus, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HeroBanner } from "@/components/hero-banner";

export const metadata: Metadata = {
  title: "Informatie",
  description:
    "Informatie over Kappersklok. Makkelijk en snel een afspraak maken bij uw kapper zonder registratie.",
};

const boxes = [
  {
    icon: Info,
    title: "Algemeen",
    description:
      "Kappersklok zorgt ervoor dat u snel en simpel een afspraak kunt maken bij de lokale kapper. U kunt een afspraak maken wanneer u dat wilt. Met enkele klikken ziet u alle beschikbare data en tijden.",
    link: { href: "/contact", label: "Staat uw kapper er niet tussen? Neem contact op" },
  },
  {
    icon: Scissors,
    title: "Kappers",
    description: "Bent u een kapper en wilt u meer informatie over wat Kappersklok voor u kan betekenen?",
    link: { href: "/registreren", label: "Klik hier voor meer info" },
  },
  {
    icon: UserPlus,
    title: "Registreren",
    description: "Wilt u direct uw kapperszaak registreren en online afspraken ontvangen?",
    link: { href: "/registreren/aanmelden", label: "Klik hier om uw zaak te registreren" },
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Heeft u een vraag? Bekijk onze veelgestelde vragen of neem contact met ons op.",
    link: { href: "/contact", label: "Bekijk de veelgestelde vragen" },
  },
];

export default function InformatiePage() {
  return (
    <>
      <HeroBanner title="Informatie" />
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-2">
            {boxes.map((box) => (
              <Card key={box.title} className="border-border bg-surface">
                <CardContent className="p-6">
                  <box.icon className="h-8 w-8 text-gold" />
                  <h2 className="mt-4 text-xl font-bold">{box.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{box.description}</p>
                  <Link
                    href={box.link.href}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-gold-hover transition-colors"
                  >
                    {box.link.label}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
