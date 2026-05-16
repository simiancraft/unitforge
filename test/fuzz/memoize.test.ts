import { describe, expect, it } from 'bun:test';
import fc from 'fast-check';
import { forge } from '../../src/index.js';
import { foot, meter } from '../../src/kits/geometry/index.js';

// Memoize properties. The cache is an FIFO bounded Map keyed by a
// deterministic stringification of inputs; identical input → identical
// output regardless of memoize cap, and the cap value itself must not
// influence outputs (only timing).

const finiteFloat = fc
  .double({ noNaN: true, noDefaultInfinity: true, min: -1e9, max: 1e9 })
  .filter((v) => v === 0 || Math.abs(v) >= 1e-200);

// Normalize -0 to +0 for comparison. The memoize cache hashes via
// String(value), so +0 and -0 collide on the same key; the cached
// output is whichever sign was inserted first, which can diverge from
// a freshly-computed sign on a sibling converter. Mathematically the
// values are equal (0 === -0 is true; Object.is(0, -0) is false), and
// `toBe` uses Object.is. Normalize at the comparison site so the
// property is "outputs are mathematically equivalent" rather than
// "outputs are bit-identical including sign of zero."
function normZero(n: number): number {
  return n === 0 ? 0 : n;
}

describe('forge: memoize identity', () => {
  it('memoize:N matches memoize off for identical inputs', () => {
    const memoOff = forge(meter, foot);
    const memoOn = forge(meter, foot, { memoize: 32 });
    fc.assert(
      fc.property(finiteFloat, (x) => {
        expect(normZero(memoOn(x))).toBe(normZero(memoOff(x)));
      }),
      { numRuns: 1000 },
    );
  });

  it('repeated calls with the same input return the same value', () => {
    const convert = forge(meter, foot, { memoize: 16 });
    fc.assert(
      fc.property(finiteFloat, (x) => {
        const a = convert(x);
        const b = convert(x);
        const c = convert(x);
        expect(a).toBe(b);
        expect(b).toBe(c);
      }),
      { numRuns: 1000 },
    );
  });

  it('different memoize caps produce identical outputs', () => {
    const caps = [1, 4, 16, 256, 4096];
    const converters = caps.map((cap) => forge(meter, foot, { memoize: cap }));
    fc.assert(
      fc.property(finiteFloat, (x) => {
        const results = converters.map((c) => normZero(c(x)));
        const first = results[0] ?? 0;
        for (const r of results) expect(r).toBe(first);
      }),
      { numRuns: 500 },
    );
  });
});

describe('forge: memoize eviction does not corrupt results', () => {
  it('with a tiny cap, output is still correct after eviction churn', () => {
    // Cap of 1 forces eviction on every fresh input. Output must remain
    // identical to the memoize-off path regardless.
    const memoOff = forge(meter, foot);
    const memoTiny = forge(meter, foot, { memoize: 1 });
    fc.assert(
      fc.property(fc.array(finiteFloat, { minLength: 2, maxLength: 20 }), (xs) => {
        for (const x of xs) {
          expect(normZero(memoTiny(x))).toBe(normZero(memoOff(x)));
        }
      }),
      { numRuns: 200 },
    );
  });
});
