"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonLink } from "@/components/button-link";
import { BrandLink } from "@/components/brand-link";
import { Settings, LogOut, LayoutDashboard } from "lucide-react";

const navLinks = [
  { href: "/kapper-zoeken", label: "Kappers zoeken" },
  { href: "/informatie", label: "Hoe het werkt" },
  { href: "/contact", label: "Contact" },
];

interface UserSession {
  userId: string;
  email: string;
  role: string;
  shopName: string | null;
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check auth state
  useEffect(() => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data && !data.error) setUser(data); })
      .catch(() => {});
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    if (avatarOpen) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [avatarOpen]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    setAvatarOpen(false);
    window.location.href = "/";
  }

  const initial = user?.shopName?.[0] || user?.email?.[0]?.toUpperCase() || "?";

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

          {/* Right */}
          <div className="flex items-center gap-3">
            {user ? (
              /* ── Logged in ── */
              <>
                <ButtonLink
                  href="/dashboard"
                  className="hidden bg-foreground text-white hover:bg-foreground/90 font-medium md:inline-flex rounded-full text-sm px-5 py-2.5"
                >
                  Dashboard
                </ButtonLink>

                {/* Avatar with dropdown */}
                <div ref={avatarRef} className="relative">
                  <button
                    onClick={() => setAvatarOpen(!avatarOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-white text-sm font-bold transition-transform hover:scale-105"
                  >
                    {initial}
                  </button>

                  <AnimatePresence>
                    {avatarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-white shadow-lg py-1 z-50"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {user.shopName || "Mijn account"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          onClick={() => setAvatarOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/instellingen"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          onClick={() => setAvatarOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Instellingen
                        </Link>
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Uitloggen
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* ── Not logged in ── */
              <>
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
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="relative h-5 w-6 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-foreground transition-all duration-300 ${
                  menuOpen ? "top-[9px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-[9px] block h-[1.5px] bg-foreground transition-all duration-300 ${
                  menuOpen ? "w-0 opacity-0" : "w-5 opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-foreground transition-all duration-300 ${
                  menuOpen ? "top-[9px] -rotate-45" : "top-[18px]"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
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
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block rounded-lg px-3 py-2.5 text-sm text-foreground font-medium hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="block w-full text-left rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    Uitloggen
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    Inloggen
                  </Link>
                  <div className="pt-2">
                    <ButtonLink
                      href="/registreren"
                      className="bg-foreground text-white hover:bg-foreground/90 font-medium w-full rounded-full"
                      onClick={() => setMenuOpen(false)}
                    >
                      Registreren
                    </ButtonLink>
                  </div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
