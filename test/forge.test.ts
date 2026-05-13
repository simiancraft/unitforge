import { describe, expect, it } from 'bun:test';
import { AREA, LENGTH } from '../src/dimensions.js';
import {
  defineConversion,
  defineUnit,
  forge,
  linear,
  ValidationError,
  type ValidationFailure,
} from '../src/index.js';
import {
  areaFromLengthAndWidth,
  centimeter,
  meter,
  squareMeter,
} from '../src/kits/geometry/index.js';
import { RESERVED_PROTO_KEYS } from '../src/lib/safeCopy.js';

describe('linear()', () => {
  it('returns a toBase/fromBase pair that round-trips', () => {
    const { toBase, fromBase } = linear(0.3048);
    expect(toBase(5)).toBeCloseTo(1.524, 10);
    expect(fromBase(1.524)).toBeCloseTo(5, 10);
  });
});

describe('defineUnit', () => {
  it('preserves the spec it was given', () => {
    expect(meter.id).toBe('meter');
    expect(meter.label).toBe('Meter');
    expect(meter.symbol).toBe('m');
    expect(meter.dimension).toBe(LENGTH);
    expect(meter.base).toBe(true);
    expect(meter.toBase(7)).toBe(7);
    expect(meter.fromBase(7)).toBe(7);
  });

  // Iterates RESERVED_PROTO_KEYS itself so the test cannot drift when the set
  // changes. Each key is forced as an OWN enumerable data property
  // (JSON.parse / Object.defineProperty path); a plain spread or Object.assign
  // would invoke the prototype SETTER for `__proto__` rather than copying an
  // own property, defeating the test setup.
  for (const key of RESERVED_PROTO_KEYS) {
    it(`rejects reserved key '${key}' at definition time`, () => {
      const evilSpec: Record<string, unknown> = {
        id: 'evil',
        label: 'Evil',
        symbol: 'evil',
        dimension: LENGTH,
        ...linear(1),
      };
      Object.defineProperty(evilSpec, key, {
        value: { polluted: true },
        enumerable: true,
        configurable: true,
        writable: true,
      });
      expect(() => defineUnit(evilSpec as unknown as Parameters<typeof defineUnit>[0])).toThrow(
        /Reserved key/,
      );
    });
  }
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

  it('freezes inputs and failures at construction (mutation rejected at runtime)', () => {
    const toArea = forge({ length: meter, width: meter }, squareMeter, {
      via: areaFromLengthAndWidth,
    });
    const originalInput = { length: -5, width: -3 };
    let caught: ValidationError | null = null;
    try {
      toArea(originalInput);
    } catch (err) {
      caught = err as ValidationError;
    }
    if (!caught) throw new Error('expected ValidationError');

    // inputs is a frozen DEFENSIVE COPY: mutating it throws in strict mode
    // and never affects the original input object the caller passed.
    expect(Object.isFrozen(caught.inputs)).toBe(true);
    expect(Object.isFrozen(caught.failures)).toBe(true);
    expect(caught.inputs).not.toBe(originalInput);

    // Mutation attempts via TS-readonly cast must fail loudly.
    expect(() => {
      (caught.inputs as Record<string, unknown>).polluted = true;
    }).toThrow();
    expect(() => {
      (caught.failures as ValidationFailure[]).push({
        key: 'fake',
        stage: 'definition',
        value: null,
        message: 'fake',
      });
    }).toThrow();
  });

  it('survives an input with a throwing property getter (safeShallowCopy)', () => {
    // A hostile input whose property getter throws would otherwise crash the
    // ValidationError constructor's defensive copy and mask the real failure.
    // safeShallowCopy catches per-key access throws and substitutes a sentinel.
    const toArea = forge({ length: meter, width: meter }, squareMeter, {
      via: areaFromLengthAndWidth,
    });
    const hostile: Record<string, unknown> = { width: -3 };
    Object.defineProperty(hostile, 'length', {
      enumerable: true,
      configurable: true,
      get: () => {
        throw new Error('gotcha');
      },
    });
    let caught: ValidationError | null = null;
    try {
      toArea(hostile as unknown as { length: number; width: number });
    } catch (err) {
      caught = err instanceof ValidationError ? err : null;
    }
    if (!caught) throw new Error('expected ValidationError; getter throw should not escape');
    expect(caught.inputs.length).toBe('[throwing getter]');
  });

  it('error message handles BigInt and circular refs in input values without throwing', () => {
    const toArea = forge({ length: meter, width: meter }, squareMeter, {
      via: areaFromLengthAndWidth,
    });

    // BigInt would crash JSON.stringify; ensure the per-value formatter handles it.
    expect(() => toArea({ length: 1n as unknown as number, width: -1 })).toThrow();

    // Circular ref would crash JSON.stringify; ensure the per-value formatter handles it.
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => toArea({ length: circular as unknown as number, width: -1 })).toThrow();
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
      // @ts-expect-error: object-shape from requires `via:` in the config
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

describe('forge: within-dim memoize-on (closes coverage on buildUnaryConverter cache path)', () => {
  it('repeated calls with the same value return cached result', () => {
    let toBaseCalls = 0;
    // Tracks only toBase (the FROM unit's `toBase` is what runs in the
    // `fromUnit.toBase(value)` half of the unary path). The TO unit's
    // `fromBase` runs too but that's centimeter, which is shared kit code;
    // verifying toBase-side is sufficient to prove cache hit.
    const trackedMeter = defineUnit({
      id: 'tracked-meter',
      label: 'Tracked Meter',
      symbol: 'm',
      dimension: LENGTH,
      toBase: (v: number) => {
        toBaseCalls++;
        return v;
      },
      fromBase: (b: number) => b,
      base: true,
    });
    const fn = forge(trackedMeter, centimeter, { memoize: 4 });
    expect(fn(1)).toBeCloseTo(100, 9);
    expect(fn(1)).toBeCloseTo(100, 9); // cache hit
    expect(fn(1)).toBeCloseTo(100, 9); // cache hit
    expect(toBaseCalls).toBe(1);
  });

  it('cache key honors precision rounding (rounded inputs collide)', () => {
    let toBaseCalls = 0;
    const trackedMeter = defineUnit({
      id: 'tracked-meter-2',
      label: 'Tracked Meter 2',
      symbol: 'm',
      dimension: LENGTH,
      toBase: (v: number) => {
        toBaseCalls++;
        return v;
      },
      fromBase: (b: number) => b,
      base: true,
    });
    // precision: 0 rounds to integer; 1.4 and 1.3 both round to 1.
    const fn = forge(trackedMeter, centimeter, { memoize: 4, precision: 0 });
    expect(fn(1.4)).toBeCloseTo(140, 9);
    expect(fn(1.3)).toBeCloseTo(140, 9); // cache hit because key rounds to '1'
    expect(toBaseCalls).toBe(1);
  });

  it('writeCache evicts the oldest entry when at cap (FIFO)', () => {
    let toBaseCalls = 0;
    const trackedMeter = defineUnit({
      id: 'tracked-meter-3',
      label: 'Tracked Meter 3',
      symbol: 'm',
      dimension: LENGTH,
      toBase: (v: number) => {
        toBaseCalls++;
        return v;
      },
      fromBase: (b: number) => b,
      base: true,
    });
    const fn = forge(trackedMeter, centimeter, { memoize: 2 });
    fn(1);
    fn(2);
    fn(3); // evicts '1'
    expect(toBaseCalls).toBe(3);
    fn(2); // still cached
    expect(toBaseCalls).toBe(3);
    fn(1); // re-computed (was evicted)
    expect(toBaseCalls).toBe(4);
  });
});

describe('forge: object-shaped output (closes coverage on cross-dim object-output branch)', () => {
  // A synthetic conversion with object output, only used here. The geometry
  // kit's shipped conversions all have scalar output; to exercise the
  // object-output denormalization loop we need a conversion that returns
  // a record. A polar-to-Cartesian (r, θ) → (x, y) split is the canonical
  // shape: takes a single LENGTH input plus a unitless angle (we use a
  // dimensionless scalar by passing it as a LENGTH that just falls through),
  // returns `{ x: LENGTH, y: LENGTH }`.
  // Explicit type parameters force the object-output conditional branch.
  // Without them, Output infers to `string | object` via the loose
  // `Dimension | Record<string, Dimension>` constraint and the conditional
  // collapses to scalar return.
  const splitInHalf = defineConversion<
    { whole: typeof LENGTH },
    { half1: typeof LENGTH; half2: typeof LENGTH }
  >({
    inputs: { whole: LENGTH },
    output: { half1: LENGTH, half2: LENGTH },
    compute: ({ whole }) => ({ half1: whole / 2, half2: whole / 2 }),
  });

  it('produces an object-shaped output with each field independently denormalized', () => {
    const fn = forge({ whole: meter }, { half1: meter, half2: centimeter }, { via: splitInHalf });
    const out = fn({ whole: 2 });
    expect(out.half1).toBeCloseTo(1, 9); // 1 m
    expect(out.half2).toBeCloseTo(100, 9); // 1 m → 100 cm
  });

  it('honors mixed input units on the way in', () => {
    const fn = forge({ whole: centimeter }, { half1: meter, half2: meter }, { via: splitInHalf });
    const out = fn({ whole: 200 }); // 200 cm = 2 m → halves are 1 m each
    expect(out.half1).toBeCloseTo(1, 9);
    expect(out.half2).toBeCloseTo(1, 9);
  });

  it('honors precision rounding on each output field', () => {
    const fn = forge(
      { whole: meter },
      { half1: centimeter, half2: centimeter },
      { via: splitInHalf, precision: 1 },
    );
    const out = fn({ whole: 1 }); // halves = 0.5 m = 50.0 cm
    expect(out.half1).toBe(50);
    expect(out.half2).toBe(50);
  });
});

describe('forge: shape-mismatch defensive throw (closes coverage on input-keys guard)', () => {
  it('throws when conversion expects a key not declared in `from`', () => {
    // Type system rejects this at compile time; cast bypasses for runtime test.
    const conv = defineConversion({
      inputs: { length: LENGTH, width: LENGTH },
      output: AREA,
      compute: ({ length, width }) => length * width,
    });
    // `from` only declares `length`; `width` is missing. Cross-dim normalization
    // walks `conversion.inputs` keys and throws when `from[k]` is absent.
    const fn = forge(
      { length: meter } as unknown as { length: typeof meter; width: typeof meter },
      squareMeter,
      { via: conv },
    );
    expect(() => fn({ length: 1, width: 1 })).toThrow(/input shape mismatch/);
  });
});
