"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite, isFavorite } from "@/lib/customer-actions";

interface FavoriteButtonProps {
  shopId: string;
}

export function FavoriteButton({ shopId }: FavoriteButtonProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/klant-profiel");
      if (!res.ok) return;
      const data = await res.json();
      setEmail(data.email);
      const fav = await isFavorite(data.email, shopId);
      setFavorited(fav);
    }
    check();
  }, [shopId]);

  if (!email) return null;

  async function handleToggle() {
    if (!email) return;
    setLoading(true);
    const result = await toggleFavorite(email, shopId);
    if (result.success) {
      setFavorited(result.isFavorite);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:border-gold/40"
      title={favorited ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
    >
      <Heart
        className={`h-3.5 w-3.5 transition-colors ${
          favorited ? "fill-gold text-gold" : "text-muted-foreground"
        }`}
      />
      {favorited ? "Favoriet" : "Favoriet"}
    </button>
  );
}
