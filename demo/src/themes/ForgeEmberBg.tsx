// Forge / blacksmith ember background for the home theme. Tunable via the
// consts at the top of the file — edit them to retune the forge without
// touching the render.
//
// Two animations run in parallel on every particle:
//   - `uf-ember-rise`  (transform): vertical rise from the bottom of the
//                       viewport plus a linear lateral drift.
//   - `uf-ember-sway`  (translate):  horizontal oscillation around the
//                       rise path. Independent of transform so the two
//                       compose cleanly.
//
// Usage on Home is layered:
//   <ForgeEmberBg intensity={1}  boost={1}  />   // ambient, always on
//   <ForgeEmberBg intensity={x}  boost={2.5} />  // stoked overlay; x is
//                                                  hover-controlled

// ─── tweakables ──────────────────────────────────────────────────────────
const PARTICLE_COUNT = 36;
const PARTICLE_MIN_SIZE = 3; // px
const PARTICLE_SIZE_RANGE = 5; // px above min
const RISE_MIN_DURATION = 7; // s
const RISE_DURATION_RANGE = 5; // s above min
const DRIFT_MAX = 18; // px lateral drift over the full rise
const SWAY_AMP_MAX = 14; // px peak horizontal oscillation
const SWAY_MIN_PERIOD = 3; // s per oscillation cycle
const SWAY_PERIOD_RANGE = 4; // s above min
// ─────────────────────────────────────────────────────────────────────────

interface ForgeEmberBgProps {
  /** 0..N; ramps overall opacity + glow on the layer. */
  intensity?: number;
  /**
   * Multiplier on particle count and per-particle size; 1.0 = ambient
   * stream, higher values are "stoked" overlays meant to fade in on
   * interaction. The Home page mounts two ForgeEmberBg layers: the base
   * ambient at boost=1, and a stoked layer at boost ~2-3 whose intensity
   * is animated 0 -> 1 -> 0 around hover events.
   */
  boost?: number;
}

export function ForgeEmberBg({ intensity = 1, boost = 1 }: ForgeEmberBgProps) {
  const count = Math.max(0, Math.round(PARTICLE_COUNT * boost));
  const sizeScale = Math.min(1.6, boost);

  const embers = Array.from({ length: count }, (_, i) => ({
    left: (i * 37 + 7) % 100,
    size: (PARTICLE_MIN_SIZE + ((i * 13) % PARTICLE_SIZE_RANGE)) * sizeScale,
    delay: ((i * 41) % 100) / 10,
    duration: RISE_MIN_DURATION + ((i * 7) % RISE_DURATION_RANGE),
    drift: ((i * 11) % (DRIFT_MAX * 2)) - DRIFT_MAX,
    swayAmp: ((i * 17) % (SWAY_AMP_MAX * 2)) - SWAY_AMP_MAX,
    swayPeriod: SWAY_MIN_PERIOD + ((i * 19) % SWAY_PERIOD_RANGE),
  }));

  const visible = Math.max(0, Math.min(1, intensity));

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes uf-ember-rise {
            0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
            10%  { opacity: 1; }
            75%  { opacity: 0.75; }
            100% { transform: translateY(-110vh) translateX(var(--drift, 0px)) scale(0.4); opacity: 0; }
          }
          @keyframes uf-ember-sway {
            0%, 100% { translate: 0 0; }
            50%      { translate: var(--sway-amp, 0px) 0; }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes uf-ember-rise {
            0%, 100% { opacity: 0.4; }
          }
          @keyframes uf-ember-sway {
            0%, 100% { translate: 0 0; }
          }
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
        {embers.map((e, i) => (
          <span
            key={i}
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
