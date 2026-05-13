// Shared pointer-drag hook for SVG handles. Maps screen pointer
// coordinates into SVG userspace via getScreenCTM().inverse(), captures
// the grab offset on pointerdown so the handle doesn't snap-to-cursor,
// and tolerates pointercancel (interrupted gestures on iOS / Android).
//
// Pointer events fire faster than the display refresh on high-poll-rate
// devices; calling onDrag synchronously per move burns renders that the
// browser never paints. The hook coalesces moves with requestAnimation-
// Frame: pointermove writes the latest SVG-space point into a ref and
// schedules a single rAF, which calls onDrag with whatever the most
// recent position is right before paint. At most one onDrag call per
// frame, always carrying the freshest pointer location.
//
// The caller supplies a mapping fn that turns the cursor's SVG-space
// position (accounting for grab offset) into application state via a
// callback. The hook owns the bookkeeping.

import { useEffect, useRef } from 'react';

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

export type UseSvgPointerDrag = ReturnType<typeof useSvgPointerDrag>;

export function useSvgPointerDrag({ getHandleCenter, onDrag }: UseSvgPointerDragArgs) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const pendingRef = useRef<SvgPoint | null>(null);
  const rafRef = useRef<number | null>(null);

  // flush is re-created each render and closes over the current onDrag.
  // A scheduled rAF carries whichever flush was passed at schedule time;
  // its onDrag closure may be one render stale by the time the frame
  // fires, but onDrag is a setState callback which is reference-stable
  // for useState, so a "stale" closure still routes to the latest state.
  // Writing a ref during render to bypass that staleness would trip
  // React Compiler's no-refs-during-render rule.
  const flush = () => {
    rafRef.current = null;
    const p = pendingRef.current;
    pendingRef.current = null;
    if (p) onDrag(p);
  };

  const cancelPending = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // Unmount mid-drag would otherwise leave an rAF pointing at a stale
  // closure; cleanup reads the ref directly rather than closing over
  // cancelPending (which is fresh each render and would force an empty-
  // deps lint exception).
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

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
      // currentTarget = the handle element the listener is attached to.
      // Using e.target would be the topmost hit (could be a child inside
      // the handle), and Safari then delivers later pointer events to
      // whatever element is under the cursor instead of honoring capture.
      const target = e.currentTarget as SVGElement;
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
      pendingRef.current = {
        x: local.x - dragRef.current.offsetX,
        y: local.y - dragRef.current.offsetY,
      };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    },
    onPointerUp: (e: React.PointerEvent<SVGElement>) => {
      // currentTarget = the handle element the listener is attached to.
      // Using e.target would be the topmost hit (could be a child inside
      // the handle), and Safari then delivers later pointer events to
      // whatever element is under the cursor instead of honoring capture.
      cancelPending();
      flush();
      const target = e.currentTarget as SVGElement;
      if (target.hasPointerCapture?.(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
      dragRef.current = null;
    },
    onPointerCancel: (e: React.PointerEvent<SVGElement>) => {
      // currentTarget = the handle element the listener is attached to.
      // Using e.target would be the topmost hit (could be a child inside
      // the handle), and Safari then delivers later pointer events to
      // whatever element is under the cursor instead of honoring capture.
      cancelPending();
      flush();
      const target = e.currentTarget as SVGElement;
      if (target.hasPointerCapture?.(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
      dragRef.current = null;
    },
  };

  return { svgRef, handlers };
}
