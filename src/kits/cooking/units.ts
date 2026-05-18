// Cooking kit unit catalog. After the foundational-layer refactor
// (#124), the kit's role is composition: it re-exports the canonical
// VOLUME atoms from `kits/volume` and the canonical MASS atoms from
// `kits/mass`, plus its own cooking-tradition packaging units that
// only make sense in a culinary context (`stickOfButter`,
// `butterBlockEu250g`, `dash`, `pinch`).
//
// JS identity is preserved across re-exports: `cooking.milliliter` is
// the same `Unit` object as `volume.milliliter`, so `forge(cooking.mL,
// volume.mL)` is identity rather than a converter through base.
//
// Authoring convention for the kit-owned tradition units below
// (mirrors the foundational kits):
//   1. Each `defineUnit({...})` is `/*#__PURE__*/`-annotated.
//   2. Spec literal contains NO `CallExpression`; `toBase` / `fromBase`
//      are inline closures.
//   3. Module-private constants (`US_FL_OZ_M3`, `US_TSP_M3`) are plain
//      numeric `const`s derived at module init.

/**
 * Cooking-domain unit catalog. The kit ships VOLUME units (re-exported
 * from `kits/volume`), the cooking-tradition tail (stick of butter,
 * EU butter block, dash, pinch — domain-specific packaging and folksy
 * measures that only make sense at a kitchen counter), and (Stage 6+)
 * the cooking-tradition temperature surface (gas marks, "low / medium
 * / high heat" descriptors). Mass and temperature scientific atoms
 * live in their respective foundational kits; this kit re-exports
 * them when relevant for downstream recipe context.
 *
 * **US/UK split:** the headline lesson. A US cup and a UK (imperial)
 * cup differ by ~20%; conflating them in a recipe ruins the dish.
 * They ship as separate units (`cupUs`, `cupUk` from `kits/volume`);
 * call sites pick one explicitly by the variable name.
 *
 * **This is a cooking kit, not a clinical-dosing kit.** US OTC liquid
 * medication labels use a 5 mL teaspoon (USP <17>, ISMP guidance), not
 * the exact 4.929 mL `teaspoonUs` shipped by `kits/volume`. If you are
 * reaching for this kit from a clinically-adjacent project, define
 * your own `clinicalTeaspoon` at exactly 5e-6 m³ via `defineUnit`
 * rather than importing `teaspoonUs`.
 *
 * **Mass and temperature are first-class neighbors now.** Pre-#124
 * this kit shipped volume-only and recommended a "forthcoming mass
 * kit" for baking precision. Both `kits/mass` and `kits/temperature`
 * ship today; this kit re-exports relevant atoms (gram, kilogram, °C,
 * °F) so downstream recipe code can import everything it needs from
 * one place.
 *
 * **Modifier vocabulary** (scant, heaping, rounded, packed, sifted)
 * is out of scope. These are recipe-layer concerns: `scant` ≈ -5%,
 * `heaping` ≈ +10-30%, `packed` doubles brown sugar mass, `sifted`
 * lowers flour mass by ~25-30%. A cookbook-importing app must model
 * them at its own recipe layer; this kit will not.
 */

import { defineUnit } from '../../define.js';
import { TEMPERATURE, VOLUME } from '../../dimensions.js';

// ─── VOLUME (re-exported from kits/volume; single source of truth) ───

export {
  centiliter,
  cubicCentimeter,
  cubicDecimeter,
  cubicFoot,
  cubicInch,
  cubicKilometer,
  cubicMeter,
  cubicMillimeter,
  cubicYard,
  cupJapaneseGeneral,
  cupJapaneseRice,
  cupMetric250,
  cupRussianStakan,
  cupUk,
  cupUs,
  cupUsLegal240,
  deciliter,
  fluidOunceUk,
  fluidOunceUs,
  liter,
  milliliter,
  tablespoonAu,
  tablespoonMetric,
  tablespoonUk,
  tablespoonUs,
  teaspoonMetric,
  teaspoonUk,
  teaspoonUs,
} from '../volume/units.js';

// ─── MASS (re-exported from kits/mass for downstream recipe context) ─

export {
  gram,
  kilogram,
  milligram,
  ounceAvoirdupois,
  pound,
} from '../mass/units.js';

// ─── TEMPERATURE (re-exported from kits/temperature) ─────────────────

export { celsius, fahrenheit, kelvin } from '../temperature/units.js';

// ─── Cooking-tradition packaging units (kit-owned) ───────────────────
// These are folksy / packaging-convention units that only make sense
// in a culinary context. The scientific atoms they derive from live
// in kits/volume; the math here uses module-private numeric constants
// rather than importing them (cheaper at module init).

const US_FL_OZ_M3 = 29.5735295625e-6;
const US_TSP_M3 = US_FL_OZ_M3 / 6;

/** Stick of butter; US-only, 1/2 US cup = 4 US fl oz = 8 US tablespoons
 *  ≈ 118.294 mL volumetric. US butter is sold in 1-lb (453.6 g) packages
 *  cut into 4 sticks per 21 CFR 131.111; the mass equivalent of one
 *  stick is 113.4 g (4 oz mass). The "1 stick = 1/2 cup" volumetric
 *  equivalent is the cookbook-industry convention; actual butter
 *  densifies as it firms, so the wrapped stick's volume is a
 *  paper-and-card artifact. UK and EU butter is sold by mass (250 g
 *  blocks per EU Regulation 1308/2013), not by stick; reach for
 *  `butterBlockEu250g` when porting from EU recipes. */
export const stickOfButter = /*#__PURE__*/ defineUnit({
  id: 'stick-of-butter',
  label: 'Stick of Butter',
  symbol: 'stick',
  dimension: VOLUME,
  toBase: (v) => v * (US_FL_OZ_M3 * 4),
  fromBase: (b) => b / (US_FL_OZ_M3 * 4),
});

/** EU butter block; 250 g per EU Regulation 1308/2013, the standard
 *  block size sold across the UK and EU. Shipped as a VOLUME unit
 *  here (this is the cooking-tradition column); the volumetric
 *  equivalent ≈ 260.85 mL is derived under the same cookbook
 *  convention `stickOfButter` uses: 1 US stick (113.4 g per 21 CFR
 *  131.111) ≡ 1/2 US cup volumetric, so 1 EU block (250 g) ≡
 *  (250 / 113.4) × 1/2 US cup ≈ 2.20 sticks ≈ 1.10 US cups. For mass-
 *  based butter math, use `kits/mass` directly (250 g → kilogram). */
export const butterBlockEu250g = /*#__PURE__*/ defineUnit({
  id: 'butter-block-eu-250g',
  label: 'EU Butter Block (250 g)',
  symbol: 'block (EU)',
  dimension: VOLUME,
  toBase: (v) => v * (US_FL_OZ_M3 * 4 * (250 / 113.4)),
  fromBase: (b) => b / (US_FL_OZ_M3 * 4 * (250 / 113.4)),
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

// ─── Cooking-tradition TEMPERATURE units (Stage 6) ───────────────────
// Folksy descriptor temperature surface. Each unit's value-1 maps to
// a fixed kelvin equivalent (the °F midpoint converted to K).
// `forge(mediumHeat, fahrenheit)(1)` → 350; `forge(fahrenheit,
// mediumHeat)(350)` → 1. Multiplicative scaling (`mediumHeat * 2`)
// is mathematically defined but conceptually nonsensical for a
// descriptor; consumers should call with v = 1.
//
// Values per common US-cookbook stovetop / oven conventions:
//   low ~225 °F, medium-low ~275 °F, medium ~350 °F,
//   medium-high ~425 °F, high ~500 °F.
//
// Module-private constants pre-compute the kelvin equivalents (no
// `CallExpression` in spec literals).

const LOW_HEAT_K = ((225 - 32) * 5) / 9 + 273.15;
const MED_LOW_HEAT_K = ((275 - 32) * 5) / 9 + 273.15;
const MED_HEAT_K = ((350 - 32) * 5) / 9 + 273.15;
const MED_HIGH_HEAT_K = ((425 - 32) * 5) / 9 + 273.15;
const HIGH_HEAT_K = ((500 - 32) * 5) / 9 + 273.15;

/** Low heat; ~225 °F (≈ 380.37 K). Slow simmer, gentle melt. */
export const lowHeat = /*#__PURE__*/ defineUnit({
  id: 'low-heat',
  label: 'Low Heat',
  symbol: 'low',
  dimension: TEMPERATURE,
  toBase: (v) => v * LOW_HEAT_K,
  fromBase: (b) => b / LOW_HEAT_K,
});

/** Medium-low heat; ~275 °F (≈ 408.15 K). */
export const mediumLowHeat = /*#__PURE__*/ defineUnit({
  id: 'medium-low-heat',
  label: 'Medium-Low Heat',
  symbol: 'med-low',
  dimension: TEMPERATURE,
  toBase: (v) => v * MED_LOW_HEAT_K,
  fromBase: (b) => b / MED_LOW_HEAT_K,
});

/** Medium heat; ~350 °F (≈ 449.82 K). Standard baking, regular sautéing. */
export const mediumHeat = /*#__PURE__*/ defineUnit({
  id: 'medium-heat',
  label: 'Medium Heat',
  symbol: 'med',
  dimension: TEMPERATURE,
  toBase: (v) => v * MED_HEAT_K,
  fromBase: (b) => b / MED_HEAT_K,
});

/** Medium-high heat; ~425 °F (≈ 491.48 K). Roasting, browning, hot oven baking. */
export const mediumHighHeat = /*#__PURE__*/ defineUnit({
  id: 'medium-high-heat',
  label: 'Medium-High Heat',
  symbol: 'med-high',
  dimension: TEMPERATURE,
  toBase: (v) => v * MED_HIGH_HEAT_K,
  fromBase: (b) => b / MED_HIGH_HEAT_K,
});

/** High heat; ~500 °F (≈ 533.15 K). Searing, broiling, peak-temp roasting. */
export const highHeat = /*#__PURE__*/ defineUnit({
  id: 'high-heat',
  label: 'High Heat',
  symbol: 'high',
  dimension: TEMPERATURE,
  toBase: (v) => v * HIGH_HEAT_K,
  fromBase: (b) => b / HIGH_HEAT_K,
});
