import { describe, expect, it } from 'bun:test';
import { AREA, LENGTH } from '../../src/dimensions.js';
import { centimeter, meter, squareMeter } from '../../src/kits/geometry/index.js';

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
