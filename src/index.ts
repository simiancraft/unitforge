/** unitforge public API barrel. */

export { defineConversion } from './defineConversion.js';
export { defineUnit } from './defineUnit.js';
export { ValidationError, type ValidationFailure } from './errors.js';
export { forge } from './forge.js';
export { DEFAULT_MEMO_CAP, MEMO_CAP_MAX } from './internal/constants.js';
export { linear } from './linear.js';

export type {
  Conversion,
  Dimension,
  ForgeConfig,
  Unit,
  ValidatorMap,
} from './types.js';

export const VERSION = '0.0.0';
