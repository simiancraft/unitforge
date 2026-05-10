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
 */
export class ValidationError extends Error {
  override readonly name = 'ValidationError';
  readonly inputs: Readonly<Record<string, unknown>>;
  readonly failures: ReadonlyArray<ValidationFailure>;

  constructor(
    failures: ReadonlyArray<ValidationFailure>,
    inputs: Readonly<Record<string, unknown>>,
  ) {
    super(buildMessage(failures, inputs));
    this.failures = failures;
    this.inputs = inputs;
  }
}

function buildMessage(
  failures: ReadonlyArray<ValidationFailure>,
  inputs: Readonly<Record<string, unknown>>,
): string {
  const head = `[unitforge] validation failed for inputs ${JSON.stringify(inputs)}:`;
  const lines = failures.map((f) => `  - ${f.stage}.${f.key}: ${f.message}`);
  return [head, ...lines].join('\n');
}
