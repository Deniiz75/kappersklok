"use server";

import { supabase } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail, bookingConfirmationEmail, barberNotificationEmail, cancellationConfirmationEmail } from "@/lib/email";

function generateId(): string {
  return crypto.randomBytes(16).toString("hex").slice(0, 25);
}

const bookingSchema = z.object({
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

type BookingResult =
  | { success: true; appointmentId: string }
  | { success: false; error: string };

export async function createAppointment(data: unknown): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;

  try {
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

    // Create appointment — id + cancelToken moeten expliciet omdat Supabase geen Prisma defaults kent
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
      console.error("[createAppointment] Insert failed:", error?.message, error?.details, error?.hint);
      throw error;
    }

    // Get shop + barber + service names for email
    const { data: shop } = await supabase.from("Shop").select("name, email").eq("id", d.shopId).single();
    const { data: barber } = await supabase.from("Barber").select("name").eq("id", d.barberId).single();
    const { data: service } = await supabase.from("Service").select("name").eq("id", d.serviceId).single();

    if (shop && barber && service) {
      const confirmEmail = bookingConfirmationEmail({
        customerName: d.customerName,
        shopName: shop.name,
        serviceName: service.name,
        date: d.date,
        time: d.startTime,
        barberName: barber.name,
        cancelToken: appointment.cancelToken || appointment.id,
      });
      sendEmail({ to: d.customerEmail, ...confirmEmail }).catch(() => {});

      const notifyEmail = barberNotificationEmail({
        customerName: d.customerName,
        serviceName: service.name,
        date: d.date,
        time: d.startTime,
        barberName: barber.name,
        customerPhone: d.customerPhone,
      });
      sendEmail({ to: shop.email, ...notifyEmail }).catch(() => {});
    }

    return { success: true, appointmentId: appointment.id };
  } catch (err) {
    console.error("[createAppointment] Error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Fout bij het boeken: ${msg}` };
  }
}

const rescheduleSchema = z.object({
  appointmentId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

export async function rescheduleAppointment(data: unknown): Promise<{ success: boolean; error?: string }> {
  const parsed = rescheduleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;

  try {
    const { data: appointment, error } = await supabase
      .from("Appointment")
      .select("id, date, startTime, barberId, shopId, serviceId, customerName, customerEmail, customerPhone")
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

    // Check conflict on new timeslot
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

    // Send reschedule confirmation email
    const { data: shop } = await supabase.from("Shop").select("name, email").eq("id", appointment.shopId).single();
    const { data: barber } = await supabase.from("Barber").select("name").eq("id", appointment.barberId).single();
    const { data: service } = await supabase.from("Service").select("name").eq("id", appointment.serviceId).single();

    if (shop && barber && service) {
      const confirmEmail = bookingConfirmationEmail({
        customerName: appointment.customerName,
        shopName: shop.name,
        serviceName: service.name,
        date: d.date,
        time: d.startTime,
        barberName: barber.name,
        cancelToken: d.appointmentId,
      });
      confirmEmail.subject = `Herplannen: Afspraak bij ${shop.name} verplaatst`;
      sendEmail({ to: appointment.customerEmail, ...confirmEmail }).catch(() => {});
    }

    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}

export async function getAppointmentForReschedule(appointmentId: string) {
  const { data, error } = await supabase
    .from("Appointment")
    .select("id, date, startTime, endTime, shopId, barberId, serviceId, customerEmail, status, shop:Shop(name, slug), barber:Barber(name), service:Service(name, duration, price)")
    .eq("id", appointmentId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function cancelAppointment(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: appointment, error } = await supabase
      .from("Appointment")
      .select("id, date, startTime, customerName, customerEmail, shopId, serviceId")
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

    // Send cancellation confirmation email
    const { data: shop } = await supabase.from("Shop").select("name").eq("id", appointment.shopId).single();
    const { data: service } = await supabase.from("Service").select("name").eq("id", appointment.serviceId).single();

    if (shop && service) {
      const cancelEmail = cancellationConfirmationEmail({
        customerName: appointment.customerName,
        shopName: shop.name,
        serviceName: service.name,
        date: appointment.date,
        time: appointment.startTime,
      });
      sendEmail({ to: appointment.customerEmail, ...cancelEmail }).catch(() => {});
    }

    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis." };
  }
}
