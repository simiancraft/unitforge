/**
 * Sugar for the common linear-unit case.
 *
 * Returns the `{ toBase, fromBase }` pair for a unit whose conversion to its
 * dimension's base is multiplication by a constant scale. `T = number`-only:
 * uses native `*` and `/`. Future precision-typed kits write `toBase` /
 * `fromBase` longhand using their precision library; they do not use `linear`.
 *
 * @example
 *   defineUnit({ name: 'foot', dimension: LENGTH, ...linear(0.3048) });
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
