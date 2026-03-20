"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { BrandLink } from "@/components/brand-link";

const navLinks = [
  { href: "/informatie", label: "Info" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
        {/* Left: hamburger on mobile, nav links on desktop */}
        <div className="flex flex-1 items-center md:gap-6">
          <button
            className="mr-2 text-foreground md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
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
          </nav>
        </div>

        {/* Center: brand logo + wordmark */}
        <div className="flex items-center justify-center">
          <div className="hidden sm:block">
            <BrandLink logoSize={36} wordmarkSize="md" showTagline />
          </div>
          <div className="sm:hidden">
            <BrandLink logoSize={32} wordmarkSize="sm" />
          </div>
        </div>

        {/* Right: CTA on desktop, spacer on mobile */}
        <div className="flex flex-1 items-center justify-end">
          <ButtonLink
            href="/registreren"
            className="hidden bg-gold text-background hover:bg-gold-hover font-semibold md:inline-flex"
          >
            Kapperszaak Registreren
          </ButtonLink>
        </div>
      </div>

      {/* Mobile menu */}
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
            <ButtonLink
              href="/registreren"
              className="bg-gold text-background hover:bg-gold-hover font-semibold w-full"
              onClick={() => setOpen(false)}
            >
              Kapperszaak Registreren
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
