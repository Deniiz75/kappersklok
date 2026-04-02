import { CalendarDays, Search, Bell, Users, Settings, Clock } from "lucide-react";

const appointments = [
  { time: "09:00 - 09:30", name: "Ahmed K.", service: "Knippen", color: "bg-blue-100 text-blue-700" },
  { time: "09:30 - 10:15", name: "Dennis V.", service: "Knippen + Baard", color: "bg-emerald-100 text-emerald-700" },
  { time: "10:30 - 11:00", name: "Yusuf A.", service: "Fade", color: "bg-violet-100 text-violet-700" },
  { time: "11:00 - 11:45", name: "Mark J.", service: "Knippen + Wassen", color: "bg-amber-100 text-amber-700" },
  { time: "12:00 - 12:30", name: "Omar S.", service: "Baard trimmen", color: "bg-rose-100 text-rose-700" },
  { time: "13:00 - 13:45", name: "Jordi M.", service: "Knippen + Baard", color: "bg-cyan-100 text-cyan-700" },
];

const barbers = [
  { name: "Mo", initial: "M", active: true },
  { name: "Ali", initial: "A", active: true },
  { name: "Sam", initial: "S", active: false },
];

export function ProductMockup() {
  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Desktop browser mockup */}
      <div className="browser-mockup">
        <div className="browser-mockup-bar">
          <div className="browser-mockup-dot" />
          <div className="browser-mockup-dot" />
          <div className="browser-mockup-dot" />
          <div className="ml-4 flex-1 rounded-md bg-muted px-3 py-1.5">
            <span className="text-[10px] text-muted-foreground">kappersklok.nl/dashboard</span>
          </div>
        </div>

        {/* App content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-14 shrink-0 border-r border-border bg-[#1a1a1a] p-2 md:flex md:flex-col md:items-center md:gap-3 md:pt-4">
            <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center">
              <CalendarDays className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="h-7 w-7 rounded-lg flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-white/40" />
            </div>
            <div className="h-7 w-7 rounded-lg flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-white/40" />
            </div>
            <div className="h-7 w-7 rounded-lg flex items-center justify-center">
              <Bell className="h-3.5 w-3.5 text-white/40" />
            </div>
            <div className="mt-auto h-7 w-7 rounded-lg flex items-center justify-center">
              <Settings className="h-3.5 w-3.5 text-white/40" />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 md:p-4">
            {/* Top bar */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Vandaag</span>
                <span className="text-[10px] text-muted-foreground">Wo 2 apr</span>
              </div>
              <div className="flex items-center gap-1.5">
                {barbers.map((b) => (
                  <div
                    key={b.name}
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      b.active ? "bg-foreground text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {b.initial}
                  </div>
                ))}
              </div>
            </div>

            {/* Agenda grid */}
            <div className="space-y-1.5">
              {appointments.map((apt) => (
                <div
                  key={apt.time}
                  className={`rounded-lg px-3 py-2 ${apt.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold">{apt.name}</span>
                    <span className="text-[9px] opacity-70">{apt.time}</span>
                  </div>
                  <span className="text-[9px] opacity-70">{apt.service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile phone mockup overlapping */}
      <div className="absolute -right-4 -bottom-6 hidden md:block">
        <div className="phone-mockup !w-[160px] !h-[320px]">
          <div className="phone-mockup-screen !inset-[6px] !rounded-[22px]">
            <div className="flex flex-col h-full bg-white p-3">
              <div className="text-center pt-4 pb-2">
                <p className="text-[8px] font-bold tracking-wider text-foreground">KAPPERSKLOK</p>
              </div>
              <div className="rounded-md bg-muted px-2 py-1.5 mb-2">
                <div className="flex items-center gap-1">
                  <Search className="h-2.5 w-2.5 text-muted-foreground" />
                  <span className="text-[7px] text-muted-foreground">Zoek kapper...</span>
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                {["Barber Kings", "Chaci Barbers", "Ace Cuts"].map((name) => (
                  <div key={name} className="rounded-md border border-border p-1.5 flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                      <span className="text-[6px] font-bold text-white">{name[0]}</span>
                    </div>
                    <div>
                      <p className="text-[7px] font-semibold text-foreground">{name}</p>
                      <p className="text-[5px] text-muted-foreground">Open · 4.9 ★</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
