// 2D coordinate plane with two draggable points. Owns the SVG; emits
// point positions in plane-space (centered on origin, y up) to its
// parent. The hook above translates plane-space pixels back to the
// chosen length unit via its current scale.
//
// Also draws derived visual elements:
//   - Distance line connecting A↔B in `distanceColor`.
//   - Midpoint marker (small filled circle) in `midpointColor`.
// The parent's Result rows display the same colors as bullets next to
// "distance" and "midpoint," so the plane reads as a legend.

import { useRef, useState } from 'react';

const VIEW = 360;
const MARGIN = 28;
const RANGE = 5; // ±5 unit visible range
const SCALE = (VIEW / 2 - MARGIN) / RANGE;

interface Point {
  x: number;
  y: number;
}

interface PlaneCanvasProps {
  pointA: Point;
  pointB: Point;
  midpoint: Point;
  /** Polar angle of A in radians, computed via polarFromCartesian by
   *  the parent. Drives the angle-arc geometry near the origin. */
  polarAngle: number;
  onPointAChange: (next: Point) => void;
  onPointBChange: (next: Point) => void;
  /** Color of the dashed distance line A↔B. Match the parent Result bullet. */
  distanceColor: string;
  /** Color of the midpoint marker. Match the parent Result bullet. */
  midpointColor: string;
  /** Color of A's decomposition: the radius vector + angle arc (polar
   *  form) and the x/y projection lines (cartesian form). Both
   *  decompositions share one color because they represent the same
   *  point. Match the parent's polar(A) and cartesian(polar(A))
   *  Result bullets. */
  decomposeColor: string;
}

export function PlaneCanvas({
  pointA,
  pointB,
  midpoint,
  polarAngle,
  onPointAChange,
  onPointBChange,
  distanceColor,
  midpointColor,
  decomposeColor,
}: PlaneCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState<'a' | 'b' | null>(null);

  const toSvg = (p: Point) => ({ x: VIEW / 2 + p.x * SCALE, y: VIEW / 2 - p.y * SCALE });
  const fromSvg = (cx: number, cy: number): Point => ({
    x: (cx - VIEW / 2) / SCALE,
    y: -(cy - VIEW / 2) / SCALE,
  });

  const aSvg = toSvg(pointA);
  const bSvg = toSvg(pointB);
  const mSvg = toSvg(midpoint);
  const originSvg = toSvg({ x: 0, y: 0 });

  // Cartesian projection foot: (A.x, 0) in plane → svg coords.
  const aXFootSvg = toSvg({ x: pointA.x, y: 0 });

  // Angle arc near the origin (radius 24 svg-px). Sweeps from the
  // positive x-axis (math) to the radius vector's direction. SVG y is
  // flipped from math y, so the arc end has -sin(angle). Positive
  // math angles draw clockwise in SVG y-down (sweep-flag = 1);
  // negative math angles draw counterclockwise (sweep-flag = 0).
  const ARC_R = 24;
  const arcEndX = originSvg.x + ARC_R * Math.cos(polarAngle);
  const arcEndY = originSvg.y - ARC_R * Math.sin(polarAngle);
  const arcSweep = polarAngle >= 0 ? 1 : 0;
  const arcLargeFlag = Math.abs(polarAngle) > Math.PI ? 1 : 0;
  const arcPath = `M ${originSvg.x + ARC_R} ${originSvg.y} A ${ARC_R} ${ARC_R} 0 ${arcLargeFlag} ${arcSweep} ${arcEndX} ${arcEndY}`;

  function pointerToSvgCoords(e: React.PointerEvent<SVGSVGElement>): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW,
      y: ((e.clientY - rect.top) / rect.height) * VIEW,
    };
  }

  function handlePointerDown(which: 'a' | 'b', e: React.PointerEvent<SVGElement>) {
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    setDragging(which);
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    const { x, y } = pointerToSvgCoords(e);
    const next = fromSvg(x, y);
    next.x = Math.round(next.x * 10) / 10;
    next.y = Math.round(next.y * 10) / 10;
    if (dragging === 'a') onPointAChange(next);
    else onPointBChange(next);
  }

  function handlePointerUp() {
    setDragging(null);
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className="block h-auto w-full max-w-full touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="2D plane with two draggable points"
    >
      <line
        x1={MARGIN}
        y1={VIEW / 2}
        x2={VIEW - MARGIN}
        y2={VIEW / 2}
        stroke="var(--uf-fg)"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1={VIEW / 2}
        y1={MARGIN}
        x2={VIEW / 2}
        y2={VIEW - MARGIN}
        stroke="var(--uf-fg)"
        strokeWidth="1"
        opacity="0.4"
      />
      {Array.from({ length: RANGE * 2 + 1 }, (_, i) => i - RANGE).map((n) =>
        n === 0 ? null : (
          <g key={`tick-${n}`}>
            <line
              x1={VIEW / 2 + n * SCALE}
              y1={VIEW / 2 - 3}
              x2={VIEW / 2 + n * SCALE}
              y2={VIEW / 2 + 3}
              stroke="var(--uf-fg)"
              opacity="0.4"
            />
            <line
              x1={VIEW / 2 - 3}
              y1={VIEW / 2 - n * SCALE}
              x2={VIEW / 2 + 3}
              y2={VIEW / 2 - n * SCALE}
              stroke="var(--uf-fg)"
              opacity="0.4"
            />
          </g>
        ),
      )}

      {/* A's cartesian decomposition: horizontal x-component from
          origin to (A.x, 0), then vertical y-component from (A.x, 0)
          up to A. Thin solid lines so the polar elements (drawn on top)
          read as the primary decomposition; cartesian reads as the
          supporting axis-aligned breakdown. */}
      <line
        x1={originSvg.x}
        y1={originSvg.y}
        x2={aXFootSvg.x}
        y2={aXFootSvg.y}
        stroke={decomposeColor}
        strokeWidth="1.5"
        opacity="0.7"
      />
      <line
        x1={aXFootSvg.x}
        y1={aXFootSvg.y}
        x2={aSvg.x}
        y2={aSvg.y}
        stroke={decomposeColor}
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* A's polar decomposition: radius vector from origin to A plus
          a small angle arc near the origin sweeping from +x to the
          radius. */}
      <line
        x1={originSvg.x}
        y1={originSvg.y}
        x2={aSvg.x}
        y2={aSvg.y}
        stroke={decomposeColor}
        strokeWidth="2"
      />
      <path d={arcPath} fill="none" stroke={decomposeColor} strokeWidth="2" />

      {/* Distance line: dashed, colored to match the parent's distance Result bullet. */}
      <line
        x1={aSvg.x}
        y1={aSvg.y}
        x2={bSvg.x}
        y2={bSvg.y}
        stroke={distanceColor}
        strokeWidth="2"
        strokeDasharray="5 4"
      />

      {/* Midpoint marker: filled circle in the legend's second color. */}
      <circle
        cx={mSvg.x}
        cy={mSvg.y}
        r={6}
        fill={midpointColor}
        stroke="var(--uf-bg)"
        strokeWidth="2"
      />

      {/* Points A and B: neutral outline (foreground color), filled with
          card color so they read as draggable handles, not legend swatches. */}
      <circle
        cx={aSvg.x}
        cy={aSvg.y}
        r={11}
        fill="var(--uf-card)"
        stroke="var(--uf-fg)"
        strokeWidth="2"
        cursor="grab"
        onPointerDown={(e) => handlePointerDown('a', e)}
      />
      <text
        x={aSvg.x + 16}
        y={aSvg.y - 10}
        style={{ fontFamily: 'var(--uf-display)', fontSize: '15px', fill: 'var(--uf-fg)' }}
      >
        A
      </text>
      <circle
        cx={bSvg.x}
        cy={bSvg.y}
        r={11}
        fill="var(--uf-card)"
        stroke="var(--uf-fg)"
        strokeWidth="2"
        cursor="grab"
        onPointerDown={(e) => handlePointerDown('b', e)}
      />
      <text
        x={bSvg.x + 16}
        y={bSvg.y - 10}
        style={{ fontFamily: 'var(--uf-display)', fontSize: '15px', fill: 'var(--uf-fg)' }}
      >
        B
      </text>
    </svg>
  );
}
