"use client";

import { useState, useEffect } from "react";

export function LiveCounter() {
  const [count, setCount] = useState(0);
  const target = 4897;

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-semibold text-foreground tabular-nums">
        {count.toLocaleString("nl-NL")}
      </span>{" "}
      afspraken vandaag gereserveerd
    </p>
  );
}
