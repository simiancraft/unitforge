// MASS units. Foundational kit; domain kits (cooking, future pharmacy,
// future home-construction, future fitness) re-export from here rather
// than redeclaring.
//
// Authoring rules (mirror kits/cooking/units.ts):
//   1. Each `defineUnit({...})` is annotated `/*#__PURE__*/`.
//   2. Spec literal contains NO `CallExpression`; `toBase` and `fromBase`
//      are inline arrow closures, not `...linear(scale)` spreads.
//   3. Module-private constants (`LB_KG`) are plain numeric `const`s
//      derived at module init; non-call, non-side-effecting.
//
// SI base for mass is the kilogram. All `toBase` outputs are in kg.
//
// Conversion factors per NIST SP 811:
//   - 1 lb (avoirdupois) = 0.45359237 kg exactly (International Yard and
//     Pound Agreement of 1959).
//   - 1 oz (avoirdupois) = 1 lb / 16.
//   - 1 short ton (US) = 2000 lb; 1 long ton (UK) = 2240 lb; 1 stone =
//     14 lb. Each derives from the lb factor for canonical exactness.
//
// Regional disambiguation for Chinese catty:
//   - 1 jin PRC = 500 g exactly (GB/T 17710-1999, the modern PRC
//     standard).
//   - 1 jin HK / Taiwan / Singapore (historical Imperial Chinese
//     catty) = 600 g exactly. Conflating the two ruins a recipe or a
//     wholesale order; ship them as separate units, never aliased.

import { defineUnit } from '../../define.js';
import { MASS } from '../../dimensions.js';

const LB_KG = 0.45359237; // 1 lb (avoirdupois) in kg, NIST exact.

/** Kilogram, SI base unit of mass. */
export const kilogram = /*#__PURE__*/ defineUnit({
  id: 'kilogram',
  label: 'Kilogram',
  symbol: 'kg',
  dimension: MASS,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** Gram; 1 g = 1e-3 kg. The cross-domain workhorse (cooking, pharmacy,
 *  nutrition, jewelry, lab assays). */
export const gram = /*#__PURE__*/ defineUnit({
  id: 'gram',
  label: 'Gram',
  symbol: 'g',
  dimension: MASS,
  toBase: (v) => v * 1e-3,
  fromBase: (b) => b / 1e-3,
});

/** Milligram; 1 mg = 1e-6 kg. Pharmacy dosing, spice weights, nutrition
 *  labeling at small-quantity scales. */
export const milligram = /*#__PURE__*/ defineUnit({
  id: 'milligram',
  label: 'Milligram',
  symbol: 'mg',
  dimension: MASS,
  toBase: (v) => v * 1e-6,
  fromBase: (b) => b / 1e-6,
});

/** Microgram; 1 µg = 1e-9 kg. Vitamin / mineral nutrition labels,
 *  pharmaceutical trace dosing.
 *
 *  Clinical safety: ISMP's *List of Error-Prone Abbreviations* prescribes
 *  `mcg` as the clinical surface form because `µg` degrades to `ug` in
 *  low-ASCII rendering, and `ug` is then misread as `mg`, producing
 *  1000x overdoses. The symbol shipped here is the SI standard `µg`
 *  (U+00B5 MICRO SIGN); a future `kits/pharmacy` will REDECLARE this
 *  unit with `symbol: 'mcg'` for the clinical dosing path, intentionally
 *  breaking the "domain kits re-export rather than redeclare" rule for
 *  this single unit. Do not display `µg` in any clinical UI. */
export const microgram = /*#__PURE__*/ defineUnit({
  id: 'microgram',
  label: 'Microgram',
  symbol: 'µg',
  dimension: MASS,
  toBase: (v) => v * 1e-9,
  fromBase: (b) => b / 1e-9,
});

/** Tonne (metric ton); 1 t = 1000 kg exactly. SI prefix-on-base
 *  combination is non-standard in the abstract, but the tonne is the
 *  conventional metric large-mass unit and ships under this name across
 *  every metric-system kit. */
export const tonne = /*#__PURE__*/ defineUnit({
  id: 'tonne',
  label: 'Tonne',
  symbol: 't',
  dimension: MASS,
  toBase: (v) => v * 1000,
  fromBase: (b) => b / 1000,
});

/** Ounce (avoirdupois); 1 oz = 1 lb / 16 = 0.028349523125 kg. US
 *  customary; distinct from the apothecaries' ounce (480 grains, ~31.1
 *  g) which is not shipped here (future kits/apothecary territory). */
export const ounceAvoirdupois = /*#__PURE__*/ defineUnit({
  id: 'ounce-avoirdupois',
  label: 'Ounce (Avoirdupois)',
  symbol: 'oz',
  dimension: MASS,
  toBase: (v) => v * (LB_KG / 16),
  fromBase: (b) => b / (LB_KG / 16),
});

/** Pound (avoirdupois); 1 lb = 0.45359237 kg exactly per the
 *  International Yard and Pound Agreement of 1959 (NIST SP 811). */
export const pound = /*#__PURE__*/ defineUnit({
  id: 'pound',
  label: 'Pound',
  symbol: 'lb',
  dimension: MASS,
  toBase: (v) => v * LB_KG,
  fromBase: (b) => b / LB_KG,
});

/** Stone; 1 st = 14 lb = 6.35029318 kg. UK bodyweight unit; survives
 *  in UK cookery (joint of meat) and in clinical bodyweight reporting
 *  in some Commonwealth contexts. */
export const stone = /*#__PURE__*/ defineUnit({
  id: 'stone',
  label: 'Stone',
  symbol: 'st',
  dimension: MASS,
  toBase: (v) => v * (LB_KG * 14),
  fromBase: (b) => b / (LB_KG * 14),
});

/** Short ton (US ton); 1 short ton = 2000 lb = 907.18474 kg. The
 *  default ton in US shipping, freight, and warehouse contexts. */
export const shortTon = /*#__PURE__*/ defineUnit({
  id: 'short-ton',
  label: 'Short Ton (US)',
  symbol: 'ton (US)',
  dimension: MASS,
  toBase: (v) => v * (LB_KG * 2000),
  fromBase: (b) => b / (LB_KG * 2000),
});

/** Long ton (UK ton); 1 long ton = 2240 lb = 1016.0469088 kg. Used in
 *  UK freight and shipping; the 12% gap vs short ton bites if you
 *  conflate them on an invoice. */
export const longTon = /*#__PURE__*/ defineUnit({
  id: 'long-ton',
  label: 'Long Ton (UK)',
  symbol: 'ton (UK)',
  dimension: MASS,
  toBase: (v) => v * (LB_KG * 2240),
  fromBase: (b) => b / (LB_KG * 2240),
});

/** Jin (PRC mainland); 1 jin = 500 g exactly per GB/T 17710-1999. The
 *  modern PRC standard catty. */
export const jinPrc = /*#__PURE__*/ defineUnit({
  id: 'jin-prc',
  label: 'Jin (PRC, 500 g)',
  symbol: '斤 (PRC)',
  dimension: MASS,
  toBase: (v) => v * 0.5,
  fromBase: (b) => b / 0.5,
});

/** Jin / catty (HK, Taiwan, Singapore); 1 jin = 600 g exactly. The
 *  historical Imperial Chinese catty preserved in HK / Taiwan /
 *  Singapore markets. 20% larger than the PRC jin; conflating them on
 *  a wholesale produce order costs real money. */
export const jinHk = /*#__PURE__*/ defineUnit({
  id: 'jin-hk',
  label: 'Jin / Catty (HK, Taiwan, Singapore; 600 g)',
  symbol: '斤 (HK)',
  dimension: MASS,
  toBase: (v) => v * 0.6,
  fromBase: (b) => b / 0.6,
});
