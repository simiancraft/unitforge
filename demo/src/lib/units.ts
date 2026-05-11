// Per-kit unit option catalogs for the demo UnitPicker dropdowns. Kept in
// one place so widgets can import a stable `{ key, label, value }[]` shape
// instead of building option lists inline.

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
  mile,
  milliliter,
  millimeter,
  squareCentimeter,
  squareFoot,
  squareInch,
  squareMeter,
  squareMillimeter,
  yard,
} from 'unitforge/kits/geometry';
import {
  bit,
  byte,
  gibibyte,
  gigabit,
  gigabyte,
  kibibyte,
  kilobit,
  kilobyte,
  mebibyte,
  megabit,
  megabyte,
  pebibyte,
  petabyte,
  tebibyte,
  terabyte,
} from 'unitforge/kits/data-storage';

export interface UnitOption<D extends string = string> {
  key: string;
  label: string;
  unit: Unit<D, number>;
}

export const LENGTH_UNITS: ReadonlyArray<UnitOption<'length'>> = [
  { key: 'mm', label: 'millimeter', unit: millimeter },
  { key: 'cm', label: 'centimeter', unit: centimeter },
  { key: 'm', label: 'meter', unit: meter },
  { key: 'km', label: 'kilometer', unit: kilometer },
  { key: 'in', label: 'inch', unit: inch },
  { key: 'ft', label: 'foot', unit: foot },
  { key: 'yd', label: 'yard', unit: yard },
  { key: 'mi', label: 'mile', unit: mile },
];

export const AREA_UNITS: ReadonlyArray<UnitOption<'area'>> = [
  { key: 'mm2', label: 'square millimeter', unit: squareMillimeter },
  { key: 'cm2', label: 'square centimeter', unit: squareCentimeter },
  { key: 'm2', label: 'square meter', unit: squareMeter },
  { key: 'in2', label: 'square inch', unit: squareInch },
  { key: 'ft2', label: 'square foot', unit: squareFoot },
  { key: 'acre', label: 'acre', unit: acre },
  { key: 'ha', label: 'hectare', unit: hectare },
];

export const VOLUME_UNITS: ReadonlyArray<UnitOption<'volume'>> = [
  { key: 'cc', label: 'cubic centimeter', unit: cubicCentimeter },
  { key: 'in3', label: 'cubic inch', unit: cubicInch },
  { key: 'ft3', label: 'cubic foot', unit: cubicFoot },
  { key: 'm3', label: 'cubic meter', unit: cubicMeter },
  { key: 'L', label: 'liter', unit: liter },
  { key: 'mL', label: 'milliliter', unit: milliliter },
];

export const DATA_DECIMAL_UNITS: ReadonlyArray<UnitOption<'data'>> = [
  { key: 'B', label: 'byte', unit: byte },
  { key: 'kB', label: 'kilobyte', unit: kilobyte },
  { key: 'MB', label: 'megabyte', unit: megabyte },
  { key: 'GB', label: 'gigabyte', unit: gigabyte },
  { key: 'TB', label: 'terabyte', unit: terabyte },
  { key: 'PB', label: 'petabyte', unit: petabyte },
];

export const DATA_BINARY_UNITS: ReadonlyArray<UnitOption<'data'>> = [
  { key: 'KiB', label: 'kibibyte', unit: kibibyte },
  { key: 'MiB', label: 'mebibyte', unit: mebibyte },
  { key: 'GiB', label: 'gibibyte', unit: gibibyte },
  { key: 'TiB', label: 'tebibyte', unit: tebibyte },
  { key: 'PiB', label: 'pebibyte', unit: pebibyte },
];

export const DATA_BIT_UNITS: ReadonlyArray<UnitOption<'data'>> = [
  { key: 'bit', label: 'bit', unit: bit },
  { key: 'kbit', label: 'kilobit', unit: kilobit },
  { key: 'Mbit', label: 'megabit', unit: megabit },
  { key: 'Gbit', label: 'gigabit', unit: gigabit },
];

export const DATA_ALL_UNITS: ReadonlyArray<UnitOption<'data'>> = [
  ...DATA_DECIMAL_UNITS,
  ...DATA_BINARY_UNITS,
  ...DATA_BIT_UNITS,
];

export function findByKey<D extends string>(
  list: ReadonlyArray<UnitOption<D>>,
  key: string,
): UnitOption<D> {
  const found = list.find((o) => o.key === key);
  if (!found) throw new Error(`Unknown unit key: ${key}`);
  return found;
}

export function pickerOptions<D extends string>(
  list: ReadonlyArray<UnitOption<D>>,
) {
  return list.map(({ key, label }) => ({ key, label }));
}
