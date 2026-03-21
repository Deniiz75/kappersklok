"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const tabs = [
  { key: "overzicht", label: "Overzicht" },
  { key: "kappers", label: "Kappers" },
  { key: "diensten", label: "Diensten" },
  { key: "uren", label: "Openingstijden" },
  { key: "afspraken", label: "Afspraken" },
  { key: "reviews", label: "Reviews" },
  { key: "betalingen", label: "Betalingen" },
];

export function ShopDetailTabs({ shopId }: { shopId: string }) {
  const searchParams = useSearchParams();
  const current = searchParams.get("tab") || "overzicht";

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/dashboard/shops/${shopId}?tab=${tab.key}`}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors ${
            current === tab.key
              ? "bg-gold/10 text-gold border border-gold/30"
              : "text-muted-foreground hover:bg-surface border border-transparent"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
