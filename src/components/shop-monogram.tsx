interface ShopMonogramProps {
  name: string;
  size?: number;
  className?: string;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function hashN(str: string, seed: number): number {
  let hash = seed;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 7) - hash);
  }
  return Math.abs(hash);
}

function getShortName(name: string): string {
  const clean = name.replace(/[^a-zA-ZÀ-ÿ\s&'.-]/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 2) return clean.toUpperCase();
  return words.slice(0, 2).join(" ").toUpperCase();
}

function getDisplayName(name: string): { top: string; bottom: string } {
  const clean = name.replace(/[^a-zA-ZÀ-ÿ\s&'.-]/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) return { top: words[0].toUpperCase(), bottom: "" };
  if (words.length === 2) return { top: words[0].toUpperCase(), bottom: words[1].toUpperCase() };
  const mid = Math.ceil(words.length / 2);
  return {
    top: words.slice(0, mid).join(" ").toUpperCase(),
    bottom: words.slice(mid).join(" ").toUpperCase(),
  };
}

const palettes = [
  { bg: "#1a1510", accent: "#d4a853", text: "#d4a853" },
  { bg: "#111518", accent: "#8ab4c9", text: "#8ab4c9" },
  { bg: "#18120e", accent: "#c97d4a", text: "#c97d4a" },
  { bg: "#0f1512", accent: "#6db87b", text: "#6db87b" },
  { bg: "#151118", accent: "#a48bc9", text: "#a48bc9" },
  { bg: "#181210", accent: "#c9944a", text: "#c9944a" },
  { bg: "#101518", accent: "#4a9ec9", text: "#4a9ec9" },
  { bg: "#171015", accent: "#c94a6d", text: "#c94a6d" },
  { bg: "#141410", accent: "#b8b44a", text: "#b8b44a" },
  { bg: "#101418", accent: "#4ac9b8", text: "#4ac9b8" },
  { bg: "#181418", accent: "#c9a0d4", text: "#c9a0d4" },
  { bg: "#151510", accent: "#d4c484", text: "#d4c484" },
];

type Palette = (typeof palettes)[number];

interface CompositionProps {
  name: string;
  palette: Palette;
  iconIndex: number;
  uid: string;
}

// ═══════════════════════════════════════════════════
// BARBER ICONS — each renders centered at 0,0
// ═══════════════════════════════════════════════════

function IconScissorsOpen({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="-8" cy="12" r="5" />
      <circle cx="8" cy="12" r="5" />
      <line x1="-5" y1="8" x2="8" y2="-14" />
      <line x1="5" y1="8" x2="-8" y2="-14" />
    </g>
  );
}

function IconScissorsClosed({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round">
      <circle cx="-5" cy="14" r="5" />
      <circle cx="5" cy="14" r="5" />
      <line x1="-2" y1="10" x2="4" y2="-14" />
      <line x1="2" y1="10" x2="-4" y2="-14" />
    </g>
  );
}

function IconScissorsCrossed({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round">
      <circle cx="-10" cy="14" r="4.5" />
      <circle cx="10" cy="14" r="4.5" />
      <line x1="-7" y1="11" x2="12" y2="-14" />
      <line x1="7" y1="11" x2="-12" y2="-14" />
      <circle cx="0" cy="1" r="2" fill={color} />
    </g>
  );
}

function IconRazor({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-5,-16 L10,-16 Q15,-16 15,-11 L15,2 Q15,7 10,7 L-5,7 Z" />
      <line x1="-5" y1="-16" x2="-5" y2="7" strokeWidth="2.5" />
      <line x1="-5" y1="-5" x2="-12" y2="-5" />
      <line x1="-12" y1="-5" x2="-12" y2="14" />
      <circle cx="-12" cy="16" r="2.5" fill={color} />
    </g>
  );
}

function IconComb({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
      <rect x="-15" y="-7" width="30" height="14" rx="3" />
      {[-10, -6, -2, 2, 6, 10].map((x) => (
        <line key={x} x1={x} y1="7" x2={x} y2="17" />
      ))}
    </g>
  );
}

function IconBrush({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="0" cy="-7" rx="8" ry="11" />
      <rect x="-5" y="4" width="10" height="14" rx="2" />
      <line x1="-3" y1="8" x2="3" y2="8" strokeWidth="1.5" />
      {[-3, 0, 3].map((x) => (
        <line key={x} x1={x} y1="-15" x2={x} y2="-1" strokeWidth="1" opacity="0.4" />
      ))}
    </g>
  );
}

function IconPole({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
      <rect x="-7" y="-18" width="14" height="36" rx="7" />
      <line x1="-7" y1="-10" x2="7" y2="-4" strokeWidth="2" opacity="0.7" />
      <line x1="-7" y1="-1" x2="7" y2="5" strokeWidth="2" opacity="0.7" />
      <line x1="-7" y1="8" x2="7" y2="14" strokeWidth="2" opacity="0.7" />
      <circle cx="0" cy="-18" r="3.5" fill={color} />
      <circle cx="0" cy="18" r="3.5" fill={color} />
    </g>
  );
}

function IconClipper({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-8,-14 L8,-14 L10,-8 L10,10 Q10,14 6,14 L-6,14 Q-10,14 -10,10 L-10,-8 Z" />
      <line x1="-10" y1="-2" x2="10" y2="-2" />
      <rect x="-6" y="-12" width="12" height="6" rx="1" strokeWidth="1.5" />
      {[-5, -1, 3, 7].map((x) => (
        <line key={x} x1={x} y1="14" x2={x} y2="19" strokeWidth="2" />
      ))}
    </g>
  );
}

const icons = [
  IconScissorsOpen, IconScissorsClosed, IconScissorsCrossed,
  IconRazor, IconComb, IconBrush, IconPole, IconClipper,
];

// ═══════════════════════════════════════════════════
// 8 COMPOSITIONS — full logo layouts in 200×200
// ═══════════════════════════════════════════════════

function CircularBadge({ name, palette, iconIndex, uid }: CompositionProps) {
  const Icon = icons[iconIndex % icons.length];
  const displayName = getShortName(name);
  const pid = `cb-${uid}`;
  return (
    <g>
      <circle cx="100" cy="100" r="94" fill={palette.bg} stroke={palette.accent} strokeWidth="3" />
      <circle cx="100" cy="100" r="84" fill="none" stroke={palette.accent} strokeWidth="1.2" opacity="0.35" />
      <circle cx="100" cy="100" r="80" fill="none" stroke={palette.accent} strokeWidth="0.6" opacity="0.15" />
      <defs>
        <path id={pid} d="M 28,100 A 72,72 0 1,1 172,100" fill="none" />
      </defs>
      <text fill={palette.text} fontSize={displayName.length > 14 ? "11" : "13"} fontFamily="system-ui, sans-serif" fontWeight="700" letterSpacing="4">
        <textPath href={`#${pid}`} startOffset="50%" textAnchor="middle">{displayName}</textPath>
      </text>
      <circle cx="36" cy="120" r="2" fill={palette.accent} opacity="0.5" />
      <circle cx="164" cy="120" r="2" fill={palette.accent} opacity="0.5" />
      <g transform="translate(100,112) scale(1.5)">
        <Icon color={palette.accent} />
      </g>
      <text x="100" y="172" textAnchor="middle" fill={palette.text} fontSize="9" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="3" opacity="0.45">BARBER</text>
    </g>
  );
}

function ShieldEmblem({ name, palette, iconIndex }: CompositionProps) {
  const Icon = icons[iconIndex % icons.length];
  const { top, bottom } = getDisplayName(name);
  return (
    <g>
      <path d="M100 8 L175 42 L175 115 Q175 175 100 194 Q25 175 25 115 L25 42 Z" fill={palette.bg} stroke={palette.accent} strokeWidth="3" />
      <path d="M100 22 L162 50 L162 112 Q162 164 100 180 Q38 164 38 112 L38 50 Z" fill="none" stroke={palette.accent} strokeWidth="1" opacity="0.25" />
      <g transform="translate(100,72) scale(1.3)"><Icon color={palette.accent} /></g>
      <line x1="52" y1="112" x2="148" y2="112" stroke={palette.accent} strokeWidth="1.2" opacity="0.35" />
      <text x="55" y="116" fill={palette.accent} fontSize="7" opacity="0.45" textAnchor="middle">★</text>
      <text x="145" y="116" fill={palette.accent} fontSize="7" opacity="0.45" textAnchor="middle">★</text>
      <text x="100" y="136" textAnchor="middle" fill={palette.text} fontSize={top.length > 10 ? "13" : "16"} fontFamily="system-ui, sans-serif" fontWeight="800" letterSpacing="2">{top}</text>
      {bottom && <text x="100" y="155" textAnchor="middle" fill={palette.text} fontSize={bottom.length > 10 ? "10" : "13"} fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="1.5" opacity="0.65">{bottom}</text>}
    </g>
  );
}

function CrossedTools({ name, palette, iconIndex }: CompositionProps) {
  const Icon1 = icons[iconIndex % icons.length];
  const Icon2 = icons[(iconIndex + 3) % icons.length];
  const displayName = getShortName(name);
  return (
    <g>
      <rect x="8" y="8" width="184" height="184" rx="12" fill={palette.bg} stroke={palette.accent} strokeWidth="2.5" />
      <text x="100" y="30" textAnchor="middle" fill={palette.accent} fontSize="9" opacity="0.4" letterSpacing="4">★  ★  ★</text>
      <g transform="translate(78,82) rotate(-30) scale(1.15)"><Icon1 color={palette.accent} /></g>
      <g transform="translate(122,82) rotate(30) scale(1.15)"><Icon2 color={palette.accent} /></g>
      <line x1="28" y1="138" x2="172" y2="138" stroke={palette.accent} strokeWidth="1" opacity="0.3" />
      <text x="100" y="162" textAnchor="middle" fill={palette.text} fontSize={displayName.length > 12 ? "14" : "18"} fontFamily="system-ui, sans-serif" fontWeight="800" letterSpacing="3">{displayName}</text>
      <line x1="28" y1="172" x2="172" y2="172" stroke={palette.accent} strokeWidth="1" opacity="0.3" />
      <text x="100" y="189" textAnchor="middle" fill={palette.text} fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="4" opacity="0.35">BARBERSHOP</text>
    </g>
  );
}

function BarberPoleComp({ name, palette, iconIndex }: CompositionProps) {
  const Icon = icons[iconIndex % icons.length];
  const displayName = getShortName(name);
  return (
    <g>
      <circle cx="100" cy="100" r="94" fill={palette.bg} stroke={palette.accent} strokeWidth="2.5" />
      <rect x="86" y="22" width="28" height="82" rx="14" fill="none" stroke={palette.accent} strokeWidth="2" />
      <line x1="86" y1="38" x2="114" y2="48" stroke={palette.accent} strokeWidth="1.8" opacity="0.55" />
      <line x1="86" y1="54" x2="114" y2="64" stroke={palette.accent} strokeWidth="1.8" opacity="0.55" />
      <line x1="86" y1="70" x2="114" y2="80" stroke={palette.accent} strokeWidth="1.8" opacity="0.55" />
      <circle cx="100" cy="22" r="5" fill={palette.accent} opacity="0.45" />
      <circle cx="100" cy="104" r="5" fill={palette.accent} opacity="0.45" />
      <g transform="translate(46,60) scale(0.55)"><Icon color={palette.accent} /></g>
      <g transform="translate(154,60) scale(-0.55,0.55)"><Icon color={palette.accent} /></g>
      <text x="100" y="140" textAnchor="middle" fill={palette.text} fontSize={displayName.length > 12 ? "13" : "16"} fontFamily="system-ui, sans-serif" fontWeight="800" letterSpacing="2">{displayName}</text>
      <line x1="38" y1="150" x2="162" y2="150" stroke={palette.accent} strokeWidth="0.8" opacity="0.3" />
      <text x="100" y="166" textAnchor="middle" fill={palette.text} fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="500" letterSpacing="3" opacity="0.4">BARBER</text>
    </g>
  );
}

function VintageSeal({ name, palette, iconIndex, uid }: CompositionProps) {
  const Icon = icons[iconIndex % icons.length];
  const displayName = getShortName(name);
  const pid = `vs-${uid}`;
  const dots = Array.from({ length: 24 }, (_, i) => {
    const a = (Math.PI * 2 / 24) * i;
    return <circle key={i} cx={100 + 90 * Math.cos(a)} cy={100 + 90 * Math.sin(a)} r="1.3" fill={palette.accent} opacity="0.3" />;
  });
  return (
    <g>
      <circle cx="100" cy="100" r="94" fill={palette.bg} stroke={palette.accent} strokeWidth="3" />
      <circle cx="100" cy="100" r="86" fill="none" stroke={palette.accent} strokeWidth="1.5" opacity="0.4" />
      <circle cx="100" cy="100" r="82" fill="none" stroke={palette.accent} strokeWidth="0.5" opacity="0.2" />
      {dots}
      <defs><path id={pid} d="M 22,100 A 78,78 0 1,1 178,100" fill="none" /></defs>
      <text fill={palette.text} fontSize={displayName.length > 14 ? "11" : "13"} fontFamily="system-ui, sans-serif" fontWeight="700" letterSpacing="4">
        <textPath href={`#${pid}`} startOffset="50%" textAnchor="middle">{displayName}</textPath>
      </text>
      <g transform="translate(100,110) scale(1.5)"><Icon color={palette.accent} /></g>
      <text x="22" y="105" fill={palette.accent} fontSize="11" opacity="0.55" textAnchor="middle">★</text>
      <text x="178" y="105" fill={palette.accent} fontSize="11" opacity="0.55" textAnchor="middle">★</text>
      <text x="100" y="176" textAnchor="middle" fill={palette.text} fontSize="9" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="3" opacity="0.4">EST.</text>
    </g>
  );
}

function ModernMark({ name, palette, iconIndex }: CompositionProps) {
  const Icon = icons[iconIndex % icons.length];
  const { top, bottom } = getDisplayName(name);
  return (
    <g>
      <rect x="8" y="8" width="184" height="184" rx="4" fill={palette.bg} stroke={palette.accent} strokeWidth="2" />
      <line x1="20" y1="20" x2="180" y2="20" stroke={palette.accent} strokeWidth="0.8" opacity="0.25" />
      <g transform="translate(100,72) scale(1.8)"><Icon color={palette.accent} /></g>
      <line x1="68" y1="122" x2="132" y2="122" stroke={palette.accent} strokeWidth="1.5" opacity="0.35" />
      <text x="100" y="148" textAnchor="middle" fill={palette.text} fontSize={top.length > 10 ? "14" : "19"} fontFamily="system-ui, sans-serif" fontWeight="800" letterSpacing="3">{top}</text>
      {bottom && <text x="100" y="168" textAnchor="middle" fill={palette.text} fontSize={bottom.length > 10 ? "10" : "13"} fontFamily="system-ui, sans-serif" fontWeight="500" letterSpacing="2" opacity="0.55">{bottom}</text>}
      <line x1="20" y1="180" x2="180" y2="180" stroke={palette.accent} strokeWidth="0.8" opacity="0.25" />
    </g>
  );
}

function BannerRibbon({ name, palette, iconIndex }: CompositionProps) {
  const Icon = icons[iconIndex % icons.length];
  const displayName = getShortName(name);
  return (
    <g>
      <circle cx="100" cy="100" r="94" fill={palette.bg} stroke={palette.accent} strokeWidth="2.5" />
      <g transform="translate(100,62) scale(1.35)"><Icon color={palette.accent} /></g>
      <path d="M14,118 L30,112 L170,112 L186,118 L170,124 L30,124 Z" fill={palette.bg} stroke={palette.accent} strokeWidth="1.8" />
      <path d="M14,118 L24,127 L30,124" fill="none" stroke={palette.accent} strokeWidth="1" opacity="0.45" />
      <path d="M186,118 L176,127 L170,124" fill="none" stroke={palette.accent} strokeWidth="1" opacity="0.45" />
      <text x="100" y="122" textAnchor="middle" fill={palette.text} fontSize={displayName.length > 12 ? "11" : "14"} fontFamily="system-ui, sans-serif" fontWeight="700" letterSpacing="2">{displayName}</text>
      <text x="100" y="150" textAnchor="middle" fill={palette.accent} fontSize="9" opacity="0.45" letterSpacing="3">★  ★  ★</text>
      <text x="100" y="170" textAnchor="middle" fill={palette.text} fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="500" letterSpacing="3" opacity="0.35">BARBERSHOP</text>
    </g>
  );
}

function DiamondFrame({ name, palette, iconIndex }: CompositionProps) {
  const Icon = icons[iconIndex % icons.length];
  const displayName = getShortName(name);
  return (
    <g>
      <rect x="29" y="29" width="142" height="142" rx="6" fill={palette.bg} stroke={palette.accent} strokeWidth="2.5" transform="rotate(45 100 100)" />
      <rect x="42" y="42" width="116" height="116" rx="4" fill="none" stroke={palette.accent} strokeWidth="0.8" opacity="0.25" transform="rotate(45 100 100)" />
      <g transform="translate(100,82) scale(1.25)"><Icon color={palette.accent} /></g>
      <text x="100" y="128" textAnchor="middle" fill={palette.text} fontSize={displayName.length > 10 ? "11" : "14"} fontFamily="system-ui, sans-serif" fontWeight="800" letterSpacing="2">{displayName}</text>
      <circle cx="100" cy="6" r="2.5" fill={palette.accent} opacity="0.45" />
      <circle cx="100" cy="194" r="2.5" fill={palette.accent} opacity="0.45" />
      <circle cx="6" cy="100" r="2.5" fill={palette.accent} opacity="0.45" />
      <circle cx="194" cy="100" r="2.5" fill={palette.accent} opacity="0.45" />
    </g>
  );
}

const compositions = [
  CircularBadge, ShieldEmblem, CrossedTools, BarberPoleComp,
  VintageSeal, ModernMark, BannerRibbon, DiamondFrame,
];

// ═══════════════════════════════════════════════════
// SMALL LOGO — simplified for sizes < 40px
// ═══════════════════════════════════════════════════

const smallShapes: ((p: Palette) => React.JSX.Element)[] = [
  (p) => <circle cx="100" cy="100" r="90" fill={p.bg} stroke={p.accent} strokeWidth="5" />,
  (p) => <rect x="10" y="10" width="180" height="180" rx="24" fill={p.bg} stroke={p.accent} strokeWidth="5" />,
  (p) => <polygon points={Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i - Math.PI / 2; return `${100 + 88 * Math.cos(a)},${100 + 88 * Math.sin(a)}`; }).join(" ")} fill={p.bg} stroke={p.accent} strokeWidth="5" />,
  (p) => <path d="M100 10 L182 48 L182 115 Q182 178 100 194 Q18 178 18 115 L18 48 Z" fill={p.bg} stroke={p.accent} strokeWidth="5" />,
  (p) => <rect x="10" y="10" width="180" height="180" rx="48" fill={p.bg} stroke={p.accent} strokeWidth="5" />,
  (p) => <rect x="32" y="32" width="136" height="136" rx="8" fill={p.bg} stroke={p.accent} strokeWidth="5" transform="rotate(45 100 100)" />,
];

function SmallLogo({ palette, iconIndex, compositionIndex }: { palette: Palette; iconIndex: number; compositionIndex: number }) {
  const Icon = icons[iconIndex % icons.length];
  return (
    <g>
      {smallShapes[compositionIndex % smallShapes.length](palette)}
      <g transform="translate(100,100) scale(2)"><Icon color={palette.accent} /></g>
    </g>
  );
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════

export function ShopMonogram({ name, size = 64, className = "" }: ShopMonogramProps) {
  const h = hashString(name);
  const h2 = hashN(name, 42);
  const h3 = hashN(name, 99);

  const palette = palettes[h % palettes.length];
  const compositionIndex = h2 % compositions.length;
  const iconIndex = h3 % icons.length;
  const uid = String(h);

  const isSmall = size < 40;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label={`${name} logo`}
    >
      {isSmall ? (
        <SmallLogo palette={palette} iconIndex={iconIndex} compositionIndex={compositionIndex} />
      ) : (
        (() => {
          const Comp = compositions[compositionIndex];
          return <Comp name={name} palette={palette} iconIndex={iconIndex} uid={uid} />;
        })()
      )}
    </svg>
  );
}
