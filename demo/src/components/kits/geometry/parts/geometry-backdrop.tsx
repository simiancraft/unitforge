// Engineering / grid paper background for the geometry theme. TWO grids
// are superimposed: a from-grid driven by the bench's from-unit (cell
// size eases when the unit changes) and a to-grid driven by the
// to-unit, with a lighter blue stroke so the two read as distinct
// layers. The bench slider drives the phase offset between them —
// dragging visibly slides the to-grid against the from-grid. All three
// scales are forge() calls; see ./backdrop-scales.ts.
//
// Renders as a fixed-position aria-hidden layer behind page content;
// SVG patterns stay crisp at any zoom level. Each axis (from cell,
// to cell, offset) eases over ~320ms via useAnimatedNumber so unit
// swaps and slider drags morph rather than snap.

import { useAnimatedNumber } from '~/lib/use-animated-number.js';

interface GeometryBackdropProps {
  /** Render inline (sized to parent) instead of fixed to viewport. */
  inline?: boolean;
  /** Fine grid spacing in pixels for the from-grid (primary layer). */
  cellSize?: number;
  /** Fine grid spacing in pixels for the to-grid (secondary layer). */
  cellSizeTo?: number;
  /** Phase offset in px between from-grid and to-grid. */
  offsetPx?: number;
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
  cellSizeTo,
  offsetPx = 0,
  scale = 1,
}: GeometryBackdropProps) {
  const className = inline
    ? 'absolute inset-0 pointer-events-none overflow-hidden'
    : 'fixed inset-0 pointer-events-none -z-10 overflow-hidden';

  // Ease each axis independently so a from-unit swap, a to-unit swap,
  // and a slider drag all settle smoothly without colliding.
  const animatedFrom = useAnimatedNumber(cellSize);
  // Default to-cell follows from-cell so kit-card previews (no bench in
  // scope) render a single visible layer instead of two coincident
  // grids of the same size; live pages always supply both explicitly.
  const animatedTo = useAnimatedNumber(cellSizeTo ?? cellSize);
  const animatedOffset = useAnimatedNumber(offsetPx);
  const coarseFrom = animatedFrom * 5;
  const coarseTo = animatedTo * 5;

  return (
    <div
      aria-hidden
      className={className}
      style={{
        zIndex: inline ? 0 : -1,
        opacity: 0.95,
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
          {/* FROM layer: primary blue, phase 0 */}
          <pattern
            id="uf-grid-fine-from"
            width={animatedFrom}
            height={animatedFrom}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${animatedFrom} 0 L 0 0 0 ${animatedFrom}`}
              fill="none"
              stroke="var(--uf-grid-faint)"
              strokeWidth="0.8"
            />
          </pattern>
          <pattern
            id="uf-grid-coarse-from"
            width={coarseFrom}
            height={coarseFrom}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${coarseFrom} 0 L 0 0 0 ${coarseFrom}`}
              fill="none"
              stroke="var(--uf-grid)"
              strokeWidth="0.9"
              opacity="0.7"
            />
          </pattern>

          {/* TO layer: secondary blue, phase shifted by offsetPx along
              both axes so the slider drag reads as a diagonal slide. */}
          <pattern
            id="uf-grid-fine-to"
            width={animatedTo}
            height={animatedTo}
            x={animatedOffset}
            y={animatedOffset}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${animatedTo} 0 L 0 0 0 ${animatedTo}`}
              fill="none"
              stroke="var(--uf-grid-secondary-faint)"
              strokeWidth="0.8"
            />
          </pattern>
          <pattern
            id="uf-grid-coarse-to"
            width={coarseTo}
            height={coarseTo}
            x={animatedOffset}
            y={animatedOffset}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${coarseTo} 0 L 0 0 0 ${coarseTo}`}
              fill="none"
              stroke="var(--uf-grid-secondary)"
              strokeWidth="0.9"
              opacity="0.65"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#uf-grid-fine-from)" />
        <rect width="100%" height="100%" fill="url(#uf-grid-coarse-from)" />
        <rect width="100%" height="100%" fill="url(#uf-grid-fine-to)" />
        <rect width="100%" height="100%" fill="url(#uf-grid-coarse-to)" />
      </svg>
    </div>
  );
}
