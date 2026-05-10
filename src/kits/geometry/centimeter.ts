import { LENGTH } from '../../dimensions.js';
import { defineUnit, linear } from '../../index.js';

/** 1 cm = 0.01 m. */
export const centimeter = defineUnit({
  name: 'centimeter',
  dimension: LENGTH,
  ...linear(0.01),
});
