// Astronomy backdrop. A deterministic starfield plus a soft central
// glow (a nebula / galactic core). Bench-reactive: the bench's
// normalized slider position drives `--astro-intensity`, which shortens
// the twinkle period (stars shimmer faster as the measured distance
// reaches deeper) and brightens the central glow.
//
// The starfield is static across renders (LCG-seeded) and memoized so
// it doesn't reconcile on every slider tick; only the twinkle duration
// and glow opacity flow through. Inline preview swaps the wrapper class
// the same way the sibling backdrops do.

import { type CSSProperties, memo } from 'react';

interface AstronomyBackdropProps {
  inline?: boolean;
  /** Normalized bench-slider position (0..1); drives twinkle speed and
   *  central-glow strength. */
  intensity?: number;
}

const STARS = generateStars(90);

export function AstronomyBackdrop({ inline = false, intensity = 0.4 }: AstronomyBackdropProps) {
  const t = clamp01(intensity);
  // Twinkle period shortens from 6s (cold/near) to 1.2s (hot/far).
  const twinkleSec = 6 - 4.8 * t;
  const glowOpacity = 0.12 + t * 0.4;

  const wrapperStyle: CSSProperties & Record<'--astro-intensity' | '--astro-twinkle-sec', string> =
    {
      background: 'var(--uf-bg)',
      '--astro-intensity': String(t),
      '--astro-twinkle-sec': `${twinkleSec}s`,
    };

  const className = inline
    ? 'pointer-events-none absolute inset-0 overflow-hidden'
    : 'pointer-events-none fixed inset-0 -z-10 overflow-hidden';

  return (
    <div aria-hidden className={className} style={wrapperStyle}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <title>Astronomy starfield backdrop; decorative</title>
        <defs>
          <radialGradient id="astro-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--uf-accent)" stopOpacity="0.45" />
            <stop offset="55%" stopColor="var(--uf-accent)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--uf-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="astro-glow" style={{ opacity: glowOpacity }}>
          <circle cx="600" cy="400" r={420} fill="url(#astro-core-glow)" />
        </g>

        <Starfield />
      </svg>
    </div>
  );
}

// The starfield is invariant across renders; only the inline
// animation-duration (read from the CSS custom property) changes with
// intensity, and that lives on each star element via the class, not in
// React state. Memoized so the 90-circle subtree skips reconciliation
// on every slider tick.
const Starfield = memo(function Starfield() {
  return (
    <g>
      {STARS.map((s) => (
        <circle
          key={s.key}
          className="astro-star"
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="var(--uf-grid)"
          style={{ animationDuration: 'var(--astro-twinkle-sec)', animationDelay: `${s.delay}s` }}
        />
      ))}
    </g>
  );
});

interface Star {
  key: string;
  x: number;
  y: number;
  r: number;
  delay: number;
}

// Deterministic LCG-seeded starfield; stable across renders + reloads.
function generateStars(count: number): Star[] {
  let seed = 0x2f9c;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed & 0xffff) / 0xffff;
  };
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      key: `s${i}`,
      x: next() * 1200,
      y: next() * 800,
      r: 0.6 + next() * 1.8,
      delay: next() * 6,
    });
  }
  return stars;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.4;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
