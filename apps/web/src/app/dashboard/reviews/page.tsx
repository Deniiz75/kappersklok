"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, X } from "lucide-react";

interface Review {
  id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: string;
  shop: { name: string } | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("Review")
      .select("id, customerName, customerEmail, rating, comment, approved, createdAt, shop:Shop(name)")
      .order("createdAt", { ascending: false })
      .limit(100);
    setReviews((data as unknown as Review[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleApproval(id: string, approved: boolean) {
    await supabase.from("Review").update({ approved }).eq("id", id);
    load();
  }

  async function deleteReview(id: string) {
    await supabase.from("Review").delete().eq("id", id);
    load();
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Reviews</h1>
      <p className="mt-1 text-muted-foreground">
        {reviews.length} reviews — gemiddeld {avgRating} sterren
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Laden...</p>
      ) : reviews.length === 0 ? (
        <Card className="mt-6 border-border bg-surface">
          <CardContent className="p-6 text-center text-muted-foreground">Nog geen reviews.</CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className={`border-border ${review.approved ? "bg-surface" : "bg-surface border-yellow-500/20"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-gold text-gold" : "text-muted"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.customerName}</span>
                      {!review.approved && (
                        <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-500">Wacht op goedkeuring</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {review.shop?.name} — {review.customerEmail}
                    </p>
                    {review.comment && (
                      <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("nl-NL")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {review.approved ? (
                      <Button
                        onClick={() => toggleApproval(review.id, false)}
                        variant="outline"
                        className="h-7 border-border text-xs px-2"
                      >
                        <X className="h-3 w-3 mr-1" />Verberg
                      </Button>
                    ) : (
                      <Button
                        onClick={() => toggleApproval(review.id, true)}
                        className="h-7 bg-gold/10 text-gold hover:bg-gold/20 text-xs px-2"
                      >
                        <Check className="h-3 w-3 mr-1" />Goedkeuren
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteReview(review.id)}
                      variant="outline"
                      className="h-7 border-destructive/30 text-destructive hover:bg-destructive/10 text-xs px-2"
                    >
                      Verwijder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
