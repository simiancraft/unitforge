// Per-kit unit catalogs for the cooking surfaces. Three semantic
// families (US customary, UK imperial, metric + tradition) listed
// explicitly so demo components don't have to re-derive groupings from
// id morphology; if the lib adds a new cooking unit, drop it in the
// relevant family here and the picker + readout matrix follow on next
// build.
//
// `COOKING_TRADITION_UNITS` covers stick-of-butter, dash, and pinch:
// vocabulary that is common in US recipes but isn't strictly "US
// customary measurement" the way fluid-ounce is. Kept separate so the
// HelloCooking readout matrix renders them as their own column rather
// than padding the US column.

import type { Unit } from 'unitforge';
import {
  cupUk,
  cupUs,
  dash,
  fluidOunceUk,
  fluidOunceUs,
  liter,
  milliliter,
  pinch,
  stickOfButter,
  tablespoonUk,
  tablespoonUs,
  teaspoonUk,
  teaspoonUs,
} from 'unitforge/kits/cooking';

export const COOKING_US_UNITS = [teaspoonUs, tablespoonUs, fluidOunceUs, cupUs] as const;

export const COOKING_UK_UNITS = [teaspoonUk, tablespoonUk, fluidOunceUk, cupUk] as const;

export const COOKING_METRIC_UNITS = [milliliter, liter] as const;

export const COOKING_TRADITION_UNITS = [pinch, dash, stickOfButter] as const;

export const COOKING_ALL_UNITS = [
  ...COOKING_METRIC_UNITS,
  ...COOKING_US_UNITS,
  ...COOKING_UK_UNITS,
  ...COOKING_TRADITION_UNITS,
] as const;

export type CookingUnit = Unit<'volume', number>;

/** Parallel as-const array of kit-shipped cooking ids. The core `Unit`
 *  type declares `id: string`, so deriving `CookingUnitId` from
 *  `(typeof COOKING_ALL_UNITS)[number]['id']` would widen to `string`
 *  and a Record keyed on it would silently accept stale keys. Hand-
 *  declaring the literal tuple here is the cheapest way to get a real
 *  string-literal union without touching the core library types. Must
 *  stay in sync with the kit's exports — caught by the test below. */
export const COOKING_UNIT_IDS = [
  'milliliter',
  'liter',
  'teaspoon-us',
  'teaspoon-uk',
  'tablespoon-us',
  'tablespoon-uk',
  'fluid-ounce-us',
  'fluid-ounce-uk',
  'cup-us',
  'cup-uk',
  'stick-of-butter',
  'dash',
  'pinch',
] as const;

export type CookingUnitId = (typeof COOKING_UNIT_IDS)[number];

export interface SliderBounds {
  min: number;
  max: number;
  step: number;
  /** Pedagogically meaningful default the slider snaps to when the
   *  user switches into this unit. */
  init: number;
}

/** Per-unit slider bounds, keyed by stable unit id. The cooking catalog
 *  spans six orders of magnitude (pinch ≈ 0.3 mL up through stick of
 *  butter ≈ 118 mL), so a single (min, max, step) triple cannot serve
 *  every unit; ranges below are tuned per-unit. Typed against
 *  `CookingUnitId` so a typo or a stale key surfaces at compile time. */
export const COOKING_BOUNDS: Record<CookingUnitId, SliderBounds> = {
  milliliter: { min: 1, max: 1000, step: 1, init: 250 },
  liter: { min: 0.25, max: 8, step: 0.25, init: 1 },
  'teaspoon-us': { min: 0.25, max: 24, step: 0.25, init: 1 },
  'teaspoon-uk': { min: 0.25, max: 24, step: 0.25, init: 1 },
  'tablespoon-us': { min: 0.25, max: 16, step: 0.25, init: 1 },
  'tablespoon-uk': { min: 0.25, max: 16, step: 0.25, init: 1 },
  'fluid-ounce-us': { min: 0.5, max: 16, step: 0.5, init: 1 },
  'fluid-ounce-uk': { min: 0.5, max: 16, step: 0.5, init: 1 },
  'cup-us': { min: 0.25, max: 8, step: 0.25, init: 1 },
  'cup-uk': { min: 0.25, max: 8, step: 0.25, init: 1 },
  'stick-of-butter': { min: 0.25, max: 8, step: 0.25, init: 1 },
  dash: { min: 1, max: 24, step: 1, init: 4 },
  pinch: { min: 1, max: 32, step: 1, init: 4 },
};

/** Returns the slider bounds for a given cooking unit id. Parameter
 *  is `string` because callers (bench picker, slider range table)
 *  drive from runtime state where the id originates as a generic
 *  `BenchState.fromId: string`. The `in` check narrows to
 *  `CookingUnitId` before indexing the typed Record, so the lookup
 *  side is type-safe; only the parameter side is loose, by necessity.
 *  Unknown ids fall back to `cup-us` so a future kit id rename does
 *  not crash the page before the consumer migrates. */
export function cookingBoundsFor(id: string): SliderBounds {
  if (id in COOKING_BOUNDS) {
    return COOKING_BOUNDS[id as CookingUnitId];
  }
  return COOKING_BOUNDS['cup-us'];
}

/** US / UK pairs for the customary column. Each row in the cooking
 *  readout matrix lists the unit *family* (teaspoon, tablespoon, fluid
 *  ounce, cup), with the UK row stacked above the US row so the reader
 *  sees the two values side by side without needing two columns. */
export const COOKING_US_UK_PAIRS = [
  { family: 'teaspoon', us: teaspoonUs, uk: teaspoonUk },
  { family: 'tablespoon', us: tablespoonUs, uk: tablespoonUk },
  { family: 'fluid ounce', us: fluidOunceUs, uk: fluidOunceUk },
  { family: 'cup', us: cupUs, uk: cupUk },
] as const;
