// usePulse — flash a boolean true for `durationMs` whenever any value in
// `watch` changes. Used by kit chassis files to make backdrops breathe
// in sync with bench changes (paper rippling on geometry, traces pulsing
// on data-storage).
//
// Returns the current pulse value. Caller composes the dependency tuple;
// the hook restarts the timer on every change and clears on unmount.

import { useEffect, useRef, useState } from 'react';

export function usePulse(watch: ReadonlyArray<unknown>, durationMs: number): boolean {
  const [pulse, setPulse] = useState(false);
  const timerRef = useRef<number | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the dep array IS the watch tuple by design; hook clients control the trigger.
  useEffect(() => {
    setPulse(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPulse(false), durationMs);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, watch);

  return pulse;
}
