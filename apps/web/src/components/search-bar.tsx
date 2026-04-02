"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";

const popularCities = [
  "Alle steden", "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven",
  "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen", "Arnhem", "Haarlem",
  "Enschede", "Apeldoorn", "Amersfoort", "Zaandam", "Den Bosch", "Hoofddorp",
  "Maastricht", "Leiden", "Dordrecht", "Zoetermeer", "Deventer", "Delft",
  "Alkmaar", "Amstelveen", "Roosendaal", "Bergen op Zoom", "Spijkenisse",
  "Rijswijk", "Den Helder", "Hilversum",
];

export function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("Alle steden");
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value.trim();
    const searchCity = city !== "Alle steden" ? city : "";
    const query = q || searchCity;
    router.push(query ? `/kapper-zoeken?q=${encodeURIComponent(query)}` : "/kapper-zoeken");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl">
      <div className="flex rounded-xl overflow-hidden neon-border neon-border-focus bg-white/[0.05] transition-all duration-300">
        {/* City dropdown */}
        <div className="relative hidden sm:block border-r border-white/10">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 h-12 px-4 text-sm text-white/60 hover:text-white transition-colors whitespace-nowrap"
          >
            <MapPin className="h-4 w-4 text-gold" />
            <span className="max-w-[120px] truncate">{city}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute top-full left-0 z-20 mt-1 w-56 max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-[#141414] shadow-xl shadow-black/50">
                {popularCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCity(c); setOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#2ECC71]/10 hover:text-[#2ECC71] ${
                      city === c ? "text-[#2ECC71] bg-[#2ECC71]/5 font-medium" : "text-white/60"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Search input */}
        <input
          name="q"
          type="text"
          placeholder="Zoek een kapper of stad..."
          className="flex-1 h-12 bg-transparent px-4 text-sm text-white placeholder:text-white/40 outline-none"
        />

        {/* Search button */}
        <button
          type="submit"
          className="flex items-center gap-2 h-12 px-6 bg-[#2ECC71] text-white font-semibold text-sm hover:bg-[#27AE60] transition-all rounded-r-xl whitespace-nowrap"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Zoeken</span>
        </button>
      </div>
    </form>
  );
}
