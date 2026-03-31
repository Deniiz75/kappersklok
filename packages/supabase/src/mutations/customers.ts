import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const profileSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Naam is verplicht"),
  phone: z.string().optional(),
});

export async function updateCustomerProfile(supabase: SupabaseClient, data: unknown): Promise<{ success: boolean; error?: string }> {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;

  const { error } = await supabase
    .from("Customer")
    .upsert(
      { email: d.email, name: d.name, phone: d.phone || null },
      { onConflict: "email" },
    );

  if (error) return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  return { success: true };
}

export async function toggleFavorite(supabase: SupabaseClient, customerEmail: string, shopId: string): Promise<{ success: boolean; isFavorite: boolean; error?: string }> {
  // Ensure customer exists
  const { data: customer } = await supabase
    .from("Customer")
    .select("email")
    .eq("email", customerEmail)
    .single();

  if (!customer) {
    await supabase.from("Customer").insert({ email: customerEmail });
  }

  const { data: existing } = await supabase
    .from("Favorite")
    .select("id")
    .eq("customerEmail", customerEmail)
    .eq("shopId", shopId)
    .single();

  if (existing) {
    await supabase.from("Favorite").delete().eq("id", existing.id);
    return { success: true, isFavorite: false };
  } else {
    const { error } = await supabase.from("Favorite").insert({ customerEmail, shopId });
    if (error) return { success: false, isFavorite: false, error: "Er ging iets mis." };
    return { success: true, isFavorite: true };
  }
}
