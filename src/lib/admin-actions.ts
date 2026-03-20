"use server";

import { supabase } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Geen toegang");
  }
  return session;
}

export async function updateShopStatus(shopId: string, status: "ACTIVE" | "SUSPENDED" | "PENDING") {
  await requireAdmin();
  const { error } = await supabase.from("Shop").update({ status }).eq("id", shopId);
  if (error) return { success: false, error: "Kon status niet bijwerken." };
  return { success: true };
}

export async function markMessageRead(messageId: string) {
  await requireAdmin();
  await supabase.from("ContactMessage").update({ read: true }).eq("id", messageId);
  return { success: true };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  // Delete shop first (FK constraint)
  await supabase.from("Shop").delete().eq("userId", userId);
  await supabase.from("User").delete().eq("id", userId);
  return { success: true };
}
