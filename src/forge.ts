import { buildCacheKey, roundIfNumber, validateMemoCap, writeCache } from './lib/memoize.js';
import { safeCopy } from './lib/safeCopy.js';
import { runValidators, ValidationError, type ValidationFailure } from './lib/validation.js';
import type {
  Conversion,
  Dimension,
  ForgeInput,
  ForgeOutput,
  Unit,
  ValidatorMap,
} from './types.js';

// ─── Public overload set ─────────────────────────────────────────────────
// (See PLANNING.md "Public type sketch (canonical)" for the source of truth.)
//
// Each overload inlines its own `config` shape rather than intersecting
// `ForgeConfig<T>` with a narrow `via`. Two reasons: (1) the intersection
// `ForgeConfig<T> & { via: Conversion<Inputs, Output, T> }` requires the
// narrow `via` to satisfy the loose `Conversion<Record<string, Dimension>, ...>`
// from ForgeConfig, which fails because `ValidatorMap` is invariant in
// `Inputs`; (2) the inlined shape is the source of truth at the call site.
// `ForgeConfig` remains exported for documentation/hover.

/** Within-dimension. Both `Unit`s. No `via`. Converter is unary `(value) => value`. */
export function forge<D extends Dimension, T = number>(
  from: ForgeInput<D, T>,
  to: ForgeInput<NoInfer<D>, T>,
  config?: { precision?: number; memoize?: number },
): (value: T) => T;

/** Cross-dimensional. Object input, single-`Unit` output. `via` required. */
export function forge<
  Inputs extends Record<string, Dimension>,
  Output extends Dimension,
  T = number,
>(
  from: ForgeInput<Inputs, T>,
  to: ForgeOutput<Output, T>,
  config: {
    via: Conversion<Inputs, Output, T>;
    validate?: ValidatorMap<Inputs, T>;
    precision?: number;
    memoize?: number;
  },
): (input: { [K in keyof Inputs]: T }) => T;

/** Cross-dimensional. Object input, object output. `via` required. */
export function forge<
  Inputs extends Record<string, Dimension>,
  Output extends Record<string, Dimension>,
  T = number,
>(
  from: ForgeInput<Inputs, T>,
  to: ForgeOutput<Output, T>,
  config: {
    via: Conversion<Inputs, Output, T>;
    validate?: ValidatorMap<Inputs, T>;
    precision?: number;
    memoize?: number;
  },
): (input: { [K in keyof Inputs]: T }) => { [K in keyof Output]: T };

// ─── Runtime implementation ──────────────────────────────────────────────
//
// The impl signature uses `any` ONLY because TypeScript requires the
// implementation signature of an overloaded function to be assignable to every
// overload simultaneously, and no single non-`any` type is assignable to the
// three overload return shapes. The impl signature is invisible to callers
// (TypeScript only surfaces the three overloads above); inside the body we
// use `unknown` and narrow with type guards. This is the conventional
// TypeScript escape hatch for overloaded functions, not a generalized `any`.
// biome-ignore lint/suspicious/noExplicitAny: see comment above
export function forge(from: any, to: any, config?: any): any {
  const safeConfig: SafeConfig | undefined = config
    ? (safeCopy(config as Record<string, unknown>) as SafeConfig)
    : undefined;
  const memoCap = validateMemoCap(safeConfig?.memoize);
  const precision = validatePrecision(safeConfig?.precision);
  const precisionMul = precision != null ? 10 ** precision : null;

  if (isUnitLike(from) && isUnitLike(to)) {
    return buildUnaryConverter(from, to, memoCap, precisionMul);
  }

  // Cross-dim path: object input.
  if (!safeConfig?.via) {
    const fromObj = from as Record<string, unknown>;
    throw new Error(
      `[unitforge] forge() received an object-shaped \`from\` with no \`via:\` in ForgeConfig.\n` +
        `\`from\` keys: { ${Object.keys(fromObj).join(', ')} }\n` +
        `Cross-dimensional forging requires a defineConversion value passed as \`via:\`.`,
    );
  }

  return buildCrossDimConverter(
    from as Record<string, Unit<Dimension, unknown>>,
    to as Unit<Dimension, unknown> | Record<string, Unit<Dimension, unknown>>,
    safeConfig,
    memoCap,
    precisionMul,
  );
}

// ─── Internal types for the runtime impl ─────────────────────────────────

interface SafeConfig {
  via?: Conversion<Record<string, Dimension>, Dimension | Record<string, Dimension>, unknown>;
  validate?: ValidatorMap<Record<string, Dimension>, unknown>;
  precision?: unknown;
  memoize?: unknown;
}

type AnyUnit = Unit<Dimension, unknown>;
type AnyConverter = (input: unknown) => unknown;

// ─── Within-dimension converter ──────────────────────────────────────────

function buildUnaryConverter(
  fromUnit: AnyUnit,
  toUnit: AnyUnit,
  memoCap: number,
  precisionMul: number | null,
): AnyConverter {
  // Memoize off: hot path is two function calls + optional rounding.
  if (memoCap === 0) {
    if (precisionMul == null) {
      return (value) => toUnit.fromBase(fromUnit.toBase(value));
    }
    return (value) => roundIfNumber(toUnit.fromBase(fromUnit.toBase(value)), precisionMul);
  }

  // Memoize on.
  const cache = new Map<string, unknown>();

  return (value) => {
    const keyVal = precisionMul != null ? roundIfNumber(value, precisionMul) : value;
    const key = String(keyVal);
    if (cache.has(key)) return cache.get(key);

    let result = toUnit.fromBase(fromUnit.toBase(value));
    if (precisionMul != null) result = roundIfNumber(result, precisionMul);

    writeCache(cache, key, result, memoCap);
    return result;
  };
}

// ─── Cross-dimensional converter ─────────────────────────────────────────

function buildCrossDimConverter(
  fromUnits: Record<string, AnyUnit>,
  to: AnyUnit | Record<string, AnyUnit>,
  safeConfig: SafeConfig,
  memoCap: number,
  precisionMul: number | null,
): (input: Record<string, unknown>) => unknown {
  const conversion = safeConfig.via;
  if (!conversion) {
    // Defensive: caller (forge) already guards this path, but narrow for TS.
    throw new Error('[unitforge] internal: cross-dim build called without conversion.via');
  }

  // safeCopy nested user-controlled key map (call-site validators).
  const callSiteValidate = safeConfig.validate ? safeCopy(safeConfig.validate) : undefined;

  // Pre-bake input key list (sorted for stable cache-key order).
  const inputKeys = Object.keys(conversion.inputs).sort();

  // Pre-bake output shape detection.
  const outputIsObject = !isUnitLike(to);
  const outputKeys = outputIsObject ? Object.keys(to as Record<string, AnyUnit>) : null;

  const cache = memoCap > 0 ? new Map<string, unknown>() : null;

  return (input) => {
    // 1-2: cache check (memoize-on only)
    let key: string | null = null;
    if (cache) {
      key = buildCacheKey(input, inputKeys, precisionMul);
      if (cache.has(key)) return cache.get(key);
    }

    // 3: aggregate all validator failures (no short-circuit)
    const failures: ValidationFailure[] = [];
    runValidators(callSiteValidate, input, 'call-site', failures);
    runValidators(conversion.validate, input, 'definition', failures);

    // 4: throw if any failures; no cache write
    if (failures.length > 0) {
      throw new ValidationError(failures, input);
    }

    // 5: normalize inputs to base units
    const baseValues: Record<string, unknown> = {};
    for (const k of inputKeys) {
      const u = fromUnits[k];
      if (!u) {
        throw new Error(
          `[unitforge] forge() input shape mismatch: conversion expects key '${k}' but \`from\` does not declare a unit for it.`,
        );
      }
      baseValues[k] = u.toBase(input[k]);
    }

    // 6: run compute in base units
    const compute = conversion.compute as (vals: Record<string, unknown>) => unknown;
    const baseResult = compute(baseValues);

    // 7: denormalize to target unit(s)
    let result: unknown;
    if (outputIsObject && outputKeys) {
      const out: Record<string, unknown> = {};
      const toMap = to as Record<string, AnyUnit>;
      const baseMap = baseResult as Record<string, unknown>;
      for (const k of outputKeys) {
        const u = toMap[k];
        if (!u) continue;
        out[k] = roundIfNumber(u.fromBase(baseMap[k]), precisionMul);
      }
      result = out;
    } else {
      result = roundIfNumber((to as AnyUnit).fromBase(baseResult), precisionMul);
    }

    // 8: write to cache (memoize-on only)
    if (cache && key != null) {
      writeCache(cache, key, result, memoCap);
    }

    // 9: return
    return result;
  };
}

// ─── Local helpers ───────────────────────────────────────────────────────

function isUnitLike(x: unknown): x is AnyUnit {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as { toBase?: unknown }).toBase === 'function' &&
    typeof (x as { fromBase?: unknown }).fromBase === 'function'
  );
}

function validatePrecision(precision: unknown): number | null {
  if (precision == null) return null;
  if (typeof precision !== 'number' || !Number.isInteger(precision) || precision < 0) {
    throw new Error(
      `[unitforge] precision must be a non-negative integer; got ${String(precision)}`,
    );
  }
  return precision;
}
