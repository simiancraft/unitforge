// Per-kit unit option catalogs for the demo UnitPicker dropdowns. Lists
// use `as const satisfies` so each catalog's `key` field is a literal
// union (autocompleted at the call site) while still being verified
// against `UnitOption<D>`. `findByKey` consumes that key union, so
// typos are caught at compile time instead of throwing in render.

import type { Dimension, ForgeInput } from 'unitforge';
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

/**
 * One row in a kit's unit catalog. `unit` is typed as `ForgeInput<D,
 * number>` (wider than `Unit<D, number>`) so it's directly assignable to
 * `forge`'s scalar overload without a cast even when D is generic.
 */
export interface UnitOption<D extends Dimension = Dimension, K extends string = string> {
  key: K;
  label: string;
  unit: ForgeInput<D, number>;
}

export const LENGTH_UNITS = [
  { key: 'mm', label: 'millimeter', unit: millimeter },
  { key: 'cm', label: 'centimeter', unit: centimeter },
  { key: 'm', label: 'meter', unit: meter },
  { key: 'km', label: 'kilometer', unit: kilometer },
  { key: 'in', label: 'inch', unit: inch },
  { key: 'ft', label: 'foot', unit: foot },
  { key: 'yd', label: 'yard', unit: yard },
  { key: 'mi', label: 'mile', unit: mile },
] as const satisfies ReadonlyArray<UnitOption<'length'>>;

export const AREA_UNITS = [
  { key: 'mm2', label: 'square millimeter', unit: squareMillimeter },
  { key: 'cm2', label: 'square centimeter', unit: squareCentimeter },
  { key: 'm2', label: 'square meter', unit: squareMeter },
  { key: 'in2', label: 'square inch', unit: squareInch },
  { key: 'ft2', label: 'square foot', unit: squareFoot },
  { key: 'acre', label: 'acre', unit: acre },
  { key: 'ha', label: 'hectare', unit: hectare },
] as const satisfies ReadonlyArray<UnitOption<'area'>>;

export const VOLUME_UNITS = [
  { key: 'cc', label: 'cubic centimeter', unit: cubicCentimeter },
  { key: 'in3', label: 'cubic inch', unit: cubicInch },
  { key: 'ft3', label: 'cubic foot', unit: cubicFoot },
  { key: 'm3', label: 'cubic meter', unit: cubicMeter },
  { key: 'L', label: 'liter', unit: liter },
  { key: 'mL', label: 'milliliter', unit: milliliter },
] as const satisfies ReadonlyArray<UnitOption<'volume'>>;

export const DATA_DECIMAL_UNITS = [
  { key: 'B', label: 'byte', unit: byte },
  { key: 'kB', label: 'kilobyte', unit: kilobyte },
  { key: 'MB', label: 'megabyte', unit: megabyte },
  { key: 'GB', label: 'gigabyte', unit: gigabyte },
  { key: 'TB', label: 'terabyte', unit: terabyte },
  { key: 'PB', label: 'petabyte', unit: petabyte },
] as const satisfies ReadonlyArray<UnitOption<'data'>>;

export const DATA_BINARY_UNITS = [
  { key: 'KiB', label: 'kibibyte', unit: kibibyte },
  { key: 'MiB', label: 'mebibyte', unit: mebibyte },
  { key: 'GiB', label: 'gibibyte', unit: gibibyte },
  { key: 'TiB', label: 'tebibyte', unit: tebibyte },
  { key: 'PiB', label: 'pebibyte', unit: pebibyte },
] as const satisfies ReadonlyArray<UnitOption<'data'>>;

export const DATA_BIT_UNITS = [
  { key: 'bit', label: 'bit', unit: bit },
  { key: 'kbit', label: 'kilobit', unit: kilobit },
  { key: 'Mbit', label: 'megabit', unit: megabit },
  { key: 'Gbit', label: 'gigabit', unit: gigabit },
] as const satisfies ReadonlyArray<UnitOption<'data'>>;

export const DATA_ALL_UNITS = [
  ...DATA_DECIMAL_UNITS,
  ...DATA_BINARY_UNITS,
  ...DATA_BIT_UNITS,
] as const satisfies ReadonlyArray<UnitOption<'data'>>;

// Key-union aliases for each catalog. Sections that hold a key in state
// import these so useState('m') doesn't widen to plain string, and so
// findByKey / UnitPicker callsites get literal-union autocomplete.
export type LengthKey = (typeof LENGTH_UNITS)[number]['key'];
export type AreaKey = (typeof AREA_UNITS)[number]['key'];
export type VolumeKey = (typeof VOLUME_UNITS)[number]['key'];
export type DataKey = (typeof DATA_ALL_UNITS)[number]['key'];

/**
 * Look up an entry by `key`. The return type is narrowed to the exact
 * tuple element so `findByKey(LENGTH_UNITS, 'm').key` hovers as the
 * literal `'m'`, not the full key union.
 */
export function findByKey<L extends ReadonlyArray<{ key: string }>, K extends L[number]['key']>(
  list: L,
  key: K,
): Extract<L[number], { key: K }> {
  const found = list.find((o) => o.key === key);
  if (!found) throw new Error(`Unknown unit key: ${String(key)}`);
  return found as Extract<L[number], { key: K }>;
}

/**
 * Project a unit catalog onto the `key`+`label` shape `UnitPicker` accepts.
 * The return type preserves the literal `key` union, so the picker's `K`
 * generic narrows correctly at the call site (no widening to `string`).
 */
export function pickerOptions<L extends ReadonlyArray<{ key: string; label: string }>>(
  list: L,
): ReadonlyArray<{ key: L[number]['key']; label: string }> {
  return list.map(({ key, label }) => ({ key, label }));
}
