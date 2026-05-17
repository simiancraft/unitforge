// Kit-local custom dimension for the soda comparator: "sugar mass per
// item". Demonstrates the Settlers-of-Crouton pattern (a user-defined
// dimension declared in app code, not the library) by using it for a
// recognizable culinary question ("how many doughnuts have the same
// sugar as a can of Coke?"). Each `defineUnit` here measures one
// serving (one can, one bottle, one cookie); `toBase` returns grams of
// sugar per serving.
//
// Sugar content per item is sourced from the manufacturer's nutrition
// facts panel (US labels, 2024). Sugar-cube weight is the standard
// 4 g / cube from C&H and Domino retail boxes; Oreo, Krispy Kreme,
// Snickers, and ice-cream values track current US-market labels.

import { defineUnit, type Unit } from 'unitforge';

const SUGAR = 'sugar' as const;
export type SugarUnit = Unit<'sugar', number>;

// ─── Sodas (one unit = one serving as bought) ────────────────────────

export const cokeCan = /*#__PURE__*/ defineUnit({
  id: 'coke-can',
  label: 'Coca-Cola, 12 fl oz can',
  symbol: 'Coke can',
  dimension: SUGAR,
  toBase: (n) => n * 39,
  fromBase: (g) => g / 39,
});

export const cokeBottle = /*#__PURE__*/ defineUnit({
  id: 'coke-bottle',
  label: 'Coca-Cola, 20 fl oz bottle',
  symbol: 'Coke bottle',
  dimension: SUGAR,
  toBase: (n) => n * 65,
  fromBase: (g) => g / 65,
});

export const mtnDewCan = /*#__PURE__*/ defineUnit({
  id: 'mtn-dew-can',
  label: 'Mountain Dew, 12 fl oz can',
  symbol: 'Mtn Dew can',
  dimension: SUGAR,
  toBase: (n) => n * 46,
  fromBase: (g) => g / 46,
});

export const spriteCan = /*#__PURE__*/ defineUnit({
  id: 'sprite-can',
  label: 'Sprite, 12 fl oz can',
  symbol: 'Sprite can',
  dimension: SUGAR,
  toBase: (n) => n * 38,
  fromBase: (g) => g / 38,
});

export const redBullCan = /*#__PURE__*/ defineUnit({
  id: 'red-bull-can',
  label: 'Red Bull, 8.4 fl oz can',
  symbol: 'Red Bull',
  dimension: SUGAR,
  toBase: (n) => n * 27,
  fromBase: (g) => g / 27,
});

// 2-liter bottles. 2 L = 67.628 US fl oz; sugar values from the labels
// (Coke at 110 g per 1000 mL, Mountain Dew at 130 g per 1000 mL → ×2).
export const coke2L = /*#__PURE__*/ defineUnit({
  id: 'coke-2l',
  label: 'Coca-Cola, 2 L bottle',
  symbol: 'Coke 2 L',
  dimension: SUGAR,
  toBase: (n) => n * 220,
  fromBase: (g) => g / 220,
});

export const mtnDew2L = /*#__PURE__*/ defineUnit({
  id: 'mtn-dew-2l',
  label: 'Mountain Dew, 2 L bottle',
  symbol: 'Mtn Dew 2 L',
  dimension: SUGAR,
  toBase: (n) => n * 260,
  fromBase: (g) => g / 260,
});

// ─── Foods (one unit = one item as eaten) ────────────────────────────

export const sugarCube = /*#__PURE__*/ defineUnit({
  id: 'sugar-cube',
  label: 'Sugar cube',
  symbol: 'sugar cube',
  dimension: SUGAR,
  toBase: (n) => n * 4,
  fromBase: (g) => g / 4,
});

export const oreoCookie = /*#__PURE__*/ defineUnit({
  id: 'oreo-cookie',
  label: 'Oreo cookie',
  symbol: 'Oreo',
  dimension: SUGAR,
  toBase: (n) => n * 4.7,
  fromBase: (g) => g / 4.7,
});

export const glazedDonut = /*#__PURE__*/ defineUnit({
  id: 'glazed-donut',
  label: 'Krispy Kreme glazed donut',
  symbol: 'donut',
  dimension: SUGAR,
  toBase: (n) => n * 10,
  fromBase: (g) => g / 10,
});

export const iceCreamScoop = /*#__PURE__*/ defineUnit({
  id: 'ice-cream-scoop',
  label: 'Ice cream, 1/2 cup scoop',
  symbol: 'scoop',
  dimension: SUGAR,
  toBase: (n) => n * 14,
  fromBase: (g) => g / 14,
});

export const cakeSlice = /*#__PURE__*/ defineUnit({
  id: 'cake-slice',
  label: 'Chocolate cake, slice',
  symbol: 'cake slice',
  dimension: SUGAR,
  toBase: (n) => n * 30,
  fromBase: (g) => g / 30,
});

export const snickersBar = /*#__PURE__*/ defineUnit({
  id: 'snickers-bar',
  label: 'Snickers, full size',
  symbol: 'Snickers',
  dimension: SUGAR,
  toBase: (n) => n * 27,
  fromBase: (g) => g / 27,
});

export const SODAS = [
  redBullCan,
  cokeCan,
  mtnDewCan,
  spriteCan,
  cokeBottle,
  coke2L,
  mtnDew2L,
] as const;

/** Literal union of soda ids the kit ships. Hand-declared (parallel to
 *  the SODAS array) because `Unit.id` is `string` in the core library,
 *  so deriving from `(typeof SODAS)[number]['id']` would widen to
 *  `string` and Records keyed on it would silently accept stale keys.
 *  Must stay in sync with SODAS above. */
export type SodaId =
  | 'red-bull-can'
  | 'coke-can'
  | 'mtn-dew-can'
  | 'sprite-can'
  | 'coke-bottle'
  | 'coke-2l'
  | 'mtn-dew-2l';

/** Container volume in US fl oz per soda. Used by the visualizer to
 *  scale the picked container's icon in proportion to its capacity
 *  (Red Bull 8.4 oz reads small, 2 L bottle reads big). Not part of
 *  the forge() call; the sugar dimension carries grams, not volume.
 *  Typed against `SodaId` so adding a soda without an fl-oz entry is
 *  a compile error, not a silent ?? 12 fallback. */
export const SODA_FL_OZ: Record<SodaId, number> = {
  'red-bull-can': 8.4,
  'coke-can': 12,
  'mtn-dew-can': 12,
  'sprite-can': 12,
  'coke-bottle': 20,
  'coke-2l': 67.628,
  'mtn-dew-2l': 67.628,
};

export const FOODS = [
  sugarCube,
  oreoCookie,
  glazedDonut,
  iceCreamScoop,
  cakeSlice,
  snickersBar,
] as const;

/** Literal union of food ids the kit ships. Parallel to FOODS; same
 *  reasoning as SodaId. */
export type FoodId =
  | 'sugar-cube'
  | 'oreo-cookie'
  | 'glazed-donut'
  | 'ice-cream-scoop'
  | 'cake-slice'
  | 'snickers-bar';
