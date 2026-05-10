import { describe, expect, it } from 'bun:test';
import { areaFromLengthAndWidth } from '../src/conversions/areaFromLengthAndWidth.js';
import { AREA, LENGTH } from '../src/dimensions.js';
import { defineConversion, defineUnit, forge, linear, ValidationError } from '../src/index.js';
import { centimeter, meter, squareMeter } from '../src/kits/geometry/index.js';

describe('linear()', () => {
  it('returns a toBase/fromBase pair that round-trips', () => {
    const { toBase, fromBase } = linear(0.3048);
    expect(toBase(5)).toBeCloseTo(1.524, 10);
    expect(fromBase(1.524)).toBeCloseTo(5, 10);
  });
});

describe('defineUnit', () => {
  it('preserves the spec it was given', () => {
    expect(meter.name).toBe('meter');
    expect(meter.dimension).toBe(LENGTH);
    expect(meter.base).toBe(true);
    expect(meter.toBase(7)).toBe(7);
    expect(meter.fromBase(7)).toBe(7);
  });

  it('rejects reserved keys at definition time', () => {
    // Construct a deliberately-misshaped spec with `__proto__` as an OWN
    // enumerable data property (the JSON.parse / Object.defineProperty path).
    // `Object.assign` would invoke the prototype SETTER rather than copying
    // an own property, defeating the test setup.
    const evilSpec: Record<string, unknown> = {
      name: 'evil',
      dimension: LENGTH,
      ...linear(1),
    };
    Object.defineProperty(evilSpec, '__proto__', {
      value: { polluted: true },
      enumerable: true,
      configurable: true,
      writable: true,
    });
    expect(() => defineUnit(evilSpec as unknown as Parameters<typeof defineUnit>[0])).toThrow(
      /Reserved key/,
    );
  });
});

describe('forge: within-dimension', () => {
  it('converts meter to centimeter', () => {
    const toCm = forge(meter, centimeter);
    expect(toCm(1)).toBeCloseTo(100, 10);
    expect(toCm(2.5)).toBeCloseTo(250, 10);
  });

  it('converts centimeter to meter (inverse)', () => {
    const toM = forge(centimeter, meter);
    expect(toM(100)).toBeCloseTo(1, 10);
    expect(toM(250)).toBeCloseTo(2.5, 10);
  });

  it('round-trips: forge(a, b)(forge(b, a)(x)) === x', () => {
    const toCm = forge(meter, centimeter);
    const toM = forge(centimeter, meter);
    for (const v of [0, 1, 2.5, 100, 1234.5678]) {
      expect(toM(toCm(v))).toBeCloseTo(v, 10);
    }
  });

  it('identity: forge(a, a)(x) === x', () => {
    const id = forge(meter, meter);
    expect(id(7)).toBe(7);
    expect(id(0)).toBe(0);
  });

  it('honors precision rounding when set', () => {
    const toCm = forge(meter, centimeter, { precision: 1 });
    // 1.5678 m -> 156.78 cm -> rounded to 1 decimal = 156.8
    expect(toCm(1.5678)).toBe(156.8);
  });
});

describe('forge: cross-dimensional (object input, single output)', () => {
  it('computes area = length × width in base units', () => {
    const toArea = forge({ length: meter, width: meter }, squareMeter, {
      via: areaFromLengthAndWidth,
    });
    expect(toArea({ length: 5, width: 3 })).toBeCloseTo(15, 10);
  });

  it('handles mixed input units via toBase normalization', () => {
    // length in cm, width in m — both normalize to meters before compute.
    const toArea = forge({ length: centimeter, width: meter }, squareMeter, {
      via: areaFromLengthAndWidth,
    });
    // 200 cm = 2 m; width 3 m; area = 6 m²
    expect(toArea({ length: 200, width: 3 })).toBeCloseTo(6, 10);
  });

  it('aggregates validator failures into one ValidationError', () => {
    const toArea = forge({ length: meter, width: meter }, squareMeter, {
      via: areaFromLengthAndWidth,
    });
    let caught: unknown;
    try {
      toArea({ length: -5, width: -3 });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ValidationError);
    const ve = caught as ValidationError;
    expect(ve.failures).toHaveLength(2);
    expect(ve.failures.map((f) => f.key).sort()).toEqual(['length', 'width']);
    for (const f of ve.failures) {
      expect(f.stage).toBe('definition');
    }
  });

  it('respects call-site validators (additive on top of conversion validators)', () => {
    const toArea = forge({ length: meter, width: meter }, squareMeter, {
      via: areaFromLengthAndWidth,
      validate: { length: (v) => v <= 10 || 'this app caps length at 10' },
    });
    let caught: unknown;
    try {
      toArea({ length: 100, width: 5 });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ValidationError);
    const ve = caught as ValidationError;
    expect(ve.failures).toHaveLength(1);
    expect(ve.failures[0]?.stage).toBe('call-site');
    expect(ve.failures[0]?.message).toMatch(/caps length at 10/);
  });

  it('memoize: cache hits return the same value without re-running compute', () => {
    let computeCalls = 0;
    const trackedConversion = defineConversion({
      inputs: { length: LENGTH, width: LENGTH },
      output: AREA,
      compute: ({ length, width }) => {
        computeCalls++;
        return length * width;
      },
    });
    const toArea = forge({ length: meter, width: meter }, squareMeter, {
      via: trackedConversion,
      memoize: 16,
    });
    expect(toArea({ length: 5, width: 3 })).toBeCloseTo(15, 10);
    expect(toArea({ length: 5, width: 3 })).toBeCloseTo(15, 10);
    expect(toArea({ length: 5, width: 3 })).toBeCloseTo(15, 10);
    expect(computeCalls).toBe(1);
  });
});

describe('forge: configuration validation', () => {
  it('throws on object-shape from without via', () => {
    // The overloaded forge() signature would correctly reject this at compile
    // time; @ts-expect-error documents the deliberate runtime misuse.
    expect(() =>
      // @ts-expect-error: object-shape from requires `via:` in ForgeConfig
      forge({ length: meter, width: meter }, squareMeter),
    ).toThrow(/no `via:`/);
  });

  it('throws on out-of-range memoize', () => {
    expect(() => forge(meter, centimeter, { memoize: -1 })).toThrow(/memoize/);
    expect(() => forge(meter, centimeter, { memoize: 1.5 })).toThrow(/memoize/);
  });

  it('throws on negative precision', () => {
    expect(() => forge(meter, centimeter, { precision: -1 })).toThrow(/precision/);
  });
});
