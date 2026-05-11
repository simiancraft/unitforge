// Engineering / grid paper background for the geometry theme.
// Renders as a fixed-position aria-hidden layer behind page content.
// Uses SVG patterns so the grid stays crisp at any zoom level.

interface GridPaperBgProps {
  /** Render inline (sized to parent) instead of fixed to viewport. */
  inline?: boolean;
}

export function GridPaperBg({ inline }: GridPaperBgProps) {
  const className = inline
    ? 'absolute inset-0 pointer-events-none'
    : 'fixed inset-0 pointer-events-none -z-10';

  return (
    <div aria-hidden className={className} style={{ zIndex: inline ? 0 : -1 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="uf-grid-fine" width="12" height="12" patternUnits="userSpaceOnUse">
            <path
              d="M 12 0 L 0 0 0 12"
              fill="none"
              stroke="var(--uf-grid-faint)"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern id="uf-grid-coarse" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="var(--uf-grid)"
              strokeWidth="0.6"
              opacity="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#uf-grid-fine)" />
        <rect width="100%" height="100%" fill="url(#uf-grid-coarse)" />
      </svg>
    </div>
  );
}
