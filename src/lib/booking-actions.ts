"use server";

import { supabase } from "@/lib/db";
import { z } from "zod";
import { sendEmail, bookingConfirmationEmail, barberNotificationEmail } from "@/lib/email";

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

    // Create appointment
    const { data: appointment, error } = await supabase
      .from("Appointment")
      .insert({
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
      })
      .select("id, cancelToken")
      .single();

    if (error || !appointment) throw error;

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
  } catch {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}

export async function cancelAppointment(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: appointment, error } = await supabase
      .from("Appointment")
      .select("id, date, startTime")
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
    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis." };
  }
}
