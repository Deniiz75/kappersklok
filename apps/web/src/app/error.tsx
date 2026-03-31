"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center py-24">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <span className="text-2xl">!</span>
        </div>
        <h1 className="mt-6 font-heading text-2xl font-bold">
          Er ging iets mis
        </h1>
        <p className="mt-3 text-muted-foreground">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw.
        </p>
        <Button
          onClick={reset}
          className="mt-6 bg-gold text-background hover:bg-gold-hover font-semibold"
        >
          Probeer opnieuw
        </Button>
      </div>
    </section>
  );
}
