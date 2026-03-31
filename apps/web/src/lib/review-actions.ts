"use server";

import { supabase } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  shopId: z.string().min(1),
  customerName: z.string().min(1, "Naam is verplicht"),
  customerEmail: z.string().email("Ongeldig e-mailadres"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  appointmentId: z.string().optional(),
});

type ReviewResult = { success: true } | { success: false; error: string };

export async function submitReview(data: unknown): Promise<ReviewResult> {
  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // Check if review already exists for this appointment
    if (parsed.data.appointmentId) {
      const { data: existing } = await supabase
        .from("Review")
        .select("id")
        .eq("appointmentId", parsed.data.appointmentId)
        .limit(1);
      if (existing && existing.length > 0) {
        return { success: false, error: "U heeft al een review achtergelaten voor deze afspraak." };
      }
    }

    const { error } = await supabase.from("Review").insert({
      shopId: parsed.data.shopId,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
      appointmentId: parsed.data.appointmentId || null,
    });
    if (error) throw error;
    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}
