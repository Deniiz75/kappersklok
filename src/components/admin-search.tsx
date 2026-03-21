"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Search, Store, User, CalendarDays } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface SearchResult {
  type: "shop" | "customer" | "appointment";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export function AdminSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const pattern = `%${query}%`;

      const [{ data: shops }, { data: customers }, { data: appointments }] = await Promise.all([
        supabase.from("Shop").select("id, name, city, email").or(`name.ilike.${pattern},email.ilike.${pattern},city.ilike.${pattern}`).limit(5),
        supabase.from("Customer").select("id, name, email, phone").or(`name.ilike.${pattern},email.ilike.${pattern}`).limit(5),
        supabase.from("Appointment").select("id, customerName, customerEmail, date, startTime, shop:Shop(name)").or(`customerName.ilike.${pattern},customerEmail.ilike.${pattern}`).limit(5),
      ]);

      const r: SearchResult[] = [];
      for (const s of shops || []) {
        r.push({ type: "shop", id: s.id, title: s.name, subtitle: [s.city, s.email].filter(Boolean).join(" - "), href: `/dashboard/shops/${s.id}` });
      }
      for (const c of customers || []) {
        r.push({ type: "customer", id: c.id, title: c.name || c.email, subtitle: c.email, href: `/dashboard/klanten/${c.id}` });
      }
      for (const a of appointments || []) {
        const shop = a.shop as unknown as { name: string } | null;
        r.push({ type: "appointment", id: a.id, title: a.customerName, subtitle: `${shop?.name || ""} — ${a.date} ${a.startTime}`, href: `/dashboard/alle-afspraken` });
      }

      setResults(r);
      setOpen(r.length > 0);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const icons = { shop: Store, customer: User, appointment: CalendarDays };
  const labels = { shop: "Shop", customer: "Klant", appointment: "Afspraak" };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Zoek shops, klanten, afspraken..."
          className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
          {results.map((r) => {
            const Icon = icons[r.type];
            return (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => { router.push(r.href); setOpen(false); setQuery(""); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gold/10">
                  <Icon className="h-3.5 w-3.5 text-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{r.subtitle}</p>
                </div>
                <span className="text-[9px] text-muted-foreground/60 shrink-0">{labels[r.type]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
