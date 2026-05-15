import { describe, expect, it } from 'bun:test';
import { AREA, LENGTH } from '../../src/dimensions.js';
import { defineConversion, forge, ValidationError } from '../../src/index.js';
import { meter, squareMeter } from '../../src/kits/geometry/index.js';

// Targeted unit tests against ValidationError + runValidators behaviors
// that the mutation-testing baseline flagged as under-asserted. Each
// test pins a specific invariant the fuzz suite implies but doesn't
// directly check (error.name string, frozen failures/inputs, _all
// validator invocation, throwing validator catch path, message text).

const conversionWithBothValidatorKinds = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH },
  output: AREA,
  validate: {
    // Per-field validator that rejects negatives.
    length: (v) => (typeof v === 'number' && v >= 0 ? true : 'length must be >= 0'),
    // _all validator that rejects whole input.
    _all: () => 'all-rejected',
  },
  compute: ({ length }) => length * length,
});

const conversionWithThrowingValidator = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH },
  output: AREA,
  validate: {
    length: () => {
      // Throws an Error object (not a string return) so runOne's catch
      // path is exercised; the cause must propagate to the failure
      // record.
      throw new Error('boom');
    },
  },
  compute: ({ length }) => length * length,
});

describe('ValidationError shape', () => {
  it('sets name to "ValidationError" exactly', () => {
    const convert = forge({ length: meter }, squareMeter, {
      via: conversionWithBothValidatorKinds,
    });
    try {
      convert({ length: -1 });
      throw new Error('expected ValidationError');
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      expect(err.name).toBe('ValidationError');
    }
  });

  it('freezes failures array; mutation attempt is rejected', () => {
    const convert = forge({ length: meter }, squareMeter, {
      via: conversionWithBothValidatorKinds,
    });
    try {
      convert({ length: -1 });
      throw new Error('expected ValidationError');
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      expect(Object.isFrozen(err.failures)).toBe(true);
    }
  });

  it('freezes inputs snapshot; mutation attempt is rejected', () => {
    const convert = forge({ length: meter }, squareMeter, {
      via: conversionWithBothValidatorKinds,
    });
    try {
      convert({ length: -1 });
      throw new Error('expected ValidationError');
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      expect(Object.isFrozen(err.inputs)).toBe(true);
    }
  });

  it('error message includes the "[unitforge] validation failed" prefix', () => {
    const convert = forge({ length: meter }, squareMeter, {
      via: conversionWithBothValidatorKinds,
    });
    try {
      convert({ length: -1 });
      throw new Error('expected ValidationError');
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      expect(err.message).toContain('[unitforge] validation failed');
    }
  });

  it('error message includes each failure stage and key', () => {
    const convert = forge({ length: meter }, squareMeter, {
      via: conversionWithBothValidatorKinds,
    });
    try {
      convert({ length: -1 });
      throw new Error('expected ValidationError');
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      expect(err.message).toContain('definition.length');
      expect(err.message).toContain('definition._all');
    }
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
    const convert = forge({ length: meter, width: meter }, squareMeter, { via: conversion });
    try {
      convert({ length: 1, width: 1 });
    } catch {
      // expected
    }
    expect(allCount).toBe(1);
  });
});

describe('runValidators: throwing validator', () => {
  it('captures the thrown Error as a failure with cause preserved', () => {
    const convert = forge({ length: meter }, squareMeter, {
      via: conversionWithThrowingValidator,
    });
    try {
      convert({ length: 1 });
      throw new Error('expected ValidationError');
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      const lengthFailure = err.failures.find((f) => f.key === 'length');
      expect(lengthFailure).toBeDefined();
      expect(lengthFailure?.message).toBe('boom');
      expect(lengthFailure?.cause).toBeInstanceOf(Error);
    }
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
    const convert = forge({ length: meter }, squareMeter, { via: throwsString });
    try {
      convert({ length: 1 });
      throw new Error('expected ValidationError');
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      const failure = err.failures.find((f) => f.key === 'length');
      expect(failure?.message).toBe('string-throw-payload');
    }
  });
});

describe('ValidationError message formatting', () => {
  it('renders empty inputs as {}', () => {
    // Construct a ValidationError directly so we can pass an empty
    // inputs map (a forge-level call always has keys, so the {} branch
    // is reachable only via direct construction).
    const err = new ValidationError(
      [{ key: 'x', stage: 'definition', value: 1, message: 'reject' }],
      {},
    );
    expect(err.message).toContain('{}');
  });

  it('renders single failure with the per-line dash prefix', () => {
    const convert = forge({ length: meter }, squareMeter, {
      via: conversionWithBothValidatorKinds,
    });
    try {
      convert({ length: -1 });
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      // Per-failure lines are formatted as "  - <stage>.<key> (saw ...): <message>".
      expect(err.message).toContain('  - ');
    }
  });

  it('formats numeric inputs without quotes', () => {
    const convert = forge({ length: meter }, squareMeter, {
      via: conversionWithBothValidatorKinds,
    });
    try {
      convert({ length: -42 });
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      expect(err.message).toContain('length: -42');
    }
  });

  it('formats string inputs with JSON quotes', () => {
    const acceptAny = defineConversion({
      inputs: { length: LENGTH },
      output: AREA,
      validate: { length: () => 'always reject' },
      compute: ({ length }) => length * length,
    });
    const convert = forge({ length: meter }, squareMeter, { via: acceptAny });
    try {
      convert({ length: 'oops' as unknown as number });
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      // String input rendered through stringifyValue → JSON.stringify.
      expect(err.message).toContain('"oops"');
    }
  });
});
