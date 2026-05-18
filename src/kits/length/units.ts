// LENGTH units. Foundational kit; single source of truth for the
// canonical SI + customary + astronomical length set. Domain kits
// (geometry, future home-construction, future astronomy, future
// sewing) re-export atoms from here rather than redeclaring.
//
// Authoring rules per kits/cooking/units.ts §1-3 apply verbatim
// (`/*#__PURE__*/` on every defineUnit; inline closures, no
// `CallExpression` in the spec literal).
//
// SI base is the meter. All `toBase` outputs are in m.

import { defineUnit } from '../../define.js';
import { LENGTH } from '../../dimensions.js';

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

/**
 * 1 in = 0.0254 m (exact via the 1959 international yard and pound
 * agreement). The kit does not ship a US survey inch; the US survey
 * foot / inch series was deprecated by NIST on 2023-01-01
 * (Federal Register Vol. 84, No. 184).
 */
export const inch = /*#__PURE__*/ defineUnit({
  id: 'inch',
  label: 'Inch',
  symbol: 'in',
  dimension: LENGTH,
  toBase: (v) => v * 0.0254,
  fromBase: (b) => b / 0.0254,
});

/**
 * 1 ft = 0.3048 m (= 12 × 0.0254; exact via the 1959 international yard
 * and pound agreement). The US survey foot (0.30480 060 96... m) is not
 * shipped here; NIST deprecated it as of 2023-01-01 per Federal Register
 * Vol. 84, No. 184.
 */
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

/**
 * 1 mi = 1609.344 m (= 5280 ft = 1760 yd; exact via the international yard
 * and pound agreement of 1959).
 *
 * The international (statute) mile. Disambiguated from `nauticalMile`
 * (1852 m exactly per the IHO 1929 convention); confusing them is a
 * 15.1% error. The kit does NOT ship the US survey mile (deprecated by
 * NIST on 2023-01-01 per Federal Register Vol. 84, No. 184).
 */
export const statuteMile = /*#__PURE__*/ defineUnit({
  id: 'statute-mile',
  label: 'Statute Mile',
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

/**
 * 1 fathom = 6 ft = 1.8288 m (exact via the 1959 international yard
 * and pound agreement; NIST SP 811 App. B Table B.8). Maritime depths.
 */
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
