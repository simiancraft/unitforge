// Astronomy kit tests. Per-unit shape + reference values, plus
// cross-unit ratios that pin the IAU and BIPM definitional
// relationships (1 ly ≈ 3.26156 pc; 1 Mpc = 10⁶ pc; etc.).

import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';
import {
  astronomicalUnit,
  gigaparsec,
  kilometer,
  kiloparsec,
  lightHour,
  lightMinute,
  lightSecond,
  lightYear,
  megaparsec,
  meter,
  parsec,
} from '../../src/kits/astronomy/index.js';

describe('kits/astronomy: shape', () => {
  const lengthUnits = [
    astronomicalUnit,
    lightSecond,
    lightMinute,
    lightHour,
    lightYear,
    parsec,
    kiloparsec,
    megaparsec,
    gigaparsec,
  ];

  for (const u of lengthUnits) {
    it(`${u.id}: id, label, symbol populated`, () => {
      expect(u.id.length).toBeGreaterThan(0);
      expect(u.label.length).toBeGreaterThan(0);
      expect(u.symbol.length).toBeGreaterThan(0);
      expect(u.dimension).toBe('length');
    });
  }

  it('no astronomy atom claims base: true', () => {
    for (const u of lengthUnits) {
      expect(u.base).toBeUndefined();
    }
  });
});

describe('kits/astronomy: reference values', () => {
  it('1 au = 149 597 870 700 m (exact, IAU 2012 B2)', () => {
    expect(forge(astronomicalUnit, meter)(1)).toBe(149597870700);
  });

  it('1 light-second = 299 792 458 m (exact, BIPM c)', () => {
    expect(forge(lightSecond, meter)(1)).toBe(299792458);
  });

  it('1 light-minute = 60 light-seconds', () => {
    expect(forge(lightMinute, meter)(1)).toBe(299792458 * 60);
  });

  it('1 light-hour = 3600 light-seconds', () => {
    expect(forge(lightHour, meter)(1)).toBe(299792458 * 3600);
  });

  it('1 ly = 9 460 730 472 580 800 m (Julian year × c, exact)', () => {
    expect(forge(lightYear, meter)(1)).toBe(9460730472580800);
  });

  it('1 pc ≈ 3.0857 × 10¹⁶ m (IAU 2015 B2)', () => {
    expect(forge(parsec, meter)(1)).toBeCloseTo(3.0857e16, -12);
  });

  it('1 pc ≈ 3.26156 ly (canonical astronomy ratio)', () => {
    expect(forge(parsec, meter)(1) / forge(lightYear, meter)(1)).toBeCloseTo(3.26156, 4);
  });

  it('1 kpc = 1000 pc; 1 Mpc = 10⁶ pc; 1 Gpc = 10⁹ pc', () => {
    expect(forge(kiloparsec, parsec)(1)).toBeCloseTo(1000, 6);
    expect(forge(megaparsec, parsec)(1)).toBeCloseTo(1_000_000, 0);
    expect(forge(gigaparsec, parsec)(1)).toBeCloseTo(1_000_000_000, -3);
  });
});

describe('kits/astronomy: benchmarking against modern anchors', () => {
  it('1 AU ≈ 8.317 light-minutes (Sun → Earth one-way delay)', () => {
    expect(forge(astronomicalUnit, lightMinute)(1)).toBeCloseTo(8.317, 3);
  });

  it('1 ly ≈ 9.461 × 10¹² km (re-exported kilometer)', () => {
    expect(forge(lightYear, kilometer)(1)).toBeCloseTo(9.461e12, -9);
  });

  it('1 Mpc ≈ 3.086 × 10¹⁹ km', () => {
    expect(forge(megaparsec, kilometer)(1)).toBeCloseTo(3.086e19, -16);
  });
});

describe('kits/astronomy: round-trip', () => {
  const all = [
    astronomicalUnit,
    lightSecond,
    lightMinute,
    lightHour,
    lightYear,
    parsec,
    kiloparsec,
    megaparsec,
    gigaparsec,
  ];

  for (const u of all) {
    it(`${u.id} round-trips via meter`, () => {
      const value = 4.7;
      const out = forge(meter, u)(forge(u, meter)(value));
      expect(out).toBeCloseTo(value, 10);
    });
  }
});
