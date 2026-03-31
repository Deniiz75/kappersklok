import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/db";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { Check, Clock, XCircle, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Betaling — Kappersklok",
};

export const dynamic = "force-dynamic";

export default async function BetalingPage() {
  const session = await getSession();

  // Niet ingelogd → terug naar registratie
  if (!session) redirect("/registreren/aanmelden");

  // Haal shop + laatste betaling op
  const { data: shop } = await supabase
    .from("Shop")
    .select("id, name, status")
    .eq("userId", session.userId)
    .single();

  if (!shop) redirect("/registreren/aanmelden");

  // Shop al actief → door naar dashboard
  if (shop.status === "ACTIVE") redirect("/dashboard");

  // Check de meest recente betaling
  const { data: payment } = await supabase
    .from("Payment")
    .select("status, mollieId")
    .eq("shopId", shop.id)
    .order("createdAt", { ascending: false })
    .limit(1)
    .single();

  const paymentStatus = payment?.status || "PENDING";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center">
        <Logo size={44} className="mx-auto mb-8" />

        {paymentStatus === "PAID" ? (
          <>
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 mx-auto h-24 w-24 rounded-full bg-gold/20 blur-xl" />
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/10">
                <Check className="h-8 w-8 text-gold" strokeWidth={3} />
              </div>
            </div>
            <h1 className="font-heading text-3xl font-bold">
              Betaling <span className="text-gold">geslaagd!</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Uw kapperszaak <strong>{shop.name}</strong> is geactiveerd.
              U kunt nu direct aan de slag.
            </p>
            <ButtonLink
              href="/dashboard"
              className="mt-8 bg-gold text-background hover:bg-gold-hover font-semibold px-8"
            >
              Ga naar uw dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </>
        ) : paymentStatus === "FAILED" ? (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-destructive/50 bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="font-heading text-3xl font-bold">
              Betaling mislukt
            </h1>
            <p className="mt-3 text-muted-foreground">
              De betaling is niet gelukt. Probeer het opnieuw om uw
              kapperszaak te activeren.
            </p>
            <ButtonLink
              href="/dashboard"
              className="mt-8 bg-gold text-background hover:bg-gold-hover font-semibold px-8"
            >
              Opnieuw proberen
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/30 bg-gold/5">
              <Clock className="h-8 w-8 text-gold/60" />
            </div>
            <h1 className="font-heading text-3xl font-bold">
              Betaling wordt <span className="text-gold">verwerkt</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Uw betaling wordt verwerkt. Dit kan enkele minuten duren.
              De pagina wordt automatisch ververst.
            </p>
            <meta httpEquiv="refresh" content="5" />
            <ButtonLink
              href="/dashboard"
              className="mt-8 border border-border bg-surface text-foreground hover:bg-muted px-8"
            >
              Ga naar dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </>
        )}
      </div>
    </div>
  );
}
