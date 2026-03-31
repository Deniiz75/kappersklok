"use server";

import { supabase } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail, bookingConfirmationEmail, barberNotificationEmail, cancellationConfirmationEmail, waitlistConfirmationEmail, waitlistNotificationEmail } from "@/lib/email";

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

    // Notify waitlisted customers
    notifyWaitlistForCancellation(
      appointment.shopId, appointment.barberId, appointment.date,
      appointment.startTime, appointment.endTime,
    ).catch(() => {});

    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis." };
  }
}

// --- Waitlist actions ---

export async function getBookedSlots(barberId: string, date: string): Promise<{ startTime: string; endTime: string }[]> {
  const { data } = await supabase
    .from("Appointment")
    .select("startTime, endTime")
    .eq("barberId", barberId)
    .eq("date", date)
    .eq("status", "CONFIRMED");
  return data || [];
}

const waitlistSchema = z.object({
  shopId: z.string().min(1),
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
  customerName: z.string().min(1, "Naam is verplicht"),
  customerEmail: z.string().email("Ongeldig e-mailadres"),
  customerPhone: z.string().optional(),
});

export async function joinWaitlist(data: unknown): Promise<{ success: boolean; error?: string }> {
  const parsed = waitlistSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;

  // Check date is in the future
  const today = new Date().toISOString().split("T")[0];
  if (d.date <= today) {
    return { success: false, error: "U kunt alleen op de wachtlijst voor een toekomstige datum." };
  }

  // Check for duplicate
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
    console.error("[joinWaitlist] Insert failed:", error.message);
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }

  // Send waitlist confirmation email
  const { data: shop } = await supabase.from("Shop").select("name").eq("id", d.shopId).single();
  const { data: barber } = await supabase.from("Barber").select("name").eq("id", d.barberId).single();
  const { data: service } = await supabase.from("Service").select("name").eq("id", d.serviceId).single();

  if (shop && barber && service) {
    const email = waitlistConfirmationEmail({
      customerName: d.customerName,
      shopName: shop.name,
      serviceName: service.name,
      barberName: barber.name,
      date: d.date,
    });
    sendEmail({ to: d.customerEmail, ...email }).catch(() => {});
  }

  return { success: true };
}

export async function cancelWaitlistEntry(entryId: string, customerEmail: string): Promise<{ success: boolean; error?: string }> {
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

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function notifyWaitlistForCancellation(
  shopId: string,
  barberId: string,
  date: string,
  cancelledStartTime: string,
  cancelledEndTime: string,
) {
  const cancelledDuration = timeToMinutes(cancelledEndTime) - timeToMinutes(cancelledStartTime);

  // Find all waiting entries for this barber+date
  const { data: entries } = await supabase
    .from("WaitlistEntry")
    .select("id, customerName, customerEmail, serviceId")
    .eq("shopId", shopId)
    .eq("barberId", barberId)
    .eq("date", date)
    .eq("status", "WAITING");

  if (!entries || entries.length === 0) return;

  // Get service durations for all unique serviceIds
  const serviceIds = [...new Set(entries.map((e) => e.serviceId))];
  const { data: services } = await supabase
    .from("Service")
    .select("id, duration")
    .in("id", serviceIds);

  const durationMap = new Map((services || []).map((s) => [s.id, s.duration]));

  // Get shop + barber details for email
  const [{ data: shop }, { data: barber }] = await Promise.all([
    supabase.from("Shop").select("name, slug").eq("id", shopId).single(),
    supabase.from("Barber").select("name").eq("id", barberId).single(),
  ]);

  if (!shop || !barber) return;

  const notifiedIds: string[] = [];

  for (const entry of entries) {
    const serviceDuration = durationMap.get(entry.serviceId) || 0;
    if (serviceDuration > cancelledDuration) continue; // Slot too short for this service

    const email = waitlistNotificationEmail({
      customerName: entry.customerName,
      shopName: shop.name,
      shopSlug: shop.slug,
      barberName: barber.name,
      date,
      freedTime: cancelledStartTime,
    });
    sendEmail({ to: entry.customerEmail, ...email }).catch(() => {});
    notifiedIds.push(entry.id);
  }

  if (notifiedIds.length > 0) {
    await supabase
      .from("WaitlistEntry")
      .update({ status: "NOTIFIED", notifiedAt: new Date().toISOString() })
      .in("id", notifiedIds);
  }
}
