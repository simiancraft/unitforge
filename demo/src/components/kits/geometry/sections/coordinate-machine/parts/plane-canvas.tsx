// 2D coordinate plane with two draggable points. Owns the SVG; emits
// point positions in plane-space (centered on origin, y up) to its
// parent. The hook above translates plane-space pixels back to the
// chosen length unit via its current scale.

import { useRef, useState } from 'react';

const VIEW = 320;
const MARGIN = 24;
const SCALE = (VIEW / 2 - MARGIN) / 5; // ±5 unit visible range

interface Point {
  x: number;
  y: number;
}

interface PlaneCanvasProps {
  pointA: Point;
  pointB: Point;
  onPointAChange: (next: Point) => void;
  onPointBChange: (next: Point) => void;
}

export function PlaneCanvas({ pointA, pointB, onPointAChange, onPointBChange }: PlaneCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState<'a' | 'b' | null>(null);

  const toSvg = (p: Point) => ({ x: VIEW / 2 + p.x * SCALE, y: VIEW / 2 - p.y * SCALE });
  const fromSvg = (cx: number, cy: number): Point => ({
    x: (cx - VIEW / 2) / SCALE,
    y: -(cy - VIEW / 2) / SCALE,
  });

  const aSvg = toSvg(pointA);
  const bSvg = toSvg(pointB);

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
      className="block h-auto w-full max-w-full touch-none"
      style={{ maxWidth: `${VIEW}px` }}
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
      {Array.from({ length: 11 }, (_, i) => i - 5).map((n) =>
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
      <line
        x1={aSvg.x}
        y1={aSvg.y}
        x2={bSvg.x}
        y2={bSvg.y}
        stroke="var(--uf-accent)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <circle
        cx={aSvg.x}
        cy={aSvg.y}
        r={10}
        fill="var(--uf-fg)"
        stroke="var(--uf-accent)"
        strokeWidth="2"
        cursor="grab"
        onPointerDown={(e) => handlePointerDown('a', e)}
      />
      <text
        x={aSvg.x + 14}
        y={aSvg.y - 8}
        style={{ fontFamily: 'var(--uf-display)', fontSize: '14px', fill: 'var(--uf-accent)' }}
      >
        A
      </text>
      <circle
        cx={bSvg.x}
        cy={bSvg.y}
        r={10}
        fill="var(--uf-fg)"
        stroke="var(--uf-accent)"
        strokeWidth="2"
        cursor="grab"
        onPointerDown={(e) => handlePointerDown('b', e)}
      />
      <text
        x={bSvg.x + 14}
        y={bSvg.y - 8}
        style={{ fontFamily: 'var(--uf-display)', fontSize: '14px', fill: 'var(--uf-accent)' }}
      >
        B
      </text>
    </svg>
  );
}
