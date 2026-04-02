"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize, Minimize, ArrowLeft } from "lucide-react";
import Link from "next/link";

// ── Types ──

interface Barber {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  barberId: string;
  customerName: string;
  startTime: string;
  endTime: string;
  date: string;
  status: string;
  barber?: { name: string } | null;
  service?: { name: string; duration: number; price: number } | null;
}

interface DigiboxDisplayProps {
  shopId: string;
  shopName: string;
  barbers: Barber[];
  initialAppointments: Appointment[];
}

// ── Helpers ──

const dayNames = [
  "Zondag", "Maandag", "Dinsdag", "Woensdag",
  "Donderdag", "Vrijdag", "Zaterdag",
];
const monthNames = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

function formatDate(d: Date) {
  return `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const barberColors = [
  { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)", text: "#93C5FD", dot: "#3B82F6" },
  { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)", text: "#6EE7B7", dot: "#10B981" },
  { bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.4)", text: "#C4B5FD", dot: "#A855F7" },
  { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", text: "#FCD34D", dot: "#F59E0B" },
  { bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.4)", text: "#F9A8D4", dot: "#EC4899" },
  { bg: "rgba(20,184,166,0.15)", border: "rgba(20,184,166,0.4)", text: "#5EEAD4", dot: "#14B8A6" },
  { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", text: "#FCA5A5", dot: "#EF4444" },
  { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.4)", text: "#A5B4FC", dot: "#6366F1" },
];

// ── Component ──

export function DigiboxDisplay({
  shopId,
  shopName,
  barbers,
  initialAppointments,
}: DigiboxDisplayProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Live clock ──
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch appointments ──
  const fetchAppointments = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );
      const { data } = await supabase
        .from("Appointment")
        .select("*, barber:Barber(name), service:Service(name, duration, price)")
        .eq("shopId", shopId)
        .eq("date", today)
        .order("startTime", { ascending: true });
      if (data) setAppointments(data);
    } catch {
      // silent
    }
  }, [shopId]);

  // ── Supabase Realtime ──
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    const channel = supabase
      .channel(`digibox_${shopId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "Appointment",
        filter: `shopId=eq.${shopId}`,
      }, () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(fetchAppointments, 1000);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [shopId, fetchAppointments]);

  // ── Fullscreen ──
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Derived: time calculations ──
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Filter active appointments
  const activeApts = appointments.filter(
    (a) => a.status !== "CANCELLED" && timeToMinutes(a.endTime) > nowMinutes
  );

  // Dynamic time range: earliest start - 1h to latest end + 1h
  const allStarts = activeApts.map((a) => timeToMinutes(a.startTime));
  const allEnds = activeApts.map((a) => timeToMinutes(a.endTime));
  const defaultStart = Math.max(0, nowMinutes - 60);
  const defaultEnd = Math.min(1440, nowMinutes + 180);
  const rangeStart = allStarts.length > 0
    ? Math.floor(Math.min(Math.min(...allStarts), nowMinutes) / 60) * 60 - 60
    : defaultStart;
  const rangeEnd = allEnds.length > 0
    ? Math.ceil(Math.max(Math.max(...allEnds), nowMinutes) / 60) * 60 + 60
    : defaultEnd;
  const clampedStart = Math.max(0, rangeStart);
  const clampedEnd = Math.min(1440, rangeEnd);
  const totalMinutes = clampedEnd - clampedStart;

  // Generate 30-min time slots
  const timeSlots: number[] = [];
  for (let m = clampedStart; m < clampedEnd; m += 30) {
    timeSlots.push(m);
  }

  // Now line position (percentage)
  const nowLinePercent = totalMinutes > 0
    ? ((nowMinutes - clampedStart) / totalMinutes) * 100
    : 0;
  const showNowLine = nowMinutes >= clampedStart && nowMinutes <= clampedEnd;

  // Auto-scroll to keep now-line visible
  useEffect(() => {
    if (timelineRef.current && showNowLine) {
      const container = timelineRef.current;
      const targetScroll = (nowLinePercent / 100) * container.scrollHeight - container.clientHeight / 3;
      container.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
    }
  }, [nowLinePercent, showNowLine]);

  // Row height per 30 min
  const ROW_HEIGHT = 80; // px per 30-min slot

  return (
    <div
      ref={containerRef}
      className="flex h-screen flex-col text-white overflow-hidden"
      style={{ background: "#111111" }}
    >
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes digiboxBg { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      `}</style>

      {/* ── Header ── */}
      <header
        className="shrink-0 px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8 text-center border-b border-white/[0.06]"
        style={{
          background: "linear-gradient(135deg, #111111 0%, #151518 50%, #111111 100%)",
          backgroundSize: "200% 200%",
          animation: "digiboxBg 40s ease infinite",
        }}
      >
        <div className="font-mono font-bold tracking-wider text-4xl sm:text-5xl lg:text-7xl">
          <span>{hours}</span>
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-white/40"
          >:</motion.span>
          <span>{minutes}</span>
          <span className="hidden sm:inline ml-2 text-lg lg:text-2xl text-white/20 font-normal">
            {seconds}
          </span>
        </div>
        <h1 className="mt-1 text-base sm:text-lg lg:text-xl font-semibold text-white/80">
          {shopName}
        </h1>
        <p className="text-xs sm:text-sm text-white/30">{formatDate(now)}</p>

        {/* Controls (absolute) */}
        <div className="absolute right-4 top-4 sm:right-8 sm:top-6 flex items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg p-2 text-white/20 hover:bg-white/5 hover:text-white/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <button
            onClick={toggleFullscreen}
            className="hidden sm:block rounded-lg p-2 text-white/20 hover:bg-white/5 hover:text-white/50 transition-colors"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Timeline Grid ── */}
      {barbers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30">Geen actieve kappers gevonden.</p>
        </div>
      ) : (
        <div ref={timelineRef} className="flex-1 overflow-auto">
          {/* Barber headers (sticky) */}
          <div className="sticky top-0 z-20 flex border-b border-white/[0.06]" style={{ background: "#111111" }}>
            {/* Time column header */}
            <div className="w-16 sm:w-20 shrink-0" />
            {/* Barber name headers */}
            {barbers.map((barber, i) => {
              const color = barberColors[i % barberColors.length];
              return (
                <div
                  key={barber.id}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-l border-white/[0.06]"
                >
                  <div
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold"
                    style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}
                  >
                    {barber.name[0]}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white/80 truncate max-w-[100px]">
                    {barber.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid body */}
          <div className="relative flex" style={{ height: `${timeSlots.length * ROW_HEIGHT}px` }}>
            {/* Time labels column */}
            <div className="w-16 sm:w-20 shrink-0 relative">
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="absolute right-2 sm:right-3 text-[10px] sm:text-xs text-white/25 font-mono -translate-y-1/2"
                  style={{ top: `${((slot - clampedStart) / totalMinutes) * 100}%` }}
                >
                  {minutesToTime(slot)}
                </div>
              ))}
            </div>

            {/* Barber columns with grid lines */}
            <div className="flex-1 relative">
              {/* Horizontal grid lines (per 30 min) */}
              {timeSlots.map((slot) => (
                <div
                  key={`line-${slot}`}
                  className="absolute left-0 right-0 border-t border-white/[0.04]"
                  style={{ top: `${((slot - clampedStart) / totalMinutes) * 100}%` }}
                />
              ))}

              {/* Vertical grid lines (per barber) */}
              {barbers.map((_, i) => (
                <div
                  key={`vline-${i}`}
                  className="absolute top-0 bottom-0 border-l border-white/[0.06]"
                  style={{ left: `${(i / barbers.length) * 100}%` }}
                />
              ))}

              {/* Now line */}
              {showNowLine && (
                <div
                  className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                  style={{ top: `${nowLinePercent}%` }}
                >
                  <div className="h-3 w-3 -ml-1.5 rounded-full bg-[#2ECC71] shadow-[0_0_8px_rgba(46,204,113,0.5)]" />
                  <div className="flex-1 h-[2px] bg-[#2ECC71] shadow-[0_0_6px_rgba(46,204,113,0.3)]" />
                </div>
              )}

              {/* Appointment blocks */}
              <AnimatePresence>
                {activeApts.map((apt) => {
                  const barberIndex = barbers.findIndex((b) => b.id === apt.barberId);
                  if (barberIndex === -1) return null;

                  const startMin = timeToMinutes(apt.startTime);
                  const endMin = timeToMinutes(apt.endTime);
                  const duration = endMin - startMin;
                  const topPercent = ((startMin - clampedStart) / totalMinutes) * 100;
                  const heightPercent = (duration / totalMinutes) * 100;
                  const color = barberColors[barberIndex % barberColors.length];

                  const isNow = nowMinutes >= startMin && nowMinutes < endMin;
                  const isNext = !isNow && startMin > nowMinutes &&
                    !activeApts.some((other) =>
                      other.barberId === apt.barberId &&
                      other.id !== apt.id &&
                      timeToMinutes(other.startTime) > nowMinutes &&
                      timeToMinutes(other.startTime) < startMin
                    );
                  const progress = isNow && duration > 0
                    ? Math.min(100, ((nowMinutes - startMin) / duration) * 100)
                    : 0;

                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="absolute rounded-lg overflow-hidden"
                      style={{
                        top: `${topPercent}%`,
                        height: `${heightPercent}%`,
                        left: `calc(${(barberIndex / barbers.length) * 100}% + 4px)`,
                        width: `calc(${100 / barbers.length}% - 8px)`,
                        minHeight: "40px",
                        background: color.bg,
                        border: isNow
                          ? `2px solid #2ECC71`
                          : `1px solid ${color.border}`,
                        boxShadow: isNow ? "0 0 20px rgba(46,204,113,0.15)" : "none",
                      }}
                    >
                      <div className="p-2 sm:p-3 h-full flex flex-col justify-between relative">
                        {/* Badge */}
                        {isNow && (
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 flex items-center gap-1 rounded-full bg-[#2ECC71] px-2 py-0.5"
                          >
                            <motion.div
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="h-1.5 w-1.5 rounded-full bg-white"
                            />
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase text-white tracking-wider">NU</span>
                          </motion.div>
                        )}
                        {isNext && (
                          <div
                            className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 rounded-full px-2 py-0.5 border border-white/20"
                            style={{
                              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                              backgroundSize: "200% 100%",
                              animation: "shimmer 3s ease infinite",
                            }}
                          >
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase text-white/50 tracking-wider">Volgende</span>
                          </div>
                        )}

                        <div className="pr-16 sm:pr-20">
                          <p className={`font-semibold truncate ${isNow ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`} style={{ color: color.text }}>
                            {apt.customerName}
                          </p>
                          {apt.service?.name && (
                            <p className="text-[10px] sm:text-xs text-white/30 truncate mt-0.5">
                              {apt.service.name}
                            </p>
                          )}
                        </div>
                        <p className="text-[9px] sm:text-[10px] font-mono text-white/25 mt-auto">
                          {apt.startTime} — {apt.endTime}
                        </p>

                        {/* Progress bar for NOW */}
                        {isNow && (
                          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2ECC71]/10">
                            <motion.div
                              className="h-full bg-[#2ECC71] shadow-[0_0_6px_rgba(46,204,113,0.4)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: "linear" }}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="hidden sm:flex shrink-0 items-center justify-between px-6 py-2.5 lg:px-10 border-t border-white/[0.06]">
        <div />
        <p className="text-[10px] text-white/15 tracking-widest uppercase font-medium">
          Kappersklok
        </p>
      </footer>
    </div>
  );
}
