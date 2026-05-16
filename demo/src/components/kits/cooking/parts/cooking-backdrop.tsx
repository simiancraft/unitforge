// Recipe-card background for the cooking theme. Faint horizontal ruled
// lines (recipe-card stationery) overlaid with a sparse pattern of
// measuring-spoon and cup silhouettes; an animated drip slowly traces a
// vertical line through one accent lane (always on, slow enough to live
// as ambient page texture, just lively enough to feel like a kitchen
// where something is cooking).

interface CookingBackdropProps {
  inline?: boolean;
}

export function CookingBackdrop({ inline }: CookingBackdropProps) {
  const className = inline
    ? 'absolute inset-0 pointer-events-none'
    : 'fixed inset-0 pointer-events-none -z-10';

  return (
    <div aria-hidden className={className} style={{ zIndex: inline ? 0 : -1 }}>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .uf-drip {
            stroke: var(--uf-grid);
            stroke-dasharray: 4 24;
            animation: uf-drip-flow 4.5s linear infinite;
            opacity: 0.45;
          }
          @keyframes uf-drip-flow {
            0%   { stroke-dashoffset: 28; }
            100% { stroke-dashoffset: 0; }
          }
        }
      `}</style>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="uf-recipe-card" width="800" height="36" patternUnits="userSpaceOnUse">
            <line x1="0" y1="35" x2="800" y2="35" stroke="var(--uf-grid-faint)" strokeWidth="1" />
          </pattern>
          <pattern id="uf-utensils" width="160" height="160" patternUnits="userSpaceOnUse">
            {/* Stylized measuring cup silhouette */}
            <g
              transform="translate(20, 20)"
              fill="none"
              stroke="var(--uf-grid-faint)"
              strokeWidth="1.4"
            >
              <path d="M 0 4 L 26 4 L 24 28 L 2 28 Z" />
              <line x1="6" y1="12" x2="20" y2="12" />
              <line x1="6" y1="20" x2="20" y2="20" />
              <path d="M 26 8 Q 36 8 36 14 Q 36 20 30 20" />
            </g>
            {/* Stylized spoon silhouette */}
            <g
              transform="translate(100, 90)"
              fill="none"
              stroke="var(--uf-grid-faint)"
              strokeWidth="1.4"
            >
              <ellipse cx="8" cy="8" rx="8" ry="6" />
              <line x1="14" y1="10" x2="40" y2="32" />
            </g>
          </pattern>
          <pattern id="uf-margin-rule" width="800" height="600" patternUnits="userSpaceOnUse">
            <line
              x1="60"
              y1="0"
              x2="60"
              y2="600"
              stroke="var(--uf-accent)"
              strokeWidth="1"
              opacity="0.18"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#uf-recipe-card)" />
        <rect width="100%" height="100%" fill="url(#uf-utensils)" />
        <rect width="100%" height="100%" fill="url(#uf-margin-rule)" />

        <g>
          <line x1="120" y1="60" x2="120" y2="540" strokeWidth="1.5" className="uf-drip" />
          <line
            x1="540"
            y1="40"
            x2="540"
            y2="520"
            strokeWidth="1.5"
            className="uf-drip"
            style={{ animationDelay: '1.2s' } as React.CSSProperties}
          />
        </g>
      </svg>
    </div>
  );
}
