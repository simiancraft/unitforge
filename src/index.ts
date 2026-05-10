/** unitforge public API barrel. */

export { defineConversion, defineUnit } from './define.js';
export { DEFAULT_MEMO_CAP, forge, MEMO_CAP_MAX } from './forge.js';
export { linear } from './lib/math.js';
export { ValidationError, type ValidationFailure } from './lib/validation.js';

export type {
  Conversion,
  Dimension,
  ForgeConfig,
  Unit,
  ValidatorMap,
} from './types.js';

export const VERSION = '0.0.0';
