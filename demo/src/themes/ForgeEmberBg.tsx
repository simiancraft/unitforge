// Forge / blacksmith ember background for the home theme. Embers drift
// up continuously; an optional `intensity` prop boosts the emission so
// the page can react to interaction (e.g. hovering a kit card makes the
// forge breathe brighter for a beat).

const EMBERS = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: (i * 37 + 7) % 100,
  size: 3 + ((i * 13) % 5),
  delay: ((i * 41) % 100) / 10,
  duration: 7 + ((i * 7) % 5),
  drift: ((i * 11) % 36) - 18,
}));

interface ForgeEmberBgProps {
  /** 0..1; ramps overall opacity + glow. Default 1. */
  intensity?: number;
}

export function ForgeEmberBg({ intensity = 1 }: ForgeEmberBgProps) {
  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes uf-ember-rise {
            0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
            10%  { opacity: 1; }
            75%  { opacity: 0.75; }
            100% { transform: translate3d(var(--drift, 0px), -110vh, 0) scale(0.4); opacity: 0; }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes uf-ember-rise {
            0%, 100% { opacity: 0.4; }
          }
        }
      `}</style>
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{
          zIndex: -1,
          opacity: Math.max(0, Math.min(1, intensity)),
          transition: 'opacity 600ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {EMBERS.map((e) => (
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
                boxShadow: `0 0 ${8 + intensity * 6}px rgba(249,180,76,${0.7 + intensity * 0.3})`,
                ['--drift' as string]: `${e.drift}px`,
                animation: `uf-ember-rise ${e.duration}s linear infinite`,
                animationDelay: `${e.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
