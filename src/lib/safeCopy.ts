/**
 * Reserved JS keys that prototype-pollution attacks rely on. Exported so the
 * test suite can iterate over the canonical set rather than hand-mirror it
 * (which silently drifts when the set changes).
 */
export const RESERVED_PROTO_KEYS: ReadonlySet<string> = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

/**
 * Returns a sanitized shallow copy of `spec`.
 *
 * Spreads to neutralize literal-syntax `__proto__:` pollution, then iterates
 * own-enumerable string keys and throws a clear error if any is one of the
 * JavaScript reserved keys (`__proto__`, `constructor`, `prototype`).
 *
 * Shallow by design: does NOT recurse into function values or nested objects.
 * The trust boundary is "values produced by `defineUnit` / `defineConversion`
 * have already passed `safeCopy` at their own definition time." Nested
 * user-controlled key maps must call `safeCopy` separately.
 */
export function safeCopy<T extends object>(spec: T): T {
  const copy = { ...spec };
  for (const key of Object.keys(copy)) {
    if (RESERVED_PROTO_KEYS.has(key)) {
      throw new Error(`[unitforge] Reserved key '${key}' is not allowed in factory input.`);
    }
  }
  return copy;
}
