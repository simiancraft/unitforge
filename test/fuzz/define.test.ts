import { describe, expect, it } from 'bun:test';
import fc from 'fast-check';
import { LENGTH } from '../../src/dimensions.js';
import { defineUnit, linear } from '../../src/index.js';
import { RESERVED_PROTO_KEYS } from '../../src/lib/safeCopy.js';

// defineUnit / defineConversion hygiene properties. The factories must
// reject prototype-pollution keys at definition time AND preserve
// well-formed specs unchanged structurally; arbitrary garbage that
// passes the type system shouldn't crash the factory with anything
// other than an Error.

const reservedKey = fc.constantFrom(...Array.from(RESERVED_PROTO_KEYS));

describe('defineUnit: prototype-pollution rejection', () => {
  it('rejects any reserved key forced as an own enumerable property', () => {
    fc.assert(
      fc.property(reservedKey, fc.string({ minLength: 1, maxLength: 8 }), (key, idSuffix) => {
        const spec: Record<string, unknown> = {
          id: `evil-${idSuffix}`,
          label: 'Evil',
          symbol: 'evil',
          dimension: LENGTH,
          ...linear(1),
        };
        Object.defineProperty(spec, key, {
          value: { polluted: true },
          enumerable: true,
          configurable: true,
          writable: true,
        });
        expect(() => defineUnit(spec as unknown as Parameters<typeof defineUnit>[0])).toThrow(
          /Reserved key/,
        );
      }),
      { numRuns: 200 },
    );
  });
});

describe('defineUnit: round-trip from arbitrary scales', () => {
  it('linear(scale) produces a unit whose toBase/fromBase invert', () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true, noDefaultInfinity: true, min: 1e-3, max: 1e9 }),
        fc.double({ noNaN: true, noDefaultInfinity: true, min: -1e6, max: 1e6 }),
        (scale, value) => {
          // Skip Float64 underflow + subnormal cases. fc.double can
          // generate any double in the bounded range including
          // subnormals (|v| below ~2.2e-308), where multiplication and
          // division lose precision irrecoverably. That's a Float64
          // limit, not a unitforge invariant violation.
          if (value !== 0 && Math.abs(value) < 1e-200) return;
          const base = value * scale;
          if (value !== 0 && base === 0) return;
          if (!Number.isFinite(base)) return;
          if (base !== 0 && Math.abs(base) < 1e-200) return;
          const u = defineUnit({
            id: `u-${scale}`,
            label: 'U',
            symbol: 'u',
            dimension: LENGTH,
            ...linear(scale),
          });
          const round = u.fromBase(u.toBase(value));
          if (value === 0) {
            expect(round).toBeCloseTo(0, 10);
          } else {
            expect(Math.abs(round - value) / Math.abs(value)).toBeLessThan(1e-9);
          }
        },
      ),
      { numRuns: 500 },
    );
  });
});
