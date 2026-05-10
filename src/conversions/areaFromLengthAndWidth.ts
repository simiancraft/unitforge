import { AREA, LENGTH } from '../dimensions.js';
import { defineConversion } from '../index.js';

/**
 * Cross-dimensional conversion: area = length × width.
 *
 * Compute is written in BASE units (meter × meter = m²); the library decorates
 * it so the call site may use any compatible LENGTH units (centimeter, etc.).
 */
export const areaFromLengthAndWidth = defineConversion({
  inputs: { length: LENGTH, width: LENGTH },
  output: AREA,
  validate: {
    length: (v) => v >= 0 || 'length must be >= 0',
    width: (v) => v >= 0 || 'width must be >= 0',
  },
  compute: ({ length, width }) => length * width,
});
