"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelWaitlistEntry } from "@/lib/booking-actions";

export function WaitlistActions({ entryId, customerEmail }: { entryId: string; customerEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    await cancelWaitlistEntry(entryId, customerEmail);
    router.refresh();
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-[10px] text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
    >
      {loading ? "Verwijderen..." : "Verwijderen"}
    </button>
  );
}
