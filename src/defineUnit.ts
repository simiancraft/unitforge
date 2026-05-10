import { safeCopy } from './internal/safeCopy.js';
import type { Dimension, Unit } from './types.js';

/**
 * Produces a `Unit` value. Kits export these.
 *
 * Calls `safeCopy` on the spec at the entry point to neutralize prototype
 * pollution. Returns the sanitized spec; the runtime cost lands at definition
 * time (module load), not per-conversion-call.
 *
 * @example
 *   export const meter = defineUnit({
 *     name: 'meter',
 *     dimension: LENGTH,
 *     ...linear(1),
 *     base: true,
 *   });
 */
export function defineUnit<D extends Dimension, T = number>(spec: Unit<D, T>): Unit<D, T> {
  return safeCopy(spec);
}
