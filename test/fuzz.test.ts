import { describe, it } from 'bun:test';
import fc from 'fast-check';
import { defineConversion, defineUnit, forge } from '../src/index.js';
import { foot, meter } from '../src/kits/geometry/index.js';

// Property-based smoke tests for the core public API (`forge`,
// `defineUnit`, `defineConversion`). Each property asserts the function
// either returns or throws an `Error` instance; never crashes, hangs,
// or throws a non-Error value across 1000 arbitrary inputs per run.
// Also satisfies OpenSSF Scorecard's Fuzzing check, which credits the
// presence of a fast-check property assertion.

describe('forge fuzz', () => {
  it('forge(meter, foot)(arbitrary) only throws Error instances', () => {
    const convert = forge(meter, foot);
    fc.assert(
      fc.property(fc.anything(), (input) => {
        try {
          convert(input as never);
        } catch (e) {
          if (!(e instanceof Error)) throw e;
        }
      }),
      { numRuns: 1000 },
    );
  });
});

describe('defineUnit fuzz', () => {
  it('only throws Error instances on arbitrary spec input', () => {
    fc.assert(
      fc.property(fc.anything(), (spec) => {
        try {
          defineUnit(spec as never);
        } catch (e) {
          if (!(e instanceof Error)) throw e;
        }
      }),
      { numRuns: 1000 },
    );
  });
});

describe('defineConversion fuzz', () => {
  it('only throws Error instances on arbitrary spec input', () => {
    fc.assert(
      fc.property(fc.anything(), (spec) => {
        try {
          defineConversion(spec as never);
        } catch (e) {
          if (!(e instanceof Error)) throw e;
        }
      }),
      { numRuns: 1000 },
    );
  });
});
