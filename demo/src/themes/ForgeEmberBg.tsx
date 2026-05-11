// Forge / blacksmith ember background for the home theme. A handful of
// drifting orange particles with random delays and durations; CSS-driven,
// no JS animation loop.

const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: (i * 53 + 7) % 100,
  size: 2 + ((i * 13) % 4),
  delay: ((i * 37) % 100) / 10,
  duration: 8 + ((i * 7) % 6),
  drift: ((i * 11) % 30) - 15,
}));

export function ForgeEmberBg() {
  return (
    <>
      <style>{`
        @keyframes uf-ember-rise {
          0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
          15%  { opacity: 0.85; }
          85%  { opacity: 0.5; }
          100% { transform: translate3d(var(--drift, 0px), -110vh, 0) scale(0.5); opacity: 0; }
        }
      `}</style>
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: -1 }}
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
                  'radial-gradient(circle, rgba(249,180,76,0.95) 0%, rgba(249,115,22,0.5) 50%, transparent 80%)',
                boxShadow: '0 0 6px rgba(249,180,76,0.6)',
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
