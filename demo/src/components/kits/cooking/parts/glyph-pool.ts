// Deterministic subset selection from a fixed glyph pool, keyed by
// unit id. Same unit id always picks the same indices, so navigating
// away and back is stable; different unit ids pick different subsets,
// so swapping the bench from-unit fades out one quarter of the glyph
// field and fades in another. Two pools (from + to) per backdrop;
// they don't overlap.
//
// Lives in its own file because it has nothing to do with forge() or
// with backdrop "scales"; it's a stateless utility the cooking
// backdrop calls per render.

/** Fowler-Noll-Vo 1a, 32-bit. Non-cryptographic, fast, deterministic
 *  across runs and across machines. Good enough for "pick a stable
 *  subset of N from a unit id." */
function fnv1a32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Numerical Recipes linear congruential generator; produces unsigned
 *  32-bit pseudo-randoms with full period. */
function lcgNext(seed: number): number {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}

/**
 * Returns the set of slot indices (within [0, total)) that the given
 * unit id activates. Deterministic per (unitId, total, count) tuple;
 * stable across renders so the active glyphs only change when the
 * unit id itself changes.
 */
export function glyphSubsetIndices(unitId: string, total: number, count: number): Set<number> {
  const chosen = new Set<number>();
  let seed = fnv1a32(unitId);
  // Bounded loop: lcgNext is periodic but won't repeat within total
  // many calls for these sizes; cap iterations defensively in case a
  // pathological unit id seeds a short cycle.
  let safety = total * 8;
  while (chosen.size < count && safety-- > 0) {
    chosen.add(seed % total);
    seed = lcgNext(seed);
  }
  return chosen;
}
