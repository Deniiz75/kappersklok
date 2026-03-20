"use server";

import { prisma } from "@/lib/prisma";
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
    const existing = await prisma.appointment.findFirst({
      where: {
        barberId: d.barberId,
        date: new Date(d.date),
        startTime: d.startTime,
        status: "CONFIRMED",
      },
    });

    if (existing) {
      return { success: false, error: "Dit tijdslot is al bezet. Kies een ander tijdstip." };
    }

    const appointment = await prisma.appointment.create({
      data: {
        shopId: d.shopId,
        barberId: d.barberId,
        serviceId: d.serviceId,
        date: new Date(d.date),
        startTime: d.startTime,
        endTime: d.endTime,
        customerName: d.customerName,
        customerEmail: d.customerEmail,
        customerPhone: d.customerPhone || null,
        notes: d.notes || null,
      },
      include: {
        shop: { select: { name: true, email: true } },
        barber: { select: { name: true } },
        service: { select: { name: true } },
      },
    });

    // Send confirmation email to customer
    const confirmEmail = bookingConfirmationEmail({
      customerName: d.customerName,
      shopName: appointment.shop.name,
      serviceName: appointment.service.name,
      date: d.date,
      time: d.startTime,
      barberName: appointment.barber.name,
      cancelToken: appointment.cancelToken || appointment.id,
    });
    sendEmail({ to: d.customerEmail, ...confirmEmail }).catch(() => {});

    // Send notification to barber/shop
    const notifyEmail = barberNotificationEmail({
      customerName: d.customerName,
      serviceName: appointment.service.name,
      date: d.date,
      time: d.startTime,
      barberName: appointment.barber.name,
      customerPhone: d.customerPhone,
    });
    sendEmail({ to: appointment.shop.email, ...notifyEmail }).catch(() => {});

    return { success: true, appointmentId: appointment.id };
  } catch {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}

export async function cancelAppointment(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: { cancelToken: token, status: "CONFIRMED" },
    });

    if (!appointment) {
      return { success: false, error: "Afspraak niet gevonden of al geannuleerd." };
    }

    // Check if within 2 hours of appointment
    const appointmentDateTime = new Date(`${appointment.date.toISOString().split("T")[0]}T${appointment.startTime}:00`);
    const now = new Date();
    const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 2) {
      return { success: false, error: "Annuleren is niet meer mogelijk binnen 2 uur voor de afspraak. Neem contact op met uw kapper." };
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELLED" },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis." };
  }
}
