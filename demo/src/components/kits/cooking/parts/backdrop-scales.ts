// Dogfood: the cooking backdrop's slider-driven scale axis is a real
// forge() call, mirroring the geometry and data-storage patterns. The
// unit-driven glyph selection is a stable hash from the unit id into
// an indexed subset of one of the two glyph pools (from-pool and
// to-pool), so a unit swap deterministically swaps which icons are
// visible without forge needing to express "discrete subset."
//
// Why a dedicated dimension for scale: every visual axis the backdrop
// drives gets its own dimension + unit + conversion, so the demo
// source reads "forge a volume into a scale multiplier" rather than
// "look up a number." That IS the headline.

import { defineConversion, defineUnit, forge, type Unit } from 'unitforge';
import { clamp } from '~/lib/math.js';

type VolumeUnit = Unit<'volume', number>;

// ─── Glyph scale (slider-driven, runtime-bounded) ────────────────────────

const BG_GLYPH_SCALE_DIMENSION = 'bg.glyph_scale' as const;

const glyphScaleRatio = defineUnit({
  id: 'bg-glyph-scale-ratio',
  label: 'Background glyph scale (ratio)',
  symbol: '×',
  dimension: BG_GLYPH_SCALE_DIMENSION,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

// Subtle but visible swing. At slider min the glyphs read as denser
// background texture; at slider max they puff up into more present
// recipe-card stamps. Same lerp shape as the other backdrop axes
// (linear, runtime-bounded so the slider's full travel always uses
// the full range regardless of the picked fromUnit).
const GLYPH_SCALE_MIN = 0.6;
const GLYPH_SCALE_MAX = 1.4;

const glyphScaleFromVolume = defineConversion({
  inputs: {
    volume: 'volume' as const,
    minVolume: 'volume' as const,
    maxVolume: 'volume' as const,
  },
  output: BG_GLYPH_SCALE_DIMENSION,
  compute: ({ volume, minVolume, maxVolume }) => {
    const range = maxVolume - minVolume;
    const t = range > 0 ? clamp((volume - minVolume) / range, 0, 1) : 0;
    return GLYPH_SCALE_MIN + t * (GLYPH_SCALE_MAX - GLYPH_SCALE_MIN);
  },
});

/**
 * Returns the multiplicative scale factor applied to every visible
 * glyph in the cooking backdrop, lerped over the bench's UI bounds.
 */
export function glyphScaleFor(
  fromUnit: VolumeUnit,
  amount: number,
  minAmount: number,
  maxAmount: number,
): number {
  return forge({ volume: fromUnit, minVolume: fromUnit, maxVolume: fromUnit }, glyphScaleRatio, {
    via: glyphScaleFromVolume,
  })({ volume: amount, minVolume: minAmount, maxVolume: maxAmount });
}

// ─── Glyph pool subset selection (unit-driven) ───────────────────────────
//
// Each pool holds N glyph slots; a given unit id picks a deterministic
// K-of-N subset to display. Same unit id always picks the same subset,
// so navigating away and back is stable; different unit ids pick
// different subsets, so swapping from-unit fades out one quarter of the
// glyph field and fades in another. Two pools (from + to) per backdrop;
// they don't overlap (the from-pool slots and to-pool slots are
// disjoint).

function fnv1a32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function lcgNext(seed: number): number {
  // Numerical Recipes LCG; produces unsigned 32-bit pseudo-randoms.
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}

/**
 * Returns the set of slot indices (within [0, total)) that the given
 * unit id activates. Deterministic per (unitId, total, count) tuple;
 * stable across renders so the active glyphs only change when the unit
 * id itself changes.
 */
export function glyphSubsetIndices(unitId: string, total: number, count: number): Set<number> {
  const chosen = new Set<number>();
  let seed = fnv1a32(unitId);
  // Bounded loop: lcgNext is periodic but won't repeat within total
  // many calls for these sizes; cap iterations defensively in case a
  // pathological unit id seeds a short cycle.
  let safety = total * 8;
  while (chosen.size < count && safety-- > 0) {
    chosen.add(seed % total);
    seed = lcgNext(seed);
  }
  return chosen;
}

/** Constant scroll speed in px/sec for the recipe-card horizontal
 *  scan lines. Very slow — meant to read as ambient page texture
 *  drifting, not as a marquee. */
export const SCAN_LINE_SPEED_PX_S = 2;
