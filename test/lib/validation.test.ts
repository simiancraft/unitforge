import { describe, expect, it } from 'bun:test';
import { AREA, LENGTH } from '../../src/dimensions.js';
import { defineConversion, forge, ValidationError } from '../../src/index.js';
import { meter, squareMeter } from '../../src/kits/geometry/index.js';

// Targeted unit tests against ValidationError + runValidators behaviors
// that the mutation-testing baseline flagged as under-asserted. Each
// test pins a specific invariant the fuzz suite implies but doesn't
// directly check (error.name string, frozen failures/inputs, _all
// validator invocation, throwing validator catch path, message text,
// defensive snapshotting, sorted key order, non-function validator
// silent-skip, per-type value formatting).

const conversionWithBothValidatorKinds = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH },
  output: AREA,
  validate: {
    length: (v) => (typeof v === 'number' && v >= 0 ? true : 'length must be >= 0'),
    _all: () => 'all-rejected',
  },
  compute: ({ length }) => length * length,
});

const conversionWithThrowingValidator = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH },
  output: AREA,
  validate: {
    length: () => {
      throw new Error('boom');
    },
  },
  compute: ({ length }) => length * length,
});

// Helper: trigger the validator-error path with one or more failing
// inputs; return the thrown ValidationError. Keeps each test's body
// focused on assertions rather than try/catch ceremony.
function expectValidationError(
  convert: (input: Record<string, unknown>) => unknown,
  input: Record<string, unknown>,
): ValidationError {
  try {
    convert(input);
  } catch (err) {
    if (err instanceof ValidationError) return err;
    throw err;
  }
  throw new Error('expected ValidationError; converter returned without throwing');
}

// Forge a converter with the always-reject conversion above.
const bothKinds = forge({ length: meter }, squareMeter, {
  via: conversionWithBothValidatorKinds,
}) as (input: Record<string, unknown>) => unknown;

describe('ValidationError shape', () => {
  it('sets name to "ValidationError" exactly', () => {
    const err = expectValidationError(bothKinds, { length: -1 });
    expect(err.name).toBe('ValidationError');
  });

  it('freezes failures array', () => {
    const err = expectValidationError(bothKinds, { length: -1 });
    expect(Object.isFrozen(err.failures)).toBe(true);
  });

  it('freezes inputs snapshot', () => {
    const err = expectValidationError(bothKinds, { length: -1 });
    expect(Object.isFrozen(err.inputs)).toBe(true);
  });

  it('error message includes the "[unitforge] validation failed" prefix', () => {
    const err = expectValidationError(bothKinds, { length: -1 });
    expect(err.message).toContain('[unitforge] validation failed');
  });

  it('error message includes each failure stage and key', () => {
    const err = expectValidationError(bothKinds, { length: -1 });
    expect(err.message).toContain('definition.length');
    expect(err.message).toContain('definition._all');
  });

  it('snapshots failures defensively; mutating the source array does not leak in', () => {
    // ValidationError's constructor receives a failures slice from the
    // converter's internal aggregation. The constructor must own its
    // own copy; any subsequent push to the source must NOT alter
    // err.failures. Kills the `failures.slice()` → `failures` mutation.
    const source = [{ key: 'a', stage: 'definition' as const, value: 1, message: 'reject' }];
    const err = new ValidationError(source, {});
    source.push({ key: 'b', stage: 'definition', value: 2, message: 'late-add' });
    expect(err.failures.length).toBe(1);
    expect(err.failures[0]?.key).toBe('a');
  });
});

describe('runValidators: _all validator', () => {
  it('runs once per input, not once per key', () => {
    let allCount = 0;
    const conversion = defineConversion({
      inputs: { length: LENGTH, width: LENGTH },
      output: AREA,
      validate: {
        _all: () => {
          allCount += 1;
          return 'reject';
        },
      },
      compute: ({ length, width }) => length * width,
    });
    const convert = forge({ length: meter, width: meter }, squareMeter, { via: conversion }) as (
      input: Record<string, unknown>,
    ) => unknown;
    expectValidationError(convert, { length: 1, width: 1 });
    expect(allCount).toBe(1);
  });
});

describe('runValidators: throwing validator', () => {
  it('captures the thrown Error as a failure with cause preserved', () => {
    const convert = forge({ length: meter }, squareMeter, {
      via: conversionWithThrowingValidator,
    }) as (input: Record<string, unknown>) => unknown;
    const err = expectValidationError(convert, { length: 1 });
    const lengthFailure = err.failures.find((f) => f.key === 'length');
    expect(lengthFailure).toBeDefined();
    expect(lengthFailure?.message).toBe('boom');
    expect(lengthFailure?.cause).toBeInstanceOf(Error);
  });

  it('captures non-Error thrown values via String coercion', () => {
    const throwsString = defineConversion({
      inputs: { length: LENGTH },
      output: AREA,
      validate: {
        length: () => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw 'string-throw-payload';
        },
      },
      compute: ({ length }) => length * length,
    });
    const convert = forge({ length: meter }, squareMeter, { via: throwsString }) as (
      input: Record<string, unknown>,
    ) => unknown;
    const err = expectValidationError(convert, { length: 1 });
    const failure = err.failures.find((f) => f.key === 'length');
    expect(failure?.message).toBe('string-throw-payload');
  });
});

describe('runValidators: non-function validator values', () => {
  it('silently skips non-function entries instead of throwing', () => {
    // The runtime contract allows runValidators's vmap to be received
    // unsafely (call-site validators are user-controlled). Any non-
    // function value at a per-field key must be silently skipped, NOT
    // throw a TypeError. Kills the `typeof fn !== 'function'` → false
    // mutation (which would call non-functions and TypeError out).
    const conversion = defineConversion({
      inputs: { length: LENGTH },
      output: AREA,
      validate: {
        length: (v) => (typeof v === 'number' && v >= 0 ? true : 'always reject'),
      },
      compute: ({ length }) => length * length,
    });
    const convert = forge({ length: meter }, squareMeter, {
      via: conversion,
      validate: {
        // null in the validator slot — must be skipped, not invoked.
        length: null as unknown as (v: unknown) => string | true,
      },
    }) as (input: Record<string, unknown>) => unknown;
    // Passing -1 triggers the definition-stage rejection; the call-
    // site `length: null` must NOT itself produce a TypeError.
    const err = expectValidationError(convert, { length: -1 });
    expect(err.failures.length).toBeGreaterThan(0);
    expect(err.failures.every((f) => f.stage === 'definition')).toBe(true);
  });
});

describe('ValidationError message formatting', () => {
  it('renders empty inputs as {}', () => {
    const err = new ValidationError(
      [{ key: 'x', stage: 'definition', value: 1, message: 'reject' }],
      {},
    );
    expect(err.message).toContain('{}');
  });

  it('sorts input keys alphabetically in the head summary', () => {
    // Kills the `Object.keys(inputs).sort()` → `Object.keys(inputs)`
    // mutation: with a multi-key input whose insertion order disagrees
    // with alphabetical order, the message must still surface keys
    // alphabetically.
    const err = new ValidationError(
      [{ key: 'zebra', stage: 'definition', value: 1, message: 'reject' }],
      { zebra: 1, apple: 2, mango: 3 },
    );
    const head = err.message.split('\n')[0] ?? '';
    const appleIdx = head.indexOf('apple');
    const mangoIdx = head.indexOf('mango');
    const zebraIdx = head.indexOf('zebra');
    expect(appleIdx).toBeGreaterThan(-1);
    expect(mangoIdx).toBeGreaterThan(appleIdx);
    expect(zebraIdx).toBeGreaterThan(mangoIdx);
  });

  it('joins head input fields with ", "', () => {
    const err = new ValidationError(
      [{ key: 'a', stage: 'definition', value: 1, message: 'reject' }],
      { a: 1, b: 2 },
    );
    // ", " separator between key:value pairs in the head summary.
    expect(err.message).toContain('a: 1, b: 2');
  });

  it('joins head and failure lines with "\\n"', () => {
    const err = new ValidationError(
      [{ key: 'a', stage: 'definition', value: 1, message: 'reject' }],
      { a: 1 },
    );
    expect(err.message.split('\n').length).toBeGreaterThanOrEqual(2);
  });

  it('renders single failure with the per-line dash prefix', () => {
    const err = expectValidationError(bothKinds, { length: -1 });
    expect(err.message).toContain('  - ');
  });

  it('formats numeric inputs without quotes', () => {
    const err = expectValidationError(bothKinds, { length: -42 });
    expect(err.message).toContain('length: -42');
  });

  it('formats string inputs with JSON quotes', () => {
    const acceptAny = defineConversion({
      inputs: { length: LENGTH },
      output: AREA,
      validate: { length: () => 'always reject' },
      compute: ({ length }) => length * length,
    });
    const convert = forge({ length: meter }, squareMeter, { via: acceptAny }) as (
      input: Record<string, unknown>,
    ) => unknown;
    const err = expectValidationError(convert, { length: 'oops' });
    expect(err.message).toContain('"oops"');
  });
});

describe('ValidationError per-value type formatting', () => {
  // Each test asserts stringifyValue's output for a specific value
  // type, which kills the switch-case StringLiteral mutants in
  // src/lib/validation.ts:170-185.
  const acceptAny = /*#__PURE__*/ defineConversion({
    inputs: { x: LENGTH },
    output: AREA,
    validate: { x: () => 'reject' },
    compute: ({ x }) => x * x,
  });
  const convert = forge({ x: meter }, squareMeter, { via: acceptAny }) as (
    input: Record<string, unknown>,
  ) => unknown;

  it('renders null as "null"', () => {
    const err = expectValidationError(convert, { x: null });
    expect(err.message).toContain('x: null');
  });

  it('renders undefined as "undefined"', () => {
    const err = expectValidationError(convert, { x: undefined });
    expect(err.message).toContain('x: undefined');
  });

  it('renders boolean as String(true)/String(false)', () => {
    const t = expectValidationError(convert, { x: true });
    const f = expectValidationError(convert, { x: false });
    expect(t.message).toContain('x: true');
    expect(f.message).toContain('x: false');
  });

  it('renders bigint with the "n" suffix', () => {
    const err = expectValidationError(convert, { x: 42n });
    expect(err.message).toContain('x: 42n');
  });

  it('renders symbol via Symbol.toString()', () => {
    const sym = Symbol('marker');
    const err = expectValidationError(convert, { x: sym });
    expect(err.message).toContain('Symbol(marker)');
  });

  it('renders function as "[Function]"', () => {
    const err = expectValidationError(convert, { x: () => 1 });
    expect(err.message).toContain('x: [Function]');
  });

  it('renders nested object as "[Object]"', () => {
    const err = expectValidationError(convert, { x: { nested: 1 } });
    expect(err.message).toContain('x: [Object]');
  });
});
