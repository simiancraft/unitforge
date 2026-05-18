// TEMPERATURE units. Foundational kit; first kit in the library with
// AFFINE conversions (Celsius and Fahrenheit have non-zero offsets vs
// kelvin). `defineUnit`'s `toBase` / `fromBase` closures accept affine
// math without special-casing the library; the math just lives in the
// closure instead of a multiplicative factor.
//
// Values vs deltas (v1 posture): every unit here represents an
// absolute temperature value, not a temperature difference. A delta
// converts linearly across these scales (a delta of 10 °F is +5.56 °C,
// not the -12.22 °C that the value 10 °F would convert to). This kit
// does NOT ship a TEMPERATURE_DIFFERENCE dimension or `delta_*` units
// in v1; deltas are a consumer concern. See issue #30 for the design
// discussion.
//
// Domain-specific temperature surfaces (cooking-tradition gas marks,
// folksy "high heat" / "medium heat" descriptors, sous-vide setpoint
// presets) ship in their respective DOMAIN kits and re-export the
// scientific atoms from here. The line: scientific scale-to-scale
// conversions belong here; descriptor-to-value mappings belong in the
// domain.
//
// Citations:
//   - ITS-90 (International Temperature Scale of 1990, NIST) for the
//     °C → K offset (273.15 K).
//   - NIST SP 811 for °F ↔ °C exact factors.
//   - BIPM SI Brochure 9th ed. Table 2 for the kelvin definition.
//
// Authoring rules per kits/cooking/units.ts §1-3 apply verbatim.

import { defineUnit } from '../../define.js';
import { TEMPERATURE } from '../../dimensions.js';

/** Kelvin, SI base unit of thermodynamic temperature. 0 K is absolute
 *  zero by definition; no negative values are physical. */
export const kelvin = /*#__PURE__*/ defineUnit({
  id: 'kelvin',
  label: 'Kelvin',
  symbol: 'K',
  dimension: TEMPERATURE,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** Celsius; affine offset from kelvin. 0 °C = 273.15 K (ITS-90); water
 *  freezes at 0 °C / 273.15 K at standard pressure, boils at 100 °C /
 *  373.15 K. Negative values are physical (down to absolute zero =
 *  -273.15 °C). */
export const celsius = /*#__PURE__*/ defineUnit({
  id: 'celsius',
  label: 'Celsius',
  symbol: '°C',
  dimension: TEMPERATURE,
  toBase: (v) => v + 273.15,
  fromBase: (b) => b - 273.15,
});

/** Fahrenheit; affine offset and scaled-by-5/9 from kelvin. 32 °F =
 *  0 °C = 273.15 K (water freezing). 212 °F = 100 °C (water boiling).
 *  Absolute zero = -459.67 °F. The canonical sanity-check value: -40
 *  is the same in °F and °C (the scales cross there). */
export const fahrenheit = /*#__PURE__*/ defineUnit({
  id: 'fahrenheit',
  label: 'Fahrenheit',
  symbol: '°F',
  dimension: TEMPERATURE,
  toBase: (v) => ((v - 32) * 5) / 9 + 273.15,
  fromBase: (b) => ((b - 273.15) * 9) / 5 + 32,
});

/** Rankine; purely linear from kelvin (1 °R = 5/9 K, no offset).
 *  Absolute zero = 0 °R, same as 0 K. Water freezes at 491.67 °R,
 *  boils at 671.67 °R. Used in US engineering thermodynamics where
 *  Fahrenheit's offset is inconvenient but Fahrenheit-style scale
 *  spacing is wanted. */
export const rankine = /*#__PURE__*/ defineUnit({
  id: 'rankine',
  label: 'Rankine',
  symbol: '°R',
  dimension: TEMPERATURE,
  toBase: (v) => (v * 5) / 9,
  fromBase: (b) => (b * 9) / 5,
});
