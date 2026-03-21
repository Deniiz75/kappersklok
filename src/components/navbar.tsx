"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ButtonLink } from "@/components/button-link";
import { BrandLink } from "@/components/brand-link";

const navLinks = [
  { href: "/kapper-zoeken", label: "Kapper Zoeken" },
  { href: "/informatie", label: "Info" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/80 bg-background/90 backdrop-blur-xl shadow-sm shadow-black/20"
          : "border-b border-border/30 bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
        {/* Left: hamburger on mobile, nav links on desktop */}
        <div className="flex flex-1 items-center md:gap-6">
          <motion.button
            className="mr-2 text-foreground md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={open ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-underline text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: brand logo + wordmark */}
        <motion.div
          className="flex items-center justify-center"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="hidden sm:block">
            <BrandLink logoSize={36} wordmarkSize="md" showTagline />
          </div>
          <div className="sm:hidden">
            <BrandLink logoSize={32} wordmarkSize="sm" />
          </div>
        </motion.div>

        {/* Right: CTA on desktop */}
        <div className="flex flex-1 items-center justify-end">
          <ButtonLink
            href="/registreren"
            className="hidden bg-gold text-background hover:bg-gold-hover font-semibold md:inline-flex btn-shimmer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/15 transition-all duration-300"
          >
            Kapperszaak Registreren
          </ButtonLink>
        </div>
      </div>

      {/* Mobile menu with animation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <nav className="flex flex-col gap-3 px-4 pb-4 pt-3">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
              >
                <ButtonLink
                  href="/registreren"
                  className="bg-gold text-background hover:bg-gold-hover font-semibold w-full btn-shimmer"
                  onClick={() => setOpen(false)}
                >
                  Kapperszaak Registreren
                </ButtonLink>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
