// A short-lived radial burst of ember particles, anchored to a viewport-
// space coordinate. Used on home when the visitor hovers a kit tile;
// reads as a hammer-on-anvil spark plume that pairs with the
// `uf-anvil-strike` percussion on the page. Particle layout is purely
// derived from the loop index; the React Compiler memoizes it.

interface EmberBurstProps {
  x: number;
  y: number;
}

export function EmberBurst({ x, y }: EmberBurstProps) {
  const particles = Array.from({ length: 90 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2 + ((i * 17) % 7) / 20;
    // Bias upward so the burst feels like sparks flying off an anvil
    // rather than a perfectly spherical explosion.
    const upBias = -10 - ((i * 7) % 18);
    const dist = 50 + ((i * 13) % 60);
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist + upBias,
      delay: ((i * 23) % 100) / 10,
      size: 2 + ((i * 5) % 3),
    };
  });

  return (
    <div
      aria-hidden
      className="fixed pointer-events-none"
      style={{
        left: x,
        top: y,
        zIndex: 0,
        width: 0,
        height: 0,
      }}
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={
            {
              left: 0,
              top: 0,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background:
                'radial-gradient(circle, rgba(255,210,140,1) 0%, rgba(249,115,22,0.8) 45%, transparent 80%)',
              boxShadow: '0 0 6px rgba(249,180,76,0.8)',
              ['--dx' as string]: `${p.dx}px`,
              ['--dy' as string]: `${p.dy}px`,
              animation: 'uf-ember-burst 1.1s ease-out forwards',
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
