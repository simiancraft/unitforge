// Astronomy kit unit catalog. Composition kit; owns the
// astronomy-specific LENGTH atoms that don't belong in the
// foundational `kits/length` (a working physicist or engineer
// doesn't reach for parsecs, but every working astronomer does).
//
// Three families ship:
//   1. Solar-system scale: astronomicalUnit (IAU 2012 B2 exact),
//      lightSecond / lightMinute / lightHour (one-way light-time
//      anchors, derived from c = 299 792 458 m/s exact).
//   2. Stellar / Galactic scale: lightYear (IAU Style Manual,
//      Julian-year convention), parsec (IAU 2015 B2 exact).
//   3. Extragalactic / Cosmological scale: kiloparsec / megaparsec
//      / gigaparsec (the Hubble constant is conventionally quoted
//      in km/s/Mpc; cosmology surveys are dimensioned in Gpc³).
//
// JSDoc references:
//   - IAU 2012 B2 (au), IAU 2015 B2 (parsec), IAU Style Manual
//     (light-year / Julian year).
//   - BIPM SI Brochure 9th ed. §2 for the exact c value.
//
// Authoring rules per kits/cooking/units.ts §1-3 apply verbatim.

import { defineUnit } from '../../define.js';
import { LENGTH } from '../../dimensions.js';

// Module-private anchors:
//   AU_M       = 1 astronomical unit, exact (IAU 2012 B2).
//   C_MS       = speed of light, exact (BIPM SI Brochure 9th ed.).
//   LY_M       = 1 Julian-year light-year, exact.
//   PARSEC_M   = (648000 / π) · au, IAU 2015 B2 exact rational form.
const AU_M = 149597870700;
const C_MS = 299792458;
const LY_M = 9460730472580800; // = 365.25 × 86400 × C_MS, exact integer
const PARSEC_M = (648000 / Math.PI) * AU_M;

/**
 * 1 au = 149 597 870 700 m (exact, IAU 2012 Resolution B2). The
 * astronomical unit was redefined from a derived quantity (the
 * orbital radius of a hypothetical massless body) to an exact
 * integer number of meters; this value is canonical and never
 * needs re-derivation.
 */
export const astronomicalUnit = /*#__PURE__*/ defineUnit({
  id: 'astronomical-unit',
  label: 'Astronomical Unit',
  symbol: 'au',
  dimension: LENGTH,
  toBase: (v) => v * AU_M,
  fromBase: (b) => b / AU_M,
});

/**
 * 1 light-second = 299 792 458 m (exact). The distance light
 * travels in one SI second; since the 1983 redefinition of the
 * metre fixed c exactly, this is a defined value. Solar-system
 * telemetry uses light-seconds and light-minutes for one-way
 * communication delays (Mars one-way ≈ 12.5 light-minutes,
 * Voyager 1 ≈ 22 light-hours as of 2026).
 */
export const lightSecond = /*#__PURE__*/ defineUnit({
  id: 'light-second',
  label: 'Light-Second',
  symbol: 'ls',
  dimension: LENGTH,
  toBase: (v) => v * C_MS,
  fromBase: (b) => b / C_MS,
});

/** 1 light-minute = 60 light-seconds = 17 987 547 480 m (exact).
 *  Solar-system telemetry; "1 AU ≈ 8.317 light-minutes" is the
 *  Sun-to-Earth one-way delay benchmark. */
export const lightMinute = /*#__PURE__*/ defineUnit({
  id: 'light-minute',
  label: 'Light-Minute',
  symbol: 'lmin',
  dimension: LENGTH,
  toBase: (v) => v * (C_MS * 60),
  fromBase: (b) => b / (C_MS * 60),
});

/** 1 light-hour = 60 light-minutes = 1 079 252 848 800 m (exact).
 *  Outer-solar-system scale (Voyager 1 at ~22 light-hours; New
 *  Horizons at ~8 light-hours from Pluto's orbit). */
export const lightHour = /*#__PURE__*/ defineUnit({
  id: 'light-hour',
  label: 'Light-Hour',
  symbol: 'lh',
  dimension: LENGTH,
  toBase: (v) => v * (C_MS * 3600),
  fromBase: (b) => b / (C_MS * 3600),
});

/**
 * 1 ly = 9 460 730 472 580 800 m (exact). IAU Style Manual; the
 * Julian year (365.25 days) times c gives an exact integer in
 * meters. Distinct from the Gregorian light-year (~9.461 × 10¹⁵ m,
 * derived from the 365.2425-day Gregorian year) and the
 * tropical-year light-year (~365.24219 days at J2000.0, the more
 * common confusion in published ephemerides; 6-25 ppm gap from
 * the Julian form). The Julian form is the IAU convention and
 * the value shipped here.
 */
export const lightYear = /*#__PURE__*/ defineUnit({
  id: 'light-year',
  label: 'Light-Year',
  symbol: 'ly',
  dimension: LENGTH,
  toBase: (v) => v * LY_M,
  fromBase: (b) => b / LY_M,
});

/**
 * 1 pc = (648000 / π) · au m. IAU 2015 Resolution B2; exact by
 * definition (the 2015 redefinition replaced a small-angle-
 * approximation derivation with an exact integer-coefficient form).
 * 1 pc ≈ 3.0857 × 10¹⁶ m ≈ 3.26156 light-years.
 */
export const parsec = /*#__PURE__*/ defineUnit({
  id: 'parsec',
  label: 'Parsec',
  symbol: 'pc',
  dimension: LENGTH,
  toBase: (v) => v * PARSEC_M,
  fromBase: (b) => b / PARSEC_M,
});

/** 1 kpc = 1000 pc. Galactic-scale distances; the Solar System sits
 *  at ~8.18 kpc from the galactic center. */
export const kiloparsec = /*#__PURE__*/ defineUnit({
  id: 'kiloparsec',
  label: 'Kiloparsec',
  symbol: 'kpc',
  dimension: LENGTH,
  toBase: (v) => v * (PARSEC_M * 1000),
  fromBase: (b) => b / (PARSEC_M * 1000),
});

/** 1 Mpc = 10⁶ pc. Extragalactic-scale distances; the Hubble
 *  constant is conventionally quoted in km/s/Mpc, and extragalactic
 *  redshift distances are denominated in Mpc. (Intra-galactic
 *  distances are in kpc; the Solar System sits at ~8.18 kpc from
 *  the galactic center.) */
export const megaparsec = /*#__PURE__*/ defineUnit({
  id: 'megaparsec',
  label: 'Megaparsec',
  symbol: 'Mpc',
  dimension: LENGTH,
  toBase: (v) => v * (PARSEC_M * 1_000_000),
  fromBase: (b) => b / (PARSEC_M * 1_000_000),
});

/** 1 Gpc = 10⁹ pc. Cosmological-survey scale; the observable
 *  universe radius is ~14.4 Gpc, and large-scale-structure
 *  surveys (SDSS, DESI, Euclid) report volumes in Gpc³. */
export const gigaparsec = /*#__PURE__*/ defineUnit({
  id: 'gigaparsec',
  label: 'Gigaparsec',
  symbol: 'Gpc',
  dimension: LENGTH,
  toBase: (v) => v * (PARSEC_M * 1_000_000_000),
  fromBase: (b) => b / (PARSEC_M * 1_000_000_000),
});
