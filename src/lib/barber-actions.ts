"use server";

import { supabase } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail, cancellationConfirmationEmail } from "@/lib/email";

async function requireBarberShop() {
  const session = await getSession();
  if (!session) throw new Error("Niet ingelogd");

  const { data: shop } = await supabase
    .from("Shop")
    .select("id, name")
    .eq("userId", session.userId)
    .single();

  if (!shop) throw new Error("Geen shop gevonden");
  return { session, shop };
}

async function verifyAppointmentOwnership(appointmentId: string, shopId: string) {
  const { data } = await supabase
    .from("Appointment")
    .select("id, shopId")
    .eq("id", appointmentId)
    .single();

  if (!data || data.shopId !== shopId) {
    throw new Error("Geen toegang tot deze afspraak");
  }
}

async function verifyServiceOwnership(serviceId: string, shopId: string) {
  const { data } = await supabase
    .from("Service")
    .select("id, shopId")
    .eq("id", serviceId)
    .single();

  if (!data || data.shopId !== shopId) {
    throw new Error("Geen toegang tot deze dienst");
  }
}

// --- Appointment actions ---

export async function barberUpdateAppointmentStatus(
  appointmentId: string,
  status: "COMPLETED" | "NO_SHOW" | "CANCELLED"
) {
  const { shop } = await requireBarberShop();
  await verifyAppointmentOwnership(appointmentId, shop.id);

  const { error } = await supabase
    .from("Appointment")
    .update({ status })
    .eq("id", appointmentId);

  if (error) return { success: false, error: "Kon status niet bijwerken." };
  return { success: true };
}

export async function barberCancelAppointment(appointmentId: string) {
  const { shop } = await requireBarberShop();
  await verifyAppointmentOwnership(appointmentId, shop.id);

  const { data: apt } = await supabase
    .from("Appointment")
    .select("id, customerName, customerEmail, date, startTime, serviceId")
    .eq("id", appointmentId)
    .single();

  if (!apt) return { success: false, error: "Afspraak niet gevonden." };

  await supabase
    .from("Appointment")
    .update({ status: "CANCELLED" })
    .eq("id", appointmentId);

  // Send cancellation email
  const { data: service } = await supabase
    .from("Service")
    .select("name")
    .eq("id", apt.serviceId)
    .single();

  if (service) {
    const email = cancellationConfirmationEmail({
      customerName: apt.customerName,
      shopName: shop.name,
      serviceName: service.name,
      date: apt.date,
      time: apt.startTime,
    });
    sendEmail({ to: apt.customerEmail, ...email }).catch(() => {});
  }

  return { success: true };
}

// --- Service actions ---

export async function barberCreateService(data: {
  name: string;
  duration: number;
  price: number;
  active?: boolean;
}) {
  const { shop } = await requireBarberShop();

  // Get next sortOrder
  const { data: existing } = await supabase
    .from("Service")
    .select("sortOrder")
    .eq("shopId", shop.id)
    .order("sortOrder", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? (existing[0].sortOrder || 0) + 1 : 0;

  const { error } = await supabase.from("Service").insert({
    shopId: shop.id,
    name: data.name,
    duration: data.duration,
    price: data.price,
    active: data.active ?? true,
    sortOrder: nextOrder,
  });

  if (error) return { success: false, error: "Kon dienst niet aanmaken." };
  return { success: true };
}

export async function barberUpdateService(
  serviceId: string,
  data: { name?: string; duration?: number; price?: number; active?: boolean }
) {
  const { shop } = await requireBarberShop();
  await verifyServiceOwnership(serviceId, shop.id);

  const { error } = await supabase
    .from("Service")
    .update(data)
    .eq("id", serviceId);

  if (error) return { success: false, error: "Kon dienst niet bijwerken." };
  return { success: true };
}

export async function barberDeleteService(serviceId: string) {
  const { shop } = await requireBarberShop();
  await verifyServiceOwnership(serviceId, shop.id);

  // Check for future appointments using this service
  const today = new Date().toISOString().split("T")[0];
  const { data: futureApts } = await supabase
    .from("Appointment")
    .select("id")
    .eq("serviceId", serviceId)
    .gte("date", today)
    .in("status", ["CONFIRMED"]);

  if (futureApts && futureApts.length > 0) {
    return {
      success: false,
      error: `Kan niet verwijderen: ${futureApts.length} toekomstige afspraak(en) gebruiken deze dienst.`,
    };
  }

  const { error } = await supabase
    .from("Service")
    .delete()
    .eq("id", serviceId);

  if (error) return { success: false, error: "Kon dienst niet verwijderen." };
  return { success: true };
}
