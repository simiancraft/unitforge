// useForgeStoke — single source of truth for the forge "stoke" event on
// the home page. Owns:
//
//   - flash state: a counter key (forces the gradient div to remount and
//     restart its keyframe) and the most-recent intensity (the gradient's
//     vertical scale at peak)
//   - particle stoke pool: two slots, round-robin so rapid stokes stack
//     instead of resetting
//   - shake side effects: writes --uf-shake-amp on <main> and toggles
//     the uf-anvil-strike class
//
// Hover calls `stoke(0.75)`; mousedown calls `stoke(STOKE_STRIKE_INTENSITY)`;
// pages can also call with their own intensity. All three visible parts
// (shake, flash, particles) move together.

import { useEffect, useRef, useState } from 'react';

export interface StokeSlot {
  key: number;
  expiresAt: number | null;
  intensity: number;
}

export interface UseForgeStokeArgs {
  /** Lifetime (ms) of a stoke slot's flurry. */
  holdMs: number;
  /** Peak shake amplitude in px at intensity 1.0. */
  shakeAmpBasePx: number;
  /** Duration (ms) of the shake animation; used to schedule class removal. */
  shakeDurationMs: number;
  /** Element id that receives the shake class + CSS var. Defaults to "main". */
  shakeTargetId?: string;
}

export interface UseForgeStokeResult {
  /** Trigger a stoke event with the given intensity (1.0 = baseline). */
  stoke: (intensity: number) => void;
  /** Most-recent intensity; the flash element scales by this value. */
  flashIntensity: number;
  /** Counter bumped on every stoke; use as the flash element's `key`. */
  flashKey: number;
  slotA: StokeSlot;
  slotB: StokeSlot;
}

export function useForgeStoke({
  holdMs,
  shakeAmpBasePx,
  shakeDurationMs,
  shakeTargetId = 'main',
}: UseForgeStokeArgs): UseForgeStokeResult {
  const [slotA, setSlotA] = useState<StokeSlot>({ key: 0, expiresAt: null, intensity: 1 });
  const [slotB, setSlotB] = useState<StokeSlot>({ key: 0, expiresAt: null, intensity: 1 });
  const [flashKey, setFlashKey] = useState(0);
  const [flashIntensity, setFlashIntensity] = useState(1);
  const aTimer = useRef<number | null>(null);
  const bTimer = useRef<number | null>(null);

  // Refs let stoke() pick the round-robin target from the *latest* slot
  // state without depending on the closure that captured them. Avoids the
  // hover-then-click race where stoke() reads a stale aLive/bLive value.
  const slotARef = useRef(slotA);
  const slotBRef = useRef(slotB);
  useEffect(() => {
    slotARef.current = slotA;
  }, [slotA]);
  useEffect(() => {
    slotBRef.current = slotB;
  }, [slotB]);

  // Clear any in-flight timers on unmount.
  useEffect(() => {
    return () => {
      if (aTimer.current !== null) window.clearTimeout(aTimer.current);
      if (bTimer.current !== null) window.clearTimeout(bTimer.current);
    };
  }, []);

  const stoke = (intensity: number) => {
    // Flash: react state. The gradient div uses `key={flashKey}` to
    // force a remount, and reads intensity as a prop/style value
    // straight from this state — no CSS-variable indirection.
    setFlashIntensity(intensity);
    setFlashKey((k) => k + 1);

    // Shake: direct DOM. <main> isn't a child of this hook's owner so
    // class manipulation via id-lookup is the simplest seam. CSS var
    // controls amplitude so a single keyframe carries every intensity.
    const target = document.getElementById(shakeTargetId);
    if (target) {
      target.style.setProperty('--uf-shake-amp', `${shakeAmpBasePx * intensity}px`);
      target.classList.remove('uf-anvil-strike');
      void target.offsetWidth;
      target.classList.add('uf-anvil-strike');
      window.setTimeout(() => {
        target.classList.remove('uf-anvil-strike');
      }, shakeDurationMs);
    }

    // Particles: round-robin pool. Read from refs so the freshly-mounted
    // stoke's expiry timestamps are compared against this-moment slot
    // state, not a possibly-stale captured render value.
    const now = Date.now();
    const a = slotARef.current;
    const b = slotBRef.current;
    const aLive = a.expiresAt !== null && a.expiresAt > now;
    const bLive = b.expiresAt !== null && b.expiresAt > now;
    let pick: 'A' | 'B';
    if (aLive && bLive) {
      pick = (a.expiresAt ?? 0) <= (b.expiresAt ?? 0) ? 'A' : 'B';
    } else if (aLive) {
      pick = 'B';
    } else {
      pick = 'A';
    }

    const newExpiry = now + holdMs;
    if (pick === 'A') {
      setSlotA((s) => ({ key: s.key + 1, expiresAt: newExpiry, intensity }));
      if (aTimer.current !== null) window.clearTimeout(aTimer.current);
      aTimer.current = window.setTimeout(() => {
        setSlotA((s) => ({ ...s, expiresAt: null }));
      }, holdMs);
    } else {
      setSlotB((s) => ({ key: s.key + 1, expiresAt: newExpiry, intensity }));
      if (bTimer.current !== null) window.clearTimeout(bTimer.current);
      bTimer.current = window.setTimeout(() => {
        setSlotB((s) => ({ ...s, expiresAt: null }));
      }, holdMs);
    }
  };

  return { stoke, flashIntensity, flashKey, slotA, slotB };
}
