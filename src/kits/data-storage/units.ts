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
// Naming convention: kilobyte/megabyte/... are decimal (×1000^n, per SI/JEDEC
// disk-vendor convention); kibibyte/mebibyte/... are binary (×1024^n, per
// IEC 80000-13). Both are shipped because conflating them is the canonical
// units-library bug this dimension exists to prevent. Bits are 1/8 byte and
// share the DATA dimension since network throughput specs (gigabit ethernet)
// describe the same quantity as storage (gigabyte file) at a different scale.

import { defineUnit } from '../../define.js';
import { DATA } from '../../dimensions.js';

// ─── BYTES (base + decimal multiples) ────────────────────────────────────

/** The base unit of DATA. */
export const byte = /*#__PURE__*/ defineUnit({
  name: 'byte',
  dimension: DATA,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

/** 1 kB = 1000 bytes (decimal/SI; per JEDEC and disk-vendor convention). */
export const kilobyte = /*#__PURE__*/ defineUnit({
  name: 'kilobyte',
  dimension: DATA,
  toBase: (v) => v * 1000,
  fromBase: (b) => b / 1000,
});

/** 1 MB = 1 000 000 bytes (decimal/SI). */
export const megabyte = /*#__PURE__*/ defineUnit({
  name: 'megabyte',
  dimension: DATA,
  toBase: (v) => v * 1_000_000,
  fromBase: (b) => b / 1_000_000,
});

/** 1 GB = 10⁹ bytes (decimal/SI). */
export const gigabyte = /*#__PURE__*/ defineUnit({
  name: 'gigabyte',
  dimension: DATA,
  toBase: (v) => v * 1_000_000_000,
  fromBase: (b) => b / 1_000_000_000,
});

/** 1 TB = 10¹² bytes (decimal/SI). */
export const terabyte = /*#__PURE__*/ defineUnit({
  name: 'terabyte',
  dimension: DATA,
  toBase: (v) => v * 1_000_000_000_000,
  fromBase: (b) => b / 1_000_000_000_000,
});

/** 1 PB = 10¹⁵ bytes (decimal/SI). */
export const petabyte = /*#__PURE__*/ defineUnit({
  name: 'petabyte',
  dimension: DATA,
  toBase: (v) => v * 1_000_000_000_000_000,
  fromBase: (b) => b / 1_000_000_000_000_000,
});

// ─── BYTES (binary / IEC 80000-13 multiples) ─────────────────────────────

/** 1 KiB = 1024 bytes (binary; IEC 80000-13). */
export const kibibyte = /*#__PURE__*/ defineUnit({
  name: 'kibibyte',
  dimension: DATA,
  toBase: (v) => v * 1024,
  fromBase: (b) => b / 1024,
});

/** 1 MiB = 1024² = 1 048 576 bytes (binary; IEC 80000-13). */
export const mebibyte = /*#__PURE__*/ defineUnit({
  name: 'mebibyte',
  dimension: DATA,
  toBase: (v) => v * 1_048_576,
  fromBase: (b) => b / 1_048_576,
});

/** 1 GiB = 1024³ = 1 073 741 824 bytes (binary; IEC 80000-13). */
export const gibibyte = /*#__PURE__*/ defineUnit({
  name: 'gibibyte',
  dimension: DATA,
  toBase: (v) => v * 1_073_741_824,
  fromBase: (b) => b / 1_073_741_824,
});

/** 1 TiB = 1024⁴ = 1 099 511 627 776 bytes (binary; IEC 80000-13). */
export const tebibyte = /*#__PURE__*/ defineUnit({
  name: 'tebibyte',
  dimension: DATA,
  toBase: (v) => v * 1_099_511_627_776,
  fromBase: (b) => b / 1_099_511_627_776,
});

/** 1 PiB = 1024⁵ = 1 125 899 906 842 624 bytes (binary; IEC 80000-13). */
export const pebibyte = /*#__PURE__*/ defineUnit({
  name: 'pebibyte',
  dimension: DATA,
  toBase: (v) => v * 1_125_899_906_842_624,
  fromBase: (b) => b / 1_125_899_906_842_624,
});

// ─── BITS (1 bit = 1/8 byte; decimal multiples for throughput) ───────────

/** 1 bit = 0.125 byte; 8 bits = 1 byte. */
export const bit = /*#__PURE__*/ defineUnit({
  name: 'bit',
  dimension: DATA,
  toBase: (v) => v * 0.125,
  fromBase: (b) => b / 0.125,
});

/** 1 kbit = 1000 bits = 125 bytes (decimal; per IEEE 802 throughput convention). */
export const kilobit = /*#__PURE__*/ defineUnit({
  name: 'kilobit',
  dimension: DATA,
  toBase: (v) => v * 125,
  fromBase: (b) => b / 125,
});

/** 1 Mbit = 10⁶ bits = 125 000 bytes (decimal; per IEEE 802). */
export const megabit = /*#__PURE__*/ defineUnit({
  name: 'megabit',
  dimension: DATA,
  toBase: (v) => v * 125_000,
  fromBase: (b) => b / 125_000,
});

/** 1 Gbit = 10⁹ bits = 125 000 000 bytes (decimal; per IEEE 802). */
export const gigabit = /*#__PURE__*/ defineUnit({
  name: 'gigabit',
  dimension: DATA,
  toBase: (v) => v * 125_000_000,
  fromBase: (b) => b / 125_000_000,
});
