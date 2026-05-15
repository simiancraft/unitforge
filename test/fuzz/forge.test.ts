import { describe, expect, it } from 'bun:test';
import fc from 'fast-check';
import { forge } from '../../src/index.js';
import {
  centimeter,
  foot,
  inch,
  kilometer,
  meter,
  nauticalMile,
} from '../../src/kits/geometry/index.js';

// Within-dimension property tests. The kit's linear-scale converters
// compose through a shared base unit; round-trip and chained composition
// should hold for any finite input modulo Float64 rounding.

/** Finite doubles in a normal-magnitude range. Subnormals (|v| <
 *  ~2.2e-308) are filtered out because Float64 multiplication and
 *  division lose relative precision on them; those are a Float64 limit,
 *  not a unitforge round-trip violation. */
const finiteFloat = fc
  .double({ noNaN: true, noDefaultInfinity: true, min: -1e12, max: 1e12 })
  .filter((v) => v === 0 || Math.abs(v) >= 1e-200);

/** Relative-tolerance check; defaults to 1e-9 of the larger magnitude. */
function expectClose(actual: number, expected: number, rel = 1e-9) {
  if (expected === 0) {
    expect(Math.abs(actual)).toBeLessThan(rel);
    return;
  }
  const denom = Math.max(Math.abs(actual), Math.abs(expected));
  expect(Math.abs(actual - expected) / denom).toBeLessThan(rel);
}

describe('forge: within-dim round-trip', () => {
  it('forge(b, a)(forge(a, b)(x)) ≈ x for any finite x', () => {
    const aToB = forge(meter, foot);
    const bToA = forge(foot, meter);
    fc.assert(
      fc.property(finiteFloat, (x) => {
        const round = bToA(aToB(x));
        expectClose(round, x);
      }),
      { numRuns: 1000 },
    );
  });

  it('round-trip holds across multiple unit pairs', () => {
    const pairs: Array<readonly [typeof meter, typeof meter]> = [
      [meter, kilometer],
      [centimeter, inch],
      [meter, nauticalMile],
      [foot, centimeter],
    ];
    for (const [a, b] of pairs) {
      const ab = forge(a, b);
      const ba = forge(b, a);
      fc.assert(
        fc.property(finiteFloat, (x) => {
          expectClose(ba(ab(x)), x);
        }),
        { numRuns: 500 },
      );
    }
  });
});

describe('forge: within-dim composition', () => {
  it('forge(a, c)(x) ≈ forge(b, c)(forge(a, b)(x))', () => {
    const aToC = forge(meter, nauticalMile);
    const aToB = forge(meter, kilometer);
    const bToC = forge(kilometer, nauticalMile);
    fc.assert(
      fc.property(finiteFloat, (x) => {
        expectClose(aToC(x), bToC(aToB(x)));
      }),
      { numRuns: 1000 },
    );
  });

  it('three-hop chain matches one-hop direct', () => {
    const direct = forge(meter, inch);
    const m2cm = forge(meter, centimeter);
    const cm2ft = forge(centimeter, foot);
    const ft2in = forge(foot, inch);
    fc.assert(
      fc.property(finiteFloat, (x) => {
        expectClose(direct(x), ft2in(cm2ft(m2cm(x))));
      }),
      { numRuns: 500 },
    );
  });
});

describe('forge: precision-0 returns integers', () => {
  it('within-dim with precision:0 always returns an integer', () => {
    const convert = forge(meter, foot, { precision: 0 });
    fc.assert(
      fc.property(finiteFloat, (x) => {
        const out = convert(x);
        expect(Number.isInteger(out)).toBe(true);
      }),
      { numRuns: 1000 },
    );
  });

  it('precision:N rounds to N decimal places (within Float64)', () => {
    const convert = forge(meter, foot, { precision: 3 });
    fc.assert(
      fc.property(
        fc
          .double({ noNaN: true, noDefaultInfinity: true, min: -1e6, max: 1e6 })
          .filter((v) => v === 0 || Math.abs(v) >= 1e-200),
        (x) => {
          const out = convert(x);
          // out * 10^3 should be (within Float64) an integer
          const scaled = out * 1000;
          expect(Math.abs(scaled - Math.round(scaled))).toBeLessThan(1e-6);
        },
      ),
      { numRuns: 1000 },
    );
  });
});
