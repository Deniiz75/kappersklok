import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 25; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export const bookingSchema = z.object({
  shopId: z.string().min(1),
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  customerName: z.string().min(1, "Naam is verplicht"),
  customerEmail: z.string().email("Ongeldig e-mailadres"),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

export type BookingData = z.infer<typeof bookingSchema>;

export type BookingResult =
  | { success: true; appointmentId: string; cancelToken: string }
  | { success: false; error: string };

export async function createAppointment(supabase: SupabaseClient, data: unknown): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;

  // Check conflict
  const { data: existing } = await supabase
    .from("Appointment")
    .select("id")
    .eq("barberId", d.barberId)
    .eq("date", d.date)
    .eq("startTime", d.startTime)
    .eq("status", "CONFIRMED")
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: "Dit tijdslot is al bezet. Kies een ander tijdstip." };
  }

  const appointmentId = generateId();
  const cancelToken = generateId();
  const { data: appointment, error } = await supabase
    .from("Appointment")
    .insert({
      id: appointmentId,
      shopId: d.shopId,
      barberId: d.barberId,
      serviceId: d.serviceId,
      date: d.date,
      startTime: d.startTime,
      endTime: d.endTime,
      customerName: d.customerName,
      customerEmail: d.customerEmail,
      customerPhone: d.customerPhone || null,
      notes: d.notes || null,
      cancelToken,
      updatedAt: new Date().toISOString(),
    })
    .select("id, cancelToken")
    .single();

  if (error || !appointment) {
    console.error("[createAppointment] Insert failed:", error?.message);
    return { success: false, error: "Fout bij het boeken." };
  }

  return { success: true, appointmentId: appointment.id, cancelToken: appointment.cancelToken! };
}

export const rescheduleSchema = z.object({
  appointmentId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

export async function rescheduleAppointment(supabase: SupabaseClient, data: unknown): Promise<{ success: boolean; error?: string; appointment?: Record<string, unknown> }> {
  const parsed = rescheduleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;

  const { data: appointment, error } = await supabase
    .from("Appointment")
    .select("id, date, startTime, barberId, shopId, serviceId, customerName, customerEmail")
    .eq("id", d.appointmentId)
    .eq("status", "CONFIRMED")
    .single();

  if (error || !appointment) {
    return { success: false, error: "Afspraak niet gevonden of al geannuleerd." };
  }

  const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}:00`);
  const hoursUntil = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntil < 2) {
    return { success: false, error: "Herplannen is niet meer mogelijk binnen 2 uur voor de afspraak." };
  }

  const { data: existing } = await supabase
    .from("Appointment")
    .select("id")
    .eq("barberId", appointment.barberId)
    .eq("date", d.date)
    .eq("startTime", d.startTime)
    .eq("status", "CONFIRMED")
    .neq("id", d.appointmentId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: "Dit tijdslot is al bezet. Kies een ander tijdstip." };
  }

  await supabase
    .from("Appointment")
    .update({ date: d.date, startTime: d.startTime, endTime: d.endTime })
    .eq("id", d.appointmentId);

  return { success: true, appointment };
}

export async function cancelAppointment(supabase: SupabaseClient, token: string): Promise<{ success: boolean; error?: string; appointment?: Record<string, unknown> }> {
  const { data: appointment, error } = await supabase
    .from("Appointment")
    .select("id, date, startTime, endTime, customerName, customerEmail, shopId, barberId, serviceId")
    .eq("cancelToken", token)
    .eq("status", "CONFIRMED")
    .single();

  if (error || !appointment) {
    return { success: false, error: "Afspraak niet gevonden of al geannuleerd." };
  }

  const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}:00`);
  const hoursUntil = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntil < 2) {
    return { success: false, error: "Annuleren is niet meer mogelijk binnen 2 uur voor de afspraak. Neem contact op met uw kapper." };
  }

  await supabase.from("Appointment").update({ status: "CANCELLED" }).eq("id", appointment.id);

  return { success: true, appointment };
}

export async function getAppointmentForReschedule(supabase: SupabaseClient, appointmentId: string) {
  const { data, error } = await supabase
    .from("Appointment")
    .select("id, date, startTime, endTime, shopId, barberId, serviceId, customerEmail, status, shop:Shop(name, slug), barber:Barber(name), service:Service(name, duration, price)")
    .eq("id", appointmentId)
    .single();

  if (error || !data) return null;
  return data;
}
