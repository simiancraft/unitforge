/** Reserved JS keys that prototype-pollution attacks rely on. */
export const RESERVED_PROTO_KEYS: ReadonlySet<string> = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

/** NUL byte; used as the cache-key field separator (cannot appear in JSON-safe stringify output). */
export const CACHE_KEY_SEP = '\x00';

/** Hard upper bound on `ForgeConfig.memoize` LRU cap. */
export const MEMO_CAP_MAX = 1_048_576;

/** Default LRU cap for ergonomic opt-in: `forge(a, b, { memoize: DEFAULT_MEMO_CAP })`. */
export const DEFAULT_MEMO_CAP = 1024;
