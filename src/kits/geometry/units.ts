// All units shipped by the geometry kit. Named-export-per-unit; per-export
// tree-shaking under `sideEffects: false` works because:
//   1. Each `defineUnit({...})` is annotated `/*#__PURE__*/`, which tells
//      bundlers (esbuild, rollup, webpack) the call is side-effect-free.
//   2. The spec object literal contains NO function calls; `toBase` and
//      `fromBase` are inline arrow closures, not `...linear(scale)` spreads.
//      A CallExpression inside the literal (even when PURE-marked itself)
//      defeats per-export tree-shaking because the bundler treats the whole
//      RHS expression as needed once the variable is referenced.
//
// Authoring convention for kit units: inline closures here. The `linear`
// helper exported from the root barrel is for ad-hoc userland use, not for
// kit unit definitions; using it here would re-introduce the spread and
// regress per-unit tree-shake.

import { defineUnit } from '../../define.js';
import { ANGLE, AREA, LENGTH, VOLUME } from '../../dimensions.js';

/** The base unit of LENGTH. */
export const meter = /*#__PURE__*/ defineUnit({
  id: 'meter',
  label: 'Meter',
  symbol: 'm',
  dimension: LENGTH,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** 1 mm = 0.001 m. */
export const millimeter = /*#__PURE__*/ defineUnit({
  id: 'millimeter',
  label: 'Millimeter',
  symbol: 'mm',
  dimension: LENGTH,
  toBase: (v) => v * 0.001,
  fromBase: (b) => b / 0.001,
});

/** 1 cm = 0.01 m. */
export const centimeter = /*#__PURE__*/ defineUnit({
  id: 'centimeter',
  label: 'Centimeter',
  symbol: 'cm',
  dimension: LENGTH,
  toBase: (v) => v * 0.01,
  fromBase: (b) => b / 0.01,
});

/** 1 km = 1000 m. */
export const kilometer = /*#__PURE__*/ defineUnit({
  id: 'kilometer',
  label: 'Kilometer',
  symbol: 'km',
  dimension: LENGTH,
  toBase: (v) => v * 1000,
  fromBase: (b) => b / 1000,
});

/** 1 in = 0.0254 m (international yard, 1959; exact). */
export const inch = /*#__PURE__*/ defineUnit({
  id: 'inch',
  label: 'Inch',
  symbol: 'in',
  dimension: LENGTH,
  toBase: (v) => v * 0.0254,
  fromBase: (b) => b / 0.0254,
});

/** 1 ft = 0.3048 m (= 12 in × 0.0254; exact). */
export const foot = /*#__PURE__*/ defineUnit({
  id: 'foot',
  label: 'Foot',
  symbol: 'ft',
  dimension: LENGTH,
  toBase: (v) => v * 0.3048,
  fromBase: (b) => b / 0.3048,
});

/** 1 yd = 0.9144 m (= 3 ft = 36 in; exact). */
export const yard = /*#__PURE__*/ defineUnit({
  id: 'yard',
  label: 'Yard',
  symbol: 'yd',
  dimension: LENGTH,
  toBase: (v) => v * 0.9144,
  fromBase: (b) => b / 0.9144,
});

/** 1 mi = 1609.344 m (= 5280 ft = 1760 yd; exact). */
export const mile = /*#__PURE__*/ defineUnit({
  id: 'mile',
  label: 'Mile',
  symbol: 'mi',
  dimension: LENGTH,
  toBase: (v) => v * 1609.344,
  fromBase: (b) => b / 1609.344,
});

/** 1 dm = 0.1 m (exact). BIPM SI Brochure 9th ed. §3.1. */
export const decimeter = /*#__PURE__*/ defineUnit({
  id: 'decimeter',
  label: 'Decimeter',
  symbol: 'dm',
  dimension: LENGTH,
  toBase: (v) => v * 0.1,
  fromBase: (b) => b / 0.1,
});

/** 1 µm = 1e-6 m (exact). BIPM SI Brochure 9th ed. §3.1. */
export const micrometer = /*#__PURE__*/ defineUnit({
  id: 'micrometer',
  label: 'Micrometer',
  symbol: 'µm',
  dimension: LENGTH,
  toBase: (v) => v * 1e-6,
  fromBase: (b) => b / 1e-6,
});

/** 1 nm = 1e-9 m (exact). BIPM SI Brochure 9th ed. §3.1. */
export const nanometer = /*#__PURE__*/ defineUnit({
  id: 'nanometer',
  label: 'Nanometer',
  symbol: 'nm',
  dimension: LENGTH,
  toBase: (v) => v * 1e-9,
  fromBase: (b) => b / 1e-9,
});

/** 1 Å = 1e-10 m (exact). IUPAC Gold Book; non-SI, accepted for crystallography. */
export const angstrom = /*#__PURE__*/ defineUnit({
  id: 'angstrom',
  label: 'Ångström',
  symbol: 'Å',
  dimension: LENGTH,
  toBase: (v) => v * 1e-10,
  fromBase: (b) => b / 1e-10,
});

/**
 * 1 mil (thou) = 0.0000254 m = 0.001 in (exact). ASME Y14.5.
 *
 * Used in PCB fabrication and machining tolerances. The LENGTH `mil` is
 * distinct from the angular "NATO mil" (a unit of ANGLE not shipped by
 * this kit); the symbol collision is a known hazard in technical writing.
 */
export const mil = /*#__PURE__*/ defineUnit({
  id: 'mil',
  label: 'Mil',
  symbol: 'mil',
  dimension: LENGTH,
  toBase: (v) => v * 0.0000254,
  fromBase: (b) => b / 0.0000254,
});

/**
 * 1 nmi = 1852 m (exact). International Hydrographic Organization, 1929
 * (Monaco); BIPM SI Brochure 9th ed. Table 8.
 *
 * Distinct from the statute mile (`mile` = 1609.344 m). Ship both because
 * marine and aviation specifications are in nautical miles; survey and
 * road distances are in statute miles. Confusing them is a 15.1% error.
 */
export const nauticalMile = /*#__PURE__*/ defineUnit({
  id: 'nautical-mile',
  label: 'Nautical Mile',
  symbol: 'nmi',
  dimension: LENGTH,
  toBase: (v) => v * 1852,
  fromBase: (b) => b / 1852,
});

/** 1 fathom = 1.8288 m = 6 ft (exact). NIST SP 811 App. B. Maritime depths. */
export const fathom = /*#__PURE__*/ defineUnit({
  id: 'fathom',
  label: 'Fathom',
  symbol: 'ftm',
  dimension: LENGTH,
  toBase: (v) => v * 1.8288,
  fromBase: (b) => b / 1.8288,
});

/**
 * 1 au = 149597870700 m (exact, by definition). IAU 2012 Resolution B2.
 *
 * The astronomical unit was redefined by the IAU in 2012 from a derived
 * quantity (the orbital radius of a hypothetical massless body) to an
 * exact integer number of meters; this value is canonical and never
 * needs re-derivation.
 */
export const astronomicalUnit = /*#__PURE__*/ defineUnit({
  id: 'astronomical-unit',
  label: 'Astronomical Unit',
  symbol: 'au',
  dimension: LENGTH,
  toBase: (v) => v * 149597870700,
  fromBase: (b) => b / 149597870700,
});

/**
 * 1 ly = 9 460 730 472 580 800 m (exact). IAU Style Manual; Julian year
 * (365.25 days) times c (299 792 458 m/s).
 *
 * Distinct from the Gregorian light-year (≈ 9.461 × 10¹⁵ m, derived from
 * the 365.2425-day Gregorian year); the Julian form is the astronomical
 * convention and the value shipped here.
 */
export const lightYear = /*#__PURE__*/ defineUnit({
  id: 'light-year',
  label: 'Light-Year',
  symbol: 'ly',
  dimension: LENGTH,
  toBase: (v) => v * 9460730472580800,
  fromBase: (b) => b / 9460730472580800,
});

/**
 * 1 pc = (648000 / π) · au m. IAU 2015 Resolution B2; exact by definition
 * (the 2015 redefinition replaced a small-angle-approximation derivation
 * with an exact integer-coefficient form).
 */
export const parsec = /*#__PURE__*/ defineUnit({
  id: 'parsec',
  label: 'Parsec',
  symbol: 'pc',
  dimension: LENGTH,
  toBase: (v) => v * ((648000 / Math.PI) * 149597870700),
  fromBase: (b) => b / ((648000 / Math.PI) * 149597870700),
});

/** The base unit of AREA. */
export const squareMeter = /*#__PURE__*/ defineUnit({
  id: 'square-meter',
  label: 'Square Meter',
  symbol: 'm²',
  dimension: AREA,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** 1 mm² = 1e-6 m² (= (1e-3)²). */
export const squareMillimeter = /*#__PURE__*/ defineUnit({
  id: 'square-millimeter',
  label: 'Square Millimeter',
  symbol: 'mm²',
  dimension: AREA,
  toBase: (v) => v * 1e-6,
  fromBase: (b) => b / 1e-6,
});

/** 1 cm² = 1e-4 m² (= (1e-2)²). */
export const squareCentimeter = /*#__PURE__*/ defineUnit({
  id: 'square-centimeter',
  label: 'Square Centimeter',
  symbol: 'cm²',
  dimension: AREA,
  toBase: (v) => v * 1e-4,
  fromBase: (b) => b / 1e-4,
});

/** 1 km² = 1e6 m² (= (1e3)²). */
export const squareKilometer = /*#__PURE__*/ defineUnit({
  id: 'square-kilometer',
  label: 'Square Kilometer',
  symbol: 'km²',
  dimension: AREA,
  toBase: (v) => v * 1e6,
  fromBase: (b) => b / 1e6,
});

/** 1 in² = 0.00064516 m² (= 0.0254²; exact). */
export const squareInch = /*#__PURE__*/ defineUnit({
  id: 'square-inch',
  label: 'Square Inch',
  symbol: 'in²',
  dimension: AREA,
  toBase: (v) => v * 0.00064516,
  fromBase: (b) => b / 0.00064516,
});

/** 1 ft² = 0.09290304 m² (= 0.3048² = 144 in²; exact). */
export const squareFoot = /*#__PURE__*/ defineUnit({
  id: 'square-foot',
  label: 'Square Foot',
  symbol: 'ft²',
  dimension: AREA,
  toBase: (v) => v * 0.09290304,
  fromBase: (b) => b / 0.09290304,
});

/** 1 acre = 4046.8564224 m² (= 4840 yd²; exact). */
export const acre = /*#__PURE__*/ defineUnit({
  id: 'acre',
  label: 'Acre',
  symbol: 'ac',
  dimension: AREA,
  toBase: (v) => v * 4046.8564224,
  fromBase: (b) => b / 4046.8564224,
});

/** 1 ha = 10 000 m² (= 100 m × 100 m; exact). */
export const hectare = /*#__PURE__*/ defineUnit({
  id: 'hectare',
  label: 'Hectare',
  symbol: 'ha',
  dimension: AREA,
  toBase: (v) => v * 10_000,
  fromBase: (b) => b / 10_000,
});

/** 1 a = 100 m² (= 10 m × 10 m; exact). BIPM SI Brochure 9th ed. Table 8. */
export const are = /*#__PURE__*/ defineUnit({
  id: 'are',
  label: 'Are',
  symbol: 'a',
  dimension: AREA,
  toBase: (v) => v * 100,
  fromBase: (b) => b / 100,
});

/** 1 yd² = 0.83612736 m² (= 0.9144²; exact via the international yard 1959). */
export const squareYard = /*#__PURE__*/ defineUnit({
  id: 'square-yard',
  label: 'Square Yard',
  symbol: 'yd²',
  dimension: AREA,
  toBase: (v) => v * 0.83612736,
  fromBase: (b) => b / 0.83612736,
});

/**
 * 1 mi² = 2 589 988.110336 m² (= 1609.344²; exact via the statute mile).
 * Land-area measure; do not confuse with the nautical-mile-derived
 * `square sea mile` which this kit does NOT ship.
 */
export const squareMile = /*#__PURE__*/ defineUnit({
  id: 'square-mile',
  label: 'Square Mile',
  symbol: 'mi²',
  dimension: AREA,
  toBase: (v) => v * 2_589_988.110336,
  fromBase: (b) => b / 2_589_988.110336,
});

// ─── VOLUME ──────────────────────────────────────────────────────────────

/** The base unit of VOLUME. */
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

/** 1 L = 0.001 m³ (= 1 dm³ = 1000 cm³; exact). */
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

// ─── ANGLE units ─────────────────────────────────────────────────────────
// Base: radian (SI coherent derived unit per BIPM SI Brochure 9th ed.
// Table 4). Radian-as-base means each conversion's `compute` body can
// call Math.sin / cos / tan / atan2 directly with no per-callee unit
// conversion. Non-SI units below convert through radians at the
// `toBase` / `fromBase` boundary.

/** The base unit of ANGLE. */
export const radian = /*#__PURE__*/ defineUnit({
  id: 'radian',
  label: 'Radian',
  symbol: 'rad',
  dimension: ANGLE,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** 1° = π/180 rad. BIPM SI Brochure 9th ed. Table 8 (non-SI accepted). */
export const degree = /*#__PURE__*/ defineUnit({
  id: 'degree',
  label: 'Degree',
  symbol: '°',
  dimension: ANGLE,
  toBase: (v) => v * (Math.PI / 180),
  fromBase: (b) => b / (Math.PI / 180),
});

/** 1 gon = π/200 rad. ISO 80000-3:2019 §3-5; 1 turn = 400 gon. */
export const gradian = /*#__PURE__*/ defineUnit({
  id: 'gradian',
  label: 'Gradian',
  symbol: 'gon',
  dimension: ANGLE,
  toBase: (v) => v * (Math.PI / 200),
  fromBase: (b) => b / (Math.PI / 200),
});

/** 1′ = 1/60° = π/10800 rad. BIPM SI Brochure 9th ed. Table 8. */
export const arcminute = /*#__PURE__*/ defineUnit({
  id: 'arcminute',
  label: 'Arcminute',
  symbol: "'",
  dimension: ANGLE,
  toBase: (v) => v * (Math.PI / 10800),
  fromBase: (b) => b / (Math.PI / 10800),
});

/** 1″ = 1/3600° = π/648000 rad. BIPM SI Brochure 9th ed. Table 8. */
export const arcsecond = /*#__PURE__*/ defineUnit({
  id: 'arcsecond',
  label: 'Arcsecond',
  symbol: '"',
  dimension: ANGLE,
  toBase: (v) => v * (Math.PI / 648000),
  fromBase: (b) => b / (Math.PI / 648000),
});

/** 1 turn = 2π rad. Standard rotation unit for game engines and CAD APIs. */
export const turn = /*#__PURE__*/ defineUnit({
  id: 'turn',
  label: 'Turn',
  symbol: 'tr',
  dimension: ANGLE,
  toBase: (v) => v * (2 * Math.PI),
  fromBase: (b) => b / (2 * Math.PI),
});
