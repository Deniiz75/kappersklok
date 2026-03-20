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

function getInitials(name: string): string {
  const words = name.replace(/[^a-zA-Z\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const palettes = [
  { bg: "#1a1510", accent: "#d4a853", text: "#d4a853" }, // gold classic
  { bg: "#111518", accent: "#8ab4c9", text: "#8ab4c9" }, // steel blue
  { bg: "#18120e", accent: "#c97d4a", text: "#c97d4a" }, // copper
  { bg: "#0f1512", accent: "#6db87b", text: "#6db87b" }, // sage
  { bg: "#151118", accent: "#a48bc9", text: "#a48bc9" }, // lavender
  { bg: "#181210", accent: "#c9944a", text: "#c9944a" }, // amber
  { bg: "#101518", accent: "#4a9ec9", text: "#4a9ec9" }, // ocean
  { bg: "#171015", accent: "#c94a6d", text: "#c94a6d" }, // rose
];

const shapes = ["circle", "diamond", "hexagon", "shield"] as const;

export function ShopMonogram({ name, size = 64, className = "" }: ShopMonogramProps) {
  const hash = hashString(name);
  const initials = getInitials(name);
  const palette = palettes[hash % palettes.length];
  const shape = shapes[hash % shapes.length];
  const fontSize = size * 0.32;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={`${name} logo`}
    >
      {/* Background shape */}
      {shape === "circle" && (
        <circle cx={cx} cy={cy} r={r} fill={palette.bg} stroke={palette.accent} strokeWidth={size * 0.02} />
      )}
      {shape === "diamond" && (
        <rect
          x={cx - r * 0.75}
          y={cy - r * 0.75}
          width={r * 1.5}
          height={r * 1.5}
          rx={size * 0.06}
          fill={palette.bg}
          stroke={palette.accent}
          strokeWidth={size * 0.02}
          transform={`rotate(45 ${cx} ${cy})`}
        />
      )}
      {shape === "hexagon" && (
        <polygon
          points={Array.from({ length: 6 }, (_, i) => {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          }).join(" ")}
          fill={palette.bg}
          stroke={palette.accent}
          strokeWidth={size * 0.02}
        />
      )}
      {shape === "shield" && (
        <path
          d={`M${cx} ${cy - r} L${cx + r * 0.85} ${cy - r * 0.5} L${cx + r * 0.85} ${cy + r * 0.3} Q${cx + r * 0.85} ${cy + r} ${cx} ${cy + r} Q${cx - r * 0.85} ${cy + r} ${cx - r * 0.85} ${cy + r * 0.3} L${cx - r * 0.85} ${cy - r * 0.5} Z`}
          fill={palette.bg}
          stroke={palette.accent}
          strokeWidth={size * 0.02}
        />
      )}

      {/* Decorative inner line */}
      {shape === "circle" && (
        <circle cx={cx} cy={cy} r={r * 0.82} fill="none" stroke={palette.accent} strokeWidth={size * 0.005} opacity={0.3} />
      )}

      {/* Initials */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={palette.text}
        fontSize={fontSize}
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        letterSpacing={size * 0.02}
      >
        {initials}
      </text>
    </svg>
  );
}
