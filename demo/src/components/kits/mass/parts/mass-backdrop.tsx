// Mass backdrop. Gravity-well rings, fully bench-reactive. Three
// controls drive three distinct backdrop dimensions:
//
//   - bench.fromId → ring count + spacing. Smaller from-unit reads
//     as tighter, fewer rings near the center; larger from-unit
//     reads as wider, more numerous rings reaching to the edges.
//   - bench.toId → corona size + core diameter. Smaller to-unit
//     gives a tight glow with a small hard center; larger to-unit
//     gives a broad corona with a heavier core.
//   - bench.value → dots-per-ring count and global swirl speed.
//     A higher value populates each ring with more orbit markers
//     and speeds the swirl; under reduced-motion preferences,
//     only the dot count remains.
//
// Rings rotate at different rates per Kepler intuition (inner
// faster than outer, ~radius^1.2). Rings alternate direction so
// the eye sees layered motion rather than a synchronized
// turntable. The core glow pulses and the corona breathes; both
// state changes survive under reduced motion (the pulse / breathe
// are ambient, so they're behind the prefers-reduced-motion
// guard in mass.css; the size/intensity reactions stay because
// they're state-driven, not drift).

import type { CSSProperties } from 'react';
import { forge, type Unit } from 'unitforge';
import { kilogram } from 'unitforge/kits/mass';

interface MassBackdropProps {
  inline?: boolean;
  /** Bench's from-unit; drives ring count and spacing. Optional so
   *  the inline preview can render without bench state; falls back
   *  to a kilogram-default config. */
  fromUnit?: Unit<'mass', number>;
  /** Bench's to-unit; drives corona size and core diameter. */
  toUnit?: Unit<'mass', number>;
  /** Normalized bench slider position (0..1); drives dot count and
   *  swirl speed. */
  intensity?: number;
}

interface RingConfig {
  /** Index 0..N-1; used as React key and to alternate direction. */
  index: number;
  /** Pixel radius from center. */
  radius: number;
  /** CSS animation-duration in seconds. */
  durationSec: number;
  /** Even rings spin clockwise; odd spin counter (alternates by index). */
  reverse: boolean;
  /** Markers distributed evenly around the ring; rotates with the group. */
  dotCount: number;
}

interface CoreConfig {
  /** Inner hard-core radius. */
  coreRadius: number;
  /** Outer corona radius (the radial-gradient extent). */
  coronaRadius: number;
}

export function MassBackdrop({
  inline = false,
  fromUnit,
  toUnit,
  intensity = 0.5,
}: MassBackdropProps) {
  const rings = computeRings(fromUnit, intensity);
  const core = computeCore(toUnit);
  const intensityClamped = clamp01(intensity);

  // Matches the cooking + data-storage backdrop pattern:
  //   - non-inline → `fixed inset-0 -z-10`: full viewport, behind
  //     every flow sibling. `absolute inset-0` (the previous
  //     mistake) anchored to the nearest positioned ancestor (the
  //     page-content wrapper), constraining the gravity well to
  //     the column width.
  //   - inline → `absolute inset-0`: stacks inside its preview
  //     card on the kit-grid home.
  const className = inline
    ? 'pointer-events-none absolute inset-0 overflow-hidden'
    : 'pointer-events-none fixed inset-0 -z-10 overflow-hidden';

  const wrapperStyle: CSSProperties & Record<'--mass-intensity', string> = {
    background: 'var(--uf-bg)',
    '--mass-intensity': String(intensityClamped),
  };

  return (
    <div aria-hidden className={className} style={wrapperStyle}>
      <GravityWell rings={rings} core={core} inline={inline} />
    </div>
  );
}

// SVG composition. Defs first (gradient), then the corona group
// (pulses + breathes around the center), then each ring as its own
// rotating <g>, then the hard inner core on top so it never gets
// covered by ring strokes. Each ring's animation-duration comes from
// its config; the direction comes from a class swap.
function GravityWell({
  rings,
  core,
  inline,
}: {
  rings: RingConfig[];
  core: CoreConfig;
  inline: boolean;
}) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <title>{inline ? 'Mass kit preview backdrop' : 'Gravity-well backdrop'}</title>
      <defs>
        <radialGradient id="mass-gravity-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--uf-accent)" stopOpacity="0.9" />
          <stop offset="40%" stopColor="var(--uf-accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--uf-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="mass-glow-core">
        <circle cx="600" cy="400" r={core.coronaRadius} fill="url(#mass-gravity-core)" />
      </g>

      {rings.map((ring) => (
        <Ring key={ring.index} ring={ring} />
      ))}

      <circle cx="600" cy="400" r={core.coreRadius} fill="var(--uf-accent)" />
    </svg>
  );
}

function Ring({ ring }: { ring: RingConfig }) {
  const className = ring.reverse ? 'mass-ring mass-ring-reverse' : 'mass-ring';
  const style: CSSProperties = { animationDuration: `${ring.durationSec}s` };
  return (
    <g className={className} style={style}>
      <circle
        cx={600}
        cy={400}
        r={ring.radius}
        fill="none"
        stroke="var(--uf-grid-faint)"
        strokeWidth={1}
      />
      {dotsForRing(ring).map((dot) => (
        <circle key={dot.key} cx={dot.x} cy={dot.y} r={2.5} fill="var(--uf-grid-faint)" />
      ))}
    </g>
  );
}

interface DotPosition {
  key: string;
  x: number;
  y: number;
}

function dotsForRing(ring: RingConfig): DotPosition[] {
  const dots: DotPosition[] = [];
  // Phase-shift each ring's dot pattern by its index so adjacent rings
  // don't all start at angle 0. Reads less synchronized.
  const phase = (ring.index * 17) % 360;
  for (let i = 0; i < ring.dotCount; i++) {
    const angle = phase + (i * 360) / ring.dotCount;
    const rad = (angle * Math.PI) / 180;
    dots.push({
      key: `${ring.index}-${i}`,
      x: 600 + ring.radius * Math.cos(rad),
      y: 400 + ring.radius * Math.sin(rad),
    });
  }
  return dots;
}

// Config helpers. Each input control maps to a backdrop dimension via
// a log-scale of the unit's kg-equivalent value. The mass kit spans
// ~12 orders of magnitude (microgram ≈ 1e-9 kg through long ton ≈
// 1016 kg); log10 normalizes that into a 0..1 band the math below
// can ride.

const MIN_LOG_KG = -9; // microgram floor
const MAX_LOG_KG = 4; // long-ton ceiling (with headroom)
const LOG_KG_RANGE = MAX_LOG_KG - MIN_LOG_KG;

function unitT(unit: Unit<'mass', number> | undefined): number {
  // Returns a 0..1 t-value based on log10 of the unit's kg value.
  if (!unit) return 0.5;
  const kg = Math.max(forge(unit, kilogram)(1), 1e-12);
  const logKg = Math.log10(kg);
  return clamp01((logKg - MIN_LOG_KG) / LOG_KG_RANGE);
}

function computeRings(fromUnit: Unit<'mass', number> | undefined, intensity: number): RingConfig[] {
  const t = unitT(fromUnit);
  // Ring count: smaller from-unit = fewer, tighter rings; larger =
  // more, broader. Round to integer so a unit swap moves rings by
  // discrete steps, not fractional.
  const count = 4 + Math.round(t * 4); // 4..8
  // Both ranges interpolate linearly in t (log10 of the unit's kg
  // value, normalized to 0..1). Smaller from-unit = tighter band
  // hugging the bench card; larger from-unit = sparse rings reaching
  // toward the viewport edges. The smallest-unit spacing is half
  // what it was previously (15 instead of 30) so the microgram-end
  // composition reads as a denser cluster.
  const baseRadius = 150 + t * 130; // 150..280
  const spacing = 15 + t * 85; // 15..100

  // Dot count per ring scales with intensity (bench value).
  const baseDots = 3 + Math.round(clamp01(intensity) * 12); // 3..15

  const rings: RingConfig[] = [];
  for (let i = 0; i < count; i++) {
    const radius = baseRadius + i * spacing;
    // Kepler-ish: inner rings rotate faster. Slower base when
    // intensity is low; speeds up as the user dials in the slider.
    // At intensity=0 the innermost ring takes ~70s; at intensity=1,
    // ~25s. Outer rings scale with (radius/baseRadius)^1.2.
    const baseSpeed = 70 - clamp01(intensity) * 45;
    const durationSec = baseSpeed * (radius / baseRadius) ** 1.2;
    rings.push({
      index: i,
      radius,
      durationSec,
      reverse: i % 2 === 1,
      // Slight per-ring dot variation so the eye notices the layers.
      dotCount: baseDots + (i % 3),
    });
  }
  return rings;
}

function computeCore(toUnit: Unit<'mass', number> | undefined): CoreConfig {
  const t = unitT(toUnit);
  return {
    // Hard inner core scales from 4 to 14 pixels across the kg range.
    coreRadius: 4 + t * 10,
    // Corona radial extent scales from 180 to 460.
    coronaRadius: 180 + t * 280,
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
