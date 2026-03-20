import { getSession } from "@/lib/auth";
import { getShopByUserId, getAppointmentsForShop } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;
}

export default async function AfsprakenPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const shop = await getShopByUserId(session.userId);
  if (!shop) redirect("/");

  const appointments = await getAppointmentsForShop(shop.id);
  const today = new Date().toISOString().split("T")[0];

  const upcoming = appointments.filter(
    (a) => a.date >= today && a.status !== "CANCELLED"
  );
  const past = appointments.filter(
    (a) => a.date < today || a.status === "CANCELLED"
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Afspraken</h1>
      <p className="mt-1 text-muted-foreground">
        Beheer alle afspraken van {shop.name}
      </p>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">
          Komende afspraken ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <Card className="mt-3 border-border bg-surface">
            <CardContent className="p-6 text-center text-muted-foreground">
              Geen komende afspraken. Zodra klanten boeken verschijnen ze hier.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 space-y-2">
            {upcoming.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-gold">{apt.startTime}</p>
                    <p className="text-xs text-muted-foreground">{apt.endTime}</p>
                  </div>
                  <div>
                    <p className="font-medium">{apt.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.service?.name} — {apt.barber?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(apt.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {apt.customerPhone && (
                    <a
                      href={`tel:${apt.customerPhone}`}
                      className="text-xs text-muted-foreground hover:text-gold"
                    >
                      {apt.customerPhone}
                    </a>
                  )}
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold">
                    {apt.status === "CONFIRMED" ? "Bevestigd" : apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Afgelopen ({past.length})
          </h2>
          <div className="mt-3 space-y-2 opacity-60">
            {past.slice(0, 10).map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono">{apt.startTime}</span>
                  <span className="text-sm">{apt.customerName}</span>
                  <span className="text-xs text-muted-foreground">{apt.service?.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(apt.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
