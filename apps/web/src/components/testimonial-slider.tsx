"use client";

import { useState, useEffect } from "react";
import { Quote, Star } from "lucide-react";

interface Testimonial {
  name: string;
  shop: string;
  text: string;
  stars: number;
}

export function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="relative">
      {/* Slides */}
      <div className="relative min-h-[180px]">
        {testimonials.map((t, i) => (
          <div
            key={t.name}
            className={`absolute inset-0 transition-all duration-500 ${
              i === active ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
            }`}
          >
            <div className="rounded-xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6">
              <Quote className="h-5 w-5 text-gold/40 mb-3" />
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
                  <span className="text-sm font-bold text-gold">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.shop}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-gold text-gold" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-gold" : "w-2 bg-border hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
