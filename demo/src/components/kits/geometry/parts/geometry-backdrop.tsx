// Engineering / grid paper background for the geometry theme. The grid IS
// the ruler: the fine cell size is driven by the page's currently-selected
// "from" unit, so switching from meters to feet visibly reticks the grid.
// Coarse grid lines mark every 5 fine cells.
//
// Renders as a fixed-position aria-hidden layer behind page content; SVG
// patterns stay crisp at any zoom level.

interface GeometryBackdropProps {
  /** Render inline (sized to parent) instead of fixed to viewport. */
  inline?: boolean;
  /** Fine grid spacing in pixels. Driven by the page bench's unit choice. */
  cellSize?: number;
  /** When true, the coarse grid flashes briefly. Reset by parent after ~600ms. */
  pulse?: boolean;
  /**
   * CSS scale applied to the whole grid; transitions smoothly so hovers
   * on a kit card visibly "zoom in" on the paper without re-rendering
   * SVG pattern attributes (which would snap instantly).
   */
  scale?: number;
}

export function GeometryBackdrop({
  inline,
  cellSize = 12,
  pulse,
  scale = 1,
}: GeometryBackdropProps) {
  const className = inline
    ? 'absolute inset-0 pointer-events-none overflow-hidden'
    : 'fixed inset-0 pointer-events-none -z-10 overflow-hidden';

  const coarse = cellSize * 5;

  return (
    <div
      aria-hidden
      className={className}
      style={{
        zIndex: inline ? 0 : -1,
        opacity: pulse ? 1.15 : 0.95,
        transition: 'opacity 600ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          transition: 'transform 400ms cubic-bezier(0.22,1,0.36,1)',
        }}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="uf-grid-fine"
            width={cellSize}
            height={cellSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
              fill="none"
              stroke="var(--uf-grid-faint)"
              strokeWidth="0.8"
            />
          </pattern>
          <pattern id="uf-grid-coarse" width={coarse} height={coarse} patternUnits="userSpaceOnUse">
            <path
              d={`M ${coarse} 0 L 0 0 0 ${coarse}`}
              fill="none"
              stroke="var(--uf-grid)"
              strokeWidth="0.9"
              opacity="0.7"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#uf-grid-fine)" />
        <rect width="100%" height="100%" fill="url(#uf-grid-coarse)" />
      </svg>
    </div>
  );
}
