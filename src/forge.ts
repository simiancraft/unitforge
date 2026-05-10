import { ValidationError, type ValidationFailure } from './errors.js';
import { CACHE_KEY_SEP, MEMO_CAP_MAX } from './lib/constants.js';
import { safeCopy } from './lib/safeCopy.js';
import type { Conversion, Dimension, ForgeConfig, Unit, ValidatorMap } from './types.js';

// ─── Public overload set ─────────────────────────────────────────────────
// (See PLANNING.md "Public type sketch (canonical)" for the source of truth.)

/** Within-dimension. Both `Unit`s. No `via`. Converter is unary `(value) => value`. */
export function forge<D extends Dimension, T = number>(
  from: Unit<D, T>,
  to: Unit<D, T>,
  config?: Omit<ForgeConfig<T>, 'via'> & { via?: never },
): (value: T) => T;

/** Cross-dimensional. Object input, single-`Unit` output. `via` required. */
export function forge<
  Inputs extends Record<string, Dimension>,
  Output extends Dimension,
  T = number,
>(
  from: { [K in keyof Inputs]: Unit<Inputs[K], T> },
  to: Unit<Output, T>,
  config: ForgeConfig<T> & {
    via: Conversion<Inputs, Output, T>;
    validate?: ValidatorMap<Inputs, T>;
  },
): (input: { [K in keyof Inputs]: T }) => T;

/** Cross-dimensional. Object input, object output. `via` required. */
export function forge<
  Inputs extends Record<string, Dimension>,
  Output extends Record<string, Dimension>,
  T = number,
>(
  from: { [K in keyof Inputs]: Unit<Inputs[K], T> },
  to: { [K in keyof Output]: Unit<Output[K], T> },
  config: ForgeConfig<T> & {
    via: Conversion<Inputs, Output, T>;
    validate?: ValidatorMap<Inputs, T>;
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

  const buildKey = (input: Record<string, unknown>): string => {
    const parts: string[] = [];
    for (const k of inputKeys) {
      const v = input[k];
      parts.push(String(precisionMul != null ? roundIfNumber(v, precisionMul) : v));
    }
    return parts.join(CACHE_KEY_SEP);
  };

  return (input) => {
    // 1-2: cache check (memoize-on only)
    let key: string | null = null;
    if (cache) {
      key = buildKey(input);
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

// ─── Helpers ─────────────────────────────────────────────────────────────

function isUnitLike(x: unknown): x is AnyUnit {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as { toBase?: unknown }).toBase === 'function' &&
    typeof (x as { fromBase?: unknown }).fromBase === 'function'
  );
}

function validateMemoCap(memoize: unknown): number {
  if (memoize == null) return 0;
  if (
    typeof memoize !== 'number' ||
    !Number.isInteger(memoize) ||
    memoize < 0 ||
    memoize > MEMO_CAP_MAX
  ) {
    throw new Error(
      `[unitforge] memoize must be an integer in [0, ${MEMO_CAP_MAX}]; got ${String(memoize)}`,
    );
  }
  return memoize;
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

/** Rounds `v` if it is a finite number; otherwise returns `v` unchanged. */
function roundIfNumber(v: unknown, mul: number | null): unknown {
  if (mul == null) return v;
  if (typeof v !== 'number' || !Number.isFinite(v)) return v;
  return Math.round(v * mul) / mul;
}

function writeCache(cache: Map<string, unknown>, key: string, value: unknown, cap: number): void {
  if (cache.size >= cap) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

function runValidators(
  vmap: ValidatorMap<Record<string, Dimension>, unknown> | undefined,
  input: Record<string, unknown>,
  stage: 'call-site' | 'definition',
  failures: ValidationFailure[],
): void {
  if (!vmap) return;

  // Per-property validators
  for (const k of Object.keys(vmap)) {
    if (k === '_all') continue;
    const fn = (vmap as Record<string, unknown>)[k];
    if (typeof fn !== 'function') continue;
    runOne(fn as (v: unknown) => true | string | undefined, input[k], k, stage, failures);
  }

  // Cross-property `_all` validator
  const allFn = (vmap as { _all?: unknown })._all;
  if (typeof allFn === 'function') {
    runOne(allFn as (v: unknown) => true | string | undefined, input, '_all', stage, failures);
  }
}

function runOne(
  fn: (v: unknown) => true | string | undefined,
  value: unknown,
  key: string,
  stage: 'call-site' | 'definition',
  failures: ValidationFailure[],
): void {
  try {
    const result = fn(value);
    if (typeof result === 'string') {
      failures.push({ key, stage, value, message: result });
    }
  } catch (err) {
    failures.push({
      key,
      stage,
      value,
      message: String(
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: unknown }).message
          : err,
      ),
      cause: err,
    });
  }
}
