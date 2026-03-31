"use server";

import { supabase } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail, cancellationConfirmationEmail } from "@/lib/email";
import { notifyWaitlistForCancellation } from "@/lib/booking-actions";
import { hash } from "bcryptjs";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Geen toegang");
  }
  return session;
}

// --- Shop management ---

export async function updateShopStatus(shopId: string, status: "ACTIVE" | "SUSPENDED" | "PENDING") {
  await requireAdmin();
  const { error } = await supabase.from("Shop").update({ status }).eq("id", shopId);
  if (error) return { success: false, error: "Kon status niet bijwerken." };
  return { success: true };
}

export async function updateShop(shopId: string, data: Record<string, unknown>) {
  await requireAdmin();
  const { error } = await supabase.from("Shop").update(data).eq("id", shopId);
  if (error) return { success: false, error: "Kon shop niet bijwerken." };
  return { success: true };
}

export async function updateShopBarber(barberId: string, data: { name?: string; active?: boolean }) {
  await requireAdmin();
  const { error } = await supabase.from("Barber").update(data).eq("id", barberId);
  if (error) return { success: false, error: "Kon kapper niet bijwerken." };
  return { success: true };
}

export async function updateShopService(serviceId: string, data: { name?: string; duration?: number; price?: number; active?: boolean }) {
  await requireAdmin();
  const { error } = await supabase.from("Service").update(data).eq("id", serviceId);
  if (error) return { success: false, error: "Kon dienst niet bijwerken." };
  return { success: true };
}

export async function updateShopBusinessHours(shopId: string, hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }>) {
  await requireAdmin();
  for (const h of hours) {
    await supabase
      .from("BusinessHours")
      .upsert({ shopId, dayOfWeek: h.dayOfWeek, openTime: h.openTime, closeTime: h.closeTime, closed: h.closed }, { onConflict: "shopId,dayOfWeek" });
  }
  return { success: true };
}

// --- Appointment management ---

export async function updateAppointmentStatus(appointmentId: string, status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW") {
  await requireAdmin();
  const { error } = await supabase.from("Appointment").update({ status }).eq("id", appointmentId);
  if (error) return { success: false, error: "Kon status niet bijwerken." };
  return { success: true };
}

export async function adminCancelAppointment(appointmentId: string) {
  await requireAdmin();
  const { data: apt } = await supabase
    .from("Appointment")
    .select("id, customerName, customerEmail, date, startTime, endTime, shopId, barberId, serviceId")
    .eq("id", appointmentId)
    .single();

  if (!apt) return { success: false, error: "Afspraak niet gevonden." };

  await supabase.from("Appointment").update({ status: "CANCELLED" }).eq("id", appointmentId);

  // Send cancellation email
  const { data: shop } = await supabase.from("Shop").select("name").eq("id", apt.shopId).single();
  const { data: service } = await supabase.from("Service").select("name").eq("id", apt.serviceId).single();

  if (shop && service) {
    const email = cancellationConfirmationEmail({
      customerName: apt.customerName,
      shopName: shop.name,
      serviceName: service.name,
      date: apt.date,
      time: apt.startTime,
    });
    sendEmail({ to: apt.customerEmail, ...email }).catch(() => {});
  }

  // Notify waitlisted customers
  notifyWaitlistForCancellation(
    apt.shopId, apt.barberId, apt.date, apt.startTime, apt.endTime,
  ).catch(() => {});

  return { success: true };
}

// --- Payment management ---

export async function createPayment(data: { shopId: string; amount: number; description: string; period: string; status: "PAID" | "PENDING" }) {
  await requireAdmin();
  const { error } = await supabase.from("Payment").insert({
    shopId: data.shopId,
    amount: data.amount,
    description: data.description,
    period: data.period,
    status: data.status,
    paidAt: data.status === "PAID" ? new Date().toISOString() : null,
  });
  if (error) return { success: false, error: "Kon betaling niet aanmaken." };
  return { success: true };
}

export async function updatePaymentStatus(paymentId: string, status: "PAID" | "PENDING" | "REFUNDED") {
  await requireAdmin();
  const update: Record<string, unknown> = { status };
  if (status === "PAID") update.paidAt = new Date().toISOString();
  const { error } = await supabase.from("Payment").update(update).eq("id", paymentId);
  if (error) return { success: false, error: "Kon status niet bijwerken." };
  return { success: true };
}

export async function deletePayment(paymentId: string) {
  await requireAdmin();
  await supabase.from("Payment").delete().eq("id", paymentId);
  return { success: true };
}

// --- User management ---

export async function updateUserRole(userId: string, role: "ADMIN" | "BARBER") {
  await requireAdmin();
  const { error } = await supabase.from("User").update({ role }).eq("id", userId);
  if (error) return { success: false, error: "Kon rol niet bijwerken." };
  return { success: true };
}

export async function resetUserPassword(userId: string) {
  await requireAdmin();
  const tempPassword = Math.random().toString(36).slice(-10);
  const passwordHash = await hash(tempPassword, 10);
  const { error } = await supabase.from("User").update({ passwordHash }).eq("id", userId);
  if (error) return { success: false, error: "Kon wachtwoord niet resetten." };
  return { success: true, tempPassword };
}

// --- Customer management ---

export async function updateCustomer(customerId: string, data: { name?: string; phone?: string }) {
  await requireAdmin();
  const { error } = await supabase.from("Customer").update(data).eq("id", customerId);
  if (error) return { success: false, error: "Kon klant niet bijwerken." };
  return { success: true };
}

export async function deleteCustomer(customerId: string) {
  await requireAdmin();
  // Get email first for cascade
  const { data: customer } = await supabase.from("Customer").select("email").eq("id", customerId).single();
  if (customer) {
    await supabase.from("Favorite").delete().eq("customerEmail", customer.email);
  }
  await supabase.from("Customer").delete().eq("id", customerId);
  return { success: true };
}

// --- Message management ---

export async function markMessageRead(messageId: string) {
  await requireAdmin();
  await supabase.from("ContactMessage").update({ read: true }).eq("id", messageId);
  return { success: true };
}

export async function deleteMessage(messageId: string) {
  await requireAdmin();
  await supabase.from("ContactMessage").delete().eq("id", messageId);
  return { success: true };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  await supabase.from("Shop").delete().eq("userId", userId);
  await supabase.from("User").delete().eq("id", userId);
  return { success: true };
}
