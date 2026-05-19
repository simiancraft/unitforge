// Mass backdrop. Two themed visuals on the same conceptual axis:
//
//   - light variant: balance-paper. Faint ledger rules + an abstract
//     beam-scale silhouette anchored bottom-center. The metrologist's
//     notebook reading. The beam gently sways (~8 s arc) under the
//     ambient-motion CSS keyframes.
//   - dark variant: gravity well. Radial field lines from a glowing
//     center. The ring group slowly rotates (~120 s/turn); the
//     central glow pulses (~6 s cycle). The cosmic reading.
//
// Bench-reactive: a normalized intensity (0..1, derived from the
// slider's position within its current min/max) feeds a CSS custom
// property `--mass-intensity` that scales the glow opacity. Lives on
// the outer wrapper so it cascades into the glow's gradient without
// SVG attribute interpolation.
//
// Motion is wrapped in @media (prefers-reduced-motion: no-preference)
// in mass.css so users with the OS-level preference get a static
// layout; the intensity scaling stays (it's a state-driven change,
// not ambient drift).

import type { CSSProperties } from 'react';

interface MassBackdropProps {
  inline?: boolean;
  /** Normalized bench-slider position (0..1). Scales central glow
   *  opacity at the SVG layer; default 0.5 for the inline preview
   *  and any caller that doesn't track bench state. */
  intensity?: number;
}

const LEDGER_Y_COORDS = Array.from({ length: 22 }, (_, i) => 40 + i * 34);

export function MassBackdrop({ inline = false, intensity = 0.5 }: MassBackdropProps) {
  const wrapperStyle: CSSProperties & Record<'--mass-intensity', string> = {
    background: 'var(--uf-bg)',
    '--mass-intensity': String(clamp01(intensity)),
  };
  if (inline) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={wrapperStyle}
      >
        <GravityWell />
        <BalancePaper />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={wrapperStyle}
    >
      <GravityWell />
      <BalancePaper />
    </div>
  );
}

// Dark-variant primary: radial gravitational field. Concentric circles
// implying field lines + a glowing central point. Visible against dark
// bg; nearly invisible against light bg (which is the desired behavior;
// the light variant uses BalancePaper as its primary visual). Ring
// group has the `mass-rings` class so CSS keyframes can rotate it.
function GravityWell() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <title>Gravity well backdrop; decorative</title>
      <defs>
        <radialGradient id="mass-gravity-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--uf-accent)" stopOpacity="0.9" />
          <stop offset="40%" stopColor="var(--uf-accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--uf-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Glowing center; opacity reacts to bench intensity. */}
      <g className="mass-glow-core">
        <circle cx="600" cy="400" r="280" fill="url(#mass-gravity-core)" />
      </g>
      {/* Concentric field-line rings. Group rotates ambient. */}
      <g className="mass-rings">
        {RING_RADII.map((r) => (
          <circle
            key={r}
            cx="600"
            cy="400"
            r={r}
            fill="none"
            stroke="var(--uf-grid-faint)"
            strokeWidth={1}
          />
        ))}
        {/* Tiny "orbit markers": four small dots distributed across the
         *  outer ring so the rotation reads as motion, not just a
         *  static rendering. Without these, the symmetric circles
         *  look identical at every rotation angle. */}
        {ORBIT_MARKERS.map(({ angle, r }) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 600 + r * Math.cos(rad);
          const cy = 400 + r * Math.sin(rad);
          return <circle key={`${r}-${angle}`} cx={cx} cy={cy} r={3} fill="var(--uf-grid-faint)" />;
        })}
      </g>
      {/* Hard inner core; the "mass point". Stays put under rotation. */}
      <circle cx="600" cy="400" r="6" fill="var(--uf-accent)" />
    </svg>
  );
}

const RING_RADII = [80, 140, 220, 320, 440, 580];

// Markers along select rings so the slow rotation is visible. Picked
// at angles that don't quite line up across rings so the eye sees
// motion rather than a synchronized pattern.
const ORBIT_MARKERS = [
  { angle: 32, r: 220 },
  { angle: 118, r: 320 },
  { angle: 247, r: 220 },
  { angle: 305, r: 440 },
  { angle: 75, r: 580 },
  { angle: 195, r: 580 },
];

// Light-variant primary: ledger rules + an abstract beam-scale at the
// bottom. The beam silhouette has the `mass-beam` class so CSS
// keyframes can gently sway it (rotation around the pivot column).
function BalancePaper() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <title>Balance paper backdrop; decorative</title>
      {/* Horizontal ledger rules. Y-coordinates pre-computed so each
       *  line's y value is a stable key. */}
      {LEDGER_Y_COORDS.map((y) => (
        <line
          key={y}
          x1={0}
          x2={1200}
          y1={y}
          y2={y}
          stroke="var(--uf-grid-faint)"
          strokeWidth={1}
        />
      ))}
      {/* Abstract beam-scale silhouette near bottom. Pivot, beam, two
       *  pan suspensions. The beam group sways under the mass-beam
       *  animation; the pivot column anchors the rotation origin
       *  (handled by CSS transform-origin to (600, 700)). */}
      <g className="mass-beam" stroke="var(--uf-grid)" strokeWidth={1.5} fill="none">
        {/* Pivot column (anchored to ground; doesn't visibly rotate
         *  because it's vertical). */}
        <line x1={600} y1={700} x2={600} y2={620} />
        {/* Beam. */}
        <line x1={420} y1={620} x2={780} y2={620} />
        {/* Left pan suspension. */}
        <line x1={420} y1={620} x2={420} y2={660} />
        <ellipse cx={420} cy={670} rx={60} ry={10} />
        {/* Right pan suspension. */}
        <line x1={780} y1={620} x2={780} y2={660} />
        <ellipse cx={780} cy={670} rx={60} ry={10} />
        {/* Pivot pin. */}
        <circle cx={600} cy={620} r={4} fill="var(--uf-grid)" />
      </g>
    </svg>
  );
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
