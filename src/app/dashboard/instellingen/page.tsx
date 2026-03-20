import { getSession } from "@/lib/auth";
import { getShopByUserId } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Instagram, Globe, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InstellingenPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const shop = await getShopByUserId(session.userId);
  if (!shop) redirect("/");

  const address = [shop.street, shop.houseNumber].filter(Boolean).join(" ");
  const location = [address, shop.postalCode, shop.city].filter(Boolean).join(", ");

  const details = [
    { icon: Mail, label: "E-mail", value: shop.email },
    { icon: Phone, label: "Telefoon (bedrijf)", value: shop.phone },
    { icon: Phone, label: "Telefoon (privé)", value: shop.privatePhone },
    { icon: MapPin, label: "Adres", value: location || null },
    { icon: Instagram, label: "Instagram", value: shop.instagram },
    { icon: Globe, label: "Land", value: shop.country },
    { icon: Users, label: "Max. kappers", value: String(shop.barbersCount) },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Instellingen</h1>
      <p className="mt-1 text-muted-foreground">Gegevens van {shop.name}</p>

      <Card className="mt-6 border-border bg-surface">
        <CardContent className="p-0">
          {details.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center gap-4 px-4 py-3 ${
                i < details.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0 text-gold" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm truncate">
                  {item.value || <span className="text-muted-foreground italic">Niet ingevuld</span>}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Barbers */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">
          Kappers ({shop.barbers.filter((b: { active: boolean }) => b.active).length} actief)
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {shop.barbers.map((barber: { id: string; name: string; active: boolean }) => (
            <div
              key={barber.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2"
            >
              <span className="text-sm">{barber.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  barber.active ? "bg-gold/10 text-gold" : "bg-muted text-muted-foreground"
                }`}
              >
                {barber.active ? "Actief" : "Inactief"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Account</h2>
        <Card className="mt-3 border-border bg-surface">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Ingelogd als <span className="text-foreground font-medium">{session.email}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Rol: <span className="text-foreground">{session.role === "ADMIN" ? "Beheerder" : "Kapper"}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Status: <span className="text-gold font-medium">{shop.status}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
