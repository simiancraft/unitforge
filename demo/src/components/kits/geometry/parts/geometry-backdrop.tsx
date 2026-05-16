// Engineering / grid paper background for the geometry theme. TWO
// grids are superimposed: a from-grid driven by the bench's from-unit
// (cell size eases when the unit changes) and a to-grid driven by the
// to-unit, in a complementary hue per theme (dim orange in light, deep
// slate-navy in dark) so the two read as distinct layers.
//
// The two layers SCROLL continuously via patternTransform, creating a
// parallax effect: the from-grid moves at a fixed base speed (slow
// "background"), the to-grid moves at the slider-driven speed (the
// "foreground"). The differential between the two reads as depth —
// at low slider values the layers travel nearly together (shallow),
// at high values the to-grid races past the from-grid (deep parallax).
//
// Implementation: one rAF loop holds phase state for each layer in
// refs and writes patternTransform directly to the SVG elements via
// setAttribute; the React tree does not re-render per frame. The
// per-layer speeds come in as eased numbers (useAnimatedNumber over
// the prop) so slider drags morph smoothly. prefers-reduced-motion
// short-circuits the rAF: patterns stay static.

import { useEffect, useRef } from 'react';
import { useAnimatedNumber } from '~/lib/use-animated-number.js';
import { GRID_FROM_BASE_SPEED_PX_S } from './backdrop-scales.js';

interface GeometryBackdropProps {
  /** Render inline (sized to parent) instead of fixed to viewport. */
  inline?: boolean;
  /** Fine grid spacing in pixels for the from-grid (primary layer). */
  cellSize?: number;
  /** Fine grid spacing in pixels for the to-grid (secondary layer). */
  cellSizeTo?: number;
  /** Scroll speed in px/sec for the to-grid (slider-driven). */
  speedPxPerSec?: number;
  /**
   * CSS scale applied to the whole grid; transitions smoothly so hovers
   * on a kit card visibly "zoom in" on the paper without re-rendering
   * SVG pattern attributes (which would snap instantly).
   */
  scale?: number;
}

const PREFERS_REDUCED_MOTION_QUERY =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

function prefersReducedMotion(): boolean {
  return PREFERS_REDUCED_MOTION_QUERY?.matches ?? false;
}

export function GeometryBackdrop({
  inline,
  cellSize = 12,
  cellSizeTo,
  speedPxPerSec = 0,
  scale = 1,
}: GeometryBackdropProps) {
  const className = inline
    ? 'absolute inset-0 pointer-events-none overflow-hidden'
    : 'fixed inset-0 pointer-events-none -z-10 overflow-hidden';

  // Ease each unit-axis so a from-unit / to-unit swap morphs rather
  // than snaps. Default the to-cell to the from-cell so kit-card
  // previews (no bench in scope) render a single visible layer.
  const animatedFrom = useAnimatedNumber(cellSize);
  const animatedTo = useAnimatedNumber(cellSizeTo ?? cellSize);
  const coarseFrom = animatedFrom * 5;
  const coarseTo = animatedTo * 5;

  // Speed flows through a ref so the rAF tick reads the current eased
  // value without restarting the animation loop on every change.
  const animatedSpeed = useAnimatedNumber(speedPxPerSec);
  const toSpeedRef = useRef(animatedSpeed);
  toSpeedRef.current = animatedSpeed;

  // The from-grid speed is fixed; baked into the loop as a constant so
  // the from-layer scrolls steadily regardless of slider state.
  const fineFromRef = useRef<SVGPatternElement>(null);
  const coarseFromRef = useRef<SVGPatternElement>(null);
  const fineToRef = useRef<SVGPatternElement>(null);
  const coarseToRef = useRef<SVGPatternElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    let last = performance.now();
    let phaseFrom = 0;
    let phaseTo = 0;
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      phaseFrom += dt * GRID_FROM_BASE_SPEED_PX_S;
      phaseTo += dt * toSpeedRef.current;
      // The two grids scroll diagonally (both axes) so the parallax
      // reads in two directions at once; modulo the coarse cell so the
      // numeric value stays bounded and the pattern tiles seamlessly.
      const fp = phaseFrom % 1024;
      const tp = phaseTo % 1024;
      const fromXf = `translate(${fp} ${fp})`;
      const toXf = `translate(${tp} ${tp})`;
      fineFromRef.current?.setAttribute('patternTransform', fromXf);
      coarseFromRef.current?.setAttribute('patternTransform', fromXf);
      fineToRef.current?.setAttribute('patternTransform', toXf);
      coarseToRef.current?.setAttribute('patternTransform', toXf);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

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
          {/* FROM layer: primary blue, fixed-speed scroll. */}
          <pattern
            ref={fineFromRef}
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
            ref={coarseFromRef}
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

          {/* TO layer: secondary hue, slider-driven scroll speed. */}
          <pattern
            ref={fineToRef}
            id="uf-grid-fine-to"
            width={animatedTo}
            height={animatedTo}
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
            ref={coarseToRef}
            id="uf-grid-coarse-to"
            width={coarseTo}
            height={coarseTo}
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
