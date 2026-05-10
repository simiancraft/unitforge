import { AREA } from '../../dimensions.js';
import { defineUnit, linear } from '../../index.js';

/** The base unit of AREA. */
export const squareMeter = defineUnit({
  name: 'square-meter',
  dimension: AREA,
  ...linear(1),
  base: true,
});
