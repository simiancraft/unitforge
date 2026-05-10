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

/** 1 cm = 0.01 m. */
export const centimeter = /*#__PURE__*/ defineUnit({
  name: 'centimeter',
  dimension: LENGTH,
  toBase: (v) => v * 0.01,
  fromBase: (b) => b / 0.01,
});

/** The base unit of AREA. */
export const squareMeter = /*#__PURE__*/ defineUnit({
  name: 'square-meter',
  dimension: AREA,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});
