// usePulse; flash a boolean true for `durationMs` whenever any value in
// `watch` changes. Used by kit chassis files to make backdrops breathe
// in sync with bench changes (paper rippling on geometry, traces pulsing
// on data-storage).
//
// Returns the current pulse value. Caller composes the dependency tuple;
// the hook restarts the timer on every change and clears on unmount.

import { useEffect, useRef, useState } from 'react';

export function usePulse(watch: ReadonlyArray<unknown>, durationMs: number): boolean {
  // Join into a single string so the dep list below is a static array literal;
  // pulse callers only pass primitives in practice (numbers, strings).
  const watchKey = watch.join('|');
  const [active, setActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: watchKey is a trigger dep; the effect re-runs every change to restart the pulse timer, even though the body doesn't read it.
  useEffect(() => {
    setActive(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setActive(false), durationMs);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [watchKey, durationMs]);

  return active;
}
