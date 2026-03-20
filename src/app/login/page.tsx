"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroBanner } from "@/components/hero-banner";

export default function LoginPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    };

    const result = await loginAction(data);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error);
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
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  E-mail adres
                </label>
                <Input id="email" name="email" type="email" required className="border-border bg-background" />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">
                  Wachtwoord
                </label>
                <Input id="password" name="password" type="password" required className="border-border bg-background" />
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
          </div>
        </div>
      </section>
    </>
  );
}
