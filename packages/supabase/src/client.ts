import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient(url?: string, anonKey?: string) {
  const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, supabaseKey);
}
