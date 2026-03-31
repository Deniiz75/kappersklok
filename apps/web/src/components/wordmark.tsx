import { cn } from "@/lib/utils";

interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
}

const sizes = {
  sm: {
    kappers: "text-[13px]",
    divider: "h-3 mx-[3px]",
    klok: "text-[13px]",
    tagline: "text-[7px] tracking-[0.18em] mt-0.5",
  },
  md: {
    kappers: "text-base",
    divider: "h-3.5 mx-1",
    klok: "text-base",
    tagline: "text-[8px] tracking-[0.2em] mt-0.5",
  },
  lg: {
    kappers: "text-2xl sm:text-3xl",
    divider: "h-5 sm:h-6 mx-1.5",
    klok: "text-2xl sm:text-3xl",
    tagline: "text-[10px] sm:text-xs tracking-[0.25em] mt-1",
  },
};

export function Wordmark({ size = "md", className, showTagline = false }: WordmarkProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex flex-col items-start", className)}>
      <div className="flex items-center font-heading uppercase">
        <span
          className={cn(
            s.kappers,
            "font-light tracking-[0.15em] text-foreground"
          )}
        >
          Kappers
        </span>
        <span
          className={cn(s.divider, "w-px bg-gold/50")}
          aria-hidden="true"
        />
        <span
          className={cn(
            s.klok,
            "font-extrabold tracking-[0.04em] text-gold"
          )}
        >
          Klok
        </span>
      </div>
      {showTagline && (
        <span
          className={cn(
            s.tagline,
            "uppercase text-muted-foreground/60 font-heading font-normal"
          )}
        >
          voor haar &amp; hem
        </span>
      )}
    </div>
  );
}
