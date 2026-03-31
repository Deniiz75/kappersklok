import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import {
  getActiveShopsWithBarbers,
  getShopBySlug,
  getBookedSlots,
  getCustomerAppointments,
  getFavorites,
  getWaitlistEntries,
} from "@kappersklok/supabase";
import {
  createAppointment,
  cancelAppointment,
} from "@kappersklok/supabase";
import {
  joinWaitlist,
  cancelWaitlistEntry,
} from "@kappersklok/supabase";
import {
  toggleFavorite,
} from "@kappersklok/supabase";
import {
  getAppointmentsForShop,
  getShopServices,
  getShopBarbers,
  getShopBusinessHours,
} from "@kappersklok/supabase";

// --- Queries ---

export function useShops() {
  return useQuery({
    queryKey: ["shops"],
    queryFn: () => getActiveShopsWithBarbers(supabase),
    staleTime: 5 * 60 * 1000,
  });
}

export function useShop(slug: string) {
  return useQuery({
    queryKey: ["shop", slug],
    queryFn: () => getShopBySlug(supabase, slug),
    enabled: !!slug,
  });
}

export function useBookedSlots(barberId: string, date: string) {
  return useQuery({
    queryKey: ["bookedSlots", barberId, date],
    queryFn: () => getBookedSlots(supabase, barberId, date),
    enabled: !!barberId && !!date,
    staleTime: 30_000,
  });
}

export function useMyAppointments(email: string | undefined) {
  return useQuery({
    queryKey: ["appointments", email],
    queryFn: () => getCustomerAppointments(supabase, email!),
    enabled: !!email,
  });
}

export function useMyFavorites(email: string | undefined) {
  return useQuery({
    queryKey: ["favorites", email],
    queryFn: () => getFavorites(supabase, email!),
    enabled: !!email,
  });
}

export function useMyWaitlist(email: string | undefined) {
  return useQuery({
    queryKey: ["waitlist", email],
    queryFn: () => getWaitlistEntries(supabase, email!),
    enabled: !!email,
  });
}

// --- Mutations ---

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createAppointment(supabase, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => cancelAppointment(supabase, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useJoinWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => joinWaitlist(supabase, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
}

export function useCancelWaitlistEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, email }: { entryId: string; email: string }) =>
      cancelWaitlistEntry(supabase, entryId, email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, shopId }: { email: string; shopId: string }) =>
      toggleFavorite(supabase, email, shopId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

// --- Barber hooks ---

export function useShopAppointments(shopId: string | undefined, date?: string) {
  return useQuery({
    queryKey: ["shopAppointments", shopId, date],
    queryFn: () => getAppointmentsForShop(supabase, shopId!, date),
    enabled: !!shopId,
    refetchInterval: 30_000,
  });
}

export function useBarberServices(shopId: string | undefined) {
  return useQuery({
    queryKey: ["shopServices", shopId],
    queryFn: () => getShopServices(supabase, shopId!),
    enabled: !!shopId,
  });
}

export function useBarberBarbers(shopId: string | undefined) {
  return useQuery({
    queryKey: ["shopBarbers", shopId],
    queryFn: () => getShopBarbers(supabase, shopId!),
    enabled: !!shopId,
  });
}

export function useBarberHours(shopId: string | undefined) {
  return useQuery({
    queryKey: ["shopHours", shopId],
    queryFn: () => getShopBusinessHours(supabase, shopId!),
    enabled: !!shopId,
  });
}

export function useBarberShop() {
  const { data: session } = { data: null as unknown }; // placeholder
  // In real implementation, we'd look up the shop by the auth user's ID
  // For now, we store the shopId in AsyncStorage after barber login
  return useQuery({
    queryKey: ["barberShop"],
    queryFn: async () => {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      const shopId = await AsyncStorage.getItem("kk-barber-shopId");
      if (!shopId) return null;
      const { data } = await supabase.from("Shop").select("*").eq("id", shopId).single();
      return data;
    },
  });
}
