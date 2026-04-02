"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonLink } from "@/components/button-link";
import { BrandLink } from "@/components/brand-link";

const navLinks = [
  { href: "/kapper-zoeken", label: "Kappers zoeken" },
  { href: "/informatie", label: "Hoe het werkt" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div
        className={`border-b bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-sm" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 h-16">
          {/* Left: logo */}
          <div className="flex items-center">
            <BrandLink logoSize={32} wordmarkSize="md" />
          </div>

          {/* Center: nav links (desktop) */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: login + CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              Inloggen
            </Link>
            <ButtonLink
              href="/registreren"
              className="hidden bg-foreground text-white hover:bg-foreground/90 font-medium md:inline-flex rounded-full text-sm px-5 py-2.5"
            >
              Registreren
            </ButtonLink>

            {/* Mobile hamburger */}
            <button
              className="relative h-5 w-6 md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-foreground transition-all duration-300 ${
                  open ? "top-[9px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-[9px] block h-[1.5px] bg-foreground transition-all duration-300 ${
                  open ? "w-0 opacity-0" : "w-5 opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-foreground transition-all duration-300 ${
                  open ? "top-[9px] -rotate-45" : "top-[18px]"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border bg-white md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 pb-4 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                Inloggen
              </Link>
              <div className="pt-2">
                <ButtonLink
                  href="/registreren"
                  className="bg-foreground text-white hover:bg-foreground/90 font-medium w-full rounded-full"
                  onClick={() => setOpen(false)}
                >
                  Registreren
                </ButtonLink>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
