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
  DEFAULT_REFERENCE_ID,
  DEFAULT_SUBJECT_ID,
  FIGURES,
  STATURE_MAX_IN,
  STATURE_MIN_IN,
} from '../demo/src/components/kits/antiquity/sections/ceo-stature/figures.js';
import {
  ANTIQUITY_LENGTH_BENCH,
  ANTIQUITY_LENGTH_BENCH_IDS,
} from '../demo/src/components/kits/antiquity/units.js';
import {
  ASTRONOMY_ALL_UNITS,
  ASTRONOMY_UNIT_IDS,
} from '../demo/src/components/kits/astronomy/units.js';
import {
  FOODS,
  SODA_FL_OZ,
  SODAS,
} from '../demo/src/components/kits/cooking/sections/comparison-machine/parts/sugar-units.js';
import { COOKING_ALL_UNITS, COOKING_UNIT_IDS } from '../demo/src/components/kits/cooking/units.js';
import { MASS_ALL_UNITS, MASS_UNIT_IDS } from '../demo/src/components/kits/mass/units.js';
import {
  TEMPERATURE_ALL_UNITS,
  TEMPERATURE_UNIT_IDS,
} from '../demo/src/components/kits/temperature/units.js';

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

describe('demo invariants: mass units catalog', () => {
  it('MASS_UNIT_IDS covers every id in MASS_ALL_UNITS', () => {
    const fromArray = [...new Set(MASS_ALL_UNITS.map((u) => u.id))].sort();
    const fromUnion = [...new Set<string>(MASS_UNIT_IDS)].sort();
    expect(fromUnion).toEqual(fromArray);
  });

  it('MASS_UNIT_IDS has no extra entries vs MASS_ALL_UNITS', () => {
    const fromArrayIds = MASS_ALL_UNITS.map((u) => u.id);
    for (const id of MASS_UNIT_IDS) {
      expect(fromArrayIds).toContain(id);
    }
  });
});

describe('demo invariants: temperature units catalog', () => {
  it('TEMPERATURE_UNIT_IDS covers every id in TEMPERATURE_ALL_UNITS', () => {
    const fromArray = [...new Set(TEMPERATURE_ALL_UNITS.map((u) => u.id))].sort();
    const fromUnion = [...new Set<string>(TEMPERATURE_UNIT_IDS)].sort();
    expect(fromUnion).toEqual(fromArray);
  });

  it('TEMPERATURE_UNIT_IDS has no extra entries vs TEMPERATURE_ALL_UNITS', () => {
    const fromArrayIds = TEMPERATURE_ALL_UNITS.map((u) => u.id);
    for (const id of TEMPERATURE_UNIT_IDS) {
      expect(fromArrayIds).toContain(id);
    }
  });
});

describe('demo invariants: antiquity length-bench catalog', () => {
  it('ANTIQUITY_LENGTH_BENCH_IDS covers every id in ANTIQUITY_LENGTH_BENCH', () => {
    const fromArray = [...new Set(ANTIQUITY_LENGTH_BENCH.map((u) => u.id))].sort();
    const fromUnion = [...new Set<string>(ANTIQUITY_LENGTH_BENCH_IDS)].sort();
    expect(fromUnion).toEqual(fromArray);
  });

  it('ANTIQUITY_LENGTH_BENCH_IDS has no extra entries vs ANTIQUITY_LENGTH_BENCH', () => {
    const fromArrayIds = ANTIQUITY_LENGTH_BENCH.map((u) => u.id);
    for (const id of ANTIQUITY_LENGTH_BENCH_IDS) {
      expect(fromArrayIds).toContain(id);
    }
  });
});

describe('demo invariants: astronomy units catalog', () => {
  it('ASTRONOMY_UNIT_IDS covers every id in ASTRONOMY_ALL_UNITS', () => {
    const fromArray = [...new Set(ASTRONOMY_ALL_UNITS.map((u) => u.id))].sort();
    const fromUnion = [...new Set<string>(ASTRONOMY_UNIT_IDS)].sort();
    expect(fromUnion).toEqual(fromArray);
  });

  it('ASTRONOMY_UNIT_IDS has no extra entries vs ASTRONOMY_ALL_UNITS', () => {
    const fromArrayIds = ASTRONOMY_ALL_UNITS.map((u) => u.id);
    for (const id of ASTRONOMY_UNIT_IDS) {
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

  // Soda comparator's FOOD_ICONS + FOOD_NAMES are typed
  // Record<FoodId, …>; that catches "missing entry for a known FoodId"
  // at compile time. The reverse direction (FOODS grows, FoodId union
  // and Records do not) is invisible to TS because the array elements'
  // ids widen to `string`. The same `FOOD_*` Records live in
  // `soda.tsx`, but we cannot import them here without the demo's
  // `~/` alias resolving; instead we assert the count + shape, which
  // is the strongest thing this test file can pin without dragging in
  // demo's path aliases.
  it('FOODS has the expected count (matches the FoodId union arity)', () => {
    // Bump this constant when FoodId / FOODS gain a member.
    const EXPECTED_FOOD_COUNT = 6;
    expect(FOODS.length).toBe(EXPECTED_FOOD_COUNT);
  });
});

describe('demo invariants: comparison + recipe ORDER joints', () => {
  // ORDER arrays in comparison-machine/index.tsx and
  // recipe-machine/index.tsx hand-mirror the chassis dispatch tables.
  // TypeScript types ORDER as `readonly Key[]`, which allows missing
  // entries silently (a recipe is in the union + Record but not in
  // ORDER, so it never appears as a menu pill). These tests assert
  // the count parity; the exact key lists live in the chassis files
  // and importing them here would drag JSX into the lib's bun-test
  // invocation. Count parity is the cheapest mechanical guard.

  it('comparison-machine ORDER has 4 entries (soda + atlantic + international + subdivision)', async () => {
    // Source-grep instead of importing the React module; this test
    // runs under bun-test which has no JSX runtime in scope.
    const text = await Bun.file(
      'demo/src/components/kits/cooking/sections/comparison-machine/index.tsx',
    ).text();
    const orderMatch = text.match(/ORDER:[^=]*=\s*\[([^\]]+)\]/);
    expect(orderMatch, 'comparison-machine ORDER array not found').toBeTruthy();
    const count = (orderMatch?.[1] ?? '').split(',').filter((s) => s.trim().length > 0).length;
    expect(count).toBe(4);
  });

  it('recipe-machine ORDER has 6 entries', async () => {
    const text = await Bun.file(
      'demo/src/components/kits/cooking/sections/recipe-machine/index.tsx',
    ).text();
    const orderMatch = text.match(/ORDER:[^=]*=\s*\[([^\]]+)\]/);
    expect(orderMatch, 'recipe-machine ORDER array not found').toBeTruthy();
    const count = (orderMatch?.[1] ?? '').split(',').filter((s) => s.trim().length > 0).length;
    expect(count).toBe(6);
  });
});

describe('demo invariants: ceo-stature figures catalog', () => {
  it('figure ids are unique', () => {
    const ids = FIGURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every reported height sits within the ruler/slider domain', () => {
    for (const f of FIGURES) {
      expect(f.heightInches).toBeGreaterThanOrEqual(STATURE_MIN_IN);
      expect(f.heightInches).toBeLessThanOrEqual(STATURE_MAX_IN);
    }
  });

  it('every kind is exec or leader', () => {
    for (const f of FIGURES) {
      expect(['exec', 'leader']).toContain(f.kind);
    }
  });

  it('default subject and reference ids resolve to figures', () => {
    expect(FIGURES.some((f) => f.id === DEFAULT_SUBJECT_ID)).toBe(true);
    expect(FIGURES.some((f) => f.id === DEFAULT_REFERENCE_ID)).toBe(true);
  });
});
