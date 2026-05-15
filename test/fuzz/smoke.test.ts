import { describe, it } from 'bun:test';
import fc from 'fast-check';
import { defineConversion, defineUnit, forge } from '../../src/index.js';
import { foot, meter } from '../../src/kits/geometry/index.js';

// Smoke fuzz: arbitrary garbage in, only `Error` instances out (or a
// valid value). Catches the regression class where a hostile input
// causes a non-Error throw (string, number, undefined). Also the
// minimum surface OpenSSF Scorecard's Fuzzing check looks at to credit
// the repo.

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
