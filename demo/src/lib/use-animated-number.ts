// Eases a numeric value toward a target over `durationMs` whenever the
// target changes. rAF-driven; honors prefers-reduced-motion by snapping
// without animation. Returns the current animated value.
//
// Used by themed backdrops to smooth visual properties that are derived
// from bench state (grid cell size, dash length, gap, period). Without
// this, SVG pattern attributes snap when a unit selection changes; the
// snap reads as "broken", not "responsive".

import { useEffect, useRef, useState } from 'react';

const PREFERS_REDUCED_MOTION_QUERY =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

function prefersReducedMotion(): boolean {
  return PREFERS_REDUCED_MOTION_QUERY?.matches ?? false;
}

// Ease-out cubic; gentle settle, no overshoot, cheap to compute.
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function useAnimatedNumber(target: number, durationMs = 320): number {
  const [value, setValue] = useState(target);
  // Mirror `value` into a ref so the effect can read the latest
  // animated value without taking a dep on it (a `value` dep would
  // restart the easing from itself on every tick and freeze it).
  const valueRef = useRef(target);
  valueRef.current = value;
  const rafRef = useRef(0);

  useEffect(() => {
    const from = valueRef.current;
    if (from === target) return;
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    const startTime = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(t);
      setValue(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return value;
}
