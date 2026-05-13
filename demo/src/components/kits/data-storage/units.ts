// Per-kit unit catalogs for the data-storage surfaces. Three semantic
// families (SI decimal, IEC binary, bits) are listed explicitly so the
// demo doesn't have to re-derive the grouping from id morphology; if
// the lib adds a new bit/byte unit, drop it in the relevant family
// here and the picker + readout matrix follow on next build.

import type { Unit } from 'unitforge';
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

export const DATA_DECIMAL_UNITS = [byte, kilobyte, megabyte, gigabyte, terabyte, petabyte] as const;

export const DATA_BINARY_UNITS = [kibibyte, mebibyte, gibibyte, tebibyte, pebibyte] as const;

export const DATA_BIT_UNITS = [bit, kilobit, megabit, gigabit] as const;

export const DATA_ALL_UNITS = [
  ...DATA_DECIMAL_UNITS,
  ...DATA_BINARY_UNITS,
  ...DATA_BIT_UNITS,
] as const;

export type DataUnit = Unit<'data', number>;
