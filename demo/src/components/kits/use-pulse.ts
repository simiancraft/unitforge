// usePulse — flash a boolean true for `durationMs` whenever any value in
// `watch` changes. Used by kit chassis files to make backdrops breathe
// in sync with bench changes (paper rippling on geometry, traces pulsing
// on data-storage).
//
// Returns the current pulse value. Caller composes the dependency tuple;
// the hook restarts the timer on every change and clears on unmount.

import { useEffect, useRef, useState } from 'react';

interface PulseState {
  /** True while the pulse window is open. */
  active: boolean;
  /** The watchKey that opened the current window; used to detect change. */
  sourceKey: string;
}

export function usePulse(watch: ReadonlyArray<unknown>, durationMs: number): boolean {
  // Join into a single string so the dep list below is a static array literal;
  // pulse callers only pass primitives in practice (numbers, strings).
  const watchKey = watch.join('|');
  const [state, setState] = useState<PulseState>({ active: false, sourceKey: '' });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Stamp watchKey into state so the effect's dep is honestly read here;
    // the timer-reset behavior is what makes the pulse extend across rapid
    // changes (slider drags) rather than stopping at the first durationMs.
    setState({ active: true, sourceKey: watchKey });
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => setState((s) => ({ ...s, active: false })),
      durationMs,
    );
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [watchKey, durationMs]);

  return state.active;
}
