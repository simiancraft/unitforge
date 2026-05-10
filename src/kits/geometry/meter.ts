import { LENGTH } from '../../dimensions.js';
import { defineUnit, linear } from '../../index.js';

/** The base unit of LENGTH. */
export const meter = defineUnit({
  name: 'meter',
  dimension: LENGTH,
  ...linear(1),
  base: true,
});
