"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateShopStatus } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, Ban } from "lucide-react";

export function ShopActions({ shopId, currentStatus, slug }: { shopId: string; currentStatus: string; slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function handleStatus(status: "ACTIVE" | "SUSPENDED") {
    setLoading(status);
    await updateShopStatus(shopId, status);
    router.refresh();
    setLoading("");
  }

  return (
    <>
      <a
        href={`/kapperszaak/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ExternalLink className="h-3 w-3" /> Bekijk pagina
      </a>
      {currentStatus !== "ACTIVE" && (
        <Button
          size="sm"
          onClick={() => handleStatus("ACTIVE")}
          disabled={loading === "ACTIVE"}
          className="bg-gold text-background hover:bg-gold-hover text-xs h-8"
        >
          <Check className="h-3 w-3 mr-1" /> Activeer
        </Button>
      )}
      {currentStatus !== "SUSPENDED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatus("SUSPENDED")}
          disabled={loading === "SUSPENDED"}
          className="border-destructive/30 text-destructive hover:bg-destructive/5 text-xs h-8"
        >
          <Ban className="h-3 w-3 mr-1" /> Blokkeer
        </Button>
      )}
    </>
  );
}
