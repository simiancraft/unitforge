// Scalar within-dimension conversion helper. Wraps the `forge(from, to)(value)`
// triple-paren dance section files reach for constantly, and concentrates
// the `as ForgeInput<D>` cast in one place (TS can't prove the
// conditional `ForgeInput<D> = Unit<D>` for a generic D extending
// Dimension; the unitforge type surface is the actual fix, this helper
// just gathers the workaround).
//
// Cross-dimensional conversions (the `forge({ a, b }, c, { via })` shape
// with a recipe) still spell out the full call at the section site.

import type { Dimension, ForgeInput, Unit } from 'unitforge';
import { forge } from 'unitforge';

export function convert<D extends Dimension>(
  from: Unit<D, number>,
  to: Unit<D, number>,
  value: number,
): number {
  return forge(from as ForgeInput<D, number>, to as ForgeInput<D, number>)(value);
}
