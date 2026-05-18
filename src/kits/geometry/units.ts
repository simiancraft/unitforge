// Geometry kit unit catalog. The kit's role is composition: it
// re-exports the canonical LENGTH and VOLUME atoms from their
// foundational kits (`kits/length`, `kits/volume`) and defines its own
// AREA and ANGLE units in-place. AREA and ANGLE units only appear in
// geometry today; per the "promote when repeated" heuristic they stay
// here until a second domain kit needs them.
//
// JS identity is preserved across re-exports: `geometry.meter` is the
// same `Unit` object as `length.meter`, so `forge(geometry.meter,
// length.meter)` is identity rather than a converter through base.
//
// Authoring rules (mirror kits/cooking/units.ts):
//   1. Each `defineUnit({...})` is annotated `/*#__PURE__*/`.
//   2. Spec literal contains NO `CallExpression`; `toBase` / `fromBase`
//      are inline closures.

import { defineUnit } from '../../define.js';
import { ANGLE, AREA } from '../../dimensions.js';

// ─── LENGTH (re-exported from kits/length; single source of truth) ───

export {
  angstrom,
  astronomicalUnit,
  centimeter,
  decimeter,
  fathom,
  foot,
  inch,
  kilometer,
  lightYear,
  meter,
  micrometer,
  mil,
  millimeter,
  nanometer,
  nauticalMile,
  parsec,
  statuteMile,
  yard,
} from '../length/units.js';

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
  deciliter,
  liter,
  milliliter,
} from '../volume/units.js';

// ─── AREA (geometry-owned; not yet promoted to foundational) ─────────

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

// ─── ANGLE (geometry-owned; not yet promoted to foundational) ─────────
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
