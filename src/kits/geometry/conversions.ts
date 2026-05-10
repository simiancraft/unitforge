// Cross-dimensional conversions native to the geometry kit. Co-located with
// the kit's units so `import * from 'unitforge/kits/geometry'` gives the
// consumer everything geometry-shaped in one place.

import { defineConversion } from '../../define.js';
import { AREA, LENGTH } from '../../dimensions.js';

/**
 * Cross-dimensional: area = length × width.
 *
 * Compute is written in BASE units (meter × meter = m²); the library
 * decorates it so the call site may use any compatible LENGTH units
 * (centimeter, etc.).
 */
export const areaFromLengthAndWidth = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH, width: LENGTH },
  output: AREA,
  validate: {
    length: (v) => v >= 0 || 'length must be >= 0',
    width: (v) => v >= 0 || 'width must be >= 0',
  },
  compute: ({ length, width }) => length * width,
});
