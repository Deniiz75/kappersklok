"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value.trim();
    router.push(q ? `/kapper-zoeken?q=${encodeURIComponent(q)}` : "/kapper-zoeken");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
      <Input
        name="q"
        type="text"
        placeholder="Voer je stad in..."
        className="h-12 border-border bg-surface text-foreground placeholder:text-muted-foreground"
      />
      <Button
        type="submit"
        className="h-12 bg-gold px-6 text-background hover:bg-gold-hover font-semibold whitespace-nowrap"
      >
        <Search className="mr-2 h-4 w-4" />
        Vind mijn kapper
      </Button>
    </form>
  );
}
