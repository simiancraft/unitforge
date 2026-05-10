import { describe, expect, it } from 'bun:test';
import { AREA, LENGTH, VOLUME } from '../../src/dimensions.js';
import {
  acre,
  centimeter,
  cubicCentimeter,
  cubicFoot,
  cubicInch,
  cubicMeter,
  foot,
  hectare,
  inch,
  kilometer,
  liter,
  meter,
  mile,
  milliliter,
  millimeter,
  squareCentimeter,
  squareFoot,
  squareInch,
  squareKilometer,
  squareMeter,
  squareMillimeter,
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
  describe('squareMillimeter', () => {
    it('has the right shape', () => {
      expect(squareMillimeter.name).toBe('square-millimeter');
      expect(squareMillimeter.dimension).toBe(AREA);
      expect(squareMillimeter.base).toBeUndefined();
    });
    it('1 mm² = 1e-6 m² via toBase', () => {
      expect(squareMillimeter.toBase(1)).toBeCloseTo(1e-6, 18);
      expect(squareMillimeter.toBase(1_000_000)).toBeCloseTo(1, 9);
    });
    it('1 m² = 1e6 mm² via fromBase', () => {
      expect(squareMillimeter.fromBase(1)).toBeCloseTo(1_000_000, 6);
      expect(squareMillimeter.fromBase(1e-6)).toBeCloseTo(1, 12);
    });
  });

  describe('squareCentimeter', () => {
    it('has the right shape', () => {
      expect(squareCentimeter.name).toBe('square-centimeter');
      expect(squareCentimeter.dimension).toBe(AREA);
      expect(squareCentimeter.base).toBeUndefined();
    });
    it('1 cm² = 1e-4 m² via toBase', () => {
      expect(squareCentimeter.toBase(1)).toBeCloseTo(1e-4, 14);
      expect(squareCentimeter.toBase(10_000)).toBeCloseTo(1, 9);
    });
    it('1 m² = 1e4 cm² via fromBase', () => {
      expect(squareCentimeter.fromBase(1)).toBeCloseTo(10_000, 6);
      expect(squareCentimeter.fromBase(1e-4)).toBeCloseTo(1, 12);
    });
  });

  describe('squareKilometer', () => {
    it('has the right shape', () => {
      expect(squareKilometer.name).toBe('square-kilometer');
      expect(squareKilometer.dimension).toBe(AREA);
      expect(squareKilometer.base).toBeUndefined();
    });
    it('1 km² = 1e6 m² via toBase', () => {
      expect(squareKilometer.toBase(1)).toBeCloseTo(1_000_000, 6);
      expect(squareKilometer.toBase(0.5)).toBeCloseTo(500_000, 6);
    });
    it('1 m² = 1e-6 km² via fromBase', () => {
      expect(squareKilometer.fromBase(1)).toBeCloseTo(1e-6, 18);
      expect(squareKilometer.fromBase(1_000_000)).toBeCloseTo(1, 12);
    });
  });

  describe('squareInch', () => {
    it('has the right shape', () => {
      expect(squareInch.name).toBe('square-inch');
      expect(squareInch.dimension).toBe(AREA);
      expect(squareInch.base).toBeUndefined();
    });
    it('1 in² = 0.00064516 m² via toBase (= 0.0254², exact)', () => {
      expect(squareInch.toBase(1)).toBeCloseTo(0.00064516, 12);
      expect(squareInch.toBase(144)).toBeCloseTo(0.09290304, 12); // 144 in² = 1 ft²
    });
    it('0.00064516 m² = 1 in² via fromBase', () => {
      expect(squareInch.fromBase(0.00064516)).toBeCloseTo(1, 12);
    });
  });

  describe('squareFoot', () => {
    it('has the right shape', () => {
      expect(squareFoot.name).toBe('square-foot');
      expect(squareFoot.dimension).toBe(AREA);
      expect(squareFoot.base).toBeUndefined();
    });
    it('1 ft² = 0.09290304 m² via toBase (= 0.3048², exact)', () => {
      expect(squareFoot.toBase(1)).toBeCloseTo(0.09290304, 12);
      expect(squareFoot.toBase(9)).toBeCloseTo(0.83612736, 12); // 9 ft² = 1 yd²
    });
    it('0.09290304 m² = 1 ft² via fromBase', () => {
      expect(squareFoot.fromBase(0.09290304)).toBeCloseTo(1, 12);
    });
  });

  describe('acre', () => {
    it('has the right shape', () => {
      expect(acre.name).toBe('acre');
      expect(acre.dimension).toBe(AREA);
      expect(acre.base).toBeUndefined();
    });
    it('1 acre = 4046.8564224 m² via toBase (= 4840 yd², exact)', () => {
      expect(acre.toBase(1)).toBeCloseTo(4046.8564224, 8);
    });
    it('4046.8564224 m² = 1 acre via fromBase', () => {
      expect(acre.fromBase(4046.8564224)).toBeCloseTo(1, 12);
    });
  });

  describe('hectare', () => {
    it('has the right shape', () => {
      expect(hectare.name).toBe('hectare');
      expect(hectare.dimension).toBe(AREA);
      expect(hectare.base).toBeUndefined();
    });
    it('1 ha = 10000 m² via toBase (exact)', () => {
      expect(hectare.toBase(1)).toBeCloseTo(10_000, 9);
      expect(hectare.toBase(2.5)).toBeCloseTo(25_000, 9);
    });
    it('10000 m² = 1 ha via fromBase', () => {
      expect(hectare.fromBase(10_000)).toBeCloseTo(1, 12);
      expect(hectare.fromBase(1)).toBeCloseTo(0.0001, 16);
    });
  });

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

describe('geometry/units: VOLUME', () => {
  describe('cubicMeter (base)', () => {
    it('has the right shape', () => {
      expect(cubicMeter.name).toBe('cubic-meter');
      expect(cubicMeter.dimension).toBe(VOLUME);
      expect(cubicMeter.base).toBe(true);
    });
    it('toBase is identity', () => {
      expect(cubicMeter.toBase(0)).toBe(0);
      expect(cubicMeter.toBase(2.5)).toBe(2.5);
    });
    it('fromBase is identity', () => {
      expect(cubicMeter.fromBase(0)).toBe(0);
      expect(cubicMeter.fromBase(2.5)).toBe(2.5);
    });
  });

  describe('cubicCentimeter', () => {
    it('has the right shape', () => {
      expect(cubicCentimeter.name).toBe('cubic-centimeter');
      expect(cubicCentimeter.dimension).toBe(VOLUME);
      expect(cubicCentimeter.base).toBeUndefined();
    });
    it('1 cm³ = 1e-6 m³ via toBase (= (1e-2)³)', () => {
      expect(cubicCentimeter.toBase(1)).toBeCloseTo(1e-6, 18);
      expect(cubicCentimeter.toBase(1_000_000)).toBeCloseTo(1, 9);
    });
    it('1 m³ = 1e6 cm³ via fromBase', () => {
      expect(cubicCentimeter.fromBase(1)).toBeCloseTo(1_000_000, 6);
      expect(cubicCentimeter.fromBase(1e-6)).toBeCloseTo(1, 12);
    });
  });

  describe('cubicInch', () => {
    it('has the right shape', () => {
      expect(cubicInch.name).toBe('cubic-inch');
      expect(cubicInch.dimension).toBe(VOLUME);
      expect(cubicInch.base).toBeUndefined();
    });
    it('1 in³ = 0.000016387064 m³ via toBase (= 0.0254³, exact)', () => {
      expect(cubicInch.toBase(1)).toBeCloseTo(0.000016387064, 15);
      expect(cubicInch.toBase(1728)).toBeCloseTo(0.028316846592, 12); // 1728 in³ = 1 ft³
    });
    it('0.000016387064 m³ = 1 in³ via fromBase', () => {
      expect(cubicInch.fromBase(0.000016387064)).toBeCloseTo(1, 12);
    });
  });

  describe('cubicFoot', () => {
    it('has the right shape', () => {
      expect(cubicFoot.name).toBe('cubic-foot');
      expect(cubicFoot.dimension).toBe(VOLUME);
      expect(cubicFoot.base).toBeUndefined();
    });
    it('1 ft³ = 0.028316846592 m³ via toBase (= 0.3048³ = 1728 in³, exact)', () => {
      expect(cubicFoot.toBase(1)).toBeCloseTo(0.028316846592, 12);
      expect(cubicFoot.toBase(27)).toBeCloseTo(0.764554857984, 12); // 27 ft³ = 1 yd³
    });
    it('0.028316846592 m³ = 1 ft³ via fromBase', () => {
      expect(cubicFoot.fromBase(0.028316846592)).toBeCloseTo(1, 12);
    });
  });

  describe('liter', () => {
    it('has the right shape', () => {
      expect(liter.name).toBe('liter');
      expect(liter.dimension).toBe(VOLUME);
      expect(liter.base).toBeUndefined();
    });
    it('1 L = 0.001 m³ via toBase (= 1 dm³ = 1000 cm³; exact)', () => {
      expect(liter.toBase(1)).toBeCloseTo(0.001, 15);
      expect(liter.toBase(1000)).toBeCloseTo(1, 9);
    });
    it('1 m³ = 1000 L via fromBase', () => {
      expect(liter.fromBase(1)).toBeCloseTo(1000, 9);
      expect(liter.fromBase(0.001)).toBeCloseTo(1, 12);
    });
  });

  describe('milliliter', () => {
    it('has the right shape', () => {
      expect(milliliter.name).toBe('milliliter');
      expect(milliliter.dimension).toBe(VOLUME);
      expect(milliliter.base).toBeUndefined();
    });
    it('1 mL = 1e-6 m³ via toBase (= 1 cm³; exact)', () => {
      expect(milliliter.toBase(1)).toBeCloseTo(1e-6, 18);
      expect(milliliter.toBase(1_000_000)).toBeCloseTo(1, 6);
    });
    it('1 m³ = 1e6 mL via fromBase', () => {
      expect(milliliter.fromBase(1)).toBeCloseTo(1_000_000, 6);
      expect(milliliter.fromBase(1e-6)).toBeCloseTo(1, 12);
    });
    it('1 mL = 1 cm³ (cross-verify with cubicCentimeter)', () => {
      expect(milliliter.toBase(1)).toBeCloseTo(cubicCentimeter.toBase(1), 18);
    });
  });
});
