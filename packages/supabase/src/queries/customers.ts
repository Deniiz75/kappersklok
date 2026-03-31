import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCustomerProfile(supabase: SupabaseClient, email: string) {
  const { data } = await supabase
    .from("Customer")
    .select("email, name, phone")
    .eq("email", email)
    .single();
  return data;
}

export async function getFavorites(supabase: SupabaseClient, customerEmail: string) {
  const { data } = await supabase
    .from("Favorite")
    .select("id, shopId, shop:Shop(name, slug, city)")
    .eq("customerEmail", customerEmail)
    .order("createdAt", { ascending: false });
  return data || [];
}

export async function isFavorite(supabase: SupabaseClient, customerEmail: string, shopId: string) {
  const { data } = await supabase
    .from("Favorite")
    .select("id")
    .eq("customerEmail", customerEmail)
    .eq("shopId", shopId)
    .limit(1);
  return (data && data.length > 0) || false;
}

export async function getWaitlistEntries(supabase: SupabaseClient, email: string) {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("WaitlistEntry")
    .select("id, date, status, notifiedAt, createdAt, shop:Shop(name, slug), barber:Barber(name), service:Service(name, duration, price)")
    .eq("customerEmail", email)
    .in("status", ["WAITING", "NOTIFIED"])
    .gte("date", today)
    .order("date", { ascending: true });
  return data || [];
}
