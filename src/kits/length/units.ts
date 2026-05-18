// LENGTH units. Foundational kit; extracted from kits/geometry to make
// the canonical SI + imperial length atoms a single source of truth.
// Domain kits (geometry, future home-construction, future sewing,
// future astronomy, etc.) re-export from here rather than redeclaring.
//
// Stage 4 will populate this file by lifting from kits/geometry:
//   - SI: meter (base), millimeter, centimeter, kilometer
//   - US customary / imperial: inch, foot, yard, mile (statute),
//     nautical mile, fathom
//   - Astronomical (audit during Stage 5; may stay in geometry): light
//     year, parsec, astronomical unit
//
// Geometry retains: shape derivations (rectangle area, sphere volume,
// etc.), point-coordinate conversions (cartesianFromPolar, midpoint).
// The unit atoms move; the math stays where it composes.

export {};
