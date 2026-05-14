// Per-kit unit catalogs for the geometry surfaces. Each entry is just
// the unit object imported by name from `unitforge/kits/geometry`;
// `unit.id`, `unit.label`, `unit.symbol` carry everything the demo
// needs at display, state-key, and code-template surfaces. Adding a
// unit means importing it and dropping it in the relevant catalog.

import type { Unit } from 'unitforge';
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
  milliliter,
  millimeter,
  squareCentimeter,
  squareFoot,
  squareInch,
  squareMeter,
  squareMillimeter,
  statuteMile,
  yard,
} from 'unitforge/kits/geometry';

export const LENGTH_UNITS = [
  millimeter,
  centimeter,
  meter,
  kilometer,
  inch,
  foot,
  yard,
  statuteMile,
] as const;

export const AREA_UNITS = [
  squareMillimeter,
  squareCentimeter,
  squareMeter,
  squareInch,
  squareFoot,
  acre,
  hectare,
] as const;

export const VOLUME_UNITS = [
  cubicCentimeter,
  cubicInch,
  cubicFoot,
  cubicMeter,
  liter,
  milliliter,
] as const;

export type LengthUnit = Unit<'length', number>;
export type AreaUnit = Unit<'area', number>;
export type VolumeUnit = Unit<'volume', number>;
