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
  return `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
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
          // Debounce refetch to avoid rapid-fire updates
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

  // ── Fullscreen toggle (desktop only) ──
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

  // Group appointments by barber
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

  // Total active count for mobile summary
  const totalActive = appointmentsByBarber.reduce(
    (sum, { appointments: apts }) =>
      sum + apts.filter((a) => a.displayStatus !== "DONE").length,
    0
  );

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      {/* ── Header: compact on mobile, full on desktop ── */}
      <header className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-gold/5 to-transparent px-3 py-2.5 sm:px-6 sm:py-4 lg:px-10 lg:py-5">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <ShopMonogram name={shopName} size={36} className="sm:hidden shrink-0" />
          <ShopMonogram name={shopName} size={56} className="hidden sm:block lg:hidden shrink-0" />
          <ShopMonogram name={shopName} size={72} className="hidden lg:block shrink-0" />
          <div className="min-w-0">
            <h1 className="font-heading text-base font-bold truncate sm:text-xl lg:text-3xl">
              {shopName}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm lg:text-base hidden sm:block">
              {formatDateLong(now)}
            </p>
            <p className="text-[10px] text-muted-foreground sm:hidden">
              {formatDateShort(now)} — {totalActive} afspra{totalActive === 1 ? "ak" : "ken"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
          {/* Clock: compact on mobile */}
          <div className="text-right">
            <div className="font-mono text-xl font-bold tracking-wider sm:text-3xl lg:text-5xl">
              <span className="text-gold">{hours}</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-gold/60"
              >
                :
              </motion.span>
              <span className="text-gold">{minutes}</span>
              <span className="hidden sm:inline ml-1 text-lg text-muted-foreground lg:text-2xl">
                {seconds}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg p-1.5 sm:p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              title="Terug naar dashboard"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            {/* Fullscreen: hidden on mobile (not supported on iOS) */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:block rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              title={
                isFullscreen ? "Volledig scherm sluiten" : "Volledig scherm"
              }
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Barber Columns ── */}
      <main className="flex-1 overflow-auto p-2.5 sm:p-4 lg:p-6">
        {barbers.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-base text-muted-foreground sm:text-lg">
              Geen actieve kappers gevonden.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-2.5 sm:gap-4 lg:gap-6 ${
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
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer: hidden on mobile ── */}
      <footer className="hidden sm:flex items-center justify-between border-t border-border/30 px-6 py-3 lg:px-10">
        <div className="flex items-center gap-2">
          <Logo size={20} />
          <Wordmark size="sm" />
        </div>
        <p className="text-xs text-muted-foreground/50">
          Digi-box Display
        </p>
      </footer>
    </div>
  );
}

// ── Barber Column ──

function BarberColumn({
  barber,
  appointments,
}: {
  barber: Barber;
  appointments: (Appointment & { displayStatus: AppointmentStatus })[];
}) {
  const active = appointments.filter((a) => a.displayStatus !== "DONE");
  const done = appointments.filter((a) => a.displayStatus === "DONE");

  return (
    <div className="flex flex-col rounded-xl sm:rounded-2xl border border-border/50 bg-surface/50 overflow-hidden">
      {/* Barber header */}
      <div className="flex items-center gap-2.5 sm:gap-3 border-b border-border/30 bg-surface px-3 py-2.5 sm:px-5 sm:py-4">
        <ShopMonogram name={barber.name} size={32} className="sm:hidden" />
        <ShopMonogram name={barber.name} size={40} className="hidden sm:block" />
        <div>
          <h2 className="font-heading text-sm font-bold sm:text-base lg:text-lg">
            {barber.name}
          </h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {active.length} afspra{active.length === 1 ? "ak" : "ken"} vandaag
          </p>
        </div>
      </div>

      {/* Appointment list */}
      <div className="flex-1 space-y-1.5 sm:space-y-2 p-2 sm:p-3 lg:p-4">
        {active.length === 0 && done.length === 0 ? (
          <p className="py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground/60">
            Geen afspraken vandaag
          </p>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {active.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </AnimatePresence>

            {/* Done appointments (collapsed) */}
            {done.length > 0 && (
              <div className="mt-2 sm:mt-3 border-t border-border/20 pt-2 sm:pt-3">
                <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-muted-foreground/40 uppercase tracking-wider">
                  Afgerond ({done.length})
                </p>
                {done.slice(-3).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between py-1 sm:py-1.5 text-[10px] sm:text-xs text-muted-foreground/30"
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
}: {
  appointment: Appointment & { displayStatus: AppointmentStatus };
}) {
  const isNow = apt.displayStatus === "NOW";
  const isNext = apt.displayStatus === "NEXT";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative rounded-lg sm:rounded-xl border p-2.5 sm:p-4 transition-all ${
        isNow
          ? "border-gold bg-gold/10 shadow-[0_0_20px_-4px_rgba(212,168,83,0.3)]"
          : isNext
            ? "border-gold/30 bg-gold/5"
            : "border-border/30 bg-surface/50"
      }`}
    >
      {/* NOW badge */}
      {isNow && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-1.5 top-1.5 sm:-right-1 sm:-top-1 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 sm:px-2.5"
        >
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-background"
          />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase text-background">
            NU
          </span>
        </motion.div>
      )}

      {/* NEXT badge */}
      {isNext && (
        <div className="absolute right-1.5 top-1.5 sm:-right-1 sm:-top-1 rounded-full border border-gold/40 bg-surface px-2 py-0.5 sm:px-2.5">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase text-gold/70">
            Volgende
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`truncate font-semibold ${
              isNow ? "text-base sm:text-lg lg:text-xl" : "text-sm sm:text-base"
            }`}
          >
            {apt.customerName}
          </p>
          {apt.service?.name && (
            <p className="truncate text-xs sm:text-sm text-muted-foreground">
              {apt.service.name}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`font-mono font-bold ${
              isNow ? "text-base sm:text-lg text-gold" : "text-xs sm:text-sm"
            }`}
          >
            {apt.startTime}
          </p>
          <p className="font-mono text-[10px] sm:text-xs text-muted-foreground">
            {apt.endTime}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
