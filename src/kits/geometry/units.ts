// All units shipped by the geometry kit. Named-export-per-unit; per-export
// tree-shaking under `sideEffects: false` means consumers who import only
// `meter` from the kit barrel pay no bytes for `centimeter` or `squareMeter`.

import { defineUnit } from '../../define.js';
import { AREA, LENGTH } from '../../dimensions.js';
import { linear } from '../../lib/math.js';

/** The base unit of LENGTH. */
export const meter = defineUnit({
  name: 'meter',
  dimension: LENGTH,
  ...linear(1),
  base: true,
});

/** 1 cm = 0.01 m. */
export const centimeter = defineUnit({
  name: 'centimeter',
  dimension: LENGTH,
  ...linear(0.01),
});

/** The base unit of AREA. */
export const squareMeter = defineUnit({
  name: 'square-meter',
  dimension: AREA,
  ...linear(1),
  base: true,
});
