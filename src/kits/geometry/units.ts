// All units shipped by the geometry kit. Named-export-per-unit; per-export
// tree-shaking under `sideEffects: false` works because:
//   1. Each `defineUnit({...})` is annotated `/*#__PURE__*/`, which tells
//      bundlers (esbuild, rollup, webpack) the call is side-effect-free.
//   2. The spec object literal contains NO function calls — `toBase` and
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
import { AREA, LENGTH } from '../../dimensions.js';

/** The base unit of LENGTH. */
export const meter = /*#__PURE__*/ defineUnit({
  name: 'meter',
  dimension: LENGTH,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** 1 mm = 0.001 m. */
export const millimeter = /*#__PURE__*/ defineUnit({
  name: 'millimeter',
  dimension: LENGTH,
  toBase: (v) => v * 0.001,
  fromBase: (b) => b / 0.001,
});

/** 1 cm = 0.01 m. */
export const centimeter = /*#__PURE__*/ defineUnit({
  name: 'centimeter',
  dimension: LENGTH,
  toBase: (v) => v * 0.01,
  fromBase: (b) => b / 0.01,
});

/** 1 km = 1000 m. */
export const kilometer = /*#__PURE__*/ defineUnit({
  name: 'kilometer',
  dimension: LENGTH,
  toBase: (v) => v * 1000,
  fromBase: (b) => b / 1000,
});

/** 1 in = 0.0254 m (international yard, 1959; exact). */
export const inch = /*#__PURE__*/ defineUnit({
  name: 'inch',
  dimension: LENGTH,
  toBase: (v) => v * 0.0254,
  fromBase: (b) => b / 0.0254,
});

/** 1 ft = 0.3048 m (= 12 in × 0.0254; exact). */
export const foot = /*#__PURE__*/ defineUnit({
  name: 'foot',
  dimension: LENGTH,
  toBase: (v) => v * 0.3048,
  fromBase: (b) => b / 0.3048,
});

/** 1 yd = 0.9144 m (= 3 ft = 36 in; exact). */
export const yard = /*#__PURE__*/ defineUnit({
  name: 'yard',
  dimension: LENGTH,
  toBase: (v) => v * 0.9144,
  fromBase: (b) => b / 0.9144,
});

/** 1 mi = 1609.344 m (= 5280 ft = 1760 yd; exact). */
export const mile = /*#__PURE__*/ defineUnit({
  name: 'mile',
  dimension: LENGTH,
  toBase: (v) => v * 1609.344,
  fromBase: (b) => b / 1609.344,
});

/** The base unit of AREA. */
export const squareMeter = /*#__PURE__*/ defineUnit({
  name: 'square-meter',
  dimension: AREA,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** 1 mm² = 1e-6 m² (= (1e-3)²). */
export const squareMillimeter = /*#__PURE__*/ defineUnit({
  name: 'square-millimeter',
  dimension: AREA,
  toBase: (v) => v * 1e-6,
  fromBase: (b) => b / 1e-6,
});

/** 1 cm² = 1e-4 m² (= (1e-2)²). */
export const squareCentimeter = /*#__PURE__*/ defineUnit({
  name: 'square-centimeter',
  dimension: AREA,
  toBase: (v) => v * 1e-4,
  fromBase: (b) => b / 1e-4,
});

/** 1 km² = 1e6 m² (= (1e3)²). */
export const squareKilometer = /*#__PURE__*/ defineUnit({
  name: 'square-kilometer',
  dimension: AREA,
  toBase: (v) => v * 1e6,
  fromBase: (b) => b / 1e6,
});

/** 1 in² = 0.00064516 m² (= 0.0254²; exact). */
export const squareInch = /*#__PURE__*/ defineUnit({
  name: 'square-inch',
  dimension: AREA,
  toBase: (v) => v * 0.00064516,
  fromBase: (b) => b / 0.00064516,
});

/** 1 ft² = 0.09290304 m² (= 0.3048² = 144 in²; exact). */
export const squareFoot = /*#__PURE__*/ defineUnit({
  name: 'square-foot',
  dimension: AREA,
  toBase: (v) => v * 0.09290304,
  fromBase: (b) => b / 0.09290304,
});

/** 1 acre = 4046.8564224 m² (= 4840 yd²; exact). */
export const acre = /*#__PURE__*/ defineUnit({
  name: 'acre',
  dimension: AREA,
  toBase: (v) => v * 4046.8564224,
  fromBase: (b) => b / 4046.8564224,
});

/** 1 ha = 10 000 m² (= 100 m × 100 m; exact). */
export const hectare = /*#__PURE__*/ defineUnit({
  name: 'hectare',
  dimension: AREA,
  toBase: (v) => v * 10_000,
  fromBase: (b) => b / 10_000,
});
