// Shared engine for "bench" widgets: option lookup + forge() invocation
// + the cast workaround. Both <Bench> (card chrome, geometry/data-storage)
// and <ForgeBench> (slim home variant) consume this so the runtime logic
// only lives in one place; the layouts stay distinct.

import type { Dimension, ForgeInput } from 'unitforge';
import { forge } from 'unitforge';

interface BenchOption<D extends Dimension, K extends string> {
  key: K;
  label: string;
  unit: ForgeInput<D, number>;
}

interface ComputeBenchValuesArgs<D extends Dimension, K extends string> {
  fromKey: K;
  toKey: K;
  value: number;
  options: ReadonlyArray<BenchOption<D, K>>;
}

interface BenchValues<D extends Dimension, K extends string> {
  fromOpt: BenchOption<D, K>;
  toOpt: BenchOption<D, K>;
  result: number;
}

export function computeBenchValues<D extends Dimension, K extends string>({
  fromKey,
  toKey,
  value,
  options,
}: ComputeBenchValuesArgs<D, K>): BenchValues<D, K> {
  // The options array is non-empty by contract (kit pages always pass a
  // catalog). If the key falls out of the catalog (hot reload, future
  // deep-link state), fall back to options[0].
  const fromOpt = options.find((o) => o.key === fromKey) ?? options[0]!;
  const toOpt = options.find((o) => o.key === toKey) ?? options[0]!;
  const result = forge(fromOpt.unit, toOpt.unit)(value);
  return { fromOpt, toOpt, result };
}
