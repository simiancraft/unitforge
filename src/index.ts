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

// Note: no VERSION export. A hard-coded `'0.0.0'` would silently drift the
// moment semantic-release bumps package.json#version. Consumers who need the
// version at runtime can use their bundler's package.json substitution, or
// `import pkg from 'unitforge/package.json' with { type: 'json' }` (Node 22+).
