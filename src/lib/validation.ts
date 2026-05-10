import type { Dimension, ValidatorMap } from '../types.js';

/** A single validation failure record. Aggregated into `ValidationError.failures`. */
export interface ValidationFailure {
  /** Input key that failed (or `_all` for the cross-property validator). */
  readonly key: string;
  /** Which validator layer the failure came from. */
  readonly stage: 'call-site' | 'definition';
  /** The value the validator saw. */
  readonly value: unknown;
  /** The validator's error string (or stringified throw). */
  readonly message: string;
  /** Original thrown error if the validator threw (preserves zod/yup payloads). */
  readonly cause?: unknown;
}

/**
 * Thrown by a forged converter when one or more validators reject the input.
 * Aggregates ALL failures across both `ForgeConfig.validate` and
 * `Conversion.validate` (no first-failure short-circuit).
 *
 * Construct via `new ValidationError(failures, inputs)`.
 *
 * **Mutability:** `inputs` and `failures` are frozen at construction time
 * (TS `readonly` is a compile-time fiction; freeze is the runtime guarantee).
 * `inputs` is also a defensive copy of the caller's input object so a
 * downstream catcher cannot poison the original via `err.inputs.foo = ...`.
 * The freeze is **shallow**: nested objects under `inputs` are not
 * deep-frozen (T defaults to native `number`, so this is rarely material;
 * future precision-typed kits ship their own values). `failures` is
 * similarly snapshotted. Cost lands only on the failure path (the
 * converter's happy path never constructs a `ValidationError`).
 *
 * **Robust against malicious inputs:** the shallow copy uses
 * `safeShallowCopy` (below), which catches throws from property getters
 * so a hostile `{ get foo() { throw 'gotcha'; } }` cannot mask the real
 * validation failure with a constructor crash.
 */
export class ValidationError extends Error {
  override readonly name = 'ValidationError';
  readonly inputs: Readonly<Record<string, unknown>>;
  readonly failures: ReadonlyArray<ValidationFailure>;

  constructor(
    failures: ReadonlyArray<ValidationFailure>,
    inputs: Readonly<Record<string, unknown>>,
  ) {
    const frozenFailures = Object.freeze(failures.slice());
    const frozenInputs = Object.freeze(safeShallowCopy(inputs));
    super(buildMessage(frozenFailures, frozenInputs));
    this.failures = frozenFailures;
    this.inputs = frozenInputs;
  }
}

/**
 * Shallow copy of `src` that survives throwing property getters. Reading a
 * value via `src[k]` invokes the getter; if it throws, we substitute a
 * `'[throwing getter]'` sentinel rather than letting the throw escape.
 * Same defensive class as the per-value stringifier below.
 *
 * Used in two places: at the top of every cross-dim converter call (so all
 * downstream operations: cache-key building, validator execution, base
 * normalization, see sanitized values), AND inside `ValidationError`'s
 * constructor (so a failure built from a hostile input still constructs).
 *
 * Skips Symbol-keyed properties intentionally; the `Inputs` contract is
 * `Record<string, Dimension>`, so non-string keys are not part of the API.
 */
export function safeShallowCopy(src: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.getOwnPropertyNames(src)) {
    try {
      out[k] = src[k];
    } catch {
      out[k] = '[throwing getter]';
    }
  }
  return out;
}

/**
 * Builds the error message from per-failure records. Iterates `failures` to
 * surface only the values the validator actually saw — never `JSON.stringify`s
 * the entire `inputs` object, which would throw on circular refs / BigInt and
 * could leak unexpected properties into the message.
 */
function buildMessage(
  failures: ReadonlyArray<ValidationFailure>,
  inputs: Readonly<Record<string, unknown>>,
): string {
  const inputKeys = Object.keys(inputs).sort();
  const inputSummary =
    inputKeys.length > 0
      ? `{ ${inputKeys.map((k) => `${k}: ${stringifyValue(inputs[k])}`).join(', ')} }`
      : '{}';
  const head = `[unitforge] validation failed for inputs ${inputSummary}:`;
  const lines = failures.map(
    (f) => `  - ${f.stage}.${f.key} (saw ${stringifyValue(f.value)}): ${f.message}`,
  );
  return [head, ...lines].join('\n');
}

/**
 * Runs every validator in `vmap` against `input` and pushes any failures
 * into the shared `failures` array. Per-key validators run on each input
 * field independently; the optional `_all` validator runs on the
 * destructured input object as a whole. Aggregating; never short-circuits
 * (the caller drains the full failure set into one `ValidationError`).
 */
export function runValidators(
  vmap: ValidatorMap<Record<string, Dimension>, unknown> | undefined,
  input: Record<string, unknown>,
  stage: 'call-site' | 'definition',
  failures: ValidationFailure[],
): void {
  if (!vmap) return;

  for (const k of Object.keys(vmap)) {
    if (k === '_all') continue;
    const fn = (vmap as Record<string, unknown>)[k];
    if (typeof fn !== 'function') continue;
    runOne(fn as (v: unknown) => true | string | undefined, input[k], k, stage, failures);
  }

  const allFn = (vmap as { _all?: unknown })._all;
  if (typeof allFn === 'function') {
    runOne(allFn as (v: unknown) => true | string | undefined, input, '_all', stage, failures);
  }
}

/**
 * Runs a single validator. Captures both string-return rejection and
 * thrown errors; thrown errors preserve the original `cause` so consumers
 * can downcast (zod / yup / valibot payloads).
 */
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

/**
 * Per-value stringifier: handles primitives directly (no JSON.stringify on
 * the input as a whole, so circular refs / BigInt cannot turn a structured
 * `ValidationError` into a `TypeError`).
 */
function stringifyValue(v: unknown): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  switch (typeof v) {
    case 'number':
    case 'boolean':
      return String(v);
    case 'bigint':
      return `${v}n`;
    case 'string':
      return JSON.stringify(v);
    case 'symbol':
      return v.toString();
    case 'function':
      return '[Function]';
    default:
      return '[Object]';
  }
}
