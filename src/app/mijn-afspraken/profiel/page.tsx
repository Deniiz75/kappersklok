"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCustomerProfile, updateCustomerProfile } from "@/lib/customer-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Check } from "lucide-react";

export default function ProfielPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      // Get email from cookie via API
      const res = await fetch("/api/klant-profiel");
      if (!res.ok) {
        router.push("/login?tab=klant");
        return;
      }
      const data = await res.json();
      setEmail(data.email);

      const profile = await getCustomerProfile(data.email);
      if (profile) {
        setName(profile.name || "");
        setPhone(profile.phone || "");
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const result = await updateCustomerProfile({ email, name, phone: phone || undefined });
    if (result.success) {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setError(result.error || "Er ging iets mis.");
      setStatus("error");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Terug
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
          <User className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold">Mijn profiel</h1>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium">Naam</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Uw naam"
            required
            className="border-border bg-surface text-sm"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Wordt automatisch ingevuld bij uw volgende boeking
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Telefoonnummer</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Optioneel"
            className="border-border bg-surface text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">E-mail</label>
          <Input
            value={email}
            disabled
            className="border-border bg-muted text-sm text-muted-foreground"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            E-mailadres kan niet gewijzigd worden
          </p>
        </div>

        {status === "error" && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-gold text-background hover:bg-gold-hover font-semibold"
        >
          {status === "loading" ? "Opslaan..." : status === "success" ? (
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Opgeslagen</span>
          ) : "Profiel opslaan"}
        </Button>
      </form>
    </div>
  );
}
