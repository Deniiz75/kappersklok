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

function getInitials(name: string): string {
  const words = name.replace(/[^a-zA-Z\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
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

const shapes = ["circle", "roundedSquare", "hexagon", "shield", "diamond", "squircle"] as const;

const fontStyles = [
  { weight: 800, spacing: 0.04 },
  { weight: 700, spacing: 0.06 },
  { weight: 600, spacing: 0.02 },
  { weight: 900, spacing: 0.01 },
  { weight: 700, spacing: 0.08 },
];

// Decorative icons as positioned elements
function DecoScissors({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const sc = s * 0.012;
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`} opacity={0.25}>
      <circle cx="7" cy="7" r="3" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="17" cy="17" r="3" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="10" y1="10" x2="14" y2="14" stroke={color} strokeWidth="1.5" />
      <line x1="14" y1="10" x2="10" y2="14" stroke={color} strokeWidth="1.5" />
    </g>
  );
}

function DecoCrown({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const sc = s * 0.013;
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`} opacity={0.2}>
      <path d="M3 18l3-10 6 5 6-5 3 10z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
    </g>
  );
}

function DecoStar({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const sc = s * 0.012;
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`} opacity={0.2}>
      <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" stroke={color} strokeWidth="1.2" fill="none" />
    </g>
  );
}

function DecoMustache({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const sc = s * 0.015;
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`} opacity={0.2}>
      <path d="M2 12c2-4 5-4 7-2 1 1 2 1 3 0 2-2 5-2 7 2" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function DecoBlade({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const sc = s * 0.013;
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`} opacity={0.2}>
      <rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="1.2" fill="none" />
      <line x1="12" y1="6" x2="12" y2="18" stroke={color} strokeWidth="0.8" />
    </g>
  );
}

const decoComponents = [DecoScissors, DecoCrown, DecoStar, DecoMustache, DecoBlade, null, null, null];

export function ShopMonogram({ name, size = 64, className = "" }: ShopMonogramProps) {
  const h = hashString(name);
  const h2 = hashN(name, 42);
  const h3 = hashN(name, 99);
  const h4 = hashN(name, 7);
  const initials = getInitials(name);
  const palette = palettes[h % palettes.length];
  const shape = shapes[h2 % shapes.length];
  const DecoComp = decoComponents[h3 % decoComponents.length];
  const font = fontStyles[(h + h2) % fontStyles.length];
  const fontSize = size * 0.32;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const sw = size * 0.02;

  const hasInnerRing = h3 % 3 === 0;
  const hasAccentLine = h4 % 4 === 0;
  const hasDots = h % 5 === 0;
  const hasDiagonals = h2 % 5 === 0;

  const decoX = (h % 2 === 0) ? size * 0.7 : size * 0.02;
  const decoY = (h2 % 2 === 0) ? size * 0.01 : size * 0.65;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label={`${name} logo`}
    >
      {/* Pattern defs */}
      {hasDots && (
        <defs>
          <pattern id={`dots-${h}`} width={size * 0.12} height={size * 0.12} patternUnits="userSpaceOnUse">
            <circle cx={size * 0.06} cy={size * 0.06} r={0.8} fill={palette.accent} opacity={0.1} />
          </pattern>
        </defs>
      )}
      {hasDiagonals && (
        <defs>
          <pattern id={`diag-${h}`} width={size * 0.1} height={size * 0.1} patternUnits="userSpaceOnUse">
            <line x1={0} y1={size * 0.1} x2={size * 0.1} y2={0} stroke={palette.accent} strokeWidth={0.5} opacity={0.08} />
          </pattern>
        </defs>
      )}

      {/* Background shape */}
      {shape === "circle" && (
        <circle cx={cx} cy={cy} r={r} fill={palette.bg} stroke={palette.accent} strokeWidth={sw} />
      )}
      {shape === "roundedSquare" && (
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={size * 0.12} fill={palette.bg} stroke={palette.accent} strokeWidth={sw} />
      )}
      {shape === "hexagon" && (
        <polygon
          points={Array.from({ length: 6 }, (_, i) => {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          }).join(" ")}
          fill={palette.bg}
          stroke={palette.accent}
          strokeWidth={sw}
        />
      )}
      {shape === "shield" && (
        <path
          d={`M${cx} ${cy - r} L${cx + r * 0.85} ${cy - r * 0.5} L${cx + r * 0.85} ${cy + r * 0.3} Q${cx + r * 0.85} ${cy + r} ${cx} ${cy + r} Q${cx - r * 0.85} ${cy + r} ${cx - r * 0.85} ${cy + r * 0.3} L${cx - r * 0.85} ${cy - r * 0.5} Z`}
          fill={palette.bg}
          stroke={palette.accent}
          strokeWidth={sw}
        />
      )}
      {shape === "diamond" && (
        <rect
          x={cx - r * 0.78}
          y={cy - r * 0.78}
          width={r * 1.56}
          height={r * 1.56}
          rx={size * 0.06}
          fill={palette.bg}
          stroke={palette.accent}
          strokeWidth={sw}
          transform={`rotate(45 ${cx} ${cy})`}
        />
      )}
      {shape === "squircle" && (
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={size * 0.22} fill={palette.bg} stroke={palette.accent} strokeWidth={sw} />
      )}

      {/* Pattern overlay */}
      {hasDots && <rect x={0} y={0} width={size} height={size} fill={`url(#dots-${h})`} />}
      {hasDiagonals && <rect x={0} y={0} width={size} height={size} fill={`url(#diag-${h})`} />}

      {/* Inner ring */}
      {hasInnerRing && shape === "circle" && (
        <circle cx={cx} cy={cy} r={r * 0.82} fill="none" stroke={palette.accent} strokeWidth={size * 0.005} opacity={0.3} />
      )}
      {hasInnerRing && (shape === "roundedSquare" || shape === "squircle") && (
        <rect
          x={cx - r * 0.82}
          y={cy - r * 0.82}
          width={r * 1.64}
          height={r * 1.64}
          rx={size * (shape === "squircle" ? 0.17 : 0.08)}
          fill="none"
          stroke={palette.accent}
          strokeWidth={size * 0.005}
          opacity={0.3}
        />
      )}

      {/* Accent line */}
      {hasAccentLine && (
        <line
          x1={cx - r * 0.5}
          y1={cy + r * 0.55}
          x2={cx + r * 0.5}
          y2={cy + r * 0.55}
          stroke={palette.accent}
          strokeWidth={size * 0.008}
          opacity={0.3}
          strokeLinecap="round"
        />
      )}

      {/* Decorative icon */}
      {DecoComp && <DecoComp x={decoX} y={decoY} s={size} color={palette.accent} />}

      {/* Initials */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={palette.text}
        fontSize={fontSize}
        fontFamily="system-ui, sans-serif"
        fontWeight={font.weight}
        letterSpacing={size * font.spacing}
      >
        {initials}
      </text>
    </svg>
  );
}
