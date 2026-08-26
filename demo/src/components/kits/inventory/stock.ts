// Recipes, packaging units, and yield curves for the inventory kit's
// four sections. Everything here is *userland*: none of it ships in the
// library, and that is the point the page is making. The library ships
// the two halves that generalize (COUNT units, and the bulk-to-piece
// conversions that floor); a specific ore-to-ingot ratio, a specific
// case pack, and a specific roast loss are facts about your world, so
// you write them where your world lives.
//
// The dividing line this file demonstrates, stated once:
//
//   Units must round-trip. Recipes do not have to.
//
// `caseOfCola` and `greenSack` are units, so they are pure linear
// scalings and `forge` can run them backwards. `roastedMassFromGreen`
// is a recipe, so it is allowed to destroy mass, and no amount of
// forging will get the chaff back.

import { defineConversion, defineUnit } from 'unitforge';
import { COUNT, MASS } from 'unitforge/dimensions';

// ---------------------------------------------------------------------
// Section 1: the smelter. Raw counts into refined counts.
// ---------------------------------------------------------------------

/** Iron ore lumps consumed per ingot. The number every player already
 *  has an intuition for: you never get your remainder back as a
 *  fraction of an ingot, you get it back as ore still sitting in the
 *  hopper. */
export const ORE_PER_INGOT = 3;

/** Logs consumed per plank of lumber. Deliberately not equal to
 *  `ORE_PER_INGOT` so the two tracks in the smelter section leave
 *  different remainders from the same input count. */
export const LOGS_PER_PLANK = 4;

export interface SmeltLine {
  id: 'ingot' | 'plank';
  /** Raw input, plural, as the UI labels it. */
  rawLabel: string;
  /** Refined output, plural. */
  refinedLabel: string;
  /** Raw pieces consumed per refined piece. */
  perRefined: number;
  /** Identifier the glyph table keys on for the raw input. */
  rawGlyph: string;
  /** Identifier the glyph table keys on for the refined output. */
  refinedGlyph: string;
}

export const SMELT_LINES: readonly SmeltLine[] = [
  {
    id: 'ingot',
    rawLabel: 'iron ore',
    refinedLabel: 'ingots',
    perRefined: ORE_PER_INGOT,
    rawGlyph: 'ore',
    refinedGlyph: 'ingot',
  },
  {
    id: 'plank',
    rawLabel: 'logs',
    refinedLabel: 'planks',
    perRefined: LOGS_PER_PLANK,
    rawGlyph: 'log',
    refinedGlyph: 'plank',
  },
];

// ---------------------------------------------------------------------
// Section 2: the workbench. A bill of materials, gated by its scarcest
// line.
// ---------------------------------------------------------------------

export interface BomLine {
  /** Stable key; also the glyph table key. */
  id: string;
  label: string;
  /** Pieces of this component consumed per finished assembly. */
  perAssembly: number;
}

/** The shield recipe. Three ingots for the boss and rim, two planks for
 *  the face. Two lines with different per-assembly rates is the minimum
 *  that makes the gate interesting: whichever line runs out first sets
 *  the yield, and it is not always the one you are short of in absolute
 *  terms. */
export const SHIELD_BOM: readonly BomLine[] = [
  { id: 'ingot', label: 'iron ingots', perAssembly: 3 },
  { id: 'plank', label: 'oak planks', perAssembly: 2 },
];

/** Slider ceilings for the workbench's component stocks, keyed by BOM
 *  line id. Generous enough that either line can be made the binding
 *  constraint by dragging. */
export const WORKBENCH_MAX_STOCK = 60;

// ---------------------------------------------------------------------
// Section 3: the case pack. Packaging as a unit of COUNT.
// ---------------------------------------------------------------------

/** A twelve-can case, declared exactly the way the library declares
 *  `dozen`. It happens to equal a dozen; that is a coincidence of this
 *  SKU, not a fact about cases, which is precisely why it cannot ship
 *  in the kit. Change the 12 and it is a different unit, still valid,
 *  still reversible, still usable in `forge` against `each`. */
export const caseOfCola = /*#__PURE__*/ defineUnit({
  id: 'case-cola-12',
  label: 'Case (12 cans)',
  symbol: 'cs',
  dimension: COUNT,
  toBase: (v) => v * 12,
  fromBase: (b) => b / 12,
});

/** A twenty-four-can club pack of the same product. Two packagings of
 *  one SKU, both units, both convertible to each other through `each`
 *  without either one knowing the other exists. */
export const clubPackOfCola = /*#__PURE__*/ defineUnit({
  id: 'club-pack-cola-24',
  label: 'Club Pack (24 cans)',
  symbol: 'cp',
  dimension: COUNT,
  toBase: (v) => v * 24,
  fromBase: (b) => b / 24,
});

/** A shipping pallet of this SKU: 40 cases of 12. Stacked packaging is
 *  just another factor; the unit does not care that the number came
 *  from a pallet diagram. */
export const palletOfCola = /*#__PURE__*/ defineUnit({
  id: 'pallet-cola-480',
  label: 'Pallet (40 cases)',
  symbol: 'plt',
  dimension: COUNT,
  toBase: (v) => v * 480,
  fromBase: (b) => b / 480,
});

/** The three packaging units together, ascending. The section's picker
 *  iterates this and forges every pairing. */
export const COLA_PACKAGINGS = [caseOfCola, clubPackOfCola, palletOfCola] as const;

// ---------------------------------------------------------------------
// Section 4: the roastery. The same three beats, in a real factory.
// ---------------------------------------------------------------------

/** A jute sack of green coffee: 69 kg, the standard Colombian export
 *  bag. A packaging unit again, this time in MASS rather than COUNT,
 *  and still a pure scaling that forge can run in either direction. */
export const greenSack = /*#__PURE__*/ defineUnit({
  id: 'green-sack-69kg',
  label: 'Green Sack (69 kg)',
  symbol: 'sack',
  dimension: MASS,
  toBase: (v) => v * 69,
  fromBase: (b) => b / 69,
});

export interface RoastLevel {
  id: 'light' | 'medium' | 'dark';
  label: string;
  /** Fraction of green mass that survives the roast. Water leaves
   *  first, then organic matter as the roast goes darker, so the
   *  retained fraction falls as the level rises. */
  retained: number;
  /** What a roaster would call the loss, for the readout. */
  lossLabel: string;
}

/** Roast levels and their yields. Loss is mostly moisture (green coffee
 *  arrives around 11% moisture and leaves the drum near 2%) plus
 *  organic matter burned off as the roast develops, which is why a dark
 *  roast costs more per finished kilo than a light one from the same
 *  sack. The values here are conventional working figures for a drum
 *  roaster, not a measurement of any specific machine. */
export const ROAST_LEVELS: readonly RoastLevel[] = [
  { id: 'light', label: 'Light (city)', retained: 0.87, lossLabel: '13% loss' },
  { id: 'medium', label: 'Medium (full city)', retained: 0.84, lossLabel: '16% loss' },
  { id: 'dark', label: 'Dark (french)', retained: 0.79, lossLabel: '21% loss' },
];

/**
 * The roast itself. A MASS-to-MASS conversion that returns less than it
 * was given, which no `Unit` is allowed to do. This is the whole reason
 * `defineConversion` exists as a separate primitive: a `compute` body is
 * under no obligation to be reversible, so it is the only legal home
 * for a yield loss.
 *
 * `retained` is declared as a COUNT input so the roast level stays a
 * runtime argument rather than a constant baked into three near-identical
 * conversions. COUNT is not really what a 0..1 ratio is; a dedicated
 * RATIO dimension would be, and one is tracked as future work. Until it
 * lands, COUNT is the honest choice available: it is the dimension whose
 * base unit is the bare number 1, and `each` passes the value through
 * untouched.
 */
export const roastedMassFromGreen = /*#__PURE__*/ defineConversion({
  inputs: { greenMass: MASS, retained: COUNT },
  output: MASS,
  validate: {
    greenMass: (v) => (Number.isFinite(v) && v >= 0) || 'greenMass must be a finite value >= 0',
    retained: (v) => (v > 0 && v <= 1) || 'retained must be in (0, 1]',
  },
  compute: ({ greenMass, retained }) => greenMass * retained,
});

/** Retail bag size, in grams. 340 g is 12 oz, the US specialty default;
 *  it is written here in grams because the kit's MASS base is the
 *  kilogram and the roastery scale reads metric. */
export const RETAIL_BAG_G = 340;

/** Non-coffee components consumed per finished retail SKU. The bag
 *  itself is filled by the roast, so it is not on this list; these are
 *  the parts that come out of a different bin and can independently run
 *  out. */
export const SKU_BOM: readonly BomLine[] = [
  { id: 'bag', label: 'kraft bags', perAssembly: 1 },
  { id: 'label', label: 'printed labels', perAssembly: 1 },
  { id: 'valve', label: 'one-way valves', perAssembly: 1 },
];

/** Slider ceiling for the roastery's packaging-component stocks. Sized
 *  so a single 69 kg sack at a light roast can outrun the bin. */
export const ROASTERY_MAX_STOCK = 220;

/** Resolves a roast level id to its level. Parameter is `string`
 *  because callers drive from component state; falls back to the middle
 *  level so a stale value cannot blank the section. Throws only if the
 *  table itself is malformed, which is a build-time mistake rather than
 *  a runtime one. */
export function roastLevelFor(id: string): RoastLevel {
  const found = ROAST_LEVELS.find((l) => l.id === id);
  if (found) return found;
  const fallback = ROAST_LEVELS[1];
  if (!fallback) throw new Error('ROAST_LEVELS must declare at least two levels');
  return fallback;
}
