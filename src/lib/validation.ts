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
 * `failures` is similarly snapshotted. Cost lands only on the failure path
 * (the converter's happy path never constructs a `ValidationError`).
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
    const frozenInputs = Object.freeze({ ...inputs });
    super(buildMessage(frozenFailures, frozenInputs));
    this.failures = frozenFailures;
    this.inputs = frozenInputs;
  }
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
