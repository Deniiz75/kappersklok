interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kappersklok logo"
    >
      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" stroke="#d4a853" strokeWidth="3" />
      <circle cx="60" cy="60" r="52" stroke="#d4a853" strokeWidth="0.5" opacity="0.3" />

      {/* Hour markers */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const major = angle % 90 === 0;
        const rad = (angle - 90) * (Math.PI / 180);
        const r1 = major ? 43 : 46;
        const r2 = 50;
        return (
          <line
            key={angle}
            x1={60 + r1 * Math.cos(rad)}
            y1={60 + r1 * Math.sin(rad)}
            x2={60 + r2 * Math.cos(rad)}
            y2={60 + r2 * Math.sin(rad)}
            stroke="#d4a853"
            strokeWidth={major ? 2.5 : 1}
            strokeLinecap="round"
            opacity={major ? 1 : 0.5}
          />
        );
      })}

      {/* Scissors as clock hands — blade 1 (hour hand, ~10 o'clock) */}
      <g>
        {/* Blade 1 */}
        <path
          d="M60 60 L38 28"
          stroke="#d4a853"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Blade 1 edge */}
        <path
          d="M42 34 C39 30, 34 26, 38 28"
          stroke="#d4a853"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Finger ring 1 */}
        <circle cx="34" cy="23" r="6" stroke="#d4a853" strokeWidth="2" fill="none" />
      </g>

      {/* Scissors as clock hands — blade 2 (minute hand, ~2 o'clock) */}
      <g>
        {/* Blade 2 */}
        <path
          d="M60 60 L84 30"
          stroke="#d4a853"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Blade 2 edge */}
        <path
          d="M80 35 C83 31, 86 27, 84 30"
          stroke="#d4a853"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Finger ring 2 */}
        <circle cx="89" cy="25" r="6" stroke="#d4a853" strokeWidth="2" fill="none" />
      </g>

      {/* Center pivot screw */}
      <circle cx="60" cy="60" r="4" fill="#d4a853" />
      <circle cx="60" cy="60" r="2" fill="#0a0a0a" />

      {/* Subtle comb teeth at bottom (6 o'clock position) */}
      {[-8, -4, 0, 4, 8].map((offset) => (
        <line
          key={offset}
          x1={60 + offset}
          y1={75}
          x2={60 + offset}
          y2={86}
          stroke="#d4a853"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}
      {/* Comb spine */}
      <line
        x1="50"
        y1="86"
        x2="70"
        y2="86"
        stroke="#d4a853"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
