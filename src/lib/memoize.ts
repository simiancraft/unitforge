/**
 * FIFO bounded-cache primitives. Used by `forge()` to memoize converter
 * outputs when `ForgeConfig.memoize` is set; not part of the public API.
 *
 * Eviction is FIFO (insertion-order); reads do NOT promote entries. The
 * implementation is a `Map` because `Map` is the only JS primitive that
 * gives both key→value lookup AND insertion-order iteration (`Set` lacks
 * the value half). See `ForgeConfig.memoize` JSDoc for the rationale.
 */

/** NUL byte; used as the cache-key field separator (JSON-safe stringify output cannot contain it). */
export const CACHE_KEY_SEP = '\x00';

/** Hard upper bound on `ForgeConfig.memoize` cache cap. */
export const MEMO_CAP_MAX = 1_048_576;

/**
 * Default cache cap for ergonomic opt-in:
 *   `forge(a, b, { memoize: DEFAULT_MEMO_CAP })`
 * Sized for typical UI/spreadsheet workloads where the working set fits
 * comfortably; raise for higher-cardinality conversions.
 */
export const DEFAULT_MEMO_CAP = 1024;

/**
 * Validates `ForgeConfig.memoize` at forge-build time. Returns the cap as
 * a number (`0` means cache disabled). Throws on out-of-range / non-integer.
 */
export function validateMemoCap(memoize: unknown): number {
  if (memoize == null) return 0;
  if (
    typeof memoize !== 'number' ||
    !Number.isInteger(memoize) ||
    memoize < 0 ||
    memoize > MEMO_CAP_MAX
  ) {
    throw new Error(
      `[unitforge] memoize must be an integer in [0, ${MEMO_CAP_MAX}]; got ${String(memoize)}`,
    );
  }
  return memoize;
}

/**
 * Builds a deterministic cache key from a record of input values. Sorted
 * key order (passed in as `keys`, pre-sorted at forge-build) plus
 * `CACHE_KEY_SEP` between fields prevents `{a:'1', b:'2'}` colliding with
 * `{a:'12', b:''}` or similar. Each value is stringified with `String(v)`
 * after optional precision rounding.
 */
export function buildCacheKey(
  input: Record<string, unknown>,
  keys: readonly string[],
  precisionMul: number | null,
): string {
  const parts: string[] = [];
  for (const k of keys) {
    const v = input[k];
    parts.push(String(precisionMul != null ? roundIfNumber(v, precisionMul) : v));
  }
  return parts.join(CACHE_KEY_SEP);
}

/**
 * Inserts `(key, value)` into the cache. If at capacity, evicts the
 * oldest-INSERTED entry first (FIFO). Map iteration order is insertion
 * order per the ECMAScript spec, so `cache.keys().next().value` is the
 * oldest insertion.
 */
export function writeCache(
  cache: Map<string, unknown>,
  key: string,
  value: unknown,
  cap: number,
): void {
  if (cache.size >= cap) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

/** Rounds `v` if it is a finite number; otherwise returns `v` unchanged. */
export function roundIfNumber(v: unknown, mul: number | null): unknown {
  if (mul == null) return v;
  if (typeof v !== 'number' || !Number.isFinite(v)) return v;
  return Math.round(v * mul) / mul;
}
