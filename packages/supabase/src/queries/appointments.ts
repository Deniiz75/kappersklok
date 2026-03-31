import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAppointmentsForShop(supabase: SupabaseClient, shopId: string, date?: string) {
  let query = supabase
    .from("Appointment")
    .select("*, barber:Barber(name), service:Service(name, duration, price)")
    .eq("shopId", shopId)
    .order("date", { ascending: true })
    .order("startTime", { ascending: true });

  if (date) {
    query = query.eq("date", date);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function getBookedSlots(supabase: SupabaseClient, barberId: string, date: string) {
  const { data } = await supabase
    .from("Appointment")
    .select("startTime, endTime")
    .eq("barberId", barberId)
    .eq("date", date)
    .eq("status", "CONFIRMED");
  return (data || []) as { startTime: string; endTime: string }[];
}

export async function getCustomerAppointments(supabase: SupabaseClient, email: string) {
  const { data } = await supabase
    .from("Appointment")
    .select("id, date, startTime, endTime, customerName, status, cancelToken, notes, shop:Shop(name, slug, city), barber:Barber(name), service:Service(name, duration, price)")
    .eq("customerEmail", email)
    .order("date", { ascending: false })
    .order("startTime", { ascending: false });
  return data || [];
}
