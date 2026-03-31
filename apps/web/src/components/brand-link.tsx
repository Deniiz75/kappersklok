"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Wordmark } from "@/components/wordmark";
import type { ComponentProps } from "react";

interface BrandLinkProps {
  logoSize?: number;
  wordmarkSize?: ComponentProps<typeof Wordmark>["size"];
  showTagline?: boolean;
  wordmarkClassName?: string;
}

export function BrandLink({
  logoSize = 36,
  wordmarkSize = "md",
  showTagline = false,
  wordmarkClassName,
}: BrandLinkProps) {
  const [clicked, setClicked] = useState(false);

  function handleClick() {
    setClicked(true);
    setTimeout(() => setClicked(false), 800);
  }

  return (
    <Link
      href="/"
      className="group flex items-center gap-3"
      onClick={handleClick}
    >
      {/* Logo with spin + scissors snip animation */}
      <div
        className={`transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          clicked ? "rotate-[360deg] scale-110" : ""
        }`}
      >
        <Logo size={logoSize} className={clicked ? "animate-logo-glow" : ""} />
      </div>

      {/* Wordmark with shimmer on click */}
      <div
        className={`relative overflow-hidden ${
          clicked ? "animate-shimmer" : ""
        }`}
      >
        <Wordmark
          size={wordmarkSize}
          showTagline={showTagline}
          className={wordmarkClassName}
        />

        {/* Gold shimmer overlay */}
        <div
          className={`pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/25 to-transparent ${
            clicked ? "animate-shimmer-sweep" : ""
          }`}
        />
      </div>
    </Link>
  );
}
