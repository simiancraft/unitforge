// COUNT unit catalog for the inventory surfaces, plus the bench bounds
// the page drives its slider from. The bulk MASS units the roastery
// section needs are imported there directly; this file stays COUNT-only
// because the bench is COUNT-only.
//
// The thing to notice: every unit here is a grouping convention. A
// gross is 144 each, a ream is 500 each, and both scale cleanly in
// either direction. Nothing here floors. Flooring lives in the kit's
// conversions, not in a unit's toBase / fromBase, because forge
// composes those in both directions and the fuzz suite holds them to
// round-tripping.
//
// Mirrors the mass-units shape (family arrays + an ascending all-units
// ladder + a parallel id const + per-unit slider bounds) so the demo
// sections can share the readout-matrix and bench idioms.

import type { Unit } from 'unitforge';
import { dozen, each, greatGross, gross, pair, ream } from 'unitforge/kits/count';

/** Every COUNT unit the library ships, in ascending piece order. The
 *  bench picker iterates this. Deliberately short: `each` through
 *  `ream` are the groupings a trade actually invoices in, and the
 *  catalog stops where trade convention stops. Case, pallet, and
 *  container are NOT here; those are per-SKU numbers, not universal
 *  ones, so they belong in userland `defineUnit` calls. The case-pack
 *  section below demonstrates exactly that. */
export const INVENTORY_COUNT_UNITS = [
  each, // 1
  pair, // 2
  dozen, // 12
  gross, // 144
  ream, // 500
  greatGross, // 1728
] as const;

/** The bench catalog. COUNT only: the bench's job on this page is to
 *  show that a grouping convention is an ordinary unit, and mixing
 *  dimensions into one picker would make every other pairing a
 *  dimension error rather than a conversion. */
export const INVENTORY_ALL_UNITS = INVENTORY_COUNT_UNITS;

export type CountUnit = Unit<'count', number>;

/** Parallel as-const array of the bench catalog's ids. Same rationale
 *  as `MASS_UNIT_IDS`: the core `Unit` type declares `id: string`, so
 *  deriving the union from `INVENTORY_ALL_UNITS` would widen to
 *  `string` and a Record keyed on it would silently accept stale keys.
 *  Pinned to the catalog by a demo-invariants test. */
export const INVENTORY_UNIT_IDS = [
  'each',
  'pair',
  'dozen',
  'gross',
  'ream',
  'great-gross',
] as const;

export type InventoryUnitId = (typeof INVENTORY_UNIT_IDS)[number];

export interface SliderBounds {
  min: number;
  max: number;
  step: number;
  /** Pedagogically meaningful default the slider snaps to when the user
   *  switches into this unit. */
  init: number;
}

/** Per-unit bench bounds. Every step is 1: these are discrete units, so
 *  a slider that can land on 2.5 dozen is lying about what the
 *  dimension means. The ranges shrink as the grouping grows so the
 *  resulting `each` count stays in the same rough band across the
 *  ladder (24 gross and 3456 each are the same shelf). */
export const INVENTORY_BOUNDS: Record<InventoryUnitId, SliderBounds> = {
  each: { min: 1, max: 500, step: 1, init: 144 },
  pair: { min: 1, max: 250, step: 1, init: 24 },
  dozen: { min: 1, max: 144, step: 1, init: 12 },
  gross: { min: 1, max: 48, step: 1, init: 1 },
  ream: { min: 1, max: 40, step: 1, init: 1 },
  'great-gross': { min: 1, max: 12, step: 1, init: 1 },
};

/** Returns bench bounds for a COUNT unit id. Parameter is `string`
 *  because callers drive from `BenchState.fromId: string`; an `in`
 *  check narrows before the typed lookup. Unknown ids fall back to
 *  `each` so a future rename does not crash the page. */
export function inventoryBoundsFor(id: string): SliderBounds {
  if (id in INVENTORY_BOUNDS) {
    return INVENTORY_BOUNDS[id as InventoryUnitId];
  }
  return INVENTORY_BOUNDS.each;
}
