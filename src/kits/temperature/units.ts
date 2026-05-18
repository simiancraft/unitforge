// TEMPERATURE units. Foundational kit; first kit in the library with
// AFFINE conversions (Celsius and Fahrenheit have non-zero offsets vs
// kelvin). `defineUnit`'s `toBase` / `fromBase` closures accept affine
// math without special-casing — the math just lives in the closure
// instead of a multiplicative factor.
//
// Values vs deltas: every unit shipped here represents an absolute
// temperature value, NOT a temperature difference. Deltas convert
// linearly across these scales (a delta of 10 °F is +5.56 °C, not
// -12.22 °C). The kit does not ship a `TEMPERATURE_DIFFERENCE`
// dimension or `delta_*` units in v1; deltas are a recipe-layer
// concern that consumers handle at their call site. See issue #30 for
// the design discussion.
//
// Authoring rules per kits/cooking/units.ts §1-3 apply verbatim
// (`/*#__PURE__*/` on every `defineUnit`; inline closures, no
// `CallExpression` in the spec literal).

// Stage 2 will populate this file with: kelvin (base), celsius,
// fahrenheit, rankine. Citations: ITS-90 (International Temperature
// Scale of 1990) for °C → K offset; NIST SP 811 for °F ↔ °C exact
// factors; BIPM SI Brochure 9th ed. for the kelvin definition.

export {};
