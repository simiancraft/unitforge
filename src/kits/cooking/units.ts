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
 *
 * **This is a volume kit, not a baking kit.** Every unit here is in
 * the `VOLUME` dimension; the kit ships zero mass units. Professional
 * and serious-home baking uses mass (grams) for dry ingredients because
 * a US cup of all-purpose flour ranges from ~120 g (sifted, spooned,
 * leveled) to ~160 g (scoop-and-sweep into the bag) — same cup,
 * different cook, 33% range. King Arthur, Cook's Illustrated, every
 * UK/EU cookbook since ~1990, and Modernist Cuisine all weigh their
 * dry ingredients for this reason. For reproducible baking, pair this
 * kit with a mass-based companion (define your own `gram` /
 * `kilogram` / `ounce` via `defineUnit`, or use a forthcoming
 * `unitforge/kits/mass`). The demo recipes in `demo/src/components/
 * kits/cooking/sections/recipe-machine/recipes/` use volume to
 * exercise the conversion machinery, not to prescribe reproducible
 * bakes.
 *
 * **Modifier vocabulary** (scant, heaping, rounded, packed, sifted)
 * is out of scope for this kit. These are recipe-layer concerns:
 * `scant` ≈ -5%, `heaping` ≈ +10-30%, `packed` doubles brown sugar
 * mass, `sifted` lowers flour mass by ~25-30%. A cookbook-importing
 * app must model them at its own recipe layer; this kit will not.
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

/** 1 L = 1e-3 m³. The home cook's metric workhorse: stockpots, milk
 *  jugs, water bottles. Same canonical SI value as the geometry kit's
 *  `liter`; redefined here so the cooking kit is self-contained. */
export const liter = /*#__PURE__*/ defineUnit({
  id: 'liter',
  label: 'Liter',
  symbol: 'L',
  dimension: VOLUME,
  toBase: (v) => v * 1e-3,
  fromBase: (b) => b / 1e-3,
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
 *  Common cookbook rounding uses 5 mL even; ship exact, round at call.
 *  Modern UK cooking has metricated; the imperial teaspoon survives in
 *  pre-1970 British recipes. For "1 tsp" in a modern international
 *  cookbook, prefer `teaspoonMetric` (5 mL exact). */
export const teaspoonUk = /*#__PURE__*/ defineUnit({
  id: 'teaspoon-uk',
  label: 'UK Teaspoon',
  symbol: 'tsp (UK)',
  dimension: VOLUME,
  toBase: (v) => v * (UK_FL_OZ_M3 / 8),
  fromBase: (b) => b / (UK_FL_OZ_M3 / 8),
});

/** Metric teaspoon; 5 mL exactly. The EU/Canada/NZ/Australia/modern-UK
 *  convention and what "1 tsp" means in 90%+ of international cookbooks
 *  published today. The 1.4% gap from `teaspoonUs` (4.929 mL) is
 *  dosing-irrelevant in cooking and reproducibility-neutral in baking.
 *  Reach for this when porting an EU/AU/CA recipe; reach for
 *  `teaspoonUs` when porting a US Customary recipe; reach for the
 *  USP-prescribed 5 mL clinical teaspoon (in a future clinical kit)
 *  for OTC medication dosing. */
export const teaspoonMetric = /*#__PURE__*/ defineUnit({
  id: 'teaspoon-metric',
  label: 'Metric Teaspoon',
  symbol: 'tsp (metric)',
  dimension: VOLUME,
  toBase: (v) => v * 5e-6,
  fromBase: (b) => b / 5e-6,
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

/** UK tablespoon; 5/8 UK fluid ounce ≈ 17.758 mL. Modern UK cooking
 *  has metricated; the imperial tablespoon survives in pre-1970
 *  British recipes. For "1 tbsp" in a modern international cookbook,
 *  prefer `tablespoonMetric` (15 mL exact) for EU/CA/NZ/modern UK, or
 *  `tablespoonAu` (20 mL exact) for Australia. */
export const tablespoonUk = /*#__PURE__*/ defineUnit({
  id: 'tablespoon-uk',
  label: 'UK Tablespoon',
  symbol: 'tbsp (UK)',
  dimension: VOLUME,
  toBase: (v) => v * ((UK_FL_OZ_M3 * 5) / 8),
  fromBase: (b) => b / ((UK_FL_OZ_M3 * 5) / 8),
});

/** Metric tablespoon; 15 mL exactly. The EU/Canada/NZ/modern-UK
 *  convention and what "1 tbsp" means in most international cookbooks
 *  today. The 1.4% gap from `tablespoonUs` (14.787 mL) is cooking-
 *  irrelevant; the 18% gap from `tablespoonUk` (17.758 mL) is recipe-
 *  breaking for leaveners and salt. Reach for this when porting an
 *  EU/CA/NZ recipe. */
export const tablespoonMetric = /*#__PURE__*/ defineUnit({
  id: 'tablespoon-metric',
  label: 'Metric Tablespoon',
  symbol: 'tbsp (metric)',
  dimension: VOLUME,
  toBase: (v) => v * 15e-6,
  fromBase: (b) => b / 15e-6,
});

/** Australian tablespoon; 20 mL exactly per Standards Australia
 *  AS 1349 (4 metric teaspoons of 5 mL each). Australia's tablespoon
 *  is the global outlier: 33% larger than US, 12% larger than UK
 *  imperial. An Australian recipe that calls for "1 tbsp baking soda"
 *  is asking for 33% more leavener than a US recipe with the same
 *  line; conflating them ruins the bake. Ship as a separate unit so
 *  call sites that target Australian cookery pick it explicitly. */
export const tablespoonAu = /*#__PURE__*/ defineUnit({
  id: 'tablespoon-au',
  label: 'Australian Tablespoon',
  symbol: 'tbsp (AU)',
  dimension: VOLUME,
  toBase: (v) => v * 20e-6,
  fromBase: (b) => b / 20e-6,
});

/** US cup (Customary); 8 US fluid ounces = 236.588 mL. The metrologically
 *  exact value per NIST SP 811. Differs by 1.4% from the FDA legal cup
 *  (240 mL exact) used on US nutrition-facts panels; reach for
 *  `cupUsLegal240` if your call site needs to match a US nutrition
 *  label rather than the historical Customary value. */
export const cupUs = /*#__PURE__*/ defineUnit({
  id: 'cup-us',
  label: 'US Cup',
  symbol: 'cup (US)',
  dimension: VOLUME,
  toBase: (v) => v * (US_FL_OZ_M3 * 8),
  fromBase: (b) => b / (US_FL_OZ_M3 * 8),
});

/** US legal cup; 240 mL exactly per FDA 21 CFR 101.9(b)(8) (nutrition
 *  labeling rule). What appears on the back of every US-published cereal
 *  box and what most US cookbooks since ~1990 implicitly mean by "1 cup."
 *  The 1.4% gap from `cupUs` (236.588 mL Customary) matters at baking
 *  scale (3 cups flour: 720 mL legal vs 709.8 mL Customary, ≈ 10 mL of
 *  real flour) and matters for any consumer rendering a US nutrition
 *  label from this kit's values. */
export const cupUsLegal240 = /*#__PURE__*/ defineUnit({
  id: 'cup-us-legal-240',
  label: 'US Legal Cup (FDA, 240 mL)',
  symbol: 'cup (US legal)',
  dimension: VOLUME,
  toBase: (v) => v * 240e-6,
  fromBase: (b) => b / 240e-6,
});

/** UK cup; 10 imperial fluid ounces = 284.131 mL. ~20% larger than the
 *  US cup; mixing the two ruins the dish, which is why this kit ships
 *  them as distinct units rather than aliasing. Note: modern UK
 *  cookbooks (since ~1970) have largely metricated to grams + mL; the
 *  imperial cup survives mainly in pre-metric British recipe
 *  collections and in Commonwealth cooking that didn't metricate. For
 *  a "1 cup" reference in a modern UK, EU, AU, NZ, or CA cookbook,
 *  prefer `cupMetric250` (250 mL). */
export const cupUk = /*#__PURE__*/ defineUnit({
  id: 'cup-uk',
  label: 'UK Cup',
  symbol: 'cup (UK)',
  dimension: VOLUME,
  toBase: (v) => v * (UK_FL_OZ_M3 * 10),
  fromBase: (b) => b / (UK_FL_OZ_M3 * 10),
});

/** Metric cup; 250 mL exactly. The Australian, New Zealand, Canadian,
 *  South African, and most-of-EU convention. International cookbooks
 *  targeting an EU/AU audience use this; the 4.2% difference from
 *  `cupUsLegal240` (240 mL) compounds in baking. Reach for this when
 *  porting a recipe from outside the US. */
export const cupMetric250 = /*#__PURE__*/ defineUnit({
  id: 'cup-metric-250',
  label: 'Metric Cup (250 mL)',
  symbol: 'cup (metric)',
  dimension: VOLUME,
  toBase: (v) => v * 250e-6,
  fromBase: (b) => b / 250e-6,
});

/** Japanese rice cup; 1 gō (合) = 180.39 mL exactly. The shō (升) was
 *  fixed at 1.8039 L by Toyotomi Hideyoshi's 1582-98 land survey; 1 gō
 *  is 1/10 shō, the unit a rice cooker measures when you pour "1 rice
 *  cup" of dry rice. Every Japanese rice cooker ships with a 180 mL
 *  measuring cup marked "1 合" / "1 cup." Use this for rice-cooker
 *  recipes; for general Japanese cooking measurements, prefer
 *  `cupJapaneseGeneral` (200 mL). */
export const cupJapaneseRice = /*#__PURE__*/ defineUnit({
  id: 'cup-japanese-rice',
  label: 'Japanese Rice Cup (合, gō)',
  symbol: 'gō',
  dimension: VOLUME,
  toBase: (v) => v * 180.39e-6,
  fromBase: (b) => b / 180.39e-6,
});

/** Japanese general-cooking cup; 200 mL exactly per Japanese Industrial
 *  Standards JIS S 2052 (kitchen measuring tools). The everyday cup
 *  for non-rice ingredients in Japanese cookbooks. Rice cookery uses
 *  the 180.39 mL `cupJapaneseRice` instead. */
export const cupJapaneseGeneral = /*#__PURE__*/ defineUnit({
  id: 'cup-japanese-general',
  label: 'Japanese Cooking Cup (200 mL)',
  symbol: 'cup (JP)',
  dimension: VOLUME,
  toBase: (v) => v * 200e-6,
  fromBase: (b) => b / 200e-6,
});

/** Russian stakan (стакан); 250 mL modern standard. The Soviet-era
 *  graneny stakan (faceted glass) is the iconic Russian measuring
 *  vessel: 250 mL when filled to the rim, 200 mL when filled to the
 *  lower facet (the "small stakan" of Tsarist-era teacup tradition,
 *  still found in babushka recipe books). Modern Russian cookbooks
 *  use the 250 mL convention; this ships that value. For pre-Soviet
 *  recipes that use the 200 mL "small stakan," substitute
 *  `cupJapaneseGeneral` (numerically identical) or define your own. */
export const cupRussianStakan = /*#__PURE__*/ defineUnit({
  id: 'cup-russian-stakan',
  label: 'Russian Stakan (250 mL)',
  symbol: 'stakan',
  dimension: VOLUME,
  toBase: (v) => v * 250e-6,
  fromBase: (b) => b / 250e-6,
});

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
 *  (this kit is volume-only); the volumetric equivalent ≈ 260.85 mL
 *  is derived under the same cookbook convention `stickOfButter`
 *  uses: 1 US stick (113.4 g per 21 CFR 131.111) ≡ 1/2 US cup
 *  volumetric, so 1 EU block (250 g) ≡ (250 / 113.4) × 1/2 US cup
 *  ≈ 2.20 sticks ≈ 1.10 US cups. The convention ignores butter
 *  density (which varies with temperature anyway). For fully-honest
 *  mass-based butter math, await the forthcoming mass kit. */
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
