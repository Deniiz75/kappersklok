"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/db";
import { updateShopStatus } from "@/lib/admin-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Check, X, Eye } from "lucide-react";
import Link from "next/link";

interface Shop {
  id: string;
  name: string;
  slug: string;
  contactName: string;
  email: string;
  city: string | null;
  status: string;
  createdAt: string;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PENDING" | "SUSPENDED">("ALL");
  const [loading, setLoading] = useState(true);

  async function loadShops() {
    let query = supabase
      .from("Shop")
      .select("id, name, slug, contactName, email, city, status, createdAt")
      .order("createdAt", { ascending: false });

    if (filter !== "ALL") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setShops(data || []);
    setLoading(false);
  }

  useEffect(() => { loadShops(); }, [filter]);

  async function handleStatus(shopId: string, status: "ACTIVE" | "SUSPENDED") {
    await updateShopStatus(shopId, status);
    loadShops();
  }

  const filters = [
    { value: "ALL" as const, label: "Alle" },
    { value: "ACTIVE" as const, label: "Actief" },
    { value: "PENDING" as const, label: "Wachtend" },
    { value: "SUSPENDED" as const, label: "Geblokkeerd" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Kapperszaken</h1>
      <p className="mt-1 text-muted-foreground">Beheer alle geregistreerde kapperszaken</p>

      <div className="mt-4 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              filter === f.value
                ? "bg-gold/10 text-gold border border-gold"
                : "bg-surface border border-border text-muted-foreground hover:border-gold/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Laden...</p>
      ) : shops.length === 0 ? (
        <Card className="mt-6 border-border bg-surface">
          <CardContent className="p-6 text-center text-muted-foreground">
            Geen kapperszaken gevonden.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {shops.map((shop) => (
            <Card key={shop.id} className="border-border bg-surface">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{shop.name}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                      shop.status === "ACTIVE" ? "bg-gold/10 text-gold"
                        : shop.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {shop.status === "ACTIVE" ? "Actief" : shop.status === "PENDING" ? "Wachtend" : "Geblokkeerd"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{shop.contactName} — {shop.email}</p>
                  {shop.city && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />{shop.city}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/kapperszaak/${shop.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Eye className="h-3 w-3" />Bekijk
                  </Link>
                  {shop.status !== "ACTIVE" && (
                    <Button
                      onClick={() => handleStatus(shop.id, "ACTIVE")}
                      className="h-7 bg-gold/10 text-gold hover:bg-gold/20 text-xs px-2"
                    >
                      <Check className="h-3 w-3 mr-1" />Activeer
                    </Button>
                  )}
                  {shop.status !== "SUSPENDED" && (
                    <Button
                      onClick={() => handleStatus(shop.id, "SUSPENDED")}
                      variant="outline"
                      className="h-7 border-destructive/30 text-destructive hover:bg-destructive/10 text-xs px-2"
                    >
                      <X className="h-3 w-3 mr-1" />Blokkeer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
