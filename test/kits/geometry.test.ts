import { describe, expect, it } from 'bun:test';
import { ANGLE, AREA, LENGTH, VOLUME } from '../../src/dimensions.js';
import { forge, ValidationError } from '../../src/index.js';
import {
  acre,
  angstrom,
  arcminute,
  arcsecond,
  are,
  areaFromAnnulusRadii,
  areaFromCircleDiameter,
  areaFromCircleRadius,
  areaFromCircularSegmentRadiusAndAngle,
  areaFromEllipseSemiAxes,
  areaFromEquilateralTriangleSide,
  areaFromKiteDiagonals,
  areaFromParallelogramBaseAndHeight,
  areaFromRectangleLengthAndWidth,
  areaFromRhombusDiagonals,
  areaFromSectorRadiusAndAngle,
  areaFromSquareSide,
  areaFromTrapezoidBasesAndHeight,
  areaFromTriangleBaseAndHeight,
  areaFromTriangleSides,
  arcLengthFromRadiusAndAngle,
  astronomicalUnit,
  chordLengthFromRadiusAndAngle,
  circumferenceOfCircleFromDiameter,
  circumferenceOfCircleFromRadius,  diagonalOfRectangleFromLengthAndWidth,
  diagonalOfSquareFromSide,
  distanceBetweenPoints,
  hypotenuseFromLegs,
  legFromHypotenuseAndLeg,
  midpointBetweenPoints,
  centimeter,
  centiliter,
  cubicCentimeter,
  cubicDecimeter,
  cubicFoot,
  cubicInch,
  cubicKilometer,
  cubicMeter,
  cubicMillimeter,
  cubicYard,
  deciliter,
  decimeter,
  degree,
  fathom,
  foot,
  gradian,
  hectare,
  inch,
  kilometer,
  lightYear,
  liter,
  meter,
  micrometer,
  mil,
  statuteMile,
  milliliter,
  millimeter,
  nanometer,
  nauticalMile,
  parsec,
  perimeterOfEllipseSemiAxes,
  perimeterOfEquilateralTriangleFromSide,
  perimeterOfParallelogramFromBaseAndSide,
  perimeterOfRectangleFromLengthAndWidth,
  perimeterOfRhombusFromSide,
  perimeterOfSquareFromSide,
  perimeterOfTrapezoidFromSides,
  perimeterOfTriangleFromSides,
  radian,
  squareCentimeter,
  squareFoot,
  squareInch,
  squareKilometer,
  squareMeter,
  squareMile,
  squareMillimeter,
  squareYard,
  turn,
  volumeFromCubeSide,
  volumeFromCylinderRadiusAndHeight,
  volumeFromCuboidLengthAndWidthAndHeight,
  volumeFromSphereRadius,
  yard,
} from '../../src/kits/geometry/index.js';

// Per-unit tests assert the four invariants every Unit must hold:
//   1. `id` / `label` / `symbol` match the documented identity triple
//   2. `dimension` is correct
//   3. `toBase` converts forward correctly (some known reference value)
//   4. `fromBase` is the inverse (round-trip from base back to unit)
// `base: true` is asserted only on canonical bases.

describe('geometry/units: LENGTH', () => {
  describe('meter (base)', () => {
    it('has the right shape', () => {
      expect(meter.id).toBe('meter');
      expect(meter.label).toBe('Meter');
      expect(meter.symbol).toBe('m');
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
      expect(millimeter.id).toBe('millimeter');
      expect(millimeter.label).toBe('Millimeter');
      expect(millimeter.symbol).toBe('mm');
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
      expect(inch.id).toBe('inch');
      expect(inch.label).toBe('Inch');
      expect(inch.symbol).toBe('in');
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
      expect(foot.id).toBe('foot');
      expect(foot.label).toBe('Foot');
      expect(foot.symbol).toBe('ft');
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
      expect(yard.id).toBe('yard');
      expect(yard.label).toBe('Yard');
      expect(yard.symbol).toBe('yd');
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

  describe('statuteMile', () => {
    it('has the right shape', () => {
      expect(statuteMile.id).toBe('statute-mile');
      expect(statuteMile.label).toBe('Statute Mile');
      expect(statuteMile.symbol).toBe('mi');
      expect(statuteMile.dimension).toBe(LENGTH);
      expect(statuteMile.base).toBeUndefined();
    });
    it('1 mi = 1609.344 m via toBase (= 5280 ft; exact)', () => {
      expect(statuteMile.toBase(1)).toBeCloseTo(1609.344, 9);
      expect(statuteMile.toBase(0.5)).toBeCloseTo(804.672, 9);
    });
    it('1609.344 m = 1 mi via fromBase', () => {
      expect(statuteMile.fromBase(1609.344)).toBeCloseTo(1, 12);
      expect(statuteMile.fromBase(1000)).toBeCloseTo(0.621371192237334, 9);
    });
  });

  describe('kilometer', () => {
    it('has the right shape', () => {
      expect(kilometer.id).toBe('kilometer');
      expect(kilometer.label).toBe('Kilometer');
      expect(kilometer.symbol).toBe('km');
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
      expect(centimeter.id).toBe('centimeter');
      expect(centimeter.label).toBe('Centimeter');
      expect(centimeter.symbol).toBe('cm');
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

  describe('decimeter', () => {
    it('has the right shape', () => {
      expect(decimeter.id).toBe('decimeter');
      expect(decimeter.label).toBe('Decimeter');
      expect(decimeter.symbol).toBe('dm');
      expect(decimeter.dimension).toBe(LENGTH);
    });
    it('1 dm = 0.1 m via toBase', () => {
      expect(decimeter.toBase(1)).toBeCloseTo(0.1, 12);
    });
    it('round-trips through base', () => {
      expect(decimeter.fromBase(decimeter.toBase(7.3))).toBeCloseTo(7.3, 12);
    });
  });

  describe('micrometer', () => {
    it('has the right shape', () => {
      expect(micrometer.id).toBe('micrometer');
      expect(micrometer.label).toBe('Micrometer');
      expect(micrometer.symbol).toBe('µm');
      expect(micrometer.dimension).toBe(LENGTH);
    });
    it('1 µm = 1e-6 m via toBase', () => {
      expect(micrometer.toBase(1)).toBeCloseTo(1e-6, 18);
    });
    it('round-trips through base', () => {
      expect(micrometer.fromBase(micrometer.toBase(42))).toBeCloseTo(42, 9);
    });
  });

  describe('nanometer', () => {
    it('has the right shape', () => {
      expect(nanometer.id).toBe('nanometer');
      expect(nanometer.label).toBe('Nanometer');
      expect(nanometer.symbol).toBe('nm');
      expect(nanometer.dimension).toBe(LENGTH);
    });
    it('1000 nm = 1 µm via the LENGTH base', () => {
      expect(nanometer.toBase(1000)).toBeCloseTo(micrometer.toBase(1), 18);
    });
    it('round-trips through base', () => {
      expect(nanometer.fromBase(nanometer.toBase(550))).toBeCloseTo(550, 6);
    });
  });

  describe('angstrom', () => {
    it('has the right shape', () => {
      expect(angstrom.id).toBe('angstrom');
      expect(angstrom.label).toBe('Ångström');
      expect(angstrom.symbol).toBe('Å');
      expect(angstrom.dimension).toBe(LENGTH);
    });
    it('1 Å = 1e-10 m via toBase', () => {
      expect(angstrom.toBase(1)).toBeCloseTo(1e-10, 22);
    });
    it('10 Å = 1 nm via the LENGTH base', () => {
      expect(angstrom.toBase(10)).toBeCloseTo(nanometer.toBase(1), 22);
    });
  });

  describe('mil (thou)', () => {
    it('has the right shape', () => {
      expect(mil.id).toBe('mil');
      expect(mil.label).toBe('Mil');
      expect(mil.symbol).toBe('mil');
      expect(mil.dimension).toBe(LENGTH);
    });
    it('1000 mil = 1 inch (exact)', () => {
      expect(mil.toBase(1000)).toBeCloseTo(inch.toBase(1), 14);
    });
    it('1 mil = 25.4 µm', () => {
      expect(mil.toBase(1)).toBeCloseTo(micrometer.toBase(25.4), 14);
    });
  });

  describe('nauticalMile', () => {
    it('has the right shape', () => {
      expect(nauticalMile.id).toBe('nautical-mile');
      expect(nauticalMile.label).toBe('Nautical Mile');
      expect(nauticalMile.symbol).toBe('nmi');
      expect(nauticalMile.dimension).toBe(LENGTH);
    });
    it('1 nmi = 1852 m (exact)', () => {
      expect(nauticalMile.toBase(1)).toBe(1852);
    });
    it('is distinct from statute mile', () => {
      expect(nauticalMile.toBase(1)).not.toBeCloseTo(statuteMile.toBase(1), 0);
    });
  });

  describe('fathom', () => {
    it('has the right shape', () => {
      expect(fathom.id).toBe('fathom');
      expect(fathom.label).toBe('Fathom');
      expect(fathom.symbol).toBe('ftm');
      expect(fathom.dimension).toBe(LENGTH);
    });
    it('1 fathom = 6 feet (exact)', () => {
      expect(fathom.toBase(1)).toBeCloseTo(foot.toBase(6), 14);
    });
  });

  describe('astronomicalUnit', () => {
    it('has the right shape', () => {
      expect(astronomicalUnit.id).toBe('astronomical-unit');
      expect(astronomicalUnit.label).toBe('Astronomical Unit');
      expect(astronomicalUnit.symbol).toBe('au');
      expect(astronomicalUnit.dimension).toBe(LENGTH);
    });
    it('1 au = 149597870700 m (IAU 2012, exact)', () => {
      expect(astronomicalUnit.toBase(1)).toBe(149597870700);
    });
  });

  describe('lightYear', () => {
    it('has the right shape', () => {
      expect(lightYear.id).toBe('light-year');
      expect(lightYear.label).toBe('Light-Year');
      expect(lightYear.symbol).toBe('ly');
      expect(lightYear.dimension).toBe(LENGTH);
    });
    it('1 ly = 9460730472580800 m (Julian year × c, exact)', () => {
      expect(lightYear.toBase(1)).toBe(9460730472580800);
    });
  });

  describe('parsec', () => {
    it('has the right shape', () => {
      expect(parsec.id).toBe('parsec');
      expect(parsec.label).toBe('Parsec');
      expect(parsec.symbol).toBe('pc');
      expect(parsec.dimension).toBe(LENGTH);
    });
    it('1 pc ≈ 3.0857e16 m (within Float64)', () => {
      expect(parsec.toBase(1)).toBeCloseTo(3.0857e16, -12);
    });
    it('1 pc ≈ 3.26156 ly (within Float64)', () => {
      expect(parsec.toBase(1) / lightYear.toBase(1)).toBeCloseTo(3.26156, 4);
    });
  });
});

describe('geometry/units: AREA', () => {
  describe('squareMillimeter', () => {
    it('has the right shape', () => {
      expect(squareMillimeter.id).toBe('square-millimeter');
      expect(squareMillimeter.label).toBe('Square Millimeter');
      expect(squareMillimeter.symbol).toBe('mm²');
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
      expect(squareCentimeter.id).toBe('square-centimeter');
      expect(squareCentimeter.label).toBe('Square Centimeter');
      expect(squareCentimeter.symbol).toBe('cm²');
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
      expect(squareKilometer.id).toBe('square-kilometer');
      expect(squareKilometer.label).toBe('Square Kilometer');
      expect(squareKilometer.symbol).toBe('km²');
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
      expect(squareInch.id).toBe('square-inch');
      expect(squareInch.label).toBe('Square Inch');
      expect(squareInch.symbol).toBe('in²');
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
      expect(squareFoot.id).toBe('square-foot');
      expect(squareFoot.label).toBe('Square Foot');
      expect(squareFoot.symbol).toBe('ft²');
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
      expect(acre.id).toBe('acre');
      expect(acre.label).toBe('Acre');
      expect(acre.symbol).toBe('ac');
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
      expect(hectare.id).toBe('hectare');
      expect(hectare.label).toBe('Hectare');
      expect(hectare.symbol).toBe('ha');
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
      expect(squareMeter.id).toBe('square-meter');
      expect(squareMeter.label).toBe('Square Meter');
      expect(squareMeter.symbol).toBe('m²');
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

  describe('are', () => {
    it('has the right shape', () => {
      expect(are.id).toBe('are');
      expect(are.label).toBe('Are');
      expect(are.symbol).toBe('a');
      expect(are.dimension).toBe(AREA);
    });
    it('1 a = 100 m² (exact)', () => {
      expect(are.toBase(1)).toBe(100);
    });
    it('100 a = 1 ha (exact)', () => {
      expect(are.toBase(100)).toBeCloseTo(hectare.toBase(1), 12);
    });
  });

  describe('squareYard', () => {
    it('has the right shape', () => {
      expect(squareYard.id).toBe('square-yard');
      expect(squareYard.label).toBe('Square Yard');
      expect(squareYard.symbol).toBe('yd²');
      expect(squareYard.dimension).toBe(AREA);
    });
    it('1 yd² = 0.83612736 m² (exact)', () => {
      expect(squareYard.toBase(1)).toBeCloseTo(0.83612736, 14);
    });
    it('9 ft² = 1 yd² (exact)', () => {
      expect(squareFoot.toBase(9)).toBeCloseTo(squareYard.toBase(1), 14);
    });
  });

  describe('squareMile', () => {
    it('has the right shape', () => {
      expect(squareMile.id).toBe('square-mile');
      expect(squareMile.label).toBe('Square Mile');
      expect(squareMile.symbol).toBe('mi²');
      expect(squareMile.dimension).toBe(AREA);
    });
    it('1 mi² = 2589988.110336 m² (exact)', () => {
      expect(squareMile.toBase(1)).toBeCloseTo(2_589_988.110336, 8);
    });
    it('640 acres = 1 square mile (exact, the section)', () => {
      expect(acre.toBase(640)).toBeCloseTo(squareMile.toBase(1), 8);
    });
  });
});

describe('geometry/units: VOLUME', () => {
  describe('cubicMeter (base)', () => {
    it('has the right shape', () => {
      expect(cubicMeter.id).toBe('cubic-meter');
      expect(cubicMeter.label).toBe('Cubic Meter');
      expect(cubicMeter.symbol).toBe('m³');
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
      expect(cubicCentimeter.id).toBe('cubic-centimeter');
      expect(cubicCentimeter.label).toBe('Cubic Centimeter');
      expect(cubicCentimeter.symbol).toBe('cm³');
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
      expect(cubicInch.id).toBe('cubic-inch');
      expect(cubicInch.label).toBe('Cubic Inch');
      expect(cubicInch.symbol).toBe('in³');
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
      expect(cubicFoot.id).toBe('cubic-foot');
      expect(cubicFoot.label).toBe('Cubic Foot');
      expect(cubicFoot.symbol).toBe('ft³');
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
      expect(liter.id).toBe('liter');
      expect(liter.label).toBe('Liter');
      expect(liter.symbol).toBe('L');
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
      expect(milliliter.id).toBe('milliliter');
      expect(milliliter.label).toBe('Milliliter');
      expect(milliliter.symbol).toBe('mL');
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

// Conversion tests assert four invariants:
//   1. correct numerical output for known inputs in base units
//   2. correct unit-aware output via mixed-unit forge call (toBase normalization)
//   3. correct ValidationError when an input is out of range (typically negative)
//   4. cross-property invariants (e.g., circle area ≈ π r²) where applicable

describe('geometry/conversions: AREA derivations', () => {
  describe('areaFromSquareSide', () => {
    it('side² = area in base units', () => {
      const fn = forge({ side: meter }, squareMeter, { via: areaFromSquareSide });
      expect(fn({ side: 5 })).toBeCloseTo(25, 12);
      expect(fn({ side: 0 })).toBeCloseTo(0, 12);
      expect(fn({ side: 12.5 })).toBeCloseTo(156.25, 12);
    });
    it('honors mixed input units (cm side → m² area)', () => {
      const fn = forge({ side: centimeter }, squareMeter, { via: areaFromSquareSide });
      // 100 cm = 1 m → area = 1 m²
      expect(fn({ side: 100 })).toBeCloseTo(1, 9);
    });
    it('rejects negative side', () => {
      const fn = forge({ side: meter }, squareMeter, { via: areaFromSquareSide });
      expect(() => fn({ side: -1 })).toThrow(ValidationError);
    });
  });

  describe('areaFromCircleRadius', () => {
    it('π · r² = area in base units', () => {
      const fn = forge({ radius: meter }, squareMeter, { via: areaFromCircleRadius });
      expect(fn({ radius: 1 })).toBeCloseTo(Math.PI, 12);
      expect(fn({ radius: 2 })).toBeCloseTo(4 * Math.PI, 12);
      expect(fn({ radius: 0 })).toBe(0);
    });
    it('honors mixed input units (cm radius → m² area)', () => {
      const fn = forge({ radius: centimeter }, squareMeter, { via: areaFromCircleRadius });
      // 100 cm = 1 m → area = π m²
      expect(fn({ radius: 100 })).toBeCloseTo(Math.PI, 9);
    });
    it('rejects negative radius', () => {
      const fn = forge({ radius: meter }, squareMeter, { via: areaFromCircleRadius });
      expect(() => fn({ radius: -1 })).toThrow(ValidationError);
    });
  });

  describe('areaFromCircleDiameter', () => {
    it('π · (d/2)² = area; agrees with areaFromCircleRadius', () => {
      const fromDia = forge({ diameter: meter }, squareMeter, {
        via: areaFromCircleDiameter,
      });
      const fromRad = forge({ radius: meter }, squareMeter, { via: areaFromCircleRadius });
      expect(fromDia({ diameter: 2 })).toBeCloseTo(fromRad({ radius: 1 }), 12);
      expect(fromDia({ diameter: 0 })).toBe(0);
    });
    it('rejects negative diameter', () => {
      const fn = forge({ diameter: meter }, squareMeter, { via: areaFromCircleDiameter });
      expect(() => fn({ diameter: -1 })).toThrow(ValidationError);
    });
  });

  describe('areaFromTriangleBaseAndHeight', () => {
    it('½ · b · h = area', () => {
      const fn = forge({ base: meter, height: meter }, squareMeter, {
        via: areaFromTriangleBaseAndHeight,
      });
      expect(fn({ base: 4, height: 6 })).toBeCloseTo(12, 12);
      expect(fn({ base: 0, height: 6 })).toBe(0);
    });
    it('rejects negative inputs', () => {
      const fn = forge({ base: meter, height: meter }, squareMeter, {
        via: areaFromTriangleBaseAndHeight,
      });
      expect(() => fn({ base: -1, height: 1 })).toThrow(ValidationError);
    });
  });

  describe('areaFromTriangleSides (Heron)', () => {
    it('3-4-5 right triangle area = 6', () => {
      const fn = forge({ a: meter, b: meter, c: meter }, squareMeter, {
        via: areaFromTriangleSides,
      });
      expect(fn({ a: 3, b: 4, c: 5 })).toBeCloseTo(6, 12);
    });
    it('equilateral triangle agrees with closed form', () => {
      const fn = forge({ a: meter, b: meter, c: meter }, squareMeter, {
        via: areaFromTriangleSides,
      });
      const s = 7;
      expect(fn({ a: s, b: s, c: s })).toBeCloseTo((Math.sqrt(3) / 4) * s * s, 9);
    });
    it('rejects triangle-inequality violation', () => {
      const fn = forge({ a: meter, b: meter, c: meter }, squareMeter, {
        via: areaFromTriangleSides,
      });
      // 1, 1, 5 cannot form a triangle (1 + 1 < 5)
      expect(() => fn({ a: 1, b: 1, c: 5 })).toThrow(ValidationError);
    });
  });

  describe('areaFromEquilateralTriangleSide', () => {
    it('(√3/4) · s² = area', () => {
      const fn = forge({ side: meter }, squareMeter, {
        via: areaFromEquilateralTriangleSide,
      });
      expect(fn({ side: 2 })).toBeCloseTo(Math.sqrt(3), 12);
    });
  });

  describe('areaFromTrapezoidBasesAndHeight', () => {
    it('½ (a + b) · h = area', () => {
      const fn = forge({ a: meter, b: meter, height: meter }, squareMeter, {
        via: areaFromTrapezoidBasesAndHeight,
      });
      expect(fn({ a: 3, b: 5, height: 4 })).toBeCloseTo(16, 12);
    });
  });

  describe('areaFromParallelogramBaseAndHeight', () => {
    it('b · h = area; matches rectangle area for the same inputs', () => {
      const para = forge({ base: meter, height: meter }, squareMeter, {
        via: areaFromParallelogramBaseAndHeight,
      });
      const rect = forge({ length: meter, width: meter }, squareMeter, {
        via: areaFromRectangleLengthAndWidth,
      });
      expect(para({ base: 5, height: 3 })).toBeCloseTo(rect({ length: 5, width: 3 }), 12);
    });
  });

  describe('areaFromRhombusDiagonals', () => {
    it('½ · d1 · d2 = area', () => {
      const fn = forge({ d1: meter, d2: meter }, squareMeter, {
        via: areaFromRhombusDiagonals,
      });
      expect(fn({ d1: 6, d2: 8 })).toBeCloseTo(24, 12);
    });
  });

  describe('areaFromKiteDiagonals', () => {
    it('½ · d1 · d2 = area; matches rhombus for the same inputs', () => {
      const kite = forge({ d1: meter, d2: meter }, squareMeter, {
        via: areaFromKiteDiagonals,
      });
      const rhomb = forge({ d1: meter, d2: meter }, squareMeter, {
        via: areaFromRhombusDiagonals,
      });
      expect(kite({ d1: 6, d2: 8 })).toBeCloseTo(rhomb({ d1: 6, d2: 8 }), 12);
    });
  });

  describe('areaFromEllipseSemiAxes', () => {
    it('π · a · b = area; circle (a=b) matches areaFromCircleRadius', () => {
      const ellipse = forge({ a: meter, b: meter }, squareMeter, {
        via: areaFromEllipseSemiAxes,
      });
      const circle = forge({ radius: meter }, squareMeter, { via: areaFromCircleRadius });
      expect(ellipse({ a: 3, b: 3 })).toBeCloseTo(circle({ radius: 3 }), 12);
      expect(ellipse({ a: 3, b: 4 })).toBeCloseTo(12 * Math.PI, 12);
    });
  });

  describe('areaFromAnnulusRadii', () => {
    it('π (R² − r²) = area', () => {
      const fn = forge({ outerRadius: meter, innerRadius: meter }, squareMeter, {
        via: areaFromAnnulusRadii,
      });
      expect(fn({ outerRadius: 3, innerRadius: 2 })).toBeCloseTo(Math.PI * (9 - 4), 12);
    });
    it('rejects outer < inner', () => {
      const fn = forge({ outerRadius: meter, innerRadius: meter }, squareMeter, {
        via: areaFromAnnulusRadii,
      });
      expect(() => fn({ outerRadius: 2, innerRadius: 3 })).toThrow(ValidationError);
    });
    it('zero annulus (outer = inner) = 0', () => {
      const fn = forge({ outerRadius: meter, innerRadius: meter }, squareMeter, {
        via: areaFromAnnulusRadii,
      });
      expect(fn({ outerRadius: 5, innerRadius: 5 })).toBe(0);
    });
  });

  describe('areaFromSectorRadiusAndAngle', () => {
    it('½ · r² · θ = area; full circle (θ=2π) = π r²', () => {
      const fn = forge({ radius: meter, angle: radian }, squareMeter, {
        via: areaFromSectorRadiusAndAngle,
      });
      expect(fn({ radius: 2, angle: 2 * Math.PI })).toBeCloseTo(4 * Math.PI, 12);
      expect(fn({ radius: 2, angle: Math.PI / 2 })).toBeCloseTo(Math.PI, 12);
    });
    it('accepts degrees via unit-aware forge', () => {
      const fn = forge({ radius: meter, angle: degree }, squareMeter, {
        via: areaFromSectorRadiusAndAngle,
      });
      // 90° = π/2 rad
      expect(fn({ radius: 2, angle: 90 })).toBeCloseTo(Math.PI, 9);
    });
    it('rejects negative angle but accepts > 2π honestly (validator runs on raw input)', () => {
      const fn = forge({ radius: meter, angle: radian }, squareMeter, {
        via: areaFromSectorRadiusAndAngle,
      });
      expect(() => fn({ radius: 1, angle: -0.1 })).toThrow(ValidationError);
      // multiple turns compute honestly; not the conversion's job to reject
      expect(fn({ radius: 1, angle: 4 * Math.PI })).toBeCloseTo(2 * Math.PI, 12);
    });
  });

  describe('areaFromCircularSegmentRadiusAndAngle', () => {
    it('½ · r² · (θ − sin θ) = area; θ = π gives a half-disk', () => {
      const fn = forge({ radius: meter, angle: radian }, squareMeter, {
        via: areaFromCircularSegmentRadiusAndAngle,
      });
      // Segment at θ = π: ½ · 1² · (π − sin π) = π/2
      expect(fn({ radius: 1, angle: Math.PI })).toBeCloseTo(Math.PI / 2, 12);
    });
  });
});

describe('geometry/conversions: perimeter / circumference / arc length', () => {
  it('perimeterOfRectangleFromLengthAndWidth = 2(L+W)', () => {
    const fn = forge({ length: meter, width: meter }, meter, {
      via: perimeterOfRectangleFromLengthAndWidth,
    });
    expect(fn({ length: 5, width: 3 })).toBeCloseTo(16, 12);
  });

  it('perimeterOfSquareFromSide = 4s', () => {
    const fn = forge({ side: meter }, meter, { via: perimeterOfSquareFromSide });
    expect(fn({ side: 7 })).toBeCloseTo(28, 12);
  });

  it('perimeterOfTriangleFromSides = a+b+c; no triangle-inequality rejection', () => {
    const fn = forge({ a: meter, b: meter, c: meter }, meter, {
      via: perimeterOfTriangleFromSides,
    });
    expect(fn({ a: 3, b: 4, c: 5 })).toBeCloseTo(12, 12);
    // 1+1+5 is a degenerate triple; perimeter is still meaningful
    expect(fn({ a: 1, b: 1, c: 5 })).toBeCloseTo(7, 12);
  });

  it('perimeterOfEquilateralTriangleFromSide = 3s', () => {
    const fn = forge({ side: meter }, meter, {
      via: perimeterOfEquilateralTriangleFromSide,
    });
    expect(fn({ side: 4 })).toBeCloseTo(12, 12);
  });

  it('perimeterOfRhombusFromSide = 4s', () => {
    const fn = forge({ side: meter }, meter, { via: perimeterOfRhombusFromSide });
    expect(fn({ side: 5 })).toBeCloseTo(20, 12);
  });

  it('perimeterOfParallelogramFromBaseAndSide = 2(b+s)', () => {
    const fn = forge({ base: meter, side: meter }, meter, {
      via: perimeterOfParallelogramFromBaseAndSide,
    });
    expect(fn({ base: 6, side: 4 })).toBeCloseTo(20, 12);
  });

  it('perimeterOfTrapezoidFromSides = a+b+c+d', () => {
    const fn = forge({ a: meter, b: meter, c: meter, d: meter }, meter, {
      via: perimeterOfTrapezoidFromSides,
    });
    expect(fn({ a: 3, b: 5, c: 4, d: 4 })).toBeCloseTo(16, 12);
  });

  it('circumferenceOfCircleFromRadius = 2πr', () => {
    const fn = forge({ radius: meter }, meter, { via: circumferenceOfCircleFromRadius });
    expect(fn({ radius: 1 })).toBeCloseTo(2 * Math.PI, 12);
    expect(fn({ radius: 5 })).toBeCloseTo(10 * Math.PI, 12);
  });

  it('circumferenceOfCircleFromDiameter = πd; agrees with from-radius', () => {
    const fromDia = forge({ diameter: meter }, meter, {
      via: circumferenceOfCircleFromDiameter,
    });
    const fromRad = forge({ radius: meter }, meter, {
      via: circumferenceOfCircleFromRadius,
    });
    expect(fromDia({ diameter: 2 })).toBeCloseTo(fromRad({ radius: 1 }), 12);
  });

  it('arcLengthFromRadiusAndAngle = r·θ', () => {
    const fn = forge({ radius: meter, angle: radian }, meter, {
      via: arcLengthFromRadiusAndAngle,
    });
    // Full circle: arc = 2π · r
    expect(fn({ radius: 1, angle: 2 * Math.PI })).toBeCloseTo(2 * Math.PI, 12);
    // Quarter circle, r = 4: arc = π/2 · 4 = 2π
    expect(fn({ radius: 4, angle: Math.PI / 2 })).toBeCloseTo(2 * Math.PI, 12);
  });

  it('arcLengthFromRadiusAndAngle accepts degree input via forge', () => {
    const fn = forge({ radius: meter, angle: degree }, meter, {
      via: arcLengthFromRadiusAndAngle,
    });
    // 90° arc on r = 4 = π/2 · 4 = 2π
    expect(fn({ radius: 4, angle: 90 })).toBeCloseTo(2 * Math.PI, 9);
  });

  it('chordLengthFromRadiusAndAngle = 2·r·sin(θ/2); θ=π gives diameter', () => {
    const fn = forge({ radius: meter, angle: radian }, meter, {
      via: chordLengthFromRadiusAndAngle,
    });
    expect(fn({ radius: 5, angle: Math.PI })).toBeCloseTo(10, 12);
    // θ = π/2 on r = 1: chord = 2 · 1 · sin(π/4) = √2
    expect(fn({ radius: 1, angle: Math.PI / 2 })).toBeCloseTo(Math.SQRT2, 12);
  });
});

describe('geometry/conversions: diagonals and Pythagorean', () => {
  it('diagonalOfRectangleFromLengthAndWidth: 3-4-5 triangle', () => {
    const fn = forge({ length: meter, width: meter }, meter, {
      via: diagonalOfRectangleFromLengthAndWidth,
    });
    expect(fn({ length: 3, width: 4 })).toBeCloseTo(5, 12);
  });

  it('diagonalOfSquareFromSide = s · √2', () => {
    const fn = forge({ side: meter }, meter, { via: diagonalOfSquareFromSide });
    expect(fn({ side: 1 })).toBeCloseTo(Math.SQRT2, 12);
    expect(fn({ side: 5 })).toBeCloseTo(5 * Math.SQRT2, 12);
  });

  it('hypotenuseFromLegs agrees with rectangle diagonal', () => {
    const hyp = forge({ a: meter, b: meter }, meter, { via: hypotenuseFromLegs });
    const diag = forge({ length: meter, width: meter }, meter, {
      via: diagonalOfRectangleFromLengthAndWidth,
    });
    expect(hyp({ a: 5, b: 12 })).toBeCloseTo(diag({ length: 5, width: 12 }), 12);
    expect(hyp({ a: 5, b: 12 })).toBeCloseTo(13, 12);
  });

  it('legFromHypotenuseAndLeg recovers the other leg', () => {
    const fn = forge({ hypotenuse: meter, leg: meter }, meter, {
      via: legFromHypotenuseAndLeg,
    });
    // 5-12-13: hyp=13, leg=5 → other leg = 12
    expect(fn({ hypotenuse: 13, leg: 5 })).toBeCloseTo(12, 12);
  });

  it('legFromHypotenuseAndLeg rejects hypotenuse < leg', () => {
    const fn = forge({ hypotenuse: meter, leg: meter }, meter, {
      via: legFromHypotenuseAndLeg,
    });
    expect(() => fn({ hypotenuse: 3, leg: 5 })).toThrow(ValidationError);
  });
});

describe('geometry/conversions: coordinate geometry', () => {
  it('distanceBetweenPoints: 3-4-5 right triangle', () => {
    const fn = forge({ x1: meter, y1: meter, x2: meter, y2: meter }, meter, {
      via: distanceBetweenPoints,
    });
    expect(fn({ x1: 0, y1: 0, x2: 3, y2: 4 })).toBeCloseTo(5, 12);
  });

  it('distanceBetweenPoints accepts negative coordinates', () => {
    const fn = forge({ x1: meter, y1: meter, x2: meter, y2: meter }, meter, {
      via: distanceBetweenPoints,
    });
    expect(fn({ x1: -1, y1: -1, x2: 2, y2: 3 })).toBeCloseTo(5, 12);
  });

  it('distanceBetweenPoints rejects NaN/Infinity', () => {
    const fn = forge({ x1: meter, y1: meter, x2: meter, y2: meter }, meter, {
      via: distanceBetweenPoints,
    });
    expect(() => fn({ x1: Number.NaN, y1: 0, x2: 0, y2: 0 })).toThrow(ValidationError);
    expect(() => fn({ x1: 0, y1: Number.POSITIVE_INFINITY, x2: 0, y2: 0 })).toThrow(
      ValidationError,
    );
  });

  it('midpointBetweenPoints returns {x, y} object', () => {
    const fn = forge(
      { x1: meter, y1: meter, x2: meter, y2: meter },
      { x: meter, y: meter },
      { via: midpointBetweenPoints },
    );
    const result = fn({ x1: 0, y1: 0, x2: 4, y2: 6 });
    expect(result.x).toBeCloseTo(2, 12);
    expect(result.y).toBeCloseTo(3, 12);
  });

  it('midpointBetweenPoints accepts negative coordinates', () => {
    const fn = forge(
      { x1: meter, y1: meter, x2: meter, y2: meter },
      { x: meter, y: meter },
      { via: midpointBetweenPoints },
    );
    const result = fn({ x1: -2, y1: -4, x2: 4, y2: 8 });
    expect(result.x).toBeCloseTo(1, 12);
    expect(result.y).toBeCloseTo(2, 12);
  });
});

describe('geometry/conversions: ellipse perimeter (Ramanujan II)', () => {
  it('agrees with circle circumference for a = b (degenerate case)', () => {
    const ellipse = forge({ a: meter, b: meter }, meter, {
      via: perimeterOfEllipseSemiAxes,
    });
    const circle = forge({ radius: meter }, meter, {
      via: circumferenceOfCircleFromRadius,
    });
    // Within Ramanujan II's accuracy: a = b is the easiest case (zero
    // eccentricity), should agree very tightly.
    expect(ellipse({ a: 5, b: 5 })).toBeCloseTo(circle({ radius: 5 }), 6);
  });

  it('moderate eccentricity (3:2) lands within published error band', () => {
    const fn = forge({ a: meter, b: meter }, meter, {
      via: perimeterOfEllipseSemiAxes,
    });
    // Ellipse with a = 3, b = 2. Numerical reference value (integrated
    // elliptic integral) ≈ 15.86543958. Ramanujan II should be within
    // 4e-5 relative error (and is much better than that here).
    const expected = 15.86543958891069;
    const actual = fn({ a: 3, b: 2 });
    expect(Math.abs(actual - expected) / expected).toBeLessThan(4e-5);
  });

  it('rejects negative inputs', () => {
    const fn = forge({ a: meter, b: meter }, meter, {
      via: perimeterOfEllipseSemiAxes,
    });
    expect(() => fn({ a: -1, b: 1 })).toThrow(ValidationError);
  });
});

describe('geometry/conversions: VOLUME derivations', () => {
  describe('volumeFromCuboidLengthAndWidthAndHeight', () => {
    it('l × w × h = volume in base units', () => {
      const fn = forge({ length: meter, width: meter, height: meter }, cubicMeter, {
        via: volumeFromCuboidLengthAndWidthAndHeight,
      });
      expect(fn({ length: 2, width: 3, height: 4 })).toBeCloseTo(24, 12);
      expect(fn({ length: 0, width: 5, height: 5 })).toBe(0);
    });
    it('honors mixed input units (cm × m × m)', () => {
      const fn = forge({ length: centimeter, width: meter, height: meter }, cubicMeter, {
        via: volumeFromCuboidLengthAndWidthAndHeight,
      });
      // 200 cm = 2 m; 2 × 3 × 4 = 24 m³
      expect(fn({ length: 200, width: 3, height: 4 })).toBeCloseTo(24, 9);
    });
    it('rejects any negative dimension; aggregates failures', () => {
      const fn = forge({ length: meter, width: meter, height: meter }, cubicMeter, {
        via: volumeFromCuboidLengthAndWidthAndHeight,
      });
      let caught: ValidationError | null = null;
      try {
        fn({ length: -1, width: -2, height: -3 });
      } catch (e) {
        caught = e instanceof ValidationError ? e : null;
      }
      if (!caught) throw new Error('expected ValidationError');
      expect(caught.failures).toHaveLength(3);
      expect(caught.failures.map((f) => f.key).sort()).toEqual(['height', 'length', 'width']);
    });
  });

  describe('volumeFromCubeSide', () => {
    it('side³ = volume in base units', () => {
      const fn = forge({ side: meter }, cubicMeter, { via: volumeFromCubeSide });
      expect(fn({ side: 2 })).toBeCloseTo(8, 12);
      expect(fn({ side: 3 })).toBeCloseTo(27, 12);
      expect(fn({ side: 0 })).toBe(0);
    });
    it('honors mixed input units (cm side → m³)', () => {
      const fn = forge({ side: centimeter }, cubicMeter, { via: volumeFromCubeSide });
      // 100 cm = 1 m → volume = 1 m³
      expect(fn({ side: 100 })).toBeCloseTo(1, 9);
    });
    it('rejects negative side', () => {
      const fn = forge({ side: meter }, cubicMeter, { via: volumeFromCubeSide });
      expect(() => fn({ side: -1 })).toThrow(ValidationError);
    });
  });

  describe('volumeFromSphereRadius', () => {
    it('(4/3) π r³ = volume in base units', () => {
      const fn = forge({ radius: meter }, cubicMeter, { via: volumeFromSphereRadius });
      expect(fn({ radius: 1 })).toBeCloseTo((4 / 3) * Math.PI, 12);
      expect(fn({ radius: 2 })).toBeCloseTo((4 / 3) * Math.PI * 8, 12);
      expect(fn({ radius: 0 })).toBe(0);
    });
    it('honors mixed input units (cm radius → m³ volume)', () => {
      const fn = forge({ radius: centimeter }, cubicMeter, { via: volumeFromSphereRadius });
      // 100 cm = 1 m → volume = (4/3) π m³
      expect(fn({ radius: 100 })).toBeCloseTo((4 / 3) * Math.PI, 9);
    });
    it('rejects negative radius', () => {
      const fn = forge({ radius: meter }, cubicMeter, { via: volumeFromSphereRadius });
      expect(() => fn({ radius: -1 })).toThrow(ValidationError);
    });
  });

  describe('volumeFromCylinderRadiusAndHeight', () => {
    it('π r² h = volume in base units', () => {
      const fn = forge({ radius: meter, height: meter }, cubicMeter, {
        via: volumeFromCylinderRadiusAndHeight,
      });
      expect(fn({ radius: 1, height: 1 })).toBeCloseTo(Math.PI, 12);
      expect(fn({ radius: 2, height: 5 })).toBeCloseTo(20 * Math.PI, 12);
      expect(fn({ radius: 0, height: 10 })).toBe(0);
    });
    it('honors mixed input units (cm radius, m height)', () => {
      const fn = forge({ radius: centimeter, height: meter }, cubicMeter, {
        via: volumeFromCylinderRadiusAndHeight,
      });
      // 100 cm = 1 m; π × 1² × 5 = 5π
      expect(fn({ radius: 100, height: 5 })).toBeCloseTo(5 * Math.PI, 9);
    });
    it('rejects negative radius or height; aggregates', () => {
      const fn = forge({ radius: meter, height: meter }, cubicMeter, {
        via: volumeFromCylinderRadiusAndHeight,
      });
      let caught: ValidationError | null = null;
      try {
        fn({ radius: -1, height: -1 });
      } catch (e) {
        caught = e instanceof ValidationError ? e : null;
      }
      if (!caught) throw new Error('expected ValidationError');
      expect(caught.failures).toHaveLength(2);
    });
  });
});

describe('geometry/units: VOLUME additions', () => {
  describe('cubicMillimeter', () => {
    it('has the right shape', () => {
      expect(cubicMillimeter.id).toBe('cubic-millimeter');
      expect(cubicMillimeter.label).toBe('Cubic Millimeter');
      expect(cubicMillimeter.symbol).toBe('mm³');
      expect(cubicMillimeter.dimension).toBe(VOLUME);
    });
    it('1 mm³ = 1e-9 m³', () => {
      expect(cubicMillimeter.toBase(1)).toBeCloseTo(1e-9, 18);
    });
  });

  describe('cubicDecimeter', () => {
    it('has the right shape', () => {
      expect(cubicDecimeter.id).toBe('cubic-decimeter');
      expect(cubicDecimeter.label).toBe('Cubic Decimeter');
      expect(cubicDecimeter.symbol).toBe('dm³');
      expect(cubicDecimeter.dimension).toBe(VOLUME);
    });
    it('1 dm³ = 1 L (CGPM 1964 redefinition)', () => {
      expect(cubicDecimeter.toBase(1)).toBeCloseTo(liter.toBase(1), 14);
    });
  });

  describe('cubicKilometer', () => {
    it('has the right shape', () => {
      expect(cubicKilometer.id).toBe('cubic-kilometer');
      expect(cubicKilometer.label).toBe('Cubic Kilometer');
      expect(cubicKilometer.symbol).toBe('km³');
      expect(cubicKilometer.dimension).toBe(VOLUME);
    });
    it('1 km³ = 1e9 m³', () => {
      expect(cubicKilometer.toBase(1)).toBe(1e9);
    });
  });

  describe('cubicYard', () => {
    it('has the right shape', () => {
      expect(cubicYard.id).toBe('cubic-yard');
      expect(cubicYard.label).toBe('Cubic Yard');
      expect(cubicYard.symbol).toBe('yd³');
      expect(cubicYard.dimension).toBe(VOLUME);
    });
    it('1 yd³ = 0.764554857984 m³ (exact)', () => {
      expect(cubicYard.toBase(1)).toBeCloseTo(0.764554857984, 14);
    });
    it('27 ft³ = 1 yd³ (exact)', () => {
      expect(cubicFoot.toBase(27)).toBeCloseTo(cubicYard.toBase(1), 14);
    });
  });

  describe('centiliter', () => {
    it('has the right shape', () => {
      expect(centiliter.id).toBe('centiliter');
      expect(centiliter.label).toBe('Centiliter');
      expect(centiliter.symbol).toBe('cL');
      expect(centiliter.dimension).toBe(VOLUME);
    });
    it('10 mL = 1 cL', () => {
      expect(milliliter.toBase(10)).toBeCloseTo(centiliter.toBase(1), 14);
    });
  });

  describe('deciliter', () => {
    it('has the right shape', () => {
      expect(deciliter.id).toBe('deciliter');
      expect(deciliter.label).toBe('Deciliter');
      expect(deciliter.symbol).toBe('dL');
      expect(deciliter.dimension).toBe(VOLUME);
    });
    it('100 mL = 1 dL', () => {
      expect(milliliter.toBase(100)).toBeCloseTo(deciliter.toBase(1), 14);
    });
  });
});

describe('geometry/units: ANGLE', () => {
  describe('radian (base)', () => {
    it('has the right shape', () => {
      expect(radian.id).toBe('radian');
      expect(radian.label).toBe('Radian');
      expect(radian.symbol).toBe('rad');
      expect(radian.dimension).toBe(ANGLE);
      expect(radian.base).toBe(true);
    });

    it('toBase / fromBase are identity', () => {
      expect(radian.toBase(1.5)).toBe(1.5);
      expect(radian.fromBase(1.5)).toBe(1.5);
    });
  });

  describe('degree', () => {
    it('has the right shape', () => {
      expect(degree.id).toBe('degree');
      expect(degree.label).toBe('Degree');
      expect(degree.symbol).toBe('°');
      expect(degree.dimension).toBe(ANGLE);
    });

    it('180° = π rad', () => {
      expect(degree.toBase(180)).toBeCloseTo(Math.PI, 12);
    });

    it('round-trips through base', () => {
      expect(degree.fromBase(degree.toBase(45))).toBeCloseTo(45, 12);
    });
  });

  describe('gradian', () => {
    it('has the right shape', () => {
      expect(gradian.id).toBe('gradian');
      expect(gradian.label).toBe('Gradian');
      expect(gradian.symbol).toBe('gon');
      expect(gradian.dimension).toBe(ANGLE);
    });

    it('400 gon = 2π rad (one turn)', () => {
      expect(gradian.toBase(400)).toBeCloseTo(2 * Math.PI, 12);
    });

    it('round-trips through base', () => {
      expect(gradian.fromBase(gradian.toBase(100))).toBeCloseTo(100, 12);
    });
  });

  describe('arcminute', () => {
    it('has the right shape', () => {
      expect(arcminute.id).toBe('arcminute');
      expect(arcminute.label).toBe('Arcminute');
      expect(arcminute.symbol).toBe("'");
      expect(arcminute.dimension).toBe(ANGLE);
    });

    it('60 arcminutes = 1 degree', () => {
      expect(arcminute.toBase(60)).toBeCloseTo(degree.toBase(1), 14);
    });

    it('round-trips through base', () => {
      expect(arcminute.fromBase(arcminute.toBase(30))).toBeCloseTo(30, 12);
    });
  });

  describe('arcsecond', () => {
    it('has the right shape', () => {
      expect(arcsecond.id).toBe('arcsecond');
      expect(arcsecond.label).toBe('Arcsecond');
      expect(arcsecond.symbol).toBe('"');
      expect(arcsecond.dimension).toBe(ANGLE);
    });

    it('3600 arcseconds = 1 degree', () => {
      expect(arcsecond.toBase(3600)).toBeCloseTo(degree.toBase(1), 14);
    });

    it('round-trips through base', () => {
      expect(arcsecond.fromBase(arcsecond.toBase(7200))).toBeCloseTo(7200, 9);
    });
  });

  describe('turn', () => {
    it('has the right shape', () => {
      expect(turn.id).toBe('turn');
      expect(turn.label).toBe('Turn');
      expect(turn.symbol).toBe('tr');
      expect(turn.dimension).toBe(ANGLE);
    });

    it('1 turn = 2π rad', () => {
      expect(turn.toBase(1)).toBeCloseTo(2 * Math.PI, 12);
    });

    it('round-trips through base', () => {
      expect(turn.fromBase(turn.toBase(0.25))).toBeCloseTo(0.25, 12);
    });
  });

  describe('within-dimension forge across ANGLE', () => {
    it('forges 90° to π/2 rad', () => {
      expect(forge(degree, radian)(90)).toBeCloseTo(Math.PI / 2, 12);
    });

    it('forges 1 turn to 360°', () => {
      expect(forge(turn, degree)(1)).toBeCloseTo(360, 12);
    });
  });
});
