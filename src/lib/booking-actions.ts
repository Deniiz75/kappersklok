"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
    // Check for conflicting appointment
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
    });

    return { success: true, appointmentId: appointment.id };
  } catch {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}
