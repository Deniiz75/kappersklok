import createMollieClient from "@mollie/api-client";
import { supabase } from "@/lib/db";

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Maak een Mollie betaling aan voor registratie (€59 = €30 eenmalig + €29 eerste maand).
 * Maakt ook een Payment record in de database.
 * Returns de checkout URL waar de klant naartoe moet.
 */
export async function createRegistrationPayment(
  shopId: string,
  shopName: string,
  email: string
): Promise<{ checkoutUrl: string; paymentId: string }> {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const payment = await mollieClient.payments.create({
    amount: { currency: "EUR", value: "59.00" },
    description: `Kappersklok registratie — ${shopName}`,
    redirectUrl: `${appUrl}/registreren/betaling`,
    webhookUrl: `${appUrl}/api/webhooks/mollie`,
    metadata: { shopId, type: "registration" },
  });

  const checkoutUrl = payment.getCheckoutUrl();
  if (!checkoutUrl) throw new Error("Geen checkout URL ontvangen van Mollie");

  // Sla Payment record op in database
  const { error } = await supabase.from("Payment").insert({
    shopId,
    amount: 5900,
    description: `Registratie + eerste maand (${period})`,
    status: "PENDING",
    period,
    mollieId: payment.id,
    checkoutUrl,
  });
  if (error) throw error;

  return { checkoutUrl, paymentId: payment.id };
}

/**
 * Verwerk een Mollie webhook: haal betaalstatus op en update database.
 * Als betaald → activeer de shop.
 */
export async function handleMollieWebhook(molliePaymentId: string) {
  const payment = await mollieClient.payments.get(molliePaymentId);

  // Vind onze Payment record
  const { data: dbPayment, error: findError } = await supabase
    .from("Payment")
    .select("id, shopId, status")
    .eq("mollieId", molliePaymentId)
    .single();

  if (findError || !dbPayment) return;

  // Map Mollie status naar onze PaymentStatus
  let newStatus: "PAID" | "PENDING" | "FAILED" = "PENDING";
  if (payment.status === "paid") newStatus = "PAID";
  else if (["failed", "canceled", "expired"].includes(payment.status)) newStatus = "FAILED";

  // Update Payment record
  await supabase
    .from("Payment")
    .update({
      status: newStatus,
      method: payment.method || null,
      paidAt: newStatus === "PAID" ? new Date().toISOString() : null,
    })
    .eq("id", dbPayment.id);

  // Als betaald → activeer shop
  if (newStatus === "PAID" && dbPayment.status !== "PAID") {
    await supabase
      .from("Shop")
      .update({ status: "ACTIVE" })
      .eq("id", dbPayment.shopId);
  }
}

/**
 * Maak een nieuwe betaallink aan voor een bestaande shop (bijv. dashboard gate).
 */
export async function createPaymentForShop(
  shopId: string,
  shopName: string
): Promise<string> {
  const result = await createRegistrationPayment(shopId, shopName, "");
  return result.checkoutUrl;
}
