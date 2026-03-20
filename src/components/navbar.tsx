"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/button-link";

const navLinks = [
  { href: "/informatie", label: "Info" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.jpg"
            alt="Kappersklok logo"
            width={40}
            height={40}
            className="rounded-full"
            priority
          />
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            Kappersklok
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <ButtonLink href="/registreren" className="bg-gold text-background hover:bg-gold-hover font-semibold">
            Kapperszaak Registreren
          </ButtonLink>
        </nav>

        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink href="/registreren" className="bg-gold text-background hover:bg-gold-hover font-semibold w-full" onClick={() => setOpen(false)}>
              Kapperszaak Registreren
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
