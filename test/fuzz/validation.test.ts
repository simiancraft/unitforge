import { describe, expect, it } from 'bun:test';
import fc from 'fast-check';
import { AREA, LENGTH } from '../../src/dimensions.js';
import { defineConversion, forge, ValidationError } from '../../src/index.js';
import { meter, squareMeter } from '../../src/kits/geometry/index.js';

// Validation properties. A validator that always rejects must produce
// a ValidationError on every input; the failures array must include the
// rejecting validator's key.

const alwaysRejectLength = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH },
  output: AREA,
  validate: {
    length: () => 'always rejected',
  },
  compute: ({ length }) => length * length,
});

const validValidatorReturnsTrue = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH },
  output: AREA,
  validate: {
    length: () => true,
  },
  compute: ({ length }) => length * length,
});

const anyFiniteInput = fc.double({
  noNaN: true,
  noDefaultInfinity: true,
  min: -1e6,
  max: 1e6,
});

describe('forge: always-reject validator', () => {
  it('throws ValidationError for every input', () => {
    const convert = forge({ length: meter }, squareMeter, { via: alwaysRejectLength });
    fc.assert(
      fc.property(anyFiniteInput, (length) => {
        try {
          convert({ length });
          throw new Error('expected ValidationError but none thrown');
        } catch (err) {
          expect(err).toBeInstanceOf(ValidationError);
        }
      }),
      { numRuns: 500 },
    );
  });

  it('failures array contains the rejecting validator key', () => {
    const convert = forge({ length: meter }, squareMeter, { via: alwaysRejectLength });
    fc.assert(
      fc.property(anyFiniteInput, (length) => {
        try {
          convert({ length });
        } catch (err) {
          if (!(err instanceof ValidationError)) throw err;
          const keys = err.failures.map((f) => f.key);
          expect(keys).toContain('length');
        }
      }),
      { numRuns: 200 },
    );
  });
});

describe('forge: passing validator does not throw', () => {
  it('validator returning true accepts every input', () => {
    const convert = forge({ length: meter }, squareMeter, { via: validValidatorReturnsTrue });
    fc.assert(
      fc.property(anyFiniteInput, (length) => {
        const out = convert({ length });
        expect(typeof out).toBe('number');
      }),
      { numRuns: 500 },
    );
  });
});

describe('forge: call-site validator stacks with conversion validator', () => {
  it('both stages contribute failures', () => {
    const convert = forge({ length: meter }, squareMeter, {
      via: alwaysRejectLength,
      validate: {
        length: () => 'also rejected at call site',
      },
    });
    fc.assert(
      fc.property(anyFiniteInput, (length) => {
        try {
          convert({ length });
        } catch (err) {
          if (!(err instanceof ValidationError)) throw err;
          const stages = err.failures.map((f) => f.stage);
          expect(stages).toContain('call-site');
          expect(stages).toContain('definition');
        }
      }),
      { numRuns: 200 },
    );
  });
});
