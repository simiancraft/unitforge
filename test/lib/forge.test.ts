import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';
import { foot, meter } from '../../src/kits/geometry/index.js';

// Targeted tests against forge.ts mutants that the fuzz + integration
// suite couldn't reach. Each describe block names the specific mutator
// class it closes against; tests assert the exact behavior the mutated
// code WOULDN'T exhibit (an error class, an error-message fragment, a
// rejection path).

describe('forge: rejects null/undefined as a Unit', () => {
  // Optional chaining inside isUnitLike protects against null/undefined
  // hitting the within-dim path. Without it, isUnitLike(null) would
  // crash on a .toBase property access; the cross-dim path's later
  // Object.keys(null) throw is the wrong surface for "null isn't a
  // unit." These tests pin the rejection at the forge() entry boundary.
  it('throws when `from` is null', () => {
    expect(() => forge(null as never, foot)).toThrow();
  });

  it('throws when `to` is null', () => {
    expect(() => forge(meter, null as never)).toThrow();
  });

  it('throws when `from` is undefined', () => {
    expect(() => forge(undefined as never, foot)).toThrow();
  });
});

describe('forge: isUnitLike duck-type rejection', () => {
  // An object with `fromBase` but NO `toBase` fails the toBase guard.
  // If the guard is mutated to `true`, the object routes through
  // within-dim; calling `obj.toBase(value)` then throws TypeError. The
  // original routes through cross-dim → no-via error.
  it('rejects a `from` object that has fromBase but no toBase', () => {
    const halfUnit = { fromBase: (b: number) => b };
    expect(() => forge(halfUnit as never, foot)).toThrow(/object-shaped `from` with no `via:`/);
  });

  // Symmetric: object with toBase but no fromBase. Kills the fromBase
  // guard mutation.
  it('rejects a `to` object that has toBase but no fromBase', () => {
    const halfUnit = { toBase: (v: number) => v };
    expect(() => forge(meter, halfUnit as never)).toThrow(/object-shaped `from` with no `via:`/);
  });
});

describe('forge: cross-dim no-via error message content', () => {
  // Kills the StringLiteral mutations that strip the keys list and the
  // helpful sentence out of the error.
  it('error message lists the keys of `from`', () => {
    expect(() => forge({ length: meter, width: meter } as never, foot)).toThrow(/length/);
    expect(() => forge({ length: meter, width: meter } as never, foot)).toThrow(/width/);
  });

  it('error message joins keys with ", "', () => {
    try {
      forge({ length: meter, width: meter } as never, foot);
    } catch (err) {
      if (!(err instanceof Error)) throw err;
      // The keys list renders as `{ length, width }` with ", " between.
      // (`Object.keys` gives insertion order, which here matches the
      // literal source order.)
      expect(err.message).toContain('length, width');
    }
  });

  it('error message includes the "Cross-dimensional forging requires" sentence', () => {
    expect(() => forge({ length: meter } as never, foot)).toThrow(
      /Cross-dimensional forging requires a defineConversion value passed as `via:`/,
    );
  });
});

describe('forge: precision is applied through the memoize-on path', () => {
  // After the buildUnaryConverter collapse the mutation-test surface
  // for precision rounding lives in a single roundIfNumber call. This
  // test exercises memoize-on + precision-set together so that any
  // mutation removing or flipping that rounding is caught.
  it('rounds the result on memoize-on cache miss', () => {
    const c = forge(meter, foot, { precision: 2, memoize: 16 }) as (v: number) => number;
    // 1.23456789 m → ~4.0498... ft; precision: 2 → 4.05.
    expect(c(1.23456789)).toBe(4.05);
  });

  it('rounds the result on memoize-on cache hit (cache stores rounded values)', () => {
    const c = forge(meter, foot, { precision: 2, memoize: 16 }) as (v: number) => number;
    const first = c(1.23456789);
    const second = c(1.23456789);
    expect(first).toBe(4.05);
    expect(second).toBe(first);
  });
});

describe('forge: validatePrecision range edge cases', () => {
  // Kills the `||` → `&&` mutation in the precision range check: with
  // && instead of ||, a non-integer NUMBER (e.g., 1.5) would slip past
  // (typeof === 'number' is true, so the first clause is false in the
  // mutated form, which short-circuits the && before reaching the
  // !Number.isInteger check).
  it('rejects a non-integer number', () => {
    expect(() => forge(meter, foot, { precision: 1.5 })).toThrow(
      /precision must be a non-negative integer/,
    );
  });

  it('rejects NaN', () => {
    expect(() => forge(meter, foot, { precision: Number.NaN })).toThrow(
      /precision must be a non-negative integer/,
    );
  });

  it('rejects Infinity', () => {
    expect(() => forge(meter, foot, { precision: Number.POSITIVE_INFINITY })).toThrow(
      /precision must be a non-negative integer/,
    );
  });

  it('accepts precision = 0', () => {
    // Boundary; must NOT throw. precision: 0 means "round to integer."
    expect(() => forge(meter, foot, { precision: 0 })).not.toThrow();
  });
});
