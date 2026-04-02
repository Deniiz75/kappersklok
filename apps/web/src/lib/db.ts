import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Shop = {
  id: string;
  name: string;
  slug: string;
  contactName: string;
  email: string;
  phone: string | null;
  city: string | null;
  street: string | null;
  houseNumber: string | null;
  postalCode: string | null;
  instagram: string | null;
  status: string;
};

export type Barber = {
  id: string;
  name: string;
  shopId: string;
  active: boolean;
};

export async function getActiveShops() {
  const { data, error } = await supabase
    .from("Shop")
    .select("id, name, slug, city")
    .eq("status", "ACTIVE")
    .order("name");
  if (error) throw error;
  return data as Pick<Shop, "id" | "name" | "slug" | "city">[];
}

export async function getActiveShopsWithBarbers() {
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

  const { data: reviews } = await supabase
    .from("Review")
    .select("shopId, rating")
    .eq("approved", true);

  return (shops || []).map((shop) => {
    const shopReviews = (reviews || []).filter((r) => r.shopId === shop.id);
    const avgRating = shopReviews.length > 0
      ? shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length
      : 0;
    return {
      ...shop,
      barbers: (barbers || []).filter((b) => b.shopId === shop.id),
      reviewCount: shopReviews.length,
      avgRating,
    };
  });
}

export async function getShopBySlug(slug: string) {
  const { data: shop, error } = await supabase
    .from("Shop")
    .select("*")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .single();
  if (error || !shop) return null;

  const { data: barbers } = await supabase
    .from("Barber")
    .select("id, name, active")
    .eq("shopId", shop.id)
    .eq("active", true);

  const { data: services } = await supabase
    .from("Service")
    .select("id, name, duration, price, active, sortOrder")
    .eq("shopId", shop.id)
    .eq("active", true)
    .order("sortOrder");

  const { data: businessHours } = await supabase
    .from("BusinessHours")
    .select("dayOfWeek, openTime, closeTime, closed")
    .eq("shopId", shop.id)
    .order("dayOfWeek");

  const { data: reviews } = await supabase
    .from("Review")
    .select("id, customerName, rating, comment, createdAt")
    .eq("shopId", shop.id)
    .eq("approved", true)
    .order("createdAt", { ascending: false })
    .limit(20);

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

export async function getShopByUserId(userId: string) {
  const { data: shop, error } = await supabase
    .from("Shop")
    .select("*")
    .eq("userId", userId)
    .single();
  if (error || !shop) return null;

  const { data: barbers } = await supabase
    .from("Barber")
    .select("*")
    .eq("shopId", shop.id)
    .order("name");

  const { data: services } = await supabase
    .from("Service")
    .select("*")
    .eq("shopId", shop.id)
    .order("sortOrder");

  const { data: businessHours } = await supabase
    .from("BusinessHours")
    .select("*")
    .eq("shopId", shop.id)
    .order("dayOfWeek");

  return {
    ...shop,
    barbers: barbers || [],
    services: services || [],
    businessHours: businessHours || [],
  };
}

export async function getAppointmentsForShop(shopId: string, date?: string) {
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

export async function getShopServices(shopId: string) {
  const { data } = await supabase
    .from("Service")
    .select("id, name, duration, price, active, sortOrder")
    .eq("shopId", shopId)
    .eq("active", true)
    .order("sortOrder");
  return data || [];
}

export async function getShopBarbers(shopId: string) {
  const { data } = await supabase
    .from("Barber")
    .select("id, name, active")
    .eq("shopId", shopId)
    .eq("active", true)
    .order("name");
  return data || [];
}

export async function getShopBusinessHours(shopId: string) {
  const { data } = await supabase
    .from("BusinessHours")
    .select("dayOfWeek, openTime, closeTime, closed")
    .eq("shopId", shopId)
    .order("dayOfWeek");
  return data || [];
}
