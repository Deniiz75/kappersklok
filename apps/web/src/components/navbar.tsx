"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
    <header className="sticky top-0 z-50">
      {/* Glassmorphism container */}
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "mx-2 mt-2 rounded-2xl border border-white/[0.06] bg-black/60 backdrop-blur-2xl shadow-lg shadow-black/30"
            : "border-b border-white/[0.04] bg-black/30 backdrop-blur-md"
        }`}
      >
        <div className={`mx-auto flex max-w-6xl items-center px-4 transition-all duration-500 ${
          scrolled ? "h-14" : "h-16"
        }`}>
          {/* Left: hamburger on mobile, nav links on desktop */}
          <div className="flex flex-1 items-center md:gap-6">
            <motion.button
              className="relative mr-2 h-5 w-6 md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              whileTap={{ scale: 0.9 }}
            >
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-white/80 transition-all duration-400 ease-in-out ${
                  open ? "top-[9px] rotate-45" : "top-0 rotate-0"
                }`}
              />
              <span
                className={`absolute left-0 top-[9px] block h-[1.5px] bg-white/80 transition-all duration-400 ease-in-out ${
                  open ? "w-0 opacity-0" : "w-5 opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-white/80 transition-all duration-400 ease-in-out ${
                  open ? "top-[9px] -rotate-45" : "top-[18px] rotate-0"
                }`}
              />
            </motion.button>
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-1.5 text-sm text-white/60 transition-all duration-200 hover:text-white rounded-lg hover:bg-white/[0.05]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: brand logo */}
          <motion.div
            className="flex items-center justify-center"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <div className="hidden sm:block">
              <BrandLink logoSize={scrolled ? 30 : 36} wordmarkSize="md" showTagline={!scrolled} />
            </div>
            <div className="sm:hidden">
              <BrandLink logoSize={32} wordmarkSize="sm" />
            </div>
          </motion.div>

          {/* Right */}
          <div className="flex flex-1 items-center justify-end gap-3">
            <Link
              href="/login"
              className="hidden text-sm text-white/60 transition-all duration-200 hover:text-white md:inline-flex"
            >
              Inloggen
            </Link>
            <ButtonLink
              href="/registreren"
              className="hidden bg-gold text-background hover:bg-gold-hover font-semibold md:inline-flex btn-shimmer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/20 transition-all duration-300 text-xs px-4 py-2"
            >
              Kapperszaak Registreren
            </ButtonLink>
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`overflow-hidden ${
              scrolled ? "mx-2 rounded-b-2xl" : ""
            } border-t border-white/[0.04] bg-black/80 backdrop-blur-2xl md:hidden`}
          >
            <nav className="flex flex-col gap-1 px-4 pb-4 pt-3">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    className="block rounded-lg px-3 py-2.5 text-sm text-white/60 transition-colors hover:text-white hover:bg-white/[0.05]"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05, duration: 0.2 }}
              >
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2.5 text-sm text-white/60 transition-colors hover:text-white hover:bg-white/[0.05]"
                  onClick={() => setOpen(false)}
                >
                  Inloggen
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                className="pt-2"
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
