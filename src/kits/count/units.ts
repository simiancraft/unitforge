// COUNT units. Foundational kit; domain kits (inventory, geometry, future
// game-state) re-export from here rather than redeclaring.
//
// Authoring rules (mirror kits/mass/units.ts):
//   1. Each `defineUnit({...})` is annotated `/*#__PURE__*/`.
//   2. Spec literal contains NO `CallExpression`; `toBase` and `fromBase`
//      are inline arrow closures, not `...linear(scale)` spreads.
//
// The base for count is `each`: one discrete thing. Every `toBase` output
// is a number of pieces.
//
// What this kit deliberately does NOT do:
//
//   - It does not enforce whole numbers. `dozen.fromBase(7)` is 0.5833…,
//     and that is correct: half a dozen eggs is a coherent quantity, and
//     the unit boundary must stay reversible for `forge` to compose it in
//     both directions. Turning a fractional count into whole pieces is a
//     lossy decision, so it lives in a conversion's `compute`; see
//     `kits/inventory`.
//   - It does not ship `case`, `pallet`, or `container`. Those are real
//     count units, but their factors are SKU data, not conventions: a
//     case is 24 for one product and 12 for the next. Shipping a number
//     for them would be shipping a guess about the caller's warehouse.
//     Define them in your own code; four lines each, and the factor lives
//     where the fact lives. See the barrel docblock for the pattern.
//
// Factors are trade conventions rather than metrology, and all six are
// exact integers by definition, so there is no rounding to document.

import { defineUnit } from '../../define.js';
import { COUNT } from '../../dimensions.js';

/** Each; one discrete thing. Base unit of COUNT. */
export const each = /*#__PURE__*/ defineUnit({
  id: 'each',
  label: 'Each',
  symbol: 'ea',
  dimension: COUNT,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** Pair; 1 pr = 2 each. Shoes, gloves, socks, cufflinks. Distinct from
 *  a "brace" (also 2, but a hunting term) and from a "couple" (informal,
 *  not a trade unit); neither is shipped. */
export const pair = /*#__PURE__*/ defineUnit({
  id: 'pair',
  label: 'Pair',
  symbol: 'pr',
  dimension: COUNT,
  toBase: (v) => v * 2,
  fromBase: (b) => b / 2,
});

/** Dozen; 1 dz = 12 each. The workhorse grouping across eggs, bakery,
 *  fasteners, and wholesale produce. */
export const dozen = /*#__PURE__*/ defineUnit({
  id: 'dozen',
  label: 'Dozen',
  symbol: 'dz',
  dimension: COUNT,
  toBase: (v) => v * 12,
  fromBase: (b) => b / 12,
});

/** Gross; 1 gr = 12 dozen = 144 each. Stationery, fasteners, buttons,
 *  and small-hardware wholesale. */
export const gross = /*#__PURE__*/ defineUnit({
  id: 'gross',
  label: 'Gross',
  symbol: 'gr',
  dimension: COUNT,
  toBase: (v) => v * 144,
  fromBase: (b) => b / 144,
});

/** Great gross; 1 ggr = 12 gross = 1728 each. Survives in bulk
 *  stationery and small-hardware ordering. Note the shape of the
 *  mistake this unit invites: a great gross is 12x a gross, not 12x a
 *  dozen, so an order keyed to the wrong one is off by a factor of 12. */
export const greatGross = /*#__PURE__*/ defineUnit({
  id: 'great-gross',
  label: 'Great Gross',
  symbol: 'ggr',
  dimension: COUNT,
  toBase: (v) => v * 1728,
  fromBase: (b) => b / 1728,
});

/** Ream; 1 rm = 500 sheets. The modern printing / office-paper ream.
 *  The historical "short ream" of 480 sheets (20 quires of 24) is a
 *  different quantity and is NOT aliased here; it belongs in
 *  kits/antiquity alongside the other pre-standardization measures. */
export const ream = /*#__PURE__*/ defineUnit({
  id: 'ream',
  label: 'Ream',
  symbol: 'rm',
  dimension: COUNT,
  toBase: (v) => v * 500,
  fromBase: (b) => b / 500,
});
