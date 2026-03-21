import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Star, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

async function getCustomerEmail(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kk_customer")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return (payload.customerEmail as string) || null;
  } catch {
    return null;
  }
}

const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function MijnReviewsPage() {
  const email = await getCustomerEmail();
  if (!email) redirect("/login?tab=klant");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  const { data: reviews } = await supabase
    .from("Review")
    .select("id, rating, comment, createdAt, shop:Shop(name, slug)")
    .eq("customerEmail", email)
    .order("createdAt", { ascending: false });

  const allReviews = (reviews || []) as unknown as Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    shop: { name: string; slug: string } | null;
  }>;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/mijn-afspraken"
        className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Terug naar overzicht
      </Link>

      <h1 className="font-heading text-lg font-bold mb-6 flex items-center gap-2">
        <Star className="h-5 w-5 text-gold" /> Mijn reviews ({allReviews.length})
      </h1>

      {allReviews.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <Star className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">U heeft nog geen reviews achtergelaten</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/kapperszaak/${review.shop?.slug}`}
                  className="text-sm font-semibold hover:text-gold transition-colors"
                >
                  {review.shop?.name}
                </Link>
                <span className="text-[10px] text-muted-foreground">{formatDate(review.createdAt)}</span>
              </div>
              <div className="mt-1.5 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < review.rating ? "fill-gold text-gold" : "text-muted"}`}
                  />
                ))}
              </div>
              {review.comment && (
                <p className="mt-2 text-xs text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
