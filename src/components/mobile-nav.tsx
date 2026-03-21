"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  CreditCard,
  CalendarDays,
  Star,
  MessageSquare,
  Users,
  Scissors,
  Settings,
  MoreHorizontal,
  LogOut,
  Heart,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Store,
  CreditCard,
  CalendarDays,
  Star,
  MessageSquare,
  Users,
  Scissors,
  Settings,
  Heart,
  User,
};

interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  iconName: string;
}

interface MobileNavProps {
  items: NavItem[];
  logoutAction?: string;
}

export function MobileNav({ items, logoutAction = "/api/logout" }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const visible = items.slice(0, 3);
  const overflow = items.slice(3);

  function Icon({ name, className }: { name: string; className?: string }) {
    const Comp = iconMap[name] || LayoutDashboard;
    return <Comp className={className} />;
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden safe-area-bottom">
        <div className="flex items-stretch">
          {visible.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-muted-foreground active:text-gold transition-colors"
            >
              <Icon name={item.iconName} className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.shortLabel}</span>
            </Link>
          ))}
          {overflow.length > 0 && (
            <button
              onClick={() => setOpen(true)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-muted-foreground active:text-gold transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">Meer</span>
            </button>
          )}
        </div>
      </nav>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl border-t border-border bg-background px-2 pb-8 pt-3 md:hidden animate-slide-up">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />
            <div className="space-y-1 px-2">
              {overflow.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground transition-colors active:bg-gold/10"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface">
                    <Icon name={item.iconName} className="h-4 w-4 text-gold" />
                  </div>
                  {item.label}
                </Link>
              ))}
              <form action={logoutAction} method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors active:bg-destructive/10"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface">
                    <LogOut className="h-4 w-4" />
                  </div>
                  Uitloggen
                </button>
              </form>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-3 flex w-full items-center justify-center rounded-xl bg-surface py-3 text-sm font-medium text-muted-foreground"
            >
              Sluiten
            </button>
          </div>
        </>
      )}
    </>
  );
}
