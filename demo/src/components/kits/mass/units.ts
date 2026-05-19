// Per-kit unit catalogs for the mass surfaces. Three semantic families
// (SI metric, US/UK customary, Asian regional) listed explicitly so demo
// components don't have to re-derive groupings from id morphology; if
// the lib adds a new mass unit, drop it in the relevant family here and
// the picker + readout matrix follow on next build.
//
// Mirrors the cooking-units shape so demo sections can share the
// readout-matrix idiom. The killer regional-disambiguation story for
// mass lives in the Asian family (jin PRC 500 g, jin HK 600 g, catty
// Singapore 604.79 g) the way it lives in the US/UK pairs for cooking.

import type { Unit } from 'unitforge';
import {
  cattySg,
  gram,
  jinHk,
  jinPrc,
  kilogram,
  longTon,
  microgram,
  milligram,
  ounceAvoirdupois,
  pound,
  shortTon,
  stone,
  tonne,
} from 'unitforge/kits/mass';

/** SI metric atoms. The kit's anchor family; every other family
 *  ultimately reduces to grams. Microgram is the smallest unit a working
 *  practitioner reaches for outside pharmacy contexts. */
export const MASS_SI_UNITS = [microgram, milligram, gram, kilogram, tonne] as const;

/** US / UK customary atoms. The avoirdupois family; ounce, pound, stone
 *  (UK bodyweight), short ton (US freight), long ton (UK freight). The
 *  short-ton vs long-ton 12% gap is the same shape as cooking's US/UK
 *  pint/quart split; lives in a side-by-side readout. */
export const MASS_CUSTOMARY_UNITS = [ounceAvoirdupois, pound, stone, shortTon, longTon] as const;

/** Asian regional atoms. PRC mainland market jin (500 g), HK / Taiwan
 *  catty (600 g, ~20% larger), and Singapore / Malaysia statutory catty
 *  (604.79 g, the 1⅓ lb avoirdupois value). Three closely-spaced
 *  weights with the same character (斤) at the heart; the killer regional
 *  disambiguation story this kit ships. */
export const MASS_ASIAN_UNITS = [jinPrc, jinHk, cattySg] as const;

/** Every kit-shipped mass unit, sequenced by ascending kilogram
 *  value (microgram → long ton). The bench picker and hello-mass
 *  input picker iterate this; the ascending sort makes the dropdown
 *  read as a sized ladder rather than a family-grouped list, which
 *  is what a user dialing in a mass actually wants. Family-grouped
 *  iteration (for the SI / customary / Asian readout columns) uses
 *  the per-family arrays above. */
export const MASS_ALL_UNITS = [
  microgram, // 1e-9 kg
  milligram, // 1e-6 kg
  gram, // 1e-3 kg
  ounceAvoirdupois, // 0.0283 kg
  pound, // 0.4536 kg
  jinPrc, // 0.5 kg
  jinHk, // 0.6 kg
  cattySg, // 0.6048 kg
  kilogram, // 1 kg
  stone, // 6.35 kg
  shortTon, // 907.18 kg
  tonne, // 1000 kg
  longTon, // 1016.05 kg
] as const;

export type MassUnit = Unit<'mass', number>;

/** Parallel as-const array of kit-shipped mass ids. Same rationale as
 *  cooking's `COOKING_UNIT_IDS`: the core `Unit` type declares
 *  `id: string`, so deriving the union from `MASS_ALL_UNITS` would
 *  widen, and a Record keyed on it would silently accept stale keys.
 *  Hand-declared here, pinned to MASS_ALL_UNITS by a demo-invariants
 *  test. */
export const MASS_UNIT_IDS = [
  'microgram',
  'milligram',
  'gram',
  'kilogram',
  'tonne',
  'ounce-avoirdupois',
  'pound',
  'stone',
  'short-ton',
  'long-ton',
  'jin-prc',
  'jin-hk',
  'catty-sg',
] as const;

export type MassUnitId = (typeof MASS_UNIT_IDS)[number];

export interface SliderBounds {
  min: number;
  max: number;
  step: number;
  /** Pedagogically meaningful default the slider snaps to when the user
   *  switches into this unit. */
  init: number;
}

/** Per-unit slider bounds, keyed by stable unit id. Mass spans ~15
 *  orders of magnitude (microgram ≈ 1e-9 kg up through long ton ≈ 1016
 *  kg); ranges below are tuned per-unit so the slider lands in the
 *  pedagogically interesting band for each. Typed against `MassUnitId`
 *  so a typo or stale key surfaces at compile time. */
export const MASS_BOUNDS: Record<MassUnitId, SliderBounds> = {
  microgram: { min: 1, max: 1000, step: 1, init: 100 },
  milligram: { min: 1, max: 1000, step: 1, init: 250 },
  gram: { min: 1, max: 1000, step: 1, init: 250 },
  kilogram: { min: 0.1, max: 100, step: 0.1, init: 1 },
  tonne: { min: 0.1, max: 100, step: 0.1, init: 1 },
  'ounce-avoirdupois': { min: 0.5, max: 64, step: 0.5, init: 8 },
  pound: { min: 0.25, max: 200, step: 0.25, init: 5 },
  stone: { min: 0.5, max: 30, step: 0.5, init: 10 },
  'short-ton': { min: 0.25, max: 50, step: 0.25, init: 1 },
  'long-ton': { min: 0.25, max: 50, step: 0.25, init: 1 },
  'jin-prc': { min: 0.5, max: 100, step: 0.5, init: 10 },
  'jin-hk': { min: 0.5, max: 100, step: 0.5, init: 10 },
  'catty-sg': { min: 0.5, max: 100, step: 0.5, init: 10 },
};

/** Returns the slider bounds for a given mass unit id. Same pattern as
 *  cooking: parameter is `string` because callers drive from runtime
 *  state where the id originates as `BenchState.fromId: string`; an
 *  `in` check narrows to `MassUnitId` before the typed lookup.
 *  Unknown ids fall back to `kilogram` so a future kit rename does not
 *  crash the page before the consumer migrates. */
export function massBoundsFor(id: string): SliderBounds {
  if (id in MASS_BOUNDS) {
    return MASS_BOUNDS[id as MassUnitId];
  }
  return MASS_BOUNDS.kilogram;
}

/** The three regional jin / catty atoms paired for the three-jins
 *  machine. Each ships a label ready for display under the unit symbol.
 *  Order matches the historical ladder: smallest first (PRC 500 g),
 *  middle (HK 600 g), heaviest (Singapore statutory 604.79 g). */
export const MASS_REGIONAL_JINS = [
  { unit: jinPrc, region: 'PRC mainland', shortLabel: 'PRC' },
  { unit: jinHk, region: 'HK / Taiwan', shortLabel: 'HK' },
  { unit: cattySg, region: 'Singapore / Malaysia (statutory)', shortLabel: 'SG' },
] as const;
