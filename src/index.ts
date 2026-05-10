/** unitforge public API barrel. */

export { defineConversion, defineUnit, linear } from './define.js';
export { ValidationError, type ValidationFailure } from './errors.js';
export { forge } from './forge.js';
export { DEFAULT_MEMO_CAP, MEMO_CAP_MAX } from './lib/constants.js';

export type {
  Conversion,
  Dimension,
  ForgeConfig,
  Unit,
  ValidatorMap,
} from './types.js';

export const VERSION = '0.0.0';
