import { describe, expect, it } from 'bun:test';
import fc from 'fast-check';
import { forge } from '../../src/index.js';
import {
  areaFromRectangleLengthAndWidth,
  meter,
  squareMeter,
} from '../../src/kits/geometry/index.js';

// Cross-dimensional property tests. The `via` path runs the user's
// compute function after normalizing inputs to base units; properties
// here exercise that path against a known-monotone conversion
// (rectangle area = length × width).

const nonNegFinite = fc.double({
  noNaN: true,
  noDefaultInfinity: true,
  min: 0,
  max: 1e6,
});

describe('forge: cross-dim monotonicity', () => {
  it('rectangle area is non-decreasing as length grows (width fixed)', () => {
    const area = forge({ length: meter, width: meter }, squareMeter, {
      via: areaFromRectangleLengthAndWidth,
    });
    fc.assert(
      fc.property(nonNegFinite, nonNegFinite, nonNegFinite, (w, l1, l2) => {
        const [smaller, larger] = l1 <= l2 ? [l1, l2] : [l2, l1];
        const a1 = area({ length: smaller, width: w });
        const a2 = area({ length: larger, width: w });
        expect(a2).toBeGreaterThanOrEqual(a1);
      }),
      { numRuns: 500 },
    );
  });

  it('rectangle area is non-decreasing as width grows (length fixed)', () => {
    const area = forge({ length: meter, width: meter }, squareMeter, {
      via: areaFromRectangleLengthAndWidth,
    });
    fc.assert(
      fc.property(nonNegFinite, nonNegFinite, nonNegFinite, (l, w1, w2) => {
        const [smaller, larger] = w1 <= w2 ? [w1, w2] : [w2, w1];
        const a1 = area({ length: l, width: smaller });
        const a2 = area({ length: l, width: larger });
        expect(a2).toBeGreaterThanOrEqual(a1);
      }),
      { numRuns: 500 },
    );
  });
});

describe('forge: cross-dim precision-0 returns integers', () => {
  it('precision:0 always returns an integer-valued area', () => {
    const area = forge({ length: meter, width: meter }, squareMeter, {
      via: areaFromRectangleLengthAndWidth,
      precision: 0,
    });
    fc.assert(
      fc.property(nonNegFinite, nonNegFinite, (l, w) => {
        const out = area({ length: l, width: w });
        expect(Number.isInteger(out)).toBe(true);
      }),
      { numRuns: 1000 },
    );
  });
});
