"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16">
      <div className="mx-auto max-w-sm px-4 text-center">
        <p className="text-4xl">⚠️</p>
        <h2 className="mt-4 font-heading text-xl font-bold">Dashboard fout</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Er ging iets mis bij het laden van het dashboard.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/50">
          {error.digest || error.message}
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={reset} className="bg-gold text-background hover:bg-gold-hover font-semibold">
            Probeer opnieuw
          </Button>
          <Button
            onClick={() => window.location.href = "/login"}
            variant="outline"
            className="border-border"
          >
            Opnieuw inloggen
          </Button>
        </div>
      </div>
    </div>
  );
}
