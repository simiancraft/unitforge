/** unitforge public API barrel. */

export { defineConversion, defineUnit } from './define.js';
export { forge } from './forge.js';
export { linear } from './lib/math.js';
export { DEFAULT_MEMO_CAP, MEMO_CAP_MAX } from './lib/memoize.js';
export { ValidationError, type ValidationFailure } from './lib/validation.js';

export type {
  Conversion,
  Dimension,
  ForgeConfig,
  ForgeInput,
  ForgeOutput,
  Unit,
  UnitMap,
  ValidatorMap,
} from './types.js';

// VERSION lives on its own subpath (`unitforge/version`) so the JSON-import
// cost (~2 kB inlined package.json in consumer bundles) is paid only by
// consumers who explicitly want it. The main barrel stays bloat-free.
// Documented in README under "API" so consumers reading docs find it.
