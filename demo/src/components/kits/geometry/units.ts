// Per-kit unit catalogs for the geometry surfaces. Each entry is just
// the unit object imported by name from `unitforge/kits/geometry`;
// `unit.id`, `unit.label`, `unit.symbol` carry everything the demo
// needs at display, state-key, and code-template surfaces. Adding a
// unit means importing it and dropping it in the relevant catalog.
//
// The four catalogs (LENGTH, AREA, VOLUME, ANGLE) mirror the four
// dimensions the geometry kit exports, with full library coverage:
// every unit shipped by `unitforge/kits/geometry` appears in the
// catalog of its dimension. Ordering within each catalog is metric
// first (smallest to largest), then customary, then astronomy /
// niche where applicable.

import type { Unit } from 'unitforge';
import {
  acre,
  angstrom,
  arcminute,
  arcsecond,
  are,
  astronomicalUnit,
  centiliter,
  centimeter,
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
  milliliter,
  millimeter,
  nanometer,
  nauticalMile,
  parsec,
  radian,
  squareCentimeter,
  squareFoot,
  squareInch,
  squareKilometer,
  squareMeter,
  squareMile,
  squareMillimeter,
  squareYard,
  statuteMile,
  turn,
  yard,
} from 'unitforge/kits/geometry';

export const LENGTH_UNITS = [
  nanometer,
  angstrom,
  micrometer,
  millimeter,
  centimeter,
  decimeter,
  meter,
  kilometer,
  mil,
  inch,
  foot,
  yard,
  fathom,
  statuteMile,
  nauticalMile,
  astronomicalUnit,
  lightYear,
  parsec,
] as const;

export const AREA_UNITS = [
  squareMillimeter,
  squareCentimeter,
  squareMeter,
  are,
  hectare,
  squareKilometer,
  squareInch,
  squareFoot,
  squareYard,
  acre,
  squareMile,
] as const;

export const VOLUME_UNITS = [
  cubicMillimeter,
  cubicCentimeter,
  cubicDecimeter,
  cubicMeter,
  cubicKilometer,
  milliliter,
  centiliter,
  deciliter,
  liter,
  cubicInch,
  cubicFoot,
  cubicYard,
] as const;

export const ANGLE_UNITS = [radian, degree, gradian, arcminute, arcsecond, turn] as const;

export type LengthUnit = Unit<'length', number>;
export type AreaUnit = Unit<'area', number>;
export type VolumeUnit = Unit<'volume', number>;
export type AngleUnit = Unit<'angle', number>;
