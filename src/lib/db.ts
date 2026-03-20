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

  return (shops || []).map((shop) => ({
    ...shop,
    barbers: (barbers || []).filter((b) => b.shopId === shop.id),
  }));
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

  return { ...shop, barbers: barbers || [] };
}
