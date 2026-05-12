// Factory primitives. `defineUnit` and `defineConversion` are co-located
// because they share `safeCopy` and are almost always imported together by
// kit authors. Pure helpers like `linear` live under `lib/math.ts`.

import { safeCopy } from './lib/safeCopy.js';
import type { Conversion, Dimension, Unit } from './types.js';

/**
 * Produces a `Unit` value. Kits export these.
 *
 * Calls `safeCopy` on the spec at the entry point to neutralize prototype
 * pollution. Returns the sanitized spec; the runtime cost lands at definition
 * time (module load), not per-conversion-call.
 *
 * Authoring convention: kit-shipped units inline `toBase`/`fromBase` as
 * arrow closures. The exported `linear(scale)` helper exists for ad-hoc
 * userland use only; spreading `...linear(scale)` into a kit's spec
 * defeats per-export tree-shaking because the CallExpression inside the
 * literal forces bundlers to retain the outer `defineUnit(...)` even with
 * a PURE annotation.
 *
 * @example
 *   export const meter = defineUnit({
 *     id: 'meter',
 *     label: 'Meter',
 *     symbol: 'm',
 *     dimension: LENGTH,
 *     toBase: (v) => v,
 *     fromBase: (b) => b,
 *     base: true,
 *   });
 */
export function defineUnit<D extends Dimension, T = number>(spec: Unit<D, T>): Unit<D, T> {
  return safeCopy(spec);
}

/**
 * Produces a `Conversion` value. Kit-local conversions live alongside their
 * units (e.g., `src/kits/geometry/conversions.ts`); cross-domain conversions
 * may live at a top-level location and be imported on demand at `forge` call
 * sites via the `via:` field on forge's cross-dim config.
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
  // Strip `validate` out of the rest before re-attaching only when
  // truthy; otherwise an explicit `validate: undefined` property leaks
  // through and shows up in Object.keys / JSON output.
  const { validate: _droppedValidate, ...rest } = safeSpec;

  return {
    ...rest,
    inputs: safeInputs,
    ...(safeValidate ? { validate: safeValidate } : {}),
  };
}
