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
import {
  GLYPH_KEYS,
  GLYPHS,
  glyphFor,
} from '../demo/src/components/kits/inventory/parts/glyph-slots.js';
import {
  COLA_PACKAGINGS,
  LOGS_PER_PLANK,
  ORE_PER_INGOT,
  RETAIL_BAG_G,
  ROAST_LEVELS,
  roastLevelFor,
  SHIELD_BOM,
  SKU_BOM,
  SMELT_LINES,
} from '../demo/src/components/kits/inventory/stock.js';
import {
  INVENTORY_ALL_UNITS,
  INVENTORY_BOUNDS,
  INVENTORY_UNIT_IDS,
  inventoryBoundsFor,
} from '../demo/src/components/kits/inventory/units.js';
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

// ── inventory kit ────────────────────────────────────────────────────
//
// The inventory page hand-mirrors more than the other kits do, because
// its recipes are userland data rather than library exports: glyph keys,
// per-assembly rates, and roast yields are all plain strings and numbers
// that TypeScript widens. The blocks below pin the joints, plus three
// numeric claims the page makes in prose (the binding-line surprise on
// the workbench, and the 170-bags / 160-grams headline in the chassis
// copy). Prose that states a number is a test assertion with worse
// tooling; these give it the better tooling.

describe('demo invariants: inventory units catalog', () => {
  it('INVENTORY_UNIT_IDS covers every id in INVENTORY_ALL_UNITS', () => {
    const fromArray = [...new Set(INVENTORY_ALL_UNITS.map((u) => u.id))].sort();
    const fromUnion = [...new Set<string>(INVENTORY_UNIT_IDS)].sort();
    expect(fromUnion).toEqual(fromArray);
  });

  it('INVENTORY_UNIT_IDS has no extra entries vs INVENTORY_ALL_UNITS', () => {
    const fromArrayIds = INVENTORY_ALL_UNITS.map((u) => u.id);
    for (const id of INVENTORY_UNIT_IDS) {
      expect(fromArrayIds).toContain(id);
    }
  });

  it('every bench unit is a COUNT unit', () => {
    for (const unit of INVENTORY_ALL_UNITS) {
      expect(unit.dimension).toBe('count');
    }
  });
});

describe('demo invariants: inventory bench bounds', () => {
  it('the chassis bench seed resolves against the catalog', () => {
    // InventoryScreen seeds { fromId: 'gross', toId: 'dozen' }. findById
    // throws on a miss, so a stale seed would blank the page at mount.
    const ids = INVENTORY_ALL_UNITS.map((u) => u.id);
    expect(ids).toContain('gross');
    expect(ids).toContain('dozen');
  });

  it('every catalog unit has a bounds entry', () => {
    for (const unit of INVENTORY_ALL_UNITS) {
      expect(INVENTORY_BOUNDS).toHaveProperty(unit.id);
    }
  });

  it('bounds are ordered, whole-stepped, and enclose their init', () => {
    for (const [id, b] of Object.entries(INVENTORY_BOUNDS)) {
      expect(b.min, `${id} min < max`).toBeLessThan(b.max);
      // COUNT is discrete; a slider that can land on 2.5 dozen would be
      // lying about what the dimension means.
      expect(b.step, `${id} step`).toBe(1);
      expect(b.init, `${id} init >= min`).toBeGreaterThanOrEqual(b.min);
      expect(b.init, `${id} init <= max`).toBeLessThanOrEqual(b.max);
    }
  });

  it('inventoryBoundsFor falls back to each on an unknown id', () => {
    expect(inventoryBoundsFor('not-a-unit')).toEqual(INVENTORY_BOUNDS.each);
  });
});

describe('demo invariants: inventory glyph pool', () => {
  it('GLYPHS has an icon for every declared key', () => {
    for (const key of GLYPH_KEYS) {
      expect(GLYPHS).toHaveProperty(key);
    }
  });

  it('every glyph key a recipe references is in the pool', () => {
    // These ids widen to `string` in the recipe data, so the Record's
    // totality does not protect the lookup direction that matters.
    const referenced = [
      ...SMELT_LINES.flatMap((l) => [l.rawGlyph, l.refinedGlyph]),
      ...SHIELD_BOM.map((l) => l.id),
      ...SKU_BOM.map((l) => l.id),
      'shield',
      'can',
      'bean',
    ];
    for (const key of referenced) {
      expect(GLYPH_KEYS as readonly string[]).toContain(key);
    }
  });

  it('glyphFor degrades rather than throwing on an unknown key', () => {
    expect(glyphFor('not-a-glyph')).toBeDefined();
  });
});

describe('demo invariants: inventory recipe constants', () => {
  it('smelt ratios are whole numbers above one', () => {
    // A ratio of 1 would make the section's whole point (the remainder)
    // invisible, and a fractional one would not be a piece count.
    for (const line of SMELT_LINES) {
      expect(Number.isInteger(line.perRefined)).toBe(true);
      expect(line.perRefined).toBeGreaterThan(1);
    }
  });

  it('the two smelt lines differ, so one input strands two remainders', () => {
    expect(ORE_PER_INGOT).not.toBe(LOGS_PER_PLANK);
    const rates = SMELT_LINES.map((l) => l.perRefined);
    expect(new Set(rates).size).toBe(rates.length);
  });

  it('every bill-of-materials line consumes a whole number of pieces', () => {
    for (const line of [...SHIELD_BOM, ...SKU_BOM]) {
      expect(Number.isInteger(line.perAssembly)).toBe(true);
      expect(line.perAssembly).toBeGreaterThanOrEqual(1);
    }
  });

  it('the workbench seed makes the fuller bin the binding one', () => {
    // The section's intro copy states this: at 14 ingots and 11 planks
    // the planks look scarcer and the ingots are what actually stop you.
    // If the BOM rates change, that sentence silently becomes false.
    const ingot = SHIELD_BOM.find((l) => l.id === 'ingot');
    const plank = SHIELD_BOM.find((l) => l.id === 'plank');
    expect(ingot?.perAssembly).toBe(3);
    expect(plank?.perAssembly).toBe(2);
    expect(Math.floor(14 / 3)).toBe(4);
    expect(Math.floor(11 / 2)).toBe(5);
    expect(Math.min(4, 5)).toBe(4); // ingots bind, despite 14 > 11
  });
});

describe('demo invariants: inventory packaging units', () => {
  it('every packaging unit round-trips', () => {
    // The case-pack section's claim is that a userland packaging unit is
    // an ordinary unit. Ordinary units round-trip; this is the same
    // invariant the library fuzzes its own units against.
    for (const unit of COLA_PACKAGINGS) {
      for (const v of [1, 7, 40, 0.5]) {
        expect(unit.fromBase(unit.toBase(v))).toBeCloseTo(v, 12);
      }
    }
  });

  it('packaging factors are whole cans and strictly ascending', () => {
    const factors = COLA_PACKAGINGS.map((u) => u.toBase(1));
    expect(factors).toEqual([12, 24, 480]);
    for (let i = 1; i < factors.length; i++) {
      expect(factors[i]).toBeGreaterThan(factors[i - 1] as number);
    }
  });

  it('every packaging unit is a COUNT unit with a unique id', () => {
    const ids = COLA_PACKAGINGS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const unit of COLA_PACKAGINGS) {
      expect(unit.dimension).toBe('count');
    }
  });
});

describe('demo invariants: roastery yields', () => {
  it('roast levels retain a real fraction and darken monotonically', () => {
    for (const level of ROAST_LEVELS) {
      expect(level.retained).toBeGreaterThan(0);
      expect(level.retained).toBeLessThanOrEqual(1);
    }
    for (let i = 1; i < ROAST_LEVELS.length; i++) {
      // A darker roast always loses more; the section's menu depends on
      // the order matching the labels.
      expect(ROAST_LEVELS[i]?.retained).toBeLessThan(ROAST_LEVELS[i - 1]?.retained as number);
    }
  });

  it('roastLevelFor falls back to the middle level on an unknown id', () => {
    expect(roastLevelFor('medium').id).toBe('medium');
    expect(roastLevelFor('not-a-roast')).toBe(ROAST_LEVELS[1] as (typeof ROAST_LEVELS)[number]);
  });

  it('one 69 kg sack at a medium roast yields 170 bags and strands 160 g', () => {
    // The chassis header states these two numbers. They are what the
    // page's fourth section computes through forge; reproduced here in
    // bare arithmetic so a change to RETAIL_BAG_G or to the medium
    // retained fraction fails a test rather than quietly making the
    // header copy wrong.
    const medium = roastLevelFor('medium');
    expect(medium.retained).toBe(0.84);
    expect(RETAIL_BAG_G).toBe(340);
    const roastedG = 69 * medium.retained * 1000;
    const bags = Math.floor(roastedG / RETAIL_BAG_G);
    expect(bags).toBe(170);
    expect(roastedG - bags * RETAIL_BAG_G).toBeCloseTo(160, 6);
  });
});
