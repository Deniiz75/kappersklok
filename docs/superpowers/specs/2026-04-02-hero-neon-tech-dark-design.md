# Hero Redesign: Neon Accent / Tech Dark — Subtiel

## Context
De Kappersklok hero sectie mist visuele identiteit en voelt te simpel. Dit redesign transformeert de hero naar een modern "tech dark" thema met subtiele neon accenten, geïnspireerd door Linear en Raycast.

## Design Beslissingen

| Element | Keuze | Reden |
|---------|-------|-------|
| Achtergrond | Puur zwart `#0D0D0D`, geen grid | Maximaal clean, alle focus op neon elementen |
| Glow level | Subtiel | Professioneel, neon is accent niet de show |
| Titel kleur | Gouden gradient + groene glow | Combineert beide brandkleuren (goud + groen) |
| Stats | In de hero | Social proof boven de fold |
| Signature animatie | Pulse rings | Uniek, geeft "levend" gevoel |
| Zoekbalk | Neon glow border | Past bij thema, intensiveert bij focus |
| Testimonials | Behouden + neon styling | Social proof met consistent design |
| Grid patroon | Verwijderd | Puur zwart voor maximale clean look |

## Technische Specificaties

### Achtergrond
```css
background: #0D0D0D;
/* Geen bg-grid-dark meer */
/* noise-overlay behouden voor textuur */
```

### Titel
```css
/* Gouden gradient tekst */
background: linear-gradient(135deg, #B8923F, #D4A853, #B8923F);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Groene glow wrapper */
filter: drop-shadow(0 0 30px rgba(46, 204, 113, 0.2));
```

### Pulse Rings (signature animatie)
```css
@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.15; }
  100% { transform: scale(2.5); opacity: 0; }
}

/* 3 ringen met verschillende delays */
/* Gecentreerd achter de titel */
/* border: 1px solid rgba(46, 204, 113, 0.15) */
/* animation: pulse-ring 3s ease-out infinite */
```

### Neon Borders (subtiel)
```css
/* Zoekbalk */
border: 1px solid rgba(46, 204, 113, 0.3);
box-shadow: 0 0 15px rgba(46, 204, 113, 0.08);
background: rgba(255, 255, 255, 0.05);

/* Zoekbalk focus */
border-color: rgba(46, 204, 113, 0.6);
box-shadow: 0 0 25px rgba(46, 204, 113, 0.15);

/* Testimonial card */
border: 1px solid rgba(46, 204, 113, 0.2);
box-shadow: 0 0 10px rgba(46, 204, 113, 0.05);
```

### Stats in Hero
```
── neon divider line ──

  ✦ 53+        ✦ 10K+       ✦ 4.9      ✦ 70%
  Kappers      Afspraken     ★★★★★      Minder no-shows

  Animated count-up bij scroll into view
  Subtiele groene glow op de cijfers
```

## Bestanden die gewijzigd worden
1. `apps/web/src/app/page.tsx` — Hero section volledig
2. `apps/web/src/app/globals.css` — Pulse ring animatie, neon utilities
3. `apps/web/src/components/search-bar.tsx` — Neon border styling

## Wat NIET verandert
- Alle secties onder de hero
- Kleuren palette (groen, goud)
- Fonts (Playfair Display + DM Sans)
- TestimonialSlider component logica
- SearchBar functionaliteit

## Verificatie
1. `npm run dev` — visueel checken
2. Pulse rings draaien smooth (geen jank)
3. Zoekbalk glow intensiveert bij focus
4. Stats count-up animatie werkt
5. Testimonial slider roteert met neon styling
6. Mobiel responsive (pulse rings kleiner op mobile)
7. `prefers-reduced-motion` respecteren
