// VOLUME units. Foundational kit; single source of truth for the
// canonical SI + US customary + UK imperial + international regional
// volume set. Domain kits (cooking, geometry, future home-construction,
// future chemistry) re-export atoms from here rather than redeclaring.
//
// Authoring rules (mirror kits/cooking/units.ts):
//   1. Each `defineUnit({...})` is `/*#__PURE__*/`-annotated.
//   2. Spec literal contains NO `CallExpression`; `toBase` / `fromBase`
//      are inline closures, not `...linear(scale)` spreads.
//   3. Module-private constants (`US_FL_OZ_M3`, `UK_FL_OZ_M3`,
//      `US_TSP_M3`) are plain numeric `const`s derived at module init.
//
// SI base is the cubic meter. All `toBase` outputs are in m³.
//
// Conversion factors:
//   - 1 US fluid ounce = 29.5735295625 mL exactly (1 US gallon =
//     3.785411784 L by NIST SP 811; 1 fl oz = 1/128 gal).
//   - 1 UK (imperial) fluid ounce = 28.4130625 mL exactly (1 imperial
//     gallon = 4.54609 L per UK Weights and Measures Act 1985; 1 fl
//     oz = 1/160 gal).
//   - 1 in = 0.0254 m exactly; 1 in³ = 0.0254³ m³ = 0.000016387064 m³.
//   - 1 ft = 0.3048 m; 1 ft³ = 0.028316846592 m³; 1 yd³ = 27 ft³.
//   - 1 L = 1 dm³ = 0.001 m³ (1964 CGPM redefinition).
//   - Regional cup variants: see per-unit JSDoc.

import { defineUnit } from '../../define.js';
import { VOLUME } from '../../dimensions.js';

const US_FL_OZ_M3 = 29.5735295625e-6;
const UK_FL_OZ_M3 = 28.4130625e-6;
const US_TSP_M3 = US_FL_OZ_M3 / 6; // 1 US fl oz = 6 US tsp.

// ─── SI base + cubic-prefix units ─────────────────────────────────────

/** Cubic meter; SI base unit of volume. */
export const cubicMeter = /*#__PURE__*/ defineUnit({
  id: 'cubic-meter',
  label: 'Cubic Meter',
  symbol: 'm³',
  dimension: VOLUME,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** 1 cm³ = 1e-6 m³ (= (1e-2)³). */
export const cubicCentimeter = /*#__PURE__*/ defineUnit({
  id: 'cubic-centimeter',
  label: 'Cubic Centimeter',
  symbol: 'cm³',
  dimension: VOLUME,
  toBase: (v) => v * 1e-6,
  fromBase: (b) => b / 1e-6,
});

/** 1 mm³ = 1e-9 m³ (= (1e-3)³; exact). Engineering tolerances. */
export const cubicMillimeter = /*#__PURE__*/ defineUnit({
  id: 'cubic-millimeter',
  label: 'Cubic Millimeter',
  symbol: 'mm³',
  dimension: VOLUME,
  toBase: (v) => v * 1e-9,
  fromBase: (b) => b / 1e-9,
});

/** 1 dm³ = 0.001 m³ (= 1 L exactly per 1964 CGPM redefinition). */
export const cubicDecimeter = /*#__PURE__*/ defineUnit({
  id: 'cubic-decimeter',
  label: 'Cubic Decimeter',
  symbol: 'dm³',
  dimension: VOLUME,
  toBase: (v) => v * 0.001,
  fromBase: (b) => b / 0.001,
});

/** 1 km³ = 1e9 m³ (exact). Hydrology / climatology / atmospheric science. */
export const cubicKilometer = /*#__PURE__*/ defineUnit({
  id: 'cubic-kilometer',
  label: 'Cubic Kilometer',
  symbol: 'km³',
  dimension: VOLUME,
  toBase: (v) => v * 1e9,
  fromBase: (b) => b / 1e9,
});

/** 1 in³ = 0.000016387064 m³ (= 0.0254³; exact). */
export const cubicInch = /*#__PURE__*/ defineUnit({
  id: 'cubic-inch',
  label: 'Cubic Inch',
  symbol: 'in³',
  dimension: VOLUME,
  toBase: (v) => v * 0.000016387064,
  fromBase: (b) => b / 0.000016387064,
});

/** 1 ft³ = 0.028316846592 m³ (= 0.3048³ = 1728 in³; exact). */
export const cubicFoot = /*#__PURE__*/ defineUnit({
  id: 'cubic-foot',
  label: 'Cubic Foot',
  symbol: 'ft³',
  dimension: VOLUME,
  toBase: (v) => v * 0.028316846592,
  fromBase: (b) => b / 0.028316846592,
});

/** 1 yd³ = 0.764554857984 m³ (= 0.9144³ = 27 ft³; exact). Concrete / landscaping. */
export const cubicYard = /*#__PURE__*/ defineUnit({
  id: 'cubic-yard',
  label: 'Cubic Yard',
  symbol: 'yd³',
  dimension: VOLUME,
  toBase: (v) => v * 0.764554857984,
  fromBase: (b) => b / 0.764554857984,
});

// ─── Liter family ─────────────────────────────────────────────────────

/** 1 L = 0.001 m³ (= 1 dm³ = 1000 cm³; exact). The home cook's metric
 *  workhorse: stockpots, milk jugs, water bottles. */
export const liter = /*#__PURE__*/ defineUnit({
  id: 'liter',
  label: 'Liter',
  symbol: 'L',
  dimension: VOLUME,
  toBase: (v) => v * 0.001,
  fromBase: (b) => b / 0.001,
});

/** 1 mL = 1e-6 m³ (= 1 cm³; exact). */
export const milliliter = /*#__PURE__*/ defineUnit({
  id: 'milliliter',
  label: 'Milliliter',
  symbol: 'mL',
  dimension: VOLUME,
  toBase: (v) => v * 1e-6,
  fromBase: (b) => b / 1e-6,
});

/** 1 cL = 1e-5 m³ (= 10 mL; exact). BIPM SI Brochure; European recipes. */
export const centiliter = /*#__PURE__*/ defineUnit({
  id: 'centiliter',
  label: 'Centiliter',
  symbol: 'cL',
  dimension: VOLUME,
  toBase: (v) => v * 1e-5,
  fromBase: (b) => b / 1e-5,
});

/** 1 dL = 1e-4 m³ (= 100 mL; exact). BIPM SI Brochure; nutrition labeling. */
export const deciliter = /*#__PURE__*/ defineUnit({
  id: 'deciliter',
  label: 'Deciliter',
  symbol: 'dL',
  dimension: VOLUME,
  toBase: (v) => v * 1e-4,
  fromBase: (b) => b / 1e-4,
});

// ─── Gallon / quart / pint family (US + UK) ───────────────────────────

/** US gallon (Queen Anne wine gallon basis); 231 in³ = 3.785411784 L
 *  exactly (NIST SP 811). 128 US fluid ounces; the workhorse for
 *  US gasoline, paint, water-rights, and bulk-liquid commerce. */
export const gallonUs = /*#__PURE__*/ defineUnit({
  id: 'gallon-us',
  label: 'US Gallon',
  symbol: 'gal (US)',
  dimension: VOLUME,
  toBase: (v) => v * (US_FL_OZ_M3 * 128),
  fromBase: (b) => b / (US_FL_OZ_M3 * 128),
});

/** UK / imperial gallon; 4.54609 L exactly (UK Weights and Measures
 *  Act 1985). 160 imperial fluid ounces; ~20% larger than the US
 *  gallon. The fuel-economy gap between "mpg US" and "mpg UK" is
 *  the canonical consumer-facing confusion. */
export const gallonUk = /*#__PURE__*/ defineUnit({
  id: 'gallon-uk',
  label: 'UK / Imperial Gallon',
  symbol: 'gal (UK)',
  dimension: VOLUME,
  toBase: (v) => v * (UK_FL_OZ_M3 * 160),
  fromBase: (b) => b / (UK_FL_OZ_M3 * 160),
});

/** US quart; 1/4 US gallon = 32 US fl oz ≈ 946.353 mL. Ice-cream
 *  quart, soup quart, milk quart in older US dairy packaging. */
export const quartUs = /*#__PURE__*/ defineUnit({
  id: 'quart-us',
  label: 'US Quart',
  symbol: 'qt (US)',
  dimension: VOLUME,
  toBase: (v) => v * (US_FL_OZ_M3 * 32),
  fromBase: (b) => b / (US_FL_OZ_M3 * 32),
});

/** UK / imperial quart; 1/4 imperial gallon = 40 imperial fl oz
 *  ≈ 1.1365 L. ~20% larger than US quart; gap is recipe-breaking
 *  and produce-pricing-disrupting at scale. */
export const quartUk = /*#__PURE__*/ defineUnit({
  id: 'quart-uk',
  label: 'UK / Imperial Quart',
  symbol: 'qt (UK)',
  dimension: VOLUME,
  toBase: (v) => v * (UK_FL_OZ_M3 * 40),
  fromBase: (b) => b / (UK_FL_OZ_M3 * 40),
});

/** US pint; 1/8 US gallon = 16 US fl oz ≈ 473.176 mL. Ice-cream
 *  pint, craft-beer pint (in US bars; UK pubs use the UK pint),
 *  blueberry / strawberry produce pint. */
export const pintUs = /*#__PURE__*/ defineUnit({
  id: 'pint-us',
  label: 'US Pint',
  symbol: 'pt (US)',
  dimension: VOLUME,
  toBase: (v) => v * (US_FL_OZ_M3 * 16),
  fromBase: (b) => b / (US_FL_OZ_M3 * 16),
});

/** UK / imperial pint; 1/8 imperial gallon = 20 imperial fl oz
 *  ≈ 568.261 mL. The pub pint, the milk-delivery pint; ~20%
 *  larger than the US pint. */
export const pintUk = /*#__PURE__*/ defineUnit({
  id: 'pint-uk',
  label: 'UK / Imperial Pint',
  symbol: 'pt (UK)',
  dimension: VOLUME,
  toBase: (v) => v * (UK_FL_OZ_M3 * 20),
  fromBase: (b) => b / (UK_FL_OZ_M3 * 20),
});

// ─── Fluid ounce (US + UK) ────────────────────────────────────────────

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

// ─── Teaspoon (US, UK, metric) ────────────────────────────────────────

/** US teaspoon; 1/6 US fluid ounce ≈ 4.929 mL. */
export const teaspoonUs = /*#__PURE__*/ defineUnit({
  id: 'teaspoon-us',
  label: 'US Teaspoon',
  symbol: 'tsp (US)',
  dimension: VOLUME,
  toBase: (v) => v * US_TSP_M3,
  fromBase: (b) => b / US_TSP_M3,
});

/** UK teaspoon; 1/8 UK fluid ounce ≈ 3.55 mL. Modern UK cooking has
 *  metricated; the imperial teaspoon survives in pre-1970 British
 *  recipes. For "1 tsp" in a modern international cookbook, prefer
 *  `teaspoonMetric` (5 mL exact). */
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
 *  today. The 1.4% gap from `teaspoonUs` (4.929 mL) is dosing-
 *  irrelevant in cooking. */
export const teaspoonMetric = /*#__PURE__*/ defineUnit({
  id: 'teaspoon-metric',
  label: 'Metric Teaspoon',
  symbol: 'tsp (metric)',
  dimension: VOLUME,
  toBase: (v) => v * 5e-6,
  fromBase: (b) => b / 5e-6,
});

// ─── Tablespoon (US, UK, metric, Australian) ──────────────────────────

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
 *  has metricated; survives in pre-1970 British recipes. */
export const tablespoonUk = /*#__PURE__*/ defineUnit({
  id: 'tablespoon-uk',
  label: 'UK Tablespoon',
  symbol: 'tbsp (UK)',
  dimension: VOLUME,
  toBase: (v) => v * ((UK_FL_OZ_M3 * 5) / 8),
  fromBase: (b) => b / ((UK_FL_OZ_M3 * 5) / 8),
});

/** Metric tablespoon; 15 mL exactly. EU/Canada/NZ/modern-UK convention. */
export const tablespoonMetric = /*#__PURE__*/ defineUnit({
  id: 'tablespoon-metric',
  label: 'Metric Tablespoon',
  symbol: 'tbsp (metric)',
  dimension: VOLUME,
  toBase: (v) => v * 15e-6,
  fromBase: (b) => b / 15e-6,
});

/** Australian tablespoon; 20 mL exactly per Standards Australia AS 1349
 *  (4 metric teaspoons of 5 mL each). 33% larger than US, 12% larger
 *  than UK imperial; recipe-breaking for leaveners if conflated. */
export const tablespoonAu = /*#__PURE__*/ defineUnit({
  id: 'tablespoon-au',
  label: 'Australian Tablespoon',
  symbol: 'tbsp (AU)',
  dimension: VOLUME,
  toBase: (v) => v * 20e-6,
  fromBase: (b) => b / 20e-6,
});

/** Dessertspoon; 10 mL exactly = 2 metric teaspoons. UK, Australian,
 *  and New Zealand recipes reach for "1 dessertspoon" routinely;
 *  US recipes effectively never. Falls between teaspoon (5 mL) and
 *  tablespoon (15 mL). */
export const dessertspoon = /*#__PURE__*/ defineUnit({
  id: 'dessertspoon',
  label: 'Dessertspoon (10 mL)',
  symbol: 'dsp',
  dimension: VOLUME,
  toBase: (v) => v * 10e-6,
  fromBase: (b) => b / 10e-6,
});

// ─── Cup variants ─────────────────────────────────────────────────────

/** US cup (Customary); 8 US fluid ounces = 236.588 mL. Metrologically
 *  exact per NIST SP 811. Differs by 1.4% from the FDA legal cup
 *  (240 mL exact) used on US nutrition-facts panels. */
export const cupUs = /*#__PURE__*/ defineUnit({
  id: 'cup-us',
  label: 'US Cup',
  symbol: 'cup (US)',
  dimension: VOLUME,
  toBase: (v) => v * (US_FL_OZ_M3 * 8),
  fromBase: (b) => b / (US_FL_OZ_M3 * 8),
});

/** US legal cup; 240 mL exactly per FDA 21 CFR 101.9(b)(8) (nutrition
 *  labeling rule). What appears on US-published cookbooks since ~1990
 *  and on the back of every US cereal box. The 1.4% gap from `cupUs`
 *  (236.588 mL Customary) matters at baking scale and for any
 *  consumer rendering a US nutrition label from this kit's values. */
export const cupUsLegal240 = /*#__PURE__*/ defineUnit({
  id: 'cup-us-legal-240',
  label: 'US Legal Cup (FDA, 240 mL)',
  symbol: 'cup (US legal)',
  dimension: VOLUME,
  toBase: (v) => v * 240e-6,
  fromBase: (b) => b / 240e-6,
});

/** UK cup; 10 imperial fluid ounces = 284.131 mL. ~20% larger than the
 *  US cup; mixing the two ruins the dish. Modern UK cookbooks (since
 *  ~1970) have largely metricated to grams + mL. For "1 cup" in a
 *  modern UK/EU/AU/NZ/CA cookbook, prefer `cupMetric250`. */
export const cupUk = /*#__PURE__*/ defineUnit({
  id: 'cup-uk',
  label: 'UK Cup',
  symbol: 'cup (UK)',
  dimension: VOLUME,
  toBase: (v) => v * (UK_FL_OZ_M3 * 10),
  fromBase: (b) => b / (UK_FL_OZ_M3 * 10),
});

/** Metric cup; 250 mL exactly. AU/NZ/CA/EU convention. Named
 *  traditions resolving to this value: Australian metric cup
 *  (Standards Australia AS 1349), Canadian cup (Metric Commission
 *  Canada 1976), modern UK metric cup, Mexican taza, most modern EU
 *  cookbooks. 4.2% larger than `cupUsLegal240` (240 mL); compounds
 *  in baking. */
export const cupMetric250 = /*#__PURE__*/ defineUnit({
  id: 'cup-metric-250',
  label: 'Metric Cup (250 mL)',
  symbol: 'cup (metric)',
  dimension: VOLUME,
  toBase: (v) => v * 250e-6,
  fromBase: (b) => b / 250e-6,
});

/** Japanese rice cup; 1 gō (合) = 180.39 mL exactly. 1/10 shō; shō
 *  fixed by Japan's Meiji-era Weights and Measures Act 1891 (度量衡法)
 *  at 2401/1331000 m³ exact, giving gō at exactly 2401/13310000 m³ ≈
 *  180.39 mL. The earlier Hideyoshi-era kyō-masu shō (Taikō kenchi,
 *  1582-98) was ~1.74 L; the modern value is Meiji, not Toyotomi.
 *  Every Japanese rice cooker ships with a 180 mL measuring cup
 *  marked "1 合". */
export const cupJapaneseRice = /*#__PURE__*/ defineUnit({
  id: 'cup-japanese-rice',
  label: 'Japanese Rice Cup (合, gō)',
  symbol: 'gō',
  dimension: VOLUME,
  toBase: (v) => v * 180.39e-6,
  fromBase: (b) => b / 180.39e-6,
});

/** Japanese general-cooking cup; 200 mL exactly. The everyday Japanese
 *  cookbook measure for non-rice ingredients, distinct from the 180.39
 *  mL `cupJapaneseRice` (gō). 200 mL is the modern convention across
 *  Japanese culinary publications; the unit is not formally defined by
 *  a JIS standard so far as the kit author can verify. */
export const cupJapaneseGeneral = /*#__PURE__*/ defineUnit({
  id: 'cup-japanese-general',
  label: 'Japanese Cooking Cup (200 mL)',
  symbol: 'cup (JP)',
  dimension: VOLUME,
  toBase: (v) => v * 200e-6,
  fromBase: (b) => b / 200e-6,
});

/** Russian stakan (стакан); 250 mL modern standard, formalized by GOST
 *  7176-77 for the граненый стакан (graneny / faceted glass, Vera
 *  Mukhina design, Gus-Khrustalny 1943). 250 mL when filled to the
 *  rim. Modern Russian cookbooks use this value. */
export const cupRussianStakan = /*#__PURE__*/ defineUnit({
  id: 'cup-russian-stakan',
  label: 'Russian Stakan (250 mL)',
  symbol: 'stakan',
  dimension: VOLUME,
  toBase: (v) => v * 250e-6,
  fromBase: (b) => b / 250e-6,
});

/** Russian small stakan (тонкий стакан, "thin stakan"); 200 mL,
 *  measured to the lower facet of the graneny glass ("до риски" /
 *  "to the line"). Soviet-era and modern Russian baking convention
 *  (Pokhlyobkin, Molokhovets-tradition cookbooks). 20% smaller than
 *  the rim-measure `cupRussianStakan` (250 mL); the gap is
 *  recipe-breaking and parallels the US-vs-UK cup pattern. */
export const cupRussianStakanSmall = /*#__PURE__*/ defineUnit({
  id: 'cup-russian-stakan-small',
  label: 'Russian Small Stakan (200 mL, lower-facet measure)',
  symbol: 'stakan (small)',
  dimension: VOLUME,
  toBase: (v) => v * 200e-6,
  fromBase: (b) => b / 200e-6,
});
