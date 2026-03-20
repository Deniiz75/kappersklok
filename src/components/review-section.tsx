"use client";

import { useState } from "react";
import { submitReview } from "@/lib/review-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface ReviewSectionProps {
  shopId: string;
  reviews: Review[];
  avgRating: number;
}

export function ReviewSection({ shopId, reviews, avgRating }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const result = await submitReview({
      shopId,
      customerName: (form.elements.namedItem("name") as HTMLInputElement).value,
      customerEmail: (form.elements.namedItem("email") as HTMLInputElement).value,
      rating,
      comment: (form.elements.namedItem("comment") as HTMLTextAreaElement).value || undefined,
    });
    if (result.success) {
      setStatus("success");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
          Reviews ({reviews.length})
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Existing reviews */}
      {reviews.length > 0 && (
        <div className="mt-3 space-y-3">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="border-t border-border pt-3 first:border-0 first:pt-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < review.rating ? "fill-gold text-gold" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium">{review.customerName}</span>
              </div>
              {review.comment && (
                <p className="mt-1 text-xs text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add review */}
      <div className="mt-4">
        {status === "success" ? (
          <p className="text-sm text-gold">Bedankt voor uw review!</p>
        ) : !showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="w-full border-border text-sm"
          >
            Schrijf een review
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 border-t border-border pt-4">
            <div>
              <p className="mb-1 text-xs font-medium">Beoordeling</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star
                      className={`h-5 w-5 transition-colors ${
                        star <= (hoverRating || rating) ? "fill-gold text-gold" : "text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Input name="name" placeholder="Uw naam" required className="border-border bg-background text-sm" />
            <Input name="email" type="email" placeholder="E-mail" required className="border-border bg-background text-sm" />
            <Textarea name="comment" placeholder="Uw ervaring (optioneel)" rows={2} className="border-border bg-background text-sm" />
            {status === "error" && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 border-border text-xs">
                Annuleer
              </Button>
              <Button type="submit" disabled={status === "loading"} className="flex-1 bg-gold text-background hover:bg-gold-hover font-semibold text-xs">
                {status === "loading" ? "Verzenden..." : "Verstuur"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
