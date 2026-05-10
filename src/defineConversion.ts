import { safeCopy } from './internal/safeCopy.js';
import type { Conversion, Dimension } from './types.js';

/**
 * Produces a `Conversion` value. Conversions live under `src/conversions/`
 * and are imported on demand at `forge` call sites via `ForgeConfig.via`.
 *
 * Calls `safeCopy` on the spec, the nested `inputs` map, and the nested
 * `validate` map at the entry point. Cost is once per conversion at module
 * load; not per-call.
 *
 * @example
 *   export const massFromVolumeAndDensity = defineConversion({
 *     inputs: { volume: VOLUME, density: DENSITY },
 *     output: MASS,
 *     compute: ({ volume, density }) => volume * density,
 *   });
 */
export function defineConversion<
  Inputs extends Record<string, Dimension>,
  Output extends Dimension | Record<string, Dimension>,
  T = number,
>(spec: Conversion<Inputs, Output, T>): Conversion<Inputs, Output, T> {
  const safeSpec = safeCopy(spec);
  const safeInputs = safeCopy(safeSpec.inputs);
  const safeValidate = safeSpec.validate ? safeCopy(safeSpec.validate) : undefined;

  return {
    ...safeSpec,
    inputs: safeInputs,
    ...(safeValidate ? { validate: safeValidate } : {}),
  };
}
