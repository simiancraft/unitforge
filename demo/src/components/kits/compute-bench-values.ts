// Shared engine for "bench" widgets: option lookup + forge() invocation.
// Both <Bench> (card chrome, geometry/data-storage) and <ForgeBench>
// (slim home variant) consume this so the runtime logic only lives in
// one place; the layouts stay distinct.

import type { Dimension, ForgeInput, Unit } from 'unitforge';
import { forge } from 'unitforge';

interface ComputeBenchValuesArgs<D extends Dimension> {
  fromId: string;
  toId: string;
  value: number;
  options: ReadonlyArray<Unit<D, number>>;
}

interface BenchValues<D extends Dimension> {
  fromUnit: Unit<D, number>;
  toUnit: Unit<D, number>;
  result: number;
}

export function computeBenchValues<D extends Dimension>({
  fromId,
  toId,
  value,
  options,
}: ComputeBenchValuesArgs<D>): BenchValues<D> {
  // Kit pages always pass a non-empty catalog; the runtime guard exists
  // for the contract, not for any production path.
  const fallback = options[0];
  if (!fallback) throw new Error('computeBenchValues: empty options array');
  const fromUnit = options.find((o) => o.id === fromId) ?? fallback;
  const toUnit = options.find((o) => o.id === toId) ?? fallback;
  // forge's within-dim signature wants ForgeInput<D, T>; Unit<D, T> is
  // structurally that, but TS under exactOptionalPropertyTypes can't see
  // through the conditional in ForgeInput. Cast at the boundary.
  const result = forge(fromUnit as ForgeInput<D, number>, toUnit as ForgeInput<D, number>)(value);
  return { fromUnit, toUnit, result };
}
