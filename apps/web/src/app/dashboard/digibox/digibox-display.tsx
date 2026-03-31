"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/logo";
import { Wordmark } from "@/components/wordmark";
import { ShopMonogram } from "@/components/shop-monogram";
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
const shortMonthNames = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

function formatDateLong(d: Date) {
  return `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;
}

function formatDateShort(d: Date) {
  return `${dayNames[d.getDay()].slice(0, 2)} ${d.getDate()} ${shortMonthNames[d.getMonth()]}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

type AppointmentStatus = "NOW" | "NEXT" | "WAITING" | "DONE";

function getAppointmentStatus(
  apt: Appointment,
  nowMinutes: number
): AppointmentStatus {
  const start = timeToMinutes(apt.startTime);
  const end = timeToMinutes(apt.endTime);
  if (nowMinutes >= start && nowMinutes < end) return "NOW";
  if (nowMinutes >= end) return "DONE";
  return "WAITING";
}

function resolveNextStatus(
  appointments: (Appointment & { displayStatus: AppointmentStatus })[]
): (Appointment & { displayStatus: AppointmentStatus })[] {
  let foundNext = false;
  return appointments.map((apt) => {
    if (!foundNext && apt.displayStatus === "WAITING") {
      foundNext = true;
      return { ...apt, displayStatus: "NEXT" as const };
    }
    return apt;
  });
}

const accentColors = [
  "#d4a853", "#8ab4c9", "#c97d4a", "#6db87b",
  "#a48bc9", "#c9944a", "#4a9ec9", "#c94a6d",
  "#b8b44a", "#4ac9b8", "#c9a0d4", "#d4c484",
];

function hashName(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getAccentColor(name: string): string {
  return accentColors[hashName(name) % accentColors.length];
}

// ── Component ──

export function DigiboxDisplay({
  shopId,
  shopName,
  barbers,
  initialAppointments,
}: DigiboxDisplayProps) {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
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
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data } = await supabase
        .from("Appointment")
        .select(
          "*, barber:Barber(name), service:Service(name, duration, price)"
        )
        .eq("shopId", shopId)
        .eq("date", today)
        .order("startTime", { ascending: true });

      if (data) setAppointments(data);
    } catch {
      // silent — keep showing current data
    }
  }, [shopId]);

  // ── Supabase Realtime ──
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const channel = supabase
      .channel(`digibox_${shopId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Appointment",
          filter: `shopId=eq.${shopId}`,
        },
        () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(fetchAppointments, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [shopId, fetchAppointments]);

  // ── Fullscreen toggle ──
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ── Derived state ──
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const appointmentsByBarber = barbers.map((barber) => {
    const barberApts = appointments
      .filter(
        (a) => a.barberId === barber.id && a.status !== "CANCELLED"
      )
      .map((a) => ({
        ...a,
        displayStatus: getAppointmentStatus(a, nowMinutes),
      }));

    return {
      barber,
      appointments: resolveNextStatus(barberApts),
    };
  });

  const totalActive = appointmentsByBarber.reduce(
    (sum, { appointments: apts }) =>
      sum + apts.filter((a) => a.displayStatus !== "DONE").length,
    0
  );

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col text-foreground overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d14 25%, #0a0f12 50%, #0c0a10 75%, #0a0a0f 100%)",
        backgroundSize: "400% 400%",
        animation: "digiboxBg 40s ease infinite",
      }}
    >
      <style>{`
        @keyframes digiboxBg {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 25%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 0% 75%; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className="relative px-3 py-3 sm:px-6 sm:py-5 lg:px-10 lg:py-6">
        {/* Radial glow behind header */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[200%] w-[80%] opacity-[0.07]" style={{ background: "radial-gradient(ellipse at top, #d4a853, transparent 70%)" }} />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 min-w-0">
            <ShopMonogram name={shopName} size={36} className="sm:hidden shrink-0" />
            <ShopMonogram name={shopName} size={56} className="hidden sm:block lg:hidden shrink-0" />
            <ShopMonogram name={shopName} size={72} className="hidden lg:block shrink-0" />
            <div className="min-w-0">
              <h1 className="font-heading text-base font-bold truncate sm:text-xl lg:text-3xl text-foreground">
                {shopName}
              </h1>
              <p className="text-xs text-white/30 sm:text-sm lg:text-base hidden sm:block tracking-wide">
                {formatDateLong(now)}
              </p>
              <p className="text-[10px] text-white/30 sm:hidden">
                {formatDateShort(now)} — {totalActive} afspra{totalActive === 1 ? "ak" : "ken"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 lg:gap-8 shrink-0">
            {/* Clock */}
            <div className="text-right">
              <div className="font-mono font-bold tracking-wider text-2xl sm:text-4xl lg:text-6xl">
                <span className="text-gold drop-shadow-[0_0_20px_rgba(212,168,83,0.3)]">{hours}</span>
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-gold/40"
                >
                  :
                </motion.span>
                <span className="text-gold drop-shadow-[0_0_20px_rgba(212,168,83,0.3)]">{minutes}</span>
                <span className="hidden sm:inline ml-1.5 text-lg text-white/20 lg:text-2xl font-normal">
                  {seconds}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/dashboard"
                className="rounded-lg p-1.5 sm:p-2 text-white/20 transition-colors hover:bg-white/5 hover:text-white/50"
                title="Terug naar dashboard"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <button
                onClick={toggleFullscreen}
                className="hidden sm:block rounded-lg p-2 text-white/20 transition-colors hover:bg-white/5 hover:text-white/50"
                title={isFullscreen ? "Volledig scherm sluiten" : "Volledig scherm"}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Separator line */}
        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </header>

      {/* ── Barber Columns ── */}
      <main className="flex-1 overflow-auto p-2.5 sm:p-5 lg:p-8">
        {barbers.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-base text-white/30 sm:text-lg">
              Geen actieve kappers gevonden.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-3 sm:gap-5 lg:gap-6 ${
              barbers.length === 1
                ? "grid-cols-1 max-w-2xl mx-auto"
                : barbers.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : barbers.length === 3
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {appointmentsByBarber.map(({ barber, appointments: barberApts }) => (
              <BarberColumn
                key={barber.id}
                barber={barber}
                appointments={barberApts}
                nowMinutes={nowMinutes}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="hidden sm:flex items-center justify-between px-6 py-3 lg:px-10">
        <div className="flex items-center gap-2 opacity-20">
          <Logo size={18} />
          <Wordmark size="sm" />
        </div>
        <p className="text-[10px] text-white/10 tracking-widest uppercase">
          Digi-box
        </p>
      </footer>
    </div>
  );
}

// ── Barber Column ──

function BarberColumn({
  barber,
  appointments,
  nowMinutes,
}: {
  barber: Barber;
  appointments: (Appointment & { displayStatus: AppointmentStatus })[];
  nowMinutes: number;
}) {
  const active = appointments.filter((a) => a.displayStatus !== "DONE");
  const done = appointments.filter((a) => a.displayStatus === "DONE");
  const accent = getAccentColor(barber.name);

  return (
    <div className="flex flex-col rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-md border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
      {/* Accent bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80, transparent)` }} />

      {/* Barber header */}
      <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <ShopMonogram name={barber.name} size={32} className="sm:hidden" />
          <ShopMonogram name={barber.name} size={40} className="hidden sm:block" />
          <h2 className="font-heading text-sm font-bold sm:text-lg lg:text-xl truncate">
            {barber.name}
          </h2>
        </div>
        <div className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-medium tracking-wide" style={{ background: `${accent}15`, color: `${accent}cc` }}>
          {active.length} afspra{active.length === 1 ? "ak" : "ken"}
        </div>
      </div>

      {/* Separator */}
      <div className="mx-3 sm:mx-5 h-px bg-white/[0.04]" />

      {/* Appointment list */}
      <div className="flex-1 space-y-2 sm:space-y-2.5 p-2.5 sm:p-4 lg:p-5">
        {active.length === 0 && done.length === 0 ? (
          <div className="py-8 sm:py-12 flex flex-col items-center gap-3 text-white/15">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="28" r="5" />
              <circle cx="28" cy="28" r="5" />
              <line x1="15" y1="24" x2="28" y2="6" />
              <line x1="25" y1="24" x2="12" y2="6" />
            </svg>
            <p className="text-xs sm:text-sm">Geen afspraken vandaag</p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {active.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} nowMinutes={nowMinutes} />
              ))}
            </AnimatePresence>

            {/* Done appointments */}
            {done.length > 0 && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/[0.04]">
                <p className="mb-2 text-[10px] sm:text-xs font-medium text-white/20 uppercase tracking-widest">
                  Afgerond ({done.length})
                </p>
                {done.slice(-3).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between py-1 sm:py-1.5 text-[10px] sm:text-xs text-white/15"
                  >
                    <span className="truncate mr-2">{apt.customerName}</span>
                    <span className="font-mono shrink-0">{apt.startTime}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Appointment Card ──

function AppointmentCard({
  appointment: apt,
  nowMinutes,
}: {
  appointment: Appointment & { displayStatus: AppointmentStatus };
  nowMinutes: number;
}) {
  const isNow = apt.displayStatus === "NOW";
  const isNext = apt.displayStatus === "NEXT";

  // Progress calculation for NOW appointments
  const startMin = timeToMinutes(apt.startTime);
  const endMin = timeToMinutes(apt.endTime);
  const duration = endMin - startMin;
  const progress = isNow && duration > 0
    ? Math.min(100, Math.max(0, ((nowMinutes - startMin) / duration) * 100))
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative rounded-lg sm:rounded-xl overflow-hidden transition-all ${
        isNow
          ? "border border-gold/50 shadow-[0_0_30px_-5px_rgba(212,168,83,0.25)]"
          : isNext
            ? "border border-gold/20"
            : "border border-white/[0.05]"
      }`}
      style={{
        background: isNow
          ? "linear-gradient(135deg, rgba(212,168,83,0.12) 0%, rgba(212,168,83,0.04) 100%)"
          : isNext
            ? "rgba(212,168,83,0.04)"
            : "rgba(255,255,255,0.015)",
      }}
    >
      <div className="p-3 sm:p-4">
        {/* NOW badge */}
        {isNow && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-2 top-2 sm:right-3 sm:top-3 flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-0.5 sm:px-3 sm:py-1"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-background"
            />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-background tracking-wider">
              NU
            </span>
          </motion.div>
        )}

        {/* NEXT badge */}
        {isNext && (
          <div
            className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 border border-gold/30"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.08), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s ease infinite",
            }}
          >
            <span className="text-[9px] sm:text-[10px] font-bold uppercase text-gold/60 tracking-wider">
              Volgende
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2 sm:gap-3 pr-16 sm:pr-20">
          <div className="min-w-0 flex-1">
            <p className={`truncate font-semibold ${isNow ? "text-base sm:text-lg lg:text-xl" : "text-sm sm:text-base"}`}>
              {apt.customerName}
            </p>
            {apt.service?.name && (
              <p className="truncate text-[11px] sm:text-xs text-white/30 mt-0.5">
                {apt.service.name}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className={`font-mono font-bold ${isNow ? "text-sm sm:text-base text-gold" : "text-xs sm:text-sm text-white/50"}`}>
              {apt.startTime}
              <span className="text-white/20 mx-0.5">—</span>
              {apt.endTime}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar for NOW */}
      {isNow && (
        <div className="h-0.5 bg-gold/10">
          <motion.div
            className="h-full bg-gold/60"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
      )}
    </motion.div>
  );
}
