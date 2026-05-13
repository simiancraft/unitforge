// All units shipped by the data-storage kit. Named-export-per-unit; per-export
// tree-shaking under `sideEffects: false` works because:
//   1. Each `defineUnit({...})` is annotated `/*#__PURE__*/`, which tells
//      bundlers (esbuild, rollup, webpack) the call is side-effect-free.
//   2. The spec object literal contains NO function calls; `toBase` and
//      `fromBase` are inline arrow closures, not `...linear(scale)` spreads.
//      A CallExpression inside the literal (even when PURE-marked itself)
//      defeats per-export tree-shaking because the bundler treats the whole
//      RHS expression as needed once the variable is referenced.
//
// Authoring convention for kit units: inline closures here. The `linear`
// helper exported from the root barrel is for ad-hoc userland use, not for
// kit unit definitions; using it here would re-introduce the spread and
// regress per-unit tree-shake.
//
// Naming convention: kilobyte/megabyte/... are decimal (×1000^n, per the SI
// prefix system as published in the BIPM SI Brochure, 9th ed., Table 7, and
// codified for storage by the disk industry through IDEMA and the SFF
// Committee); kibibyte/mebibyte/... are binary (×1024^n, per IEC 80000-13:2008
// "Quantities and units - Part 13: Information science and technology",
// §13-9 through §13-16). Both are shipped because conflating them is the
// canonical units-library bug this dimension exists to prevent.
//
// JEDEC's separate convention (JEDEC Standard 100B.01, §3.16) defines K/M/G
// as 2^10 / 2^20 / 2^30 in semiconductor memory contexts only. That
// convention is the historical source of the kB/KiB confusion; it does not
// apply to file or disk capacity, and the kit deliberately does not ship a
// "JEDEC kilobyte" as a third unit (the right disambiguating spelling is
// `kibibyte`, already provided).
//
// Bits are 1/8 byte and share the DATA dimension since network throughput
// specs (gigabit Ethernet, per IEEE 802.3) describe the same quantity as
// storage (gigabyte file) at a different scale.

import { defineUnit } from '../../define.js';
import { DATA } from '../../dimensions.js';

// ─── BYTES (base + decimal multiples) ────────────────────────────────────

/** The base unit of DATA. */
export const byte = /*#__PURE__*/ defineUnit({
  id: 'byte',
  label: 'Byte',
  symbol: 'B',
  dimension: DATA,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** 1 kB = 1000 bytes (decimal/SI; per BIPM SI Brochure Table 7 and the
 *  disk-industry convention codified by IDEMA / SFF). */
export const kilobyte = /*#__PURE__*/ defineUnit({
  id: 'kilobyte',
  label: 'Kilobyte',
  symbol: 'kB',
  dimension: DATA,
  toBase: (v) => v * 1000,
  fromBase: (b) => b / 1000,
});

/** 1 MB = 1 000 000 bytes (decimal/SI). */
export const megabyte = /*#__PURE__*/ defineUnit({
  id: 'megabyte',
  label: 'Megabyte',
  symbol: 'MB',
  dimension: DATA,
  toBase: (v) => v * 1_000_000,
  fromBase: (b) => b / 1_000_000,
});

/** 1 GB = 10⁹ bytes (decimal/SI). */
export const gigabyte = /*#__PURE__*/ defineUnit({
  id: 'gigabyte',
  label: 'Gigabyte',
  symbol: 'GB',
  dimension: DATA,
  toBase: (v) => v * 1_000_000_000,
  fromBase: (b) => b / 1_000_000_000,
});

/** 1 TB = 10¹² bytes (decimal/SI). */
export const terabyte = /*#__PURE__*/ defineUnit({
  id: 'terabyte',
  label: 'Terabyte',
  symbol: 'TB',
  dimension: DATA,
  toBase: (v) => v * 1_000_000_000_000,
  fromBase: (b) => b / 1_000_000_000_000,
});

/** 1 PB = 10¹⁵ bytes (decimal/SI). */
export const petabyte = /*#__PURE__*/ defineUnit({
  id: 'petabyte',
  label: 'Petabyte',
  symbol: 'PB',
  dimension: DATA,
  toBase: (v) => v * 1_000_000_000_000_000,
  fromBase: (b) => b / 1_000_000_000_000_000,
});

/** 1 EB = 10¹⁸ bytes (decimal/SI). Operating scale of AWS S3 and global
 *  datasphere reports; first decimal byte tier that no longer round-trips
 *  to an exact Float64 integer (10¹⁸ < 2^60 but `Number.MAX_SAFE_INTEGER`
 *  is 2^53−1 ≈ 9.007 × 10¹⁵; any byte count ≥ 1 EB has fewer than
 *  ~16 significant digits of precision). Caveat applies to ZB and YB
 *  below as well. */
export const exabyte = /*#__PURE__*/ defineUnit({
  id: 'exabyte',
  label: 'Exabyte',
  symbol: 'EB',
  dimension: DATA,
  toBase: (v) => v * 1_000_000_000_000_000_000,
  fromBase: (b) => b / 1_000_000_000_000_000_000,
});

/** 1 ZB = 10²¹ bytes (decimal/SI). Operating scale of IDC "global
 *  datasphere" reports; values converted to or from byte exceed
 *  `Number.MAX_SAFE_INTEGER` (see {@link exabyte}). */
export const zettabyte = /*#__PURE__*/ defineUnit({
  id: 'zettabyte',
  label: 'Zettabyte',
  symbol: 'ZB',
  dimension: DATA,
  toBase: (v) => v * 1e21,
  fromBase: (b) => b / 1e21,
});

/** 1 YB = 10²⁴ bytes (decimal/SI). Beyond any single deployed system in
 *  2026; shipped for ladder completeness. Values converted to or from
 *  byte exceed `Number.MAX_SAFE_INTEGER` (see {@link exabyte}). */
export const yottabyte = /*#__PURE__*/ defineUnit({
  id: 'yottabyte',
  label: 'Yottabyte',
  symbol: 'YB',
  dimension: DATA,
  toBase: (v) => v * 1e24,
  fromBase: (b) => b / 1e24,
});

// ─── BYTES (binary / IEC 80000-13 multiples) ─────────────────────────────

/** 1 KiB = 1024 bytes (binary; see kit header for IEC 80000-13:2008 cite). */
export const kibibyte = /*#__PURE__*/ defineUnit({
  id: 'kibibyte',
  label: 'Kibibyte',
  symbol: 'KiB',
  dimension: DATA,
  toBase: (v) => v * 1024,
  fromBase: (b) => b / 1024,
});

/** 1 MiB = 1024² = 1 048 576 bytes (binary; see kit header for IEC cite). */
export const mebibyte = /*#__PURE__*/ defineUnit({
  id: 'mebibyte',
  label: 'Mebibyte',
  symbol: 'MiB',
  dimension: DATA,
  toBase: (v) => v * 1_048_576,
  fromBase: (b) => b / 1_048_576,
});

/** 1 GiB = 1024³ = 1 073 741 824 bytes (binary; see kit header for IEC cite). */
export const gibibyte = /*#__PURE__*/ defineUnit({
  id: 'gibibyte',
  label: 'Gibibyte',
  symbol: 'GiB',
  dimension: DATA,
  toBase: (v) => v * 1_073_741_824,
  fromBase: (b) => b / 1_073_741_824,
});

/** 1 TiB = 1024⁴ = 1 099 511 627 776 bytes (binary; see kit header for IEC cite). */
export const tebibyte = /*#__PURE__*/ defineUnit({
  id: 'tebibyte',
  label: 'Tebibyte',
  symbol: 'TiB',
  dimension: DATA,
  toBase: (v) => v * 1_099_511_627_776,
  fromBase: (b) => b / 1_099_511_627_776,
});

/** 1 PiB = 1024⁵ = 1 125 899 906 842 624 bytes (binary; see kit header for IEC cite). */
export const pebibyte = /*#__PURE__*/ defineUnit({
  id: 'pebibyte',
  label: 'Pebibyte',
  symbol: 'PiB',
  dimension: DATA,
  toBase: (v) => v * 1_125_899_906_842_624,
  fromBase: (b) => b / 1_125_899_906_842_624,
});

// ─── BITS (1 bit = 1/8 byte; decimal multiples for throughput) ───────────

/** 1 bit = 0.125 byte; 8 bits = 1 byte. */
export const bit = /*#__PURE__*/ defineUnit({
  id: 'bit',
  label: 'Bit',
  symbol: 'bit',
  dimension: DATA,
  toBase: (v) => v * 0.125,
  fromBase: (b) => b / 0.125,
});

/** 1 kbit = 1000 bits = 125 bytes (decimal; per IEEE 802.3 line-rate convention). */
export const kilobit = /*#__PURE__*/ defineUnit({
  id: 'kilobit',
  label: 'Kilobit',
  symbol: 'kbit',
  dimension: DATA,
  toBase: (v) => v * 125,
  fromBase: (b) => b / 125,
});

/** 1 Mbit = 10⁶ bits = 125 000 bytes (decimal; per IEEE 802.3). */
export const megabit = /*#__PURE__*/ defineUnit({
  id: 'megabit',
  label: 'Megabit',
  symbol: 'Mbit',
  dimension: DATA,
  toBase: (v) => v * 125_000,
  fromBase: (b) => b / 125_000,
});

/** 1 Gbit = 10⁹ bits = 125 000 000 bytes (decimal; per IEEE 802.3). */
export const gigabit = /*#__PURE__*/ defineUnit({
  id: 'gigabit',
  label: 'Gigabit',
  symbol: 'Gbit',
  dimension: DATA,
  toBase: (v) => v * 125_000_000,
  fromBase: (b) => b / 125_000_000,
});
