// useForgeStoke; single source of truth for the forge "stoke" event on
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

import { type RefObject, useEffect, useRef, useState } from 'react';

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
  /** How many flash-variant classes exist; the round-robin cycles 0..N-1. */
  variantCount: number;
  /**
   * Ref pointing at the element that receives the shake class + CSS var.
   * Pass the chassis's main element ref; the hook reads `.current` at
   * stoke time so it tolerates the element mounting/unmounting around it.
   */
  shakeTargetRef: RefObject<HTMLElement | null>;
}

export interface UseForgeStokeResult {
  /**
   * Trigger a stoke event with the given intensity (1.0 = baseline).
   * Optional `variantOverride` pins the flash variant (0..variantCount-1)
   * instead of advancing the round-robin; useful for events that should
   * always read at the same size (e.g. mousedown).
   */
  stoke: (intensity: number, variantOverride?: number) => void;
  /** Most-recent intensity; the flash element scales by this value. */
  flashIntensity: number;
  /** Counter bumped on every stoke; use as the flash element's `key`. */
  flashKey: number;
  /** Index 0..variantCount-1 of the flash class to apply on this stoke. */
  flashVariant: number;
  slotA: StokeSlot;
  slotB: StokeSlot;
}

export function useForgeStoke({
  holdMs,
  shakeAmpBasePx,
  shakeDurationMs,
  variantCount,
  shakeTargetRef,
}: UseForgeStokeArgs): UseForgeStokeResult {
  const [slotA, setSlotA] = useState<StokeSlot>({ key: 0, expiresAt: null, intensity: 1 });
  const [slotB, setSlotB] = useState<StokeSlot>({ key: 0, expiresAt: null, intensity: 1 });
  const [flashKey, setFlashKey] = useState(0);
  const [flashIntensity, setFlashIntensity] = useState(1);
  const [flashVariant, setFlashVariant] = useState(0);
  const variantCounterRef = useRef(0);
  const aTimer = useRef<number | null>(null);
  const bTimer = useRef<number | null>(null);
  const shakeTimer = useRef<number | null>(null);

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

  // Clear any in-flight timers on unmount so a stoke that fires right
  // before route navigation doesn't write to a detached DOM node.
  useEffect(() => {
    return () => {
      if (aTimer.current !== null) window.clearTimeout(aTimer.current);
      if (bTimer.current !== null) window.clearTimeout(bTimer.current);
      if (shakeTimer.current !== null) window.clearTimeout(shakeTimer.current);
    };
  }, []);

  const stoke = (intensity: number, variantOverride?: number) => {
    // Flash: react state. The gradient div uses `key={flashKey}` to
    // force a remount, and reads intensity + variant as inline style
    // values straight from state; committed together in the same
    // render so the new keyed element paints with all three correct.
    setFlashIntensity(intensity);
    setFlashKey((k) => k + 1);
    if (variantOverride !== undefined) {
      setFlashVariant(variantOverride);
    } else {
      const next = variantCounterRef.current % variantCount;
      variantCounterRef.current += 1;
      setFlashVariant(next);
    }

    // Shake: direct DOM via the chassis-supplied ref. The element holds
    // the class + CSS var; a single keyframe carries every intensity via
    // the var so we don't author one keyframe per intensity level.
    const target = shakeTargetRef.current;
    if (target) {
      target.style.setProperty('--uf-shake-amp', `${shakeAmpBasePx * intensity}px`);
      target.classList.remove('uf-anvil-strike');
      void target.offsetWidth;
      target.classList.add('uf-anvil-strike');
      if (shakeTimer.current !== null) window.clearTimeout(shakeTimer.current);
      shakeTimer.current = window.setTimeout(() => {
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
      // Hoist null-coalesced values into locals: a LogicalExpression in
      // a ternary's test position is a react-compiler bailout.
      const aExpiry = a.expiresAt ?? 0;
      const bExpiry = b.expiresAt ?? 0;
      pick = aExpiry <= bExpiry ? 'A' : 'B';
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

  return { stoke, flashIntensity, flashKey, flashVariant, slotA, slotB };
}
