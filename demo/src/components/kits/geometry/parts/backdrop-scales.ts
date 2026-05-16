// Dogfood: the engineering-paper grid spacing is itself a forge call.
// The geometry kit's "length" dimension feeds a cross-dimensional
// conversion whose output dimension is a kit-local "background grid
// cell size" in pixels. The conversion's `compute` is the linear
// scaling the user wants; clamping keeps the result inside a
// readable pixel range no matter how small (nanometer) or large
// (parsec) the chosen unit's magnitude.
//
// Why a dedicated dimension instead of a fudge factor: every visual
// axis the backdrop drives gets its own dimension + unit + conversion,
// so the demo source reads "forge a length into pixels" rather than
// "look up a number in a hand-rolled table". That IS the headline.

import { defineConversion, defineUnit, forge, type Unit } from 'unitforge';
import { clamp } from '~/lib/math.js';

const BG_GRID_CELL_DIMENSION = 'bg.grid_cell' as const;

const pxGridCell = defineUnit({
  id: 'bg-grid-cell-px',
  label: 'Background grid cell (px)',
  symbol: 'px',
  dimension: BG_GRID_CELL_DIMENSION,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

// Input domain (in meters) and output domain (in pixels). The kit
// spans many orders of magnitude (nanometer through parsec); a linear
// lerp over byte-scale would pin almost every human-pickable unit
// (mm, cm, in, ft, m) to the floor because they cluster within 4
// orders. We lerp over log10(meters) instead, so each rung of the
// ladder steps the visible cell one notch larger and a meter visibly
// differs from a foot. Clamped at the endpoints so a nanometer and a
// parsec both pin sanely.
const MIN_LENGTH_M = 1e-9;
const MAX_LENGTH_M = 1e9;
const MIN_CELL_PX = 8;
const MAX_CELL_PX = 64;

const gridCellFromLength = defineConversion({
  inputs: { length: 'length' as const },
  output: BG_GRID_CELL_DIMENSION,
  compute: ({ length }) => {
    const logLength = Math.log10(Math.max(length, MIN_LENGTH_M));
    const logMin = Math.log10(MIN_LENGTH_M);
    const logMax = Math.log10(MAX_LENGTH_M);
    const t = clamp((logLength - logMin) / (logMax - logMin), 0, 1);
    return MIN_CELL_PX + t * (MAX_CELL_PX - MIN_CELL_PX);
  },
});

/**
 * Returns the grid cell size in px for "1 of `unit`", via a real
 * forge() call. Called per-render from the geometry chassis; the
 * underlying converter is cheap (one lerp + a clamp).
 */
export function gridCellPxForUnit(unit: Unit<'length', number>): number {
  return forge({ length: unit }, pxGridCell, { via: gridCellFromLength })({ length: 1 });
}

// ─── To-grid scroll speed (slider-driven, runtime-bounded) ───────────────
//
// Both grids translate continuously via patternTransform; the from-grid
// has a fixed base speed (slow, "background") and the to-grid scrolls
// at a slider-driven speed (fast, "foreground"). The DIFFERENTIAL
// between the two layer speeds is the parallax depth the eye reads:
// when both are equal they appear locked together (no depth); when
// they diverge the to-grid passes "in front of" the from-grid.
//
// Lerped over the bench's UI bounds so the full slider travel always
// produces visible variation regardless of which fromUnit is picked.

const BG_GRID_SPEED_DIMENSION = 'bg.grid_speed' as const;

const pxPerSecGridSpeed = defineUnit({
  id: 'bg-grid-speed-px-per-s',
  label: 'Background grid speed (px/s)',
  symbol: 'px/s',
  dimension: BG_GRID_SPEED_DIMENSION,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

// At slider min the to-grid scrolls slowly (small differential vs the
// from-grid's base speed; reads as "almost no depth"); at slider max
// the differential opens up to ~5x the base, producing visible
// parallax without dominating the page.
const GRID_SPEED_MIN_PX_S = 2;
const GRID_SPEED_MAX_PX_S = 32;

const gridSpeedFromLength = defineConversion({
  inputs: {
    length: 'length' as const,
    minLength: 'length' as const,
    maxLength: 'length' as const,
  },
  output: BG_GRID_SPEED_DIMENSION,
  compute: ({ length, minLength, maxLength }) => {
    const range = maxLength - minLength;
    const t = range > 0 ? clamp((length - minLength) / range, 0, 1) : 0;
    return GRID_SPEED_MIN_PX_S + t * (GRID_SPEED_MAX_PX_S - GRID_SPEED_MIN_PX_S);
  },
});

/**
 * Returns the to-grid scroll speed in px/sec for the bench slider's
 * current position, lerped over the bench's UI bounds so the full
 * slider travel always uses the full speed range regardless of the
 * picked fromUnit.
 */
export function gridSpeedPxPerSecFor(
  fromUnit: Unit<'length', number>,
  amount: number,
  minAmount: number,
  maxAmount: number,
): number {
  return forge({ length: fromUnit, minLength: fromUnit, maxLength: fromUnit }, pxPerSecGridSpeed, {
    via: gridSpeedFromLength,
  })({ length: amount, minLength: minAmount, maxLength: maxAmount });
}

/** Fixed scroll speed in px/sec for the from-grid (the "background"
 *  layer; the to-grid is parallaxed against this baseline). Halved
 *  from the previous 12 so the ambient page texture is calmer; the
 *  slider opens the differential rather than the page racing on
 *  load. */
export const GRID_FROM_BASE_SPEED_PX_S = 6;

// ─── To-grid scale multiplier (slider-driven, runtime-bounded) ──────────
//
// Compounds the parallax cue: as the slider drives the to-grid faster
// (foreground "coming toward us"), the same slider also nudges its
// cell-size up so the foreground visibly enlarges. At slider min the
// to-grid sits at 0.85x its unit-driven cell size (denser, reads as
// further away); at slider max it returns to 1.0x. Subtle range; the
// effect compounds with the speed differential rather than competing
// with it.

const BG_GRID_SCALE_DIMENSION = 'bg.grid_scale' as const;

const gridScaleRatio = defineUnit({
  id: 'bg-grid-scale-ratio',
  label: 'Background grid scale (ratio)',
  symbol: '×',
  dimension: BG_GRID_SCALE_DIMENSION,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

const GRID_SCALE_MIN = 0.85;
const GRID_SCALE_MAX = 1.0;

const gridScaleFromLength = defineConversion({
  inputs: {
    length: 'length' as const,
    minLength: 'length' as const,
    maxLength: 'length' as const,
  },
  output: BG_GRID_SCALE_DIMENSION,
  compute: ({ length, minLength, maxLength }) => {
    const range = maxLength - minLength;
    const t = range > 0 ? clamp((length - minLength) / range, 0, 1) : 0;
    return GRID_SCALE_MIN + t * (GRID_SCALE_MAX - GRID_SCALE_MIN);
  },
});

/**
 * Returns the multiplicative scale factor for the to-grid's cell size,
 * lerped over the bench's UI bounds so the slider's full travel always
 * uses the full scale range regardless of the picked fromUnit.
 */
export function gridScaleFor(
  fromUnit: Unit<'length', number>,
  amount: number,
  minAmount: number,
  maxAmount: number,
): number {
  return forge({ length: fromUnit, minLength: fromUnit, maxLength: fromUnit }, gridScaleRatio, {
    via: gridScaleFromLength,
  })({ length: amount, minLength: minAmount, maxLength: maxAmount });
}
