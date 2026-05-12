/**
 * Pure math helpers reusable across kits. Lives at the lib/ tier (not kit-local)
 * because every linear-scale unit in every kit uses `linear`; further math
 * helpers added here should likewise be domain-agnostic. Kit-specific math goes
 * in `src/kits/<domain>/math.ts`.
 */

/**
 * Sugar for the common linear-unit case.
 *
 * Returns the `{ toBase, fromBase }` pair for a unit whose conversion to its
 * dimension's base is multiplication by a constant scale. `T = number`-only:
 * uses native `*` and `/`. Future precision-typed kits write `toBase` /
 * `fromBase` longhand using their precision library; they do not use `linear`.
 *
 * @example
 *   defineUnit({ id: 'foot', label: 'Foot', symbol: 'ft', dimension: LENGTH, ...linear(0.3048) });
 */
export function linear(scale: number): {
  toBase: (v: number) => number;
  fromBase: (b: number) => number;
} {
  return {
    toBase: (v) => v * scale,
    fromBase: (b) => b / scale,
  };
}
