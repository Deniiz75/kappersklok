"use server";

import { supabase } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  shopId: z.string().min(1),
  customerName: z.string().min(1, "Naam is verplicht"),
  customerEmail: z.string().email("Ongeldig e-mailadres"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewResult = { success: true } | { success: false; error: string };

export async function submitReview(data: unknown): Promise<ReviewResult> {
  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { error } = await supabase.from("Review").insert({
      shopId: parsed.data.shopId,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    });
    if (error) throw error;
    return { success: true };
  } catch {
    return { success: false, error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}
