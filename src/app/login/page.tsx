"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroBanner } from "@/components/hero-banner";

export default function LoginPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (result.success) {
        setStatus("success");
        // Small delay then full page redirect
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        setError(result.error || "Inloggen mislukt.");
        setStatus("error");
      }
    } catch {
      setError("Kan geen verbinding maken met de server.");
      setStatus("error");
    }
  }

  return (
    <>
      <HeroBanner title="Inloggen" />
      <section className="py-16">
        <div className="mx-auto max-w-sm px-4">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-center text-xl font-bold">Inloggen</h2>

            {status === "success" ? (
              <div className="mt-6 rounded-lg border border-gold/30 bg-gold/5 p-4 text-center">
                <p className="font-semibold text-gold">Ingelogd!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  U wordt doorgestuurd naar het dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium">
                    E-mail adres
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="border-border bg-background"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium">
                    Wachtwoord
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="border-border bg-background"
                  />
                </div>
                {status === "error" && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-gold text-background hover:bg-gold-hover font-semibold"
                >
                  {status === "loading" ? "Inloggen..." : "Log in"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
