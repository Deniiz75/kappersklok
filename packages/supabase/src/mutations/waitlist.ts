import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { timeToMinutes } from "@kappersklok/shared";

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 25; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export const waitlistSchema = z.object({
  shopId: z.string().min(1),
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
  customerName: z.string().min(1, "Naam is verplicht"),
  customerEmail: z.string().email("Ongeldig e-mailadres"),
  customerPhone: z.string().optional(),
});

export async function joinWaitlist(supabase: SupabaseClient, data: unknown): Promise<{ success: boolean; error?: string }> {
  const parsed = waitlistSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;

  const today = new Date().toISOString().split("T")[0];
  if (d.date <= today) {
    return { success: false, error: "U kunt alleen op de wachtlijst voor een toekomstige datum." };
  }

  const { data: existing } = await supabase
    .from("WaitlistEntry")
    .select("id")
    .eq("customerEmail", d.customerEmail)
    .eq("barberId", d.barberId)
    .eq("date", d.date)
    .eq("serviceId", d.serviceId)
    .eq("status", "WAITING")
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: "U staat al op de wachtlijst voor deze dag." };
  }

  const { error } = await supabase.from("WaitlistEntry").insert({
    id: generateId(),
    shopId: d.shopId,
    barberId: d.barberId,
    serviceId: d.serviceId,
    date: d.date,
    customerName: d.customerName,
    customerEmail: d.customerEmail,
    customerPhone: d.customerPhone || null,
    status: "WAITING",
  });

  if (error) {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }

  return { success: true };
}

export async function cancelWaitlistEntry(supabase: SupabaseClient, entryId: string, customerEmail: string): Promise<{ success: boolean; error?: string }> {
  const { data: entry } = await supabase
    .from("WaitlistEntry")
    .select("id, customerEmail")
    .eq("id", entryId)
    .eq("status", "WAITING")
    .single();

  if (!entry || entry.customerEmail !== customerEmail) {
    return { success: false, error: "Wachtlijst-inschrijving niet gevonden." };
  }

  await supabase.from("WaitlistEntry").update({ status: "CANCELLED" }).eq("id", entryId);
  return { success: true };
}

export interface WaitlistNotifyEntry {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceDuration: number;
}

/**
 * Find waitlisted customers that should be notified about a freed slot.
 * Returns entries + shop/barber details. Email sending is handled by the caller.
 */
export async function notifyWaitlistForCancellation(
  supabase: SupabaseClient,
  shopId: string,
  barberId: string,
  date: string,
  cancelledStartTime: string,
  cancelledEndTime: string,
): Promise<{ entries: WaitlistNotifyEntry[]; shop: { name: string; slug: string } | null; barber: { name: string } | null }> {
  const cancelledDuration = timeToMinutes(cancelledEndTime) - timeToMinutes(cancelledStartTime);

  const { data: rawEntries } = await supabase
    .from("WaitlistEntry")
    .select("id, customerName, customerEmail, serviceId")
    .eq("shopId", shopId)
    .eq("barberId", barberId)
    .eq("date", date)
    .eq("status", "WAITING");

  if (!rawEntries || rawEntries.length === 0) {
    return { entries: [], shop: null, barber: null };
  }

  const serviceIds = [...new Set(rawEntries.map((e) => e.serviceId))];
  const { data: services } = await supabase
    .from("Service")
    .select("id, duration")
    .in("id", serviceIds);

  const durationMap = new Map((services || []).map((s) => [s.id, s.duration]));

  const [{ data: shop }, { data: barber }] = await Promise.all([
    supabase.from("Shop").select("name, slug").eq("id", shopId).single(),
    supabase.from("Barber").select("name").eq("id", barberId).single(),
  ]);

  const qualifying: WaitlistNotifyEntry[] = [];
  const notifiedIds: string[] = [];

  for (const entry of rawEntries) {
    const serviceDuration = durationMap.get(entry.serviceId) || 0;
    if (serviceDuration > cancelledDuration) continue;
    qualifying.push({ ...entry, serviceDuration });
    notifiedIds.push(entry.id);
  }

  if (notifiedIds.length > 0) {
    await supabase
      .from("WaitlistEntry")
      .update({ status: "NOTIFIED", notifiedAt: new Date().toISOString() })
      .in("id", notifiedIds);
  }

  return { entries: qualifying, shop, barber };
}
