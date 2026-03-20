import { getSession } from "@/lib/auth";
import { getShopByUserId } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Euro } from "lucide-react";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default async function DienstenPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const shop = await getShopByUserId(session.userId);
  if (!shop) redirect("/");

  const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Diensten & Openingstijden</h1>
      <p className="mt-1 text-muted-foreground">Beheer uw diensten en openingstijden</p>

      {/* Services */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Diensten ({shop.services.length})</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {shop.services.map((service: { id: string; name: string; duration: number; price: number; active: boolean }) => (
            <Card key={service.id} className="border-border bg-surface">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    service.active ? "bg-gold/10 text-gold" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {service.active ? "Actief" : "Inactief"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Business Hours */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Openingstijden</h2>
        <div className="mt-3">
          <Card className="border-border bg-surface">
            <CardContent className="p-0">
              {shop.businessHours.map((h: { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }, i: number) => (
                <div
                  key={h.dayOfWeek}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < shop.businessHours.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-sm font-medium w-28">{dayNames[h.dayOfWeek]}</span>
                  {h.closed ? (
                    <span className="text-sm text-muted-foreground">Gesloten</span>
                  ) : (
                    <span className="text-sm font-mono">
                      {h.openTime} — {h.closeTime}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
