"use client";

import { useState, useEffect } from "react";

interface Appointment {
  id: string;
  customerName: string;
  startTime: string;
  endTime: string;
  status: string;
  barber?: { name: string } | null;
  service?: { name: string } | null;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function MiniTimeline({ appointments }: { appointments: Appointment[] }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const active = appointments
    .filter((a) => a.status !== "CANCELLED")
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  if (active.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Geen afspraken vandaag
      </div>
    );
  }

  return (
    <div className="relative space-y-0.5">
      {active.map((apt) => {
        const startMin = timeToMinutes(apt.startTime);
        const endMin = timeToMinutes(apt.endTime);
        const isNow = nowMinutes >= startMin && nowMinutes < endMin;
        const isDone = nowMinutes >= endMin;

        return (
          <div key={apt.id} className="relative">
            {/* Now line — show before first appointment that's after current time */}
            {!isDone && !isNow && startMin > nowMinutes && (
              (() => {
                const prevIdx = active.indexOf(apt) - 1;
                const prevEnd = prevIdx >= 0 ? timeToMinutes(active[prevIdx].endTime) : 0;
                if (prevEnd <= nowMinutes || prevIdx < 0) {
                  return (
                    <div className="flex items-center gap-2 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-[#2ECC71]" />
                      <div className="flex-1 h-px bg-[#2ECC71]" />
                      <span className="text-[10px] font-mono text-[#2ECC71] font-medium">{nowTime}</span>
                    </div>
                  );
                }
                return null;
              })()
            )}

            <div
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isNow
                  ? "bg-[#2ECC71]/5 border border-[#2ECC71]/20"
                  : isDone
                    ? "opacity-40"
                    : "hover:bg-muted"
              }`}
            >
              {/* Time */}
              <div className="shrink-0 w-12 text-right">
                <span className={`text-xs font-mono ${isNow ? "text-[#2ECC71] font-semibold" : "text-muted-foreground"}`}>
                  {apt.startTime}
                </span>
              </div>

              {/* Dot indicator */}
              <div className={`shrink-0 h-2 w-2 rounded-full ${
                isNow ? "bg-[#2ECC71]" : isDone ? "bg-muted-foreground/30" : "bg-foreground/20"
              }`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${isNow ? "font-semibold text-foreground" : isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {apt.customerName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {apt.service?.name || "Dienst"}{apt.barber?.name ? ` · ${apt.barber.name}` : ""}
                </p>
              </div>

              {/* Status badge */}
              {isNow && (
                <span className="shrink-0 text-[10px] font-semibold text-[#2ECC71] uppercase tracking-wide">
                  Nu
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
