import { describe, expect, it } from 'bun:test';
import { AREA, LENGTH } from '../../src/dimensions.js';
import {
  centimeter,
  foot,
  inch,
  kilometer,
  meter,
  mile,
  millimeter,
  squareMeter,
  yard,
} from '../../src/kits/geometry/index.js';

// Per-unit tests assert the four invariants every Unit must hold:
//   1. `name` matches the documented identity
//   2. `dimension` is correct
//   3. `toBase` converts forward correctly (some known reference value)
//   4. `fromBase` is the inverse (round-trip from base back to unit)
// `base: true` is asserted only on canonical bases.

describe('geometry/units: LENGTH', () => {
  describe('meter (base)', () => {
    it('has the right shape', () => {
      expect(meter.name).toBe('meter');
      expect(meter.dimension).toBe(LENGTH);
      expect(meter.base).toBe(true);
    });
    it('toBase is identity', () => {
      expect(meter.toBase(0)).toBe(0);
      expect(meter.toBase(1)).toBe(1);
      expect(meter.toBase(123.456)).toBe(123.456);
    });
    it('fromBase is identity', () => {
      expect(meter.fromBase(0)).toBe(0);
      expect(meter.fromBase(1)).toBe(1);
      expect(meter.fromBase(123.456)).toBe(123.456);
    });
  });

  describe('millimeter', () => {
    it('has the right shape', () => {
      expect(millimeter.name).toBe('millimeter');
      expect(millimeter.dimension).toBe(LENGTH);
      expect(millimeter.base).toBeUndefined();
    });
    it('1 mm = 0.001 m via toBase', () => {
      expect(millimeter.toBase(1)).toBeCloseTo(0.001, 12);
      expect(millimeter.toBase(1000)).toBeCloseTo(1, 12);
    });
    it('1 m = 1000 mm via fromBase', () => {
      expect(millimeter.fromBase(1)).toBeCloseTo(1000, 9);
      expect(millimeter.fromBase(0.001)).toBeCloseTo(1, 12);
    });
  });

  describe('inch', () => {
    it('has the right shape', () => {
      expect(inch.name).toBe('inch');
      expect(inch.dimension).toBe(LENGTH);
      expect(inch.base).toBeUndefined();
    });
    it('1 in = 0.0254 m via toBase (exact, international yard 1959)', () => {
      expect(inch.toBase(1)).toBeCloseTo(0.0254, 12);
      expect(inch.toBase(12)).toBeCloseTo(0.3048, 12);
    });
    it('0.0254 m = 1 in via fromBase', () => {
      expect(inch.fromBase(0.0254)).toBeCloseTo(1, 12);
      expect(inch.fromBase(1)).toBeCloseTo(39.37007874015748, 9);
    });
  });

  describe('foot', () => {
    it('has the right shape', () => {
      expect(foot.name).toBe('foot');
      expect(foot.dimension).toBe(LENGTH);
      expect(foot.base).toBeUndefined();
    });
    it('1 ft = 0.3048 m via toBase (= 12 in × 0.0254)', () => {
      expect(foot.toBase(1)).toBeCloseTo(0.3048, 12);
      expect(foot.toBase(3)).toBeCloseTo(0.9144, 12);
    });
    it('0.3048 m = 1 ft via fromBase', () => {
      expect(foot.fromBase(0.3048)).toBeCloseTo(1, 12);
      expect(foot.fromBase(1)).toBeCloseTo(3.280839895013123, 9);
    });
  });

  describe('yard', () => {
    it('has the right shape', () => {
      expect(yard.name).toBe('yard');
      expect(yard.dimension).toBe(LENGTH);
      expect(yard.base).toBeUndefined();
    });
    it('1 yd = 0.9144 m via toBase (= 3 ft = 36 in; exact)', () => {
      expect(yard.toBase(1)).toBeCloseTo(0.9144, 12);
      expect(yard.toBase(2)).toBeCloseTo(1.8288, 12);
    });
    it('0.9144 m = 1 yd via fromBase', () => {
      expect(yard.fromBase(0.9144)).toBeCloseTo(1, 12);
      expect(yard.fromBase(1)).toBeCloseTo(1.0936132983377078, 9);
    });
  });

  describe('mile', () => {
    it('has the right shape', () => {
      expect(mile.name).toBe('mile');
      expect(mile.dimension).toBe(LENGTH);
      expect(mile.base).toBeUndefined();
    });
    it('1 mi = 1609.344 m via toBase (= 5280 ft; exact)', () => {
      expect(mile.toBase(1)).toBeCloseTo(1609.344, 9);
      expect(mile.toBase(0.5)).toBeCloseTo(804.672, 9);
    });
    it('1609.344 m = 1 mi via fromBase', () => {
      expect(mile.fromBase(1609.344)).toBeCloseTo(1, 12);
      expect(mile.fromBase(1000)).toBeCloseTo(0.621371192237334, 9);
    });
  });

  describe('kilometer', () => {
    it('has the right shape', () => {
      expect(kilometer.name).toBe('kilometer');
      expect(kilometer.dimension).toBe(LENGTH);
      expect(kilometer.base).toBeUndefined();
    });
    it('1 km = 1000 m via toBase', () => {
      expect(kilometer.toBase(1)).toBeCloseTo(1000, 9);
      expect(kilometer.toBase(0.5)).toBeCloseTo(500, 9);
    });
    it('1000 m = 1 km via fromBase', () => {
      expect(kilometer.fromBase(1000)).toBeCloseTo(1, 12);
      expect(kilometer.fromBase(2500)).toBeCloseTo(2.5, 12);
    });
  });

  describe('centimeter', () => {
    it('has the right shape', () => {
      expect(centimeter.name).toBe('centimeter');
      expect(centimeter.dimension).toBe(LENGTH);
      expect(centimeter.base).toBeUndefined();
    });
    it('1 cm = 0.01 m via toBase', () => {
      expect(centimeter.toBase(1)).toBeCloseTo(0.01, 12);
      expect(centimeter.toBase(100)).toBeCloseTo(1, 12);
    });
    it('1 m = 100 cm via fromBase', () => {
      expect(centimeter.fromBase(1)).toBeCloseTo(100, 12);
      expect(centimeter.fromBase(0.01)).toBeCloseTo(1, 12);
    });
  });
});

describe('geometry/units: AREA', () => {
  describe('squareMeter (base)', () => {
    it('has the right shape', () => {
      expect(squareMeter.name).toBe('square-meter');
      expect(squareMeter.dimension).toBe(AREA);
      expect(squareMeter.base).toBe(true);
    });
    it('toBase is identity', () => {
      expect(squareMeter.toBase(0)).toBe(0);
      expect(squareMeter.toBase(7)).toBe(7);
    });
    it('fromBase is identity', () => {
      expect(squareMeter.fromBase(0)).toBe(0);
      expect(squareMeter.fromBase(7)).toBe(7);
    });
  });
});
