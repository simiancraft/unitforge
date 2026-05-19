// Temperature backdrop. Bench-reactive thermal-imaging visualization:
//
//   - A vertical thermal gradient (cold-blue at top to ember-orange
//     at bottom) tinted by the bench's normalized intensity so cooler
//     selections wash the page blue and hotter selections wash it
//     red. The hue lerps between the two CSS accent colors at the
//     wrapper level via a custom property `--temp-mix`.
//   - A field of small particles ("molecules") distributed across the
//     viewport. At low intensities they sit still; at high intensities
//     they jitter (per the actual physics: temperature IS kinetic
//     energy). Each particle has a slightly different animation-delay
//     so the jitter reads as Brownian noise, not synchronized
//     metronome.
//   - A central radial "thermal core" whose size + opacity scale
//     with the bench's normalized intensity.
//
// Inline preview (kit-grid card) reuses the same composition at
// reduced size; the wrapper class swap matches the cooking /
// data-storage / mass pattern (fixed inset-0 -z-10 non-inline,
// absolute inset-0 inline).

import type { CSSProperties } from 'react';

interface TemperatureBackdropProps {
  inline?: boolean;
  /** Normalized bench-slider position (0..1); drives hue mix, core
   *  size + opacity, and particle jitter speed. */
  intensity?: number;
}

const PARTICLES = generateParticles(60);

export function TemperatureBackdrop({ inline = false, intensity = 0.4 }: TemperatureBackdropProps) {
  const t = clamp01(intensity);
  // Jitter duration shortens as intensity climbs: 4s at the cold end,
  // 0.4s at the hot end. The 10x range maps to the visceral sense
  // that heat = fast motion.
  const jitterDurationSec = 4 - 3.6 * t;

  const wrapperStyle: CSSProperties & Record<'--temp-intensity' | '--temp-jitter-sec', string> = {
    background: 'var(--uf-bg)',
    '--temp-intensity': String(t),
    '--temp-jitter-sec': `${jitterDurationSec}s`,
  };

  const className = inline
    ? 'pointer-events-none absolute inset-0 overflow-hidden'
    : 'pointer-events-none fixed inset-0 -z-10 overflow-hidden';

  return (
    <div aria-hidden className={className} style={wrapperStyle}>
      <ThermalField t={t} />
    </div>
  );
}

function ThermalField({ t }: { t: number }) {
  // The central thermal-core glow scales 80..360 px and reads
  // accent (warm) on hot, accent-2 (cold) on cold. We crossfade
  // by stacking two glows and lerping their opacities.
  const coreRadius = 80 + t * 280;
  const warmOpacity = t;
  const coolOpacity = 1 - t;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <title>Temperature thermal-field backdrop; decorative</title>
      <defs>
        <radialGradient id="temp-warm-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--uf-accent)" stopOpacity="0.85" />
          <stop offset="50%" stopColor="var(--uf-accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--uf-accent)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="temp-cool-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--uf-accent-2)" stopOpacity="0.7" />
          <stop offset="55%" stopColor="var(--uf-accent-2)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--uf-accent-2)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cold-side glow; fades out as intensity climbs. */}
      <g className="temp-glow" style={{ opacity: coolOpacity }}>
        <circle cx="600" cy="400" r={coreRadius} fill="url(#temp-cool-glow)" />
      </g>

      {/* Warm-side glow; fades in as intensity climbs. */}
      <g className="temp-glow" style={{ opacity: warmOpacity }}>
        <circle cx="600" cy="400" r={coreRadius} fill="url(#temp-warm-glow)" />
      </g>

      {/* Field of particles. Each is its own SVG circle wrapped in a
       *  jitter group so its animation-delay can be unique without
       *  modulo-stacking visible patterns. */}
      <g className="temp-particles">
        {PARTICLES.map((p) => (
          <g
            key={p.key}
            className="temp-particle"
            style={{
              animationDuration: 'var(--temp-jitter-sec)',
              animationDelay: `${p.delay}s`,
              transformOrigin: `${p.x}px ${p.y}px`,
            }}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={p.radius}
              fill="var(--uf-grid)"
              opacity={p.baseOpacity + t * 0.25}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

interface Particle {
  key: string;
  x: number;
  y: number;
  radius: number;
  delay: number;
  baseOpacity: number;
}

// Deterministic pseudo-random particle field. Using a fixed
// linear-congruential generator (LCG) seeded so the layout is
// stable across renders + reloads.
function generateParticles(count: number): Particle[] {
  let seed = 0xa5a5;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed & 0xffff) / 0xffff;
  };
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      key: `p${i}`,
      x: 60 + next() * 1080,
      y: 60 + next() * 680,
      radius: 1.5 + next() * 2.5,
      delay: next() * 4,
      baseOpacity: 0.25 + next() * 0.25,
    });
  }
  return particles;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.4;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
