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
  onPointAChange: (next: Point) => void;
  onPointBChange: (next: Point) => void;
  /** Color of the dashed distance line A↔B. Match the parent Result bullet. */
  distanceColor: string;
  /** Color of the midpoint marker. Match the parent Result bullet. */
  midpointColor: string;
}

export function PlaneCanvas({
  pointA,
  pointB,
  midpoint,
  onPointAChange,
  onPointBChange,
  distanceColor,
  midpointColor,
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
