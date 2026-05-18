// VOLUME units. Foundational kit; extracted from kits/geometry and
// kits/cooking to consolidate the canonical SI + customary + regional
// volume set into one source of truth. Domain kits (cooking, geometry,
// future home-construction, future chemistry, etc.) re-export atoms
// from here rather than redeclaring.
//
// Stage 4 will populate this file by lifting from existing sources:
//   - milliliter, liter (currently duplicated in cooking AND geometry)
//   - US customary: fluidOunceUs, teaspoonUs, tablespoonUs, cupUs,
//     cupUsLegal240, stickOfButter? (DEBATE: tradition or scientific?)
//   - UK imperial: fluidOunceUk, teaspoonUk, tablespoonUk, cupUk
//   - Metric: tablespoonMetric (15 mL exact), teaspoonMetric (5 mL),
//     cupMetric250 (250 mL)
//   - Australian: tablespoonAu (20 mL, AS 1349)
//   - International cup variants: cupJapaneseRice (gō 180.39 mL),
//     cupJapaneseGeneral (200 mL, JIS S 2052), cupRussianStakan (250 mL)
//   - Geometry-side: cubicMeter, cubicCentimeter, cubicFoot, gallon
//     (US + UK), pint (US + UK), quart, etc. (audit during Stage 5)
//
// Cooking-tradition-only units stay in kits/cooking and do NOT migrate
// here: dash, pinch, butterBlockEu250g, stickOfButter (probably; final
// call in Stage 5).

export {};
