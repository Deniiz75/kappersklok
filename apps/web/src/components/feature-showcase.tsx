import { CalendarDays, Bell, Monitor, CheckCircle } from "lucide-react";

const features = [
  {
    title: "Slimme planning",
    description: "Krachtige agenda met onbeperkte boekingen, klanten en medewerkers.",
    points: [
      "Klanten boeken 24/7 online",
      "Automatische herinneringen via e-mail",
      "Vaste afspraken die automatisch herhalen",
    ],
    icon: CalendarDays,
  },
  {
    title: "Minder no-shows",
    description: "Verminder no-shows met automatische herinneringen en slim klantbeheer.",
    points: [
      "Geautomatiseerde afspraakherinneringen",
      "Gemiddeld 70% minder no-shows",
      "Wachtlijst voor populaire tijdsloten",
    ],
    icon: Bell,
  },
  {
    title: "Digi-box scherm",
    description: "Uniek in Nederland: een live scherm in je zaak dat toont wie er aan de beurt is.",
    points: [
      "Sluit aan op elke TV of scherm",
      "Klanten zien direct de volgorde",
      "Geen discussies meer over beurten",
    ],
    icon: Monitor,
  },
];

export function FeatureShowcase() {
  return (
    <div className="space-y-20 md:space-y-28">
      {features.map((feature, i) => (
        <div
          key={feature.title}
          className={`flex flex-col items-center gap-10 md:flex-row md:gap-16 ${
            i % 2 === 1 ? "md:flex-row-reverse" : ""
          }`}
        >
          {/* Text side */}
          <div className="flex-1">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-4">
              <feature.icon className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground md:text-3xl">
              {feature.title}
            </h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
            <ul className="mt-5 space-y-3">
              {feature.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[#2ECC71] mt-0.5" />
                  <span className="text-sm text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual side — placeholder card */}
          <div className="flex-1 w-full">
            <div className="rounded-2xl bg-muted p-6 md:p-10 aspect-[4/3] flex items-center justify-center">
              <div className="text-center">
                <feature.icon className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Feature screenshot</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
