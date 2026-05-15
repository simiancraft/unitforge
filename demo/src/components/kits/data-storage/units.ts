// Per-kit unit catalogs for the data-storage surfaces. Four semantic
// families now (decimal bytes, binary bytes, bits, vocabulary aliases)
// are listed explicitly so the demo doesn't have to re-derive groupings
// from id morphology; if the lib adds a new unit, drop it in the
// relevant family here and the picker + readout matrix follow on next
// build.
//
// `DATA_ALIAS_UNITS` is the new family for vocabulary synonyms (octet ≡
// byte; ISO/IEC 80000-13 / IETF RFC convention). Kept separate from
// `DATA_DECIMAL_UNITS` so the picker doesn't list `octet` next to
// `byte` and read as a duplicate; HelloBytes renders aliases as its
// own readout column.

import type { Unit } from 'unitforge';
import {
  bit,
  byte,
  exabyte,
  exbibyte,
  gibibyte,
  gigabit,
  gigabyte,
  kibibyte,
  kilobit,
  kilobyte,
  mebibyte,
  megabit,
  megabyte,
  octet,
  pebibyte,
  petabit,
  petabyte,
  tebibyte,
  terabit,
  terabyte,
  yobibyte,
  yottabyte,
  zebibyte,
  zettabyte,
} from 'unitforge/kits/data-storage';

export const DATA_DECIMAL_UNITS = [
  byte,
  kilobyte,
  megabyte,
  gigabyte,
  terabyte,
  petabyte,
  exabyte,
  zettabyte,
  yottabyte,
] as const;

export const DATA_BINARY_UNITS = [
  kibibyte,
  mebibyte,
  gibibyte,
  tebibyte,
  pebibyte,
  exbibyte,
  zebibyte,
  yobibyte,
] as const;

export const DATA_BIT_UNITS = [bit, kilobit, megabit, gigabit, terabit, petabit] as const;

export const DATA_ALIAS_UNITS = [octet] as const;

export const DATA_ALL_UNITS = [
  ...DATA_DECIMAL_UNITS,
  ...DATA_BINARY_UNITS,
  ...DATA_BIT_UNITS,
  ...DATA_ALIAS_UNITS,
] as const;

export type DataUnit = Unit<'data', number>;
