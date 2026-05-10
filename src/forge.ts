import { ValidationError, type ValidationFailure } from './errors.js';
import { CACHE_KEY_SEP, MEMO_CAP_MAX } from './internal/constants.js';
import { safeCopy } from './internal/safeCopy.js';
import type { Conversion, Dimension, ForgeConfig, Unit, ValidatorMap } from './types.js';

// biome-ignore lint/suspicious/noExplicitAny: overloads are the strict surface; impl uses any for shape polymorphism

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

export function forge(
  // biome-ignore lint/suspicious/noExplicitAny: shape polymorphism inside impl
  from: any,
  // biome-ignore lint/suspicious/noExplicitAny: shape polymorphism inside impl
  to: any,
  // biome-ignore lint/suspicious/noExplicitAny: shape polymorphism inside impl
  config?: any,
  // biome-ignore lint/suspicious/noExplicitAny: variadic shape; per-call narrowing happens in overloads
): (input: any) => any {
  const safeConfig = config ? safeCopy(config) : undefined;
  const memoCap = validateMemoCap(safeConfig?.memoize);
  const precision = validatePrecision(safeConfig?.precision);
  const precisionMul = precision != null ? 10 ** precision : null;

  if (isUnitLike(from) && isUnitLike(to)) {
    return buildUnaryConverter(
      from as Unit<Dimension, unknown>,
      to as Unit<Dimension, unknown>,
      memoCap,
      precision,
      precisionMul,
    );
  }

  // Cross-dim path: object input.
  if (!safeConfig || !safeConfig.via) {
    throw new Error(
      `[unitforge] forge() received an object-shaped \`from\` with no \`via:\` in ForgeConfig.\n` +
        `\`from\` keys: { ${Object.keys(from).join(', ')} }\n` +
        `Cross-dimensional forging requires a defineConversion value passed as \`via:\`.`,
    );
  }

  return buildCrossDimConverter(
    from as Record<string, Unit<Dimension, unknown>>,
    to,
    safeConfig,
    memoCap,
    precision,
    precisionMul,
  );
}

// ─── Within-dimension converter ──────────────────────────────────────────

function buildUnaryConverter(
  fromUnit: Unit<Dimension, unknown>,
  toUnit: Unit<Dimension, unknown>,
  memoCap: number,
  precision: number | null,
  precisionMul: number | null,
  // biome-ignore lint/suspicious/noExplicitAny: T-polymorphic at the value layer
): (value: any) => any {
  // Memoize off: hot path is two function calls + optional rounding.
  if (memoCap === 0) {
    if (precisionMul == null) {
      // biome-ignore lint/suspicious/noExplicitAny: T-polymorphic
      return (value: any) =>
        // biome-ignore lint/suspicious/noExplicitAny: T-polymorphic
        toUnit.fromBase(fromUnit.toBase(value as any) as any);
    }
    // biome-ignore lint/suspicious/noExplicitAny: T-polymorphic
    return (value: any) =>
      // biome-ignore lint/suspicious/noExplicitAny: T-polymorphic
      roundNumber(toUnit.fromBase(fromUnit.toBase(value as any) as any), precisionMul);
  }

  // Memoize on.
  // biome-ignore lint/suspicious/noExplicitAny: cache values are T-polymorphic
  const cache = new Map<string, any>();

  // biome-ignore lint/suspicious/noExplicitAny: T-polymorphic
  return (value: any) => {
    const keyVal = precisionMul != null ? roundNumber(value, precisionMul) : value;
    const key = String(keyVal);
    if (cache.has(key)) return cache.get(key);

    let result = toUnit.fromBase(fromUnit.toBase(value));
    if (precisionMul != null) result = roundNumber(result, precisionMul);

    writeCache(cache, key, result, memoCap);
    return result;
  };
}

// ─── Cross-dimensional converter ─────────────────────────────────────────

function buildCrossDimConverter(
  fromUnits: Record<string, Unit<Dimension, unknown>>,
  // biome-ignore lint/suspicious/noExplicitAny: to is Unit | Record<string,Unit>
  to: any,
  // biome-ignore lint/suspicious/noExplicitAny: validated config
  safeConfig: any,
  memoCap: number,
  precision: number | null,
  precisionMul: number | null,
  // biome-ignore lint/suspicious/noExplicitAny: T-polymorphic
): (input: Record<string, any>) => any {
  const conversion: Conversion<
    Record<string, Dimension>,
    Dimension | Record<string, Dimension>,
    unknown
  > = safeConfig.via;

  // safeCopy nested user-controlled key maps (call-site validators).
  const callSiteValidate: ValidatorMap<Record<string, Dimension>, unknown> | undefined =
    safeConfig.validate ? safeCopy(safeConfig.validate) : undefined;

  // Pre-bake input key list (sorted for stable cache-key order).
  const inputKeys = Object.keys(conversion.inputs).sort();

  // Pre-bake output shape detection.
  const outputIsObject = !isUnitLike(to);
  const outputKeys = outputIsObject ? Object.keys(to as Record<string, unknown>) : null;

  // biome-ignore lint/suspicious/noExplicitAny: cache is T-polymorphic
  const cache = memoCap > 0 ? new Map<string, any>() : null;

  const buildKey = (input: Record<string, unknown>): string => {
    if (precisionMul == null) {
      const parts: string[] = [];
      for (const k of inputKeys) parts.push(String(input[k]));
      return parts.join(CACHE_KEY_SEP);
    }
    const parts: string[] = [];
    for (const k of inputKeys) {
      const v = input[k];
      parts.push(String(typeof v === 'number' ? roundNumber(v, precisionMul) : v));
    }
    return parts.join(CACHE_KEY_SEP);
  };

  return (input: Record<string, unknown>) => {
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
    // biome-ignore lint/suspicious/noExplicitAny: base values are T-polymorphic
    const baseValues: Record<string, any> = {};
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
    // biome-ignore lint/suspicious/noExplicitAny: compute return is T or {[K]:T}
    const baseResult: any = (conversion.compute as (vals: Record<string, unknown>) => unknown)(
      baseValues,
    );

    // 7: denormalize to target unit(s)
    // biome-ignore lint/suspicious/noExplicitAny: result is T or {[K]:T}
    let result: any;
    if (outputIsObject && outputKeys) {
      // biome-ignore lint/suspicious/noExplicitAny: object-output mirroring
      const out: Record<string, any> = {};
      const toMap = to as Record<string, Unit<Dimension, unknown>>;
      const baseMap = baseResult as Record<string, unknown>;
      for (const k of outputKeys) {
        const u = toMap[k];
        if (!u) continue;
        let v = u.fromBase(baseMap[k]);
        if (precisionMul != null && typeof v === 'number') {
          v = roundNumber(v, precisionMul);
        }
        out[k] = v;
      }
      result = out;
    } else {
      result = (to as Unit<Dimension, unknown>).fromBase(baseResult);
      if (precisionMul != null && typeof result === 'number') {
        result = roundNumber(result, precisionMul);
      }
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

function isUnitLike(x: unknown): x is Unit<Dimension, unknown> {
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

// biome-ignore lint/suspicious/noExplicitAny: numeric utility
function roundNumber(v: any, mul: number): any {
  if (typeof v !== 'number' || !Number.isFinite(v)) return v;
  return Math.round(v * mul) / mul;
}

function writeCache(
  // biome-ignore lint/suspicious/noExplicitAny: cache is T-polymorphic
  cache: Map<string, any>,
  key: string,
  // biome-ignore lint/suspicious/noExplicitAny: cache value is T-polymorphic
  value: any,
  cap: number,
): void {
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
