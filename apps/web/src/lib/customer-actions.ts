"use server";

import { supabase } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Naam is verplicht"),
  phone: z.string().optional(),
});

export async function updateCustomerProfile(data: unknown): Promise<{ success: boolean; error?: string }> {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;

  try {
    // Upsert: create if not exists, update if exists
    const { error } = await supabase
      .from("Customer")
      .upsert(
        {
          email: d.email,
          name: d.name,
          phone: d.phone || null,
        },
        { onConflict: "email" }
      );

    if (error) throw error;
    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}

export async function getCustomerProfile(email: string) {
  const { data } = await supabase
    .from("Customer")
    .select("email, name, phone")
    .eq("email", email)
    .single();

  return data;
}

export async function toggleFavorite(customerEmail: string, shopId: string): Promise<{ success: boolean; isFavorite: boolean; error?: string }> {
  try {
    // Check if customer exists, create if not
    const { data: customer } = await supabase
      .from("Customer")
      .select("email")
      .eq("email", customerEmail)
      .single();

    if (!customer) {
      await supabase.from("Customer").insert({ email: customerEmail });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from("Favorite")
      .select("id")
      .eq("customerEmail", customerEmail)
      .eq("shopId", shopId)
      .single();

    if (existing) {
      // Remove favorite
      await supabase.from("Favorite").delete().eq("id", existing.id);
      return { success: true, isFavorite: false };
    } else {
      // Add favorite
      const { error } = await supabase.from("Favorite").insert({
        customerEmail,
        shopId,
      });
      if (error) throw error;
      return { success: true, isFavorite: true };
    }
  } catch {
    return { success: false, isFavorite: false, error: "Er ging iets mis." };
  }
}

export async function getFavorites(customerEmail: string) {
  const { data } = await supabase
    .from("Favorite")
    .select("id, shopId, shop:Shop(name, slug, city)")
    .eq("customerEmail", customerEmail)
    .order("createdAt", { ascending: false });

  return data || [];
}

export async function isFavorite(customerEmail: string, shopId: string): Promise<boolean> {
  const { data } = await supabase
    .from("Favorite")
    .select("id")
    .eq("customerEmail", customerEmail)
    .eq("shopId", shopId)
    .limit(1);

  return (data && data.length > 0) || false;
}
