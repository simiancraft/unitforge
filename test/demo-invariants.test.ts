// Invariant tests for hand-mirrored lookups in the demo. These guard
// the joints that TypeScript can't (because `Unit.id` widens to
// `string` in the core library, so literal-union derivation from a
// `[...] as const` array of units does not carry through).
//
// What each test pins:
//
// 1. `COOKING_UNIT_IDS` parallel-const array stays in sync with
//    `COOKING_ALL_UNITS.map(u => u.id)`. The Records keyed on
//    `CookingUnitId` (e.g. `COOKING_BOUNDS`) are only as type-safe as
//    the union they're indexed by; if the array gains a unit without
//    the union getting one, every consumer silently falls through to
//    `cup-us`.
//
// 2. `SodaId` union ⇌ `SODAS` ⇌ keys of `SODA_FL_OZ` /
//    `SODA_ICONS` / `SODA_NAMES`. Same story; the soda comparator's
//    icon and codegen lookups are total only as long as these three
//    sites agree.
//
// 3. `FoodId` union ⇌ `FOODS` ⇌ keys of `FOOD_ICONS` /
//    `FOOD_NAMES`. Same.
//
// Imports are relative paths into demo/src/ rather than the demo's
// `~/` alias because this test runs under the library's bun-test
// invocation (no Vite, no alias resolution).

import { describe, expect, it } from 'bun:test';
import {
  FOODS,
  SODA_FL_OZ,
  SODAS,
} from '../demo/src/components/kits/cooking/sections/comparison-machine/parts/sugar-units.js';
import { COOKING_ALL_UNITS, COOKING_UNIT_IDS } from '../demo/src/components/kits/cooking/units.js';

describe('demo invariants: cooking units catalog', () => {
  it('COOKING_UNIT_IDS covers every id in COOKING_ALL_UNITS', () => {
    const fromArray = [...new Set(COOKING_ALL_UNITS.map((u) => u.id))].sort();
    const fromUnion = [...new Set<string>(COOKING_UNIT_IDS)].sort();
    expect(fromUnion).toEqual(fromArray);
  });

  it('COOKING_UNIT_IDS has no extra entries vs COOKING_ALL_UNITS', () => {
    const fromArrayIds = COOKING_ALL_UNITS.map((u) => u.id);
    for (const id of COOKING_UNIT_IDS) {
      expect(fromArrayIds).toContain(id);
    }
  });
});

describe('demo invariants: SODAS / SodaId records', () => {
  it('SODA_FL_OZ has an entry for every soda in SODAS', () => {
    for (const soda of SODAS) {
      expect(SODA_FL_OZ).toHaveProperty(soda.id);
    }
  });

  it('SODA_FL_OZ has no extra entries vs SODAS', () => {
    const ids = new Set(SODAS.map((s) => s.id));
    for (const key of Object.keys(SODA_FL_OZ)) {
      expect(ids.has(key)).toBe(true);
    }
  });
});

describe('demo invariants: FOODS catalog', () => {
  it('every food has a stable id and label', () => {
    for (const food of FOODS) {
      expect(food.id).toBeTruthy();
      expect(food.label).toBeTruthy();
      expect(food.dimension).toBe('sugar');
    }
  });
});
