import type { SupabaseClient } from "@supabase/supabase-js";

export async function getShopServices(supabase: SupabaseClient, shopId: string) {
  const { data } = await supabase
    .from("Service")
    .select("id, name, duration, price, active, sortOrder")
    .eq("shopId", shopId)
    .eq("active", true)
    .order("sortOrder");
  return data || [];
}

export async function getShopBarbers(supabase: SupabaseClient, shopId: string) {
  const { data } = await supabase
    .from("Barber")
    .select("id, name, active")
    .eq("shopId", shopId)
    .eq("active", true)
    .order("name");
  return data || [];
}

export async function getShopBusinessHours(supabase: SupabaseClient, shopId: string) {
  const { data } = await supabase
    .from("BusinessHours")
    .select("dayOfWeek, openTime, closeTime, closed")
    .eq("shopId", shopId)
    .order("dayOfWeek");
  return data || [];
}
