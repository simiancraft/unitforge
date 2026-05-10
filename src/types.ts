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
 * `T` is the value type (defaults to native `number`). Future precision-typed
 * kits may specialize `T` to `Decimal`, `Fraction`, etc.
 */
export interface Unit<D extends Dimension = Dimension, T = number> {
  readonly name: string;
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
  readonly compute: Output extends Dimension
    ? (vals: { [K in keyof Inputs]: T }) => T
    : Output extends Record<string, Dimension>
      ? (vals: { [K in keyof Inputs]: T }) => { [K in keyof Output]: T }
      : never;
}

/**
 * Configuration for a single `forge()` call. Plain TypeScript interface;
 * consumers construct as object literal at the call site.
 *
 * `via` and `validate` are typed loosely on this standalone interface; the
 * `forge` overloads re-narrow them via intersection with the call's inferred
 * `Inputs`/`Output`. A consumer who hovers `ForgeConfig.via` on the standalone
 * interface sees the loose type; a consumer who hovers inside an actual
 * `forge(...)` call gets the narrowed shape.
 */
export interface ForgeConfig<T = number> {
  /** Cross-dim conversion value. Required when `from` is object-shaped. */
  via?: Conversion<Record<string, Dimension>, Dimension | Record<string, Dimension>, T>;
  /** Call-site validators, additive on top of the conversion's own. */
  validate?: ValidatorMap<Record<string, Dimension>, T>;
  /**
   * Output rounding AND cache-key normalization. Native-number only at v1.
   * Non-negative integer; `0` rounds to integer; absent means no rounding.
   */
  precision?: number;
  /**
   * FIFO bounded-cache cap. `0` or absent disables the cache entirely (no key
   * construction, no Map). Bounds `[0, 1_048_576]`. `DEFAULT_MEMO_CAP = 1024`
   * ships as a named constant for ergonomic opt-in.
   *
   * **Eviction policy:** when the cache reaches `cap` entries, the
   * oldest-INSERTED entry is dropped to make room for the new one. Reads do
   * NOT promote entries (this is FIFO, not LRU). For typical
   * unit-conversion workloads (small repeating value sets), FIFO is
   * indistinguishable from LRU; the per-hit path stays as cheap as possible
   * (no delete-and-reinsert).
   *
   * **Implementation note:** backed by `Map` (the only JS primitive offering
   * both key→value lookup and insertion-order iteration); `cap` bounds entry
   * count, not byte size.
   */
  memoize?: number;
}
