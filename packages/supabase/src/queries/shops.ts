import type { SupabaseClient } from "@supabase/supabase-js";

export async function getActiveShops(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("Shop")
    .select("id, name, slug, city")
    .eq("status", "ACTIVE")
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function getActiveShopsWithBarbers(supabase: SupabaseClient) {
  const { data: shops, error } = await supabase
    .from("Shop")
    .select("id, name, slug, contactName, email, phone, city, street, houseNumber, postalCode, instagram, status")
    .eq("status", "ACTIVE")
    .order("name");
  if (error) throw error;

  const { data: barbers } = await supabase
    .from("Barber")
    .select("id, name, shopId, active")
    .eq("active", true);

  return (shops || []).map((shop) => ({
    ...shop,
    barbers: (barbers || []).filter((b) => b.shopId === shop.id),
  }));
}

export async function getShopBySlug(supabase: SupabaseClient, slug: string) {
  const { data: shop, error } = await supabase
    .from("Shop")
    .select("*")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .single();
  if (error || !shop) return null;

  const [{ data: barbers }, { data: services }, { data: businessHours }, { data: reviews }] = await Promise.all([
    supabase.from("Barber").select("id, name, active").eq("shopId", shop.id).eq("active", true),
    supabase.from("Service").select("id, name, duration, price, active, sortOrder").eq("shopId", shop.id).eq("active", true).order("sortOrder"),
    supabase.from("BusinessHours").select("dayOfWeek, openTime, closeTime, closed").eq("shopId", shop.id).order("dayOfWeek"),
    supabase.from("Review").select("id, customerName, rating, comment, createdAt").eq("shopId", shop.id).eq("approved", true).order("createdAt", { ascending: false }).limit(20),
  ]);

  const reviewList = reviews || [];
  const avgRating = reviewList.length > 0
    ? reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length
    : 0;

  return {
    ...shop,
    barbers: barbers || [],
    services: services || [],
    businessHours: businessHours || [],
    reviews: reviewList,
    avgRating,
  };
}

export async function getShopByUserId(supabase: SupabaseClient, userId: string) {
  const { data: shop, error } = await supabase
    .from("Shop")
    .select("*")
    .eq("userId", userId)
    .single();
  if (error || !shop) return null;

  const [{ data: barbers }, { data: services }, { data: businessHours }] = await Promise.all([
    supabase.from("Barber").select("*").eq("shopId", shop.id).order("name"),
    supabase.from("Service").select("*").eq("shopId", shop.id).order("sortOrder"),
    supabase.from("BusinessHours").select("*").eq("shopId", shop.id).order("dayOfWeek"),
  ]);

  return {
    ...shop,
    barbers: barbers || [],
    services: services || [],
    businessHours: businessHours || [],
  };
}
