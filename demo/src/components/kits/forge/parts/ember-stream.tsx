// EmberStream — a configurable, restartable column of rising ember
// particles. One instance is the "ambient" stream (slow, well-spread
// delays, baseline glow). On hover, the page mounts one of a pool of
// "stoke" instances with shorter delays, smaller rise duration, more
// particles, and a brighter look; remounting (via a key change at the
// call site) restarts the animation cleanly.
//
// Two parallel keyframes per particle:
//   uf-ember-rise  (transform): vertical rise + linear lateral drift
//   uf-ember-sway  (translate): independent horizontal oscillation
//
// All randomness is a tiny xor-shift seeded by the particle index, so
// the layout is deterministic per (count, layer); the React Compiler
// memoizes the array.

// ─── tweakables ──────────────────────────────────────────────────────────
const SIZE_MIN = 3; // px
const SIZE_RANGE = 5; // px above min
const DEFAULT_DURATION_MIN = 6; // s (fastest particle rise time)
const DEFAULT_DURATION_MAX = 11; // s (slowest particle rise time)
const DRIFT_MAX = 18; // px peak linear lateral drift over the full rise
const SWAY_AMP_MAX = 16; // px peak horizontal oscillation
const SWAY_PERIOD_MIN = 2; // s per sway cycle
const SWAY_PERIOD_RANGE = 4; // s above min
// ─────────────────────────────────────────────────────────────────────────

interface EmberStreamProps {
  /** Particle count for this layer. */
  count?: number;
  /** Size + glow multiplier; 1.0 = ambient, ~2 = stoked. */
  boost?: number;
  /** Fastest possible rise time (s). Smaller values = faster particles. */
  durationMin?: number;
  /** Slowest possible rise time (s). Wider range = more parallax. */
  durationMax?: number;
  /** Maximum initial delay per particle (s). Ambient ~4s; stoke ~0.5s. */
  maxDelaySec?: number;
  /** 0..1 layer visibility; 700ms opacity transition built in. */
  intensity?: number;
}

// Cheap deterministic 32-bit hash; gives well-distributed [0,1) pseudo-
// randoms without an `i * k % n` modular pattern showing up at high
// particle counts.
function rand(i: number, offset: number): number {
  let h = (i * 2654435761 + offset * 0x9e3779b1) >>> 0;
  h ^= h >>> 16;
  h = (h * 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  return (h >>> 0) / 0x100000000;
}

export function EmberStream({
  count = 32,
  boost = 1,
  durationMin = DEFAULT_DURATION_MIN,
  durationMax = DEFAULT_DURATION_MAX,
  maxDelaySec = 4,
  intensity = 1,
}: EmberStreamProps) {
  const visible = Math.max(0, Math.min(1, intensity));
  const sizeMul = Math.min(1.7, boost);
  const durationRange = durationMax - durationMin;

  const embers = Array.from({ length: count }, (_, i) => ({
    id: `ember-${rand(i, 0).toString(36)}`,
    left: rand(i, 1) * 100,
    size: (SIZE_MIN + rand(i, 2) * SIZE_RANGE) * sizeMul,
    delay: rand(i, 3) * maxDelaySec,
    duration: durationMin + rand(i, 4) * durationRange,
    drift: (rand(i, 5) - 0.5) * DRIFT_MAX * 2,
    swayAmp: (rand(i, 6) - 0.5) * SWAY_AMP_MAX * 2,
    swayPeriod: SWAY_PERIOD_MIN + rand(i, 7) * SWAY_PERIOD_RANGE,
  }));

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes uf-ember-rise {
            0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
            10%  { opacity: 1; }
            75%  { opacity: 0.7; }
            100% { transform: translateY(-110vh) translateX(var(--drift, 0px)) scale(0.4); opacity: 0; }
          }
          @keyframes uf-ember-sway {
            0%, 100% { translate: 0 0; }
            50%      { translate: var(--sway-amp, 0px) 0; }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes uf-ember-rise { 0%, 100% { opacity: 0.4; } }
          @keyframes uf-ember-sway { 0%, 100% { translate: 0 0; } }
        }
      `}</style>
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{
          zIndex: -1,
          opacity: visible,
          transition: 'opacity 700ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {embers.map((e) => (
          <span
            key={e.id}
            className="absolute rounded-full"
            style={
              {
                bottom: '-20px',
                left: `${e.left}%`,
                width: `${e.size}px`,
                height: `${e.size}px`,
                background:
                  'radial-gradient(circle, rgba(255,220,150,1) 0%, rgba(249,115,22,0.85) 45%, transparent 80%)',
                boxShadow: `0 0 ${8 + boost * 6}px rgba(249,180,76,${0.7 + boost * 0.15})`,
                ['--drift' as string]: `${e.drift}px`,
                ['--sway-amp' as string]: `${e.swayAmp}px`,
                animation: `uf-ember-rise ${e.duration}s linear infinite, uf-ember-sway ${e.swayPeriod}s ease-in-out infinite`,
                animationDelay: `${e.delay}s, ${e.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
