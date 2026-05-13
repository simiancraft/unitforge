import type { Dimension } from './dimensions.js';

/**
 * Dimension identifier. Canonical declaration lives in `./dimensions.ts`
 * alongside the constants that derive it; re-exported here for the
 * convenience of consumers who import everything from `types`.
 */
export type { Dimension };

/**
 * A unit of measure. Carries two functions: `toBase` converts a value in this
 * unit's terms to the dimension's canonical base unit; `fromBase` does the
 * inverse. Both are always functions, never auto-derived from each other.
 *
 * Identity is split across three readonly strings: `id` is the stable
 * kebab-case identifier (`'square-meter'`), `label` is the human display
 * name (`'Square Meter'`), and `symbol` is the conventional short form
 * (`'m²'`). Consumers drive select-box labels, templating output, and
 * persisted references off these without re-deriving them.
 *
 * `T` is the value type (defaults to native `number`). Future precision-typed
 * kits may specialize `T` to `Decimal`, `Fraction`, etc.
 */
export interface Unit<D extends Dimension = Dimension, T = number> {
  /** Stable kebab-case identifier (`'square-meter'`). Safe for persistence and dictionary keys. */
  readonly id: string;
  /** Human display name in title case (`'Square Meter'`). */
  readonly label: string;
  /** Conventional short form / unit symbol (`'m²'`, `'mi'`, `'KiB'`). */
  readonly symbol: string;
  readonly dimension: D;
  /** This unit's value to base-unit value (must be a pure function of `value`). */
  readonly toBase: (value: T) => T;
  /** Base-unit value back to this unit's value (must be a pure function of `base`). */
  readonly fromBase: (base: T) => T;
  /** Marks the canonical base unit for the dimension. Exactly one per dimension. */
  readonly base?: boolean;
}

/**
 * Field-name → Unit map, parameterized by an `Inputs` (or `Output`) shape.
 * Used wherever forge accepts a multi-key dimensional bundle: cross-dim
 * `from`, object-shaped `to`, etc.
 *
 * @example
 *   // Inputs = { length: 'length'; width: 'length' }
 *   const fromUnits: UnitMap<{ length: 'length'; width: 'length' }> =
 *     { length: meter, width: meter };
 */
export type UnitMap<M extends Record<string, Dimension>, T = number> = {
  readonly [K in keyof M]: Unit<M[K], T>;
};

/**
 * What `forge` accepts on the LEFT (the `from` argument). Either a single
 * `Unit` (within-dim, scalar value flows through) or a `UnitMap` (cross-dim,
 * object-keyed input). Provided as a named type so call signatures read
 * `from: ForgeInput<I, T>` rather than the mapped-type longhand.
 */
export type ForgeInput<
  I extends Dimension | Record<string, Dimension>,
  T = number,
> = I extends Dimension ? Unit<I, T> : I extends Record<string, Dimension> ? UnitMap<I, T> : never;

/**
 * What `forge` produces values into on the RIGHT (the `to` argument).
 * Symmetric to `ForgeInput`: either a single `Unit` or a `UnitMap`.
 */
export type ForgeOutput<
  O extends Dimension | Record<string, Dimension>,
  T = number,
> = O extends Dimension ? Unit<O, T> : O extends Record<string, Dimension> ? UnitMap<O, T> : never;

/**
 * Per-property + cross-property validators for a `defineConversion`'s `inputs`.
 * Per-key validators run on each input independently; the optional `_all`
 * validator runs on the destructured input object as a whole.
 *
 * Each validator MUST be a pure function of its input. Validators are skipped
 * on cache hits; a validator that depends on external state (clocks, counters,
 * request context) will silently behave wrong on memoized converters.
 *
 * Return `true` (or `undefined`) to pass; return a string to reject with that
 * message; throw to reject with the thrown error preserved on the failure
 * record's `cause` field.
 */
export type ValidatorMap<Inputs extends Record<string, Dimension>, T = number> = {
  readonly [K in keyof Inputs]?: (value: T) => true | string | undefined;
} & {
  readonly _all?: (vals: { [K in keyof Inputs]: T }) => true | string | undefined;
};

/**
 * Cross-dimensional conversion: declares a dimensional contract, optional
 * validators, and the base-unit math (`compute`) that fulfills it.
 *
 * `Output` is either a single dimension (scalar output) or a record of
 * dimensions (object output, e.g., for 2D scaling). `compute`'s return type
 * mirrors `Output`'s shape via the conditional below.
 */
export interface Conversion<
  Inputs extends Record<string, Dimension>,
  Output extends Dimension | Record<string, Dimension>,
  T = number,
> {
  readonly inputs: Inputs;
  readonly output: Output;
  readonly validate?: ValidatorMap<Inputs, T>;
  // NoInfer<T> on the return position prevents TS from inferring T from
  // the compute function body, which would otherwise compete with the
  // inference from the inputs side and break object-output conversions.
  readonly compute: Output extends Dimension
    ? (vals: { [K in keyof Inputs]: T }) => NoInfer<T>
    : Output extends Record<string, Dimension>
      ? (vals: { [K in keyof Inputs]: T }) => { [K in keyof Output]: NoInfer<T> }
      : never;
}
