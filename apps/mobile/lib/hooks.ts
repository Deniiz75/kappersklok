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
