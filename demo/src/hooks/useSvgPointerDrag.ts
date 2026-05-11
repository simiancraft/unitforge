// Shared pointer-drag hook for SVG handles. Maps screen pointer
// coordinates into SVG userspace via getScreenCTM().inverse(), captures
// the grab offset on pointerdown so the handle doesn't snap-to-cursor,
// and tolerates pointercancel (interrupted gestures on iOS / Android).
//
// The caller supplies a mapping fn that turns the cursor's SVG-space
// position (accounting for grab offset) into application state via a
// callback. The hook owns the bookkeeping.

import { useRef } from 'react';

export interface SvgPoint {
  x: number;
  y: number;
}

export interface UseSvgPointerDragArgs {
  /** Returns the handle's current SVG-space center, for grab-offset capture. */
  getHandleCenter: () => SvgPoint;
  /** Called with the cursor's SVG-space position (offset-corrected). */
  onDrag: (p: SvgPoint) => void;
}

export function useSvgPointerDrag({ getHandleCenter, onDrag }: UseSvgPointerDragArgs) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);

  const toSvgSpace = (clientX: number, clientY: number): SvgPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  };

  const handlers = {
    onPointerDown: (e: React.PointerEvent<SVGElement>) => {
      const target = e.target as SVGElement;
      target.setPointerCapture(e.pointerId);
      const local = toSvgSpace(e.clientX, e.clientY);
      const center = getHandleCenter();
      dragRef.current = local
        ? { offsetX: local.x - center.x, offsetY: local.y - center.y }
        : { offsetX: 0, offsetY: 0 };
    },
    onPointerMove: (e: React.PointerEvent<SVGElement>) => {
      if (!dragRef.current) return;
      const local = toSvgSpace(e.clientX, e.clientY);
      if (!local) return;
      onDrag({
        x: local.x - dragRef.current.offsetX,
        y: local.y - dragRef.current.offsetY,
      });
    },
    onPointerUp: (e: React.PointerEvent<SVGElement>) => {
      const target = e.target as SVGElement;
      if (target.hasPointerCapture?.(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
      dragRef.current = null;
    },
    onPointerCancel: (e: React.PointerEvent<SVGElement>) => {
      const target = e.target as SVGElement;
      if (target.hasPointerCapture?.(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
      dragRef.current = null;
    },
  };

  return { svgRef, handlers };
}
