import { buildCacheKey, roundIfNumber, validateMemoCap, writeCache } from './lib/memoize.js';
import { safeCopy } from './lib/safeCopy.js';
import {
  runValidators,
  safeShallowCopy,
  ValidationError,
  type ValidationFailure,
} from './lib/validation.js';
import type {
  Conversion,
  Dimension,
  ForgeInput,
  ForgeOutput,
  Unit,
  ValidatorMap,
} from './types.js';

// ─── Public overload set ─────────────────────────────────────────────────
//
// Each overload inlines its own `config` shape rather than sharing a base
// interface. `ValidatorMap` is invariant in `Inputs`, so a loose
// `Conversion<Record<string, Dimension>, ...>` base type can't be narrowed
// at the call site without losing assignability; the inlined per-overload
// shape ties `via` to the call's inferred `Inputs`/`Output` directly.
// Callers pass an object literal; TS contextually types it against the
// matched overload's config shape, so no shared config interface is needed.

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
      `[unitforge] forge() received an object-shaped \`from\` with no \`via:\` in the config.\n` +
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
  // Single conversion lambda; roundIfNumber is a no-op when precisionMul
  // is null (early-return inside the helper), so we don't branch on the
  // precision setting at the call site. The branch elision shrinks both
  // line count and the mutation-test surface of equivalent precision-
  // gate mutants.
  const convert = (value: unknown): unknown =>
    roundIfNumber(toUnit.fromBase(fromUnit.toBase(value)), precisionMul);

  if (memoCap === 0) return convert;

  const cache = new Map<string, unknown>();
  return (value) => {
    const key = String(roundIfNumber(value, precisionMul));
    if (cache.has(key)) return cache.get(key);
    const result = convert(value);
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
  // Caller (forge) guarantees `via` is set on this path; assertion narrows for TS.
  const conversion = safeConfig.via as NonNullable<typeof safeConfig.via>;

  // safeCopy nested user-controlled key map (call-site validators).
  const callSiteValidate = safeConfig.validate ? safeCopy(safeConfig.validate) : undefined;

  // Pre-bake input key list (sorted for stable cache-key order).
  const inputKeys = Object.keys(conversion.inputs).sort();

  // Pre-bake output shape detection. `toEntries` is the
  // (key, Unit) pair list when `to` is an object; null when `to` is a
  // single Unit (the scalar-output overload). Truthiness of this one
  // variable encodes the dispatch decision downstream; using entries
  // (over a keys-list + indexed lookup) gives each iteration a
  // non-undefined `Unit` at the type level without a cast.
  const toEntries = isUnitLike(to) ? null : Object.entries(to as Record<string, AnyUnit>);

  const cache = memoCap > 0 ? new Map<string, unknown>() : null;

  return (rawInput) => {
    // 1-2: cache check first (memoize-on only). Build the key from
    // rawInput directly so the cache-hit path skips the shallow-copy
    // allocation entirely. Hostile getters on rawInput would already
    // throw inside buildCacheKey here, which is the same behavior as
    // the memoize-off path; the sentinel substitution in safeShallowCopy
    // only protects the validator/compute stages on a miss.
    let key: string | null = null;
    if (cache) {
      key = buildCacheKey(rawInput, inputKeys, precisionMul);
      if (cache.has(key)) return cache.get(key);
    }

    // 0 (deferred to miss-only): defensive shallow-copy of the input.
    // All downstream operations (validators, base normalization) read
    // from the safe copy. Hostile inputs with throwing property getters
    // get '[throwing getter]' sentinels; validators see those and reject
    // cleanly instead of crashing the converter mid-pipeline.
    const input = safeShallowCopy(rawInput);

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

    // 7: denormalize to target unit(s). toEntries is non-null iff
    // the output is object-shaped; the entries pairs each key with
    // the live Unit from `to`, so the loop body needs no cast.
    let result: unknown;
    if (toEntries) {
      const out: Record<string, unknown> = {};
      const baseMap = baseResult as Record<string, unknown>;
      for (const [k, u] of toEntries) {
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

// Structural check: a Unit is anything with callable toBase + fromBase
// methods. Optional chaining handles null/undefined; non-object inputs
// fail the `?.toBase` lookup and reject. The original chain also
// gated on `typeof x === 'object'`; relaxing that lets a callable with
// .toBase/.fromBase methods pass through as well, which is Liskov-
// positive (it walks like a unit, it quacks like a unit) and no API
// caller would construct one intentionally.
function isUnitLike(x: unknown): x is AnyUnit {
  const obj = x as { toBase?: unknown; fromBase?: unknown } | null | undefined;
  return typeof obj?.toBase === 'function' && typeof obj?.fromBase === 'function';
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
