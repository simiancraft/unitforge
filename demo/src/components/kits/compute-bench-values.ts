// Shared engine for "bench" widgets: option lookup + forge() invocation
// + the cast workaround. Both <Bench> (card chrome, geometry/data-storage)
// and <ForgeBench> (slim home variant) consume this so the runtime logic
// only lives in one place; the layouts stay distinct.

import type { Dimension, ForgeInput, Unit } from 'unitforge';
import { forge } from 'unitforge';

interface BenchOption<D extends Dimension, K extends string> {
  key: K;
  label: string;
  unit: Unit<D, number>;
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
  // Cast: TS cannot prove `ForgeInput<D> = Unit<D>` for a generic
  // `D extends Dimension`. The runtime invariant is enforced by the
  // options array (every unit shares dimension D).
  const result = forge(
    fromOpt.unit as ForgeInput<D, number>,
    toOpt.unit as ForgeInput<D, number>,
  )(value);
  return { fromOpt, toOpt, result };
}
