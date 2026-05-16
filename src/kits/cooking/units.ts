// All units shipped by the cooking kit. Named-export-per-unit; per-export
// tree-shaking under `sideEffects: false` works because:
//   1. Each `defineUnit({...})` is annotated `/*#__PURE__*/`, which tells
//      bundlers (esbuild, rollup, webpack) the call is side-effect-free.
//   2. The spec object literal contains NO function calls; `toBase` and
//      `fromBase` are inline arrow closures, not `...linear(scale)` spreads.
//      A CallExpression inside the literal (even when PURE-marked itself)
//      defeats per-export tree-shaking because the bundler treats the whole
//      RHS expression as needed once the variable is referenced.
//   3. Module-private constants (`US_FL_OZ_M3`, `UK_FL_OZ_M3`, `US_TSP_M3`)
//      are plain numeric `const`s derived at module init; they participate
//      in tree-shaking by being non-call, non-side-effecting, and they let
//      the per-unit derivations read closer to NIST without duplicating
//      the same long literal eleven times.
//
// Authoring convention for kit units: inline closures here. The `linear`
// helper exported from the root barrel is for ad-hoc userland use, not for
// kit unit definitions; using it here would re-introduce the spread and
// regress per-unit tree-shake.

/**
 * Cooking-domain volume units. The dimensions here (`VOLUME`) are physics;
 * the *units* are culturally specific. The point of this kit is to confirm
 * that `defineUnit` alone is enough to model multi-system unit families
 * without a special "system" abstraction in the core library: a US cup and
 * a UK cup are both the `VOLUME` dimension, just different conversion
 * factors, and `forge(cupUs, cupUk)` works the same way `forge(meter,
 * foot)` does.
 *
 * **US/UK split:** the headline case. A US cup and a UK (imperial) cup
 * differ by ~20%; conflating them in a recipe ruins the dish. They ship
 * as separate units (`cupUs`, `cupUk`); call sites pick one explicitly
 * by the variable name.
 *
 * **Conversion factors:** exact NIST values where possible.
 *
 * - US fluid ounce = 29.5735295625 mL (exact, by definition: 1 US gallon =
 *   3.785411784 L; 1 fl oz = 1/128 gal).
 * - UK (imperial) fluid ounce = 28.4130625 mL (exact, by definition: 1
 *   imperial gallon = 4.54609 L per the UK Weights and Measures Act 1985;
 *   1 fl oz = 1/160 gal).
 * - US: 1 cup = 8 fl oz, 1 tablespoon = 1/2 fl oz, 1 teaspoon = 1/3 tbsp.
 * - UK: 1 cup = 10 fl oz, 1 tablespoon = 5/8 fl oz, 1 teaspoon = 1/8 fl oz.
 * - 1 stick of butter (US) = 1/2 US cup = 4 US fl oz.
 * - dash = 1/8 US teaspoon; pinch = 1/16 US teaspoon. Tradition; not legal
 *   measures; the values above are the most common modern bar/kitchen
 *   conventions.
 *
 * **Common-cookbook rounding** is intentionally NOT used here: many
 * cookbooks treat 1 tbsp ≈ 15 mL and 1 cup ≈ 240 mL. The exact NIST
 * factors above give 14.787 mL and 236.588 mL respectively. The kit
 * ships the exact values; downstream call sites can apply their own
 * rounding via `forge`'s `precision:` option.
 *
 * **This is a cooking kit, not a clinical-dosing kit.** US OTC liquid
 * medication labels use a 5 mL teaspoon (USP <17>, ISMP guidance), not
 * the exact 4.929 mL `teaspoonUs` defined here; the 1.4% delta is
 * dosing-irrelevant for most adults but matters for mcg/kg pediatric and
 * veterinary calculations. If you are reaching for this kit from a
 * clinically-adjacent project, define your own `clinicalTeaspoon` at
 * exactly 5e-6 m³ via `defineUnit` rather than importing `teaspoonUs`.
 */

import { defineUnit } from '../../define.js';
import { VOLUME } from '../../dimensions.js';

const US_FL_OZ_M3 = 29.5735295625e-6;
const UK_FL_OZ_M3 = 28.4130625e-6;
const US_TSP_M3 = US_FL_OZ_M3 / 6; // 1 US fl oz = 6 US tsp.

/** 1 mL = 1e-6 m³. Same canonical SI value as the geometry kit's
 *  `milliliter`; redefined here so the cooking kit is self-contained. */
export const milliliter = /*#__PURE__*/ defineUnit({
  id: 'milliliter',
  label: 'Milliliter',
  symbol: 'mL',
  dimension: VOLUME,
  toBase: (v) => v * 1e-6,
  fromBase: (b) => b / 1e-6,
});

/** US customary fluid ounce; 1/128 US gallon. */
export const fluidOunceUs = /*#__PURE__*/ defineUnit({
  id: 'fluid-ounce-us',
  label: 'US Fluid Ounce',
  symbol: 'fl oz (US)',
  dimension: VOLUME,
  toBase: (v) => v * US_FL_OZ_M3,
  fromBase: (b) => b / US_FL_OZ_M3,
});

/** Imperial (UK) fluid ounce; 1/160 imperial gallon. */
export const fluidOunceUk = /*#__PURE__*/ defineUnit({
  id: 'fluid-ounce-uk',
  label: 'UK Fluid Ounce',
  symbol: 'fl oz (UK)',
  dimension: VOLUME,
  toBase: (v) => v * UK_FL_OZ_M3,
  fromBase: (b) => b / UK_FL_OZ_M3,
});

/** US teaspoon; 1/6 US fluid ounce ≈ 4.929 mL. */
export const teaspoonUs = /*#__PURE__*/ defineUnit({
  id: 'teaspoon-us',
  label: 'US Teaspoon',
  symbol: 'tsp (US)',
  dimension: VOLUME,
  toBase: (v) => v * US_TSP_M3,
  fromBase: (b) => b / US_TSP_M3,
});

/** UK teaspoon; 1/8 UK fluid ounce ≈ 3.55 mL.
 *  Common cookbook rounding uses 5 mL even; ship exact, round at call. */
export const teaspoonUk = /*#__PURE__*/ defineUnit({
  id: 'teaspoon-uk',
  label: 'UK Teaspoon',
  symbol: 'tsp (UK)',
  dimension: VOLUME,
  toBase: (v) => v * (UK_FL_OZ_M3 / 8),
  fromBase: (b) => b / (UK_FL_OZ_M3 / 8),
});

/** US tablespoon; 1/2 US fluid ounce = 3 US teaspoons ≈ 14.787 mL. */
export const tablespoonUs = /*#__PURE__*/ defineUnit({
  id: 'tablespoon-us',
  label: 'US Tablespoon',
  symbol: 'tbsp (US)',
  dimension: VOLUME,
  toBase: (v) => v * (US_FL_OZ_M3 / 2),
  fromBase: (b) => b / (US_FL_OZ_M3 / 2),
});

/** UK tablespoon; 5/8 UK fluid ounce ≈ 17.758 mL.
 *  Note: Australian tablespoon is 20 mL (different from both); not
 *  shipped here, define your own kit if you cook southern-hemisphere. */
export const tablespoonUk = /*#__PURE__*/ defineUnit({
  id: 'tablespoon-uk',
  label: 'UK Tablespoon',
  symbol: 'tbsp (UK)',
  dimension: VOLUME,
  toBase: (v) => v * ((UK_FL_OZ_M3 * 5) / 8),
  fromBase: (b) => b / ((UK_FL_OZ_M3 * 5) / 8),
});

/** US cup; 8 US fluid ounces = 236.588 mL. */
export const cupUs = /*#__PURE__*/ defineUnit({
  id: 'cup-us',
  label: 'US Cup',
  symbol: 'cup (US)',
  dimension: VOLUME,
  toBase: (v) => v * (US_FL_OZ_M3 * 8),
  fromBase: (b) => b / (US_FL_OZ_M3 * 8),
});

/** UK cup; 10 imperial fluid ounces = 284.131 mL. ~20% larger than the
 *  US cup; mixing the two ruins the dish, which is why this kit ships
 *  them as distinct units rather than aliasing. */
export const cupUk = /*#__PURE__*/ defineUnit({
  id: 'cup-uk',
  label: 'UK Cup',
  symbol: 'cup (UK)',
  dimension: VOLUME,
  toBase: (v) => v * (UK_FL_OZ_M3 * 10),
  fromBase: (b) => b / (UK_FL_OZ_M3 * 10),
});

/** Stick of butter; US-only, 1/2 US cup = 4 US fl oz = 8 US tablespoons
 *  ≈ 118.294 mL. UK butter is sold by mass (250 g blocks), not by stick. */
export const stickOfButter = /*#__PURE__*/ defineUnit({
  id: 'stick-of-butter',
  label: 'Stick of Butter',
  symbol: 'stick',
  dimension: VOLUME,
  toBase: (v) => v * (US_FL_OZ_M3 * 4),
  fromBase: (b) => b / (US_FL_OZ_M3 * 4),
});

/** Dash; 1/8 US teaspoon ≈ 0.616 mL. Bar/kitchen tradition; not a legal
 *  measure. Some sources put it at 1/6 tsp; this kit picks the common
 *  modern convention of 1/8.
 *
 *  Do not use for medication dosing. Spoon-, dropper-, and pinch-based
 *  dispensing has a documented patient-harm history (ISMP). */
export const dash = /*#__PURE__*/ defineUnit({
  id: 'dash',
  label: 'Dash',
  symbol: 'dash',
  dimension: VOLUME,
  toBase: (v) => v * (US_TSP_M3 / 8),
  fromBase: (b) => b / (US_TSP_M3 / 8),
});

/** Pinch; 1/16 US teaspoon ≈ 0.308 mL = half a dash. Same caveat as
 *  dash: tradition, not legal. Two pinches equal one dash by this
 *  convention.
 *
 *  Do not use for medication dosing. */
export const pinch = /*#__PURE__*/ defineUnit({
  id: 'pinch',
  label: 'Pinch',
  symbol: 'pinch',
  dimension: VOLUME,
  toBase: (v) => v * (US_TSP_M3 / 16),
  fromBase: (b) => b / (US_TSP_M3 / 16),
});
