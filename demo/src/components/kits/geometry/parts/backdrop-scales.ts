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

// ─── Phase offset (slider-driven, runtime-bounded) ───────────────────────
//
// The to-grid sits on top of the from-grid; the bench slider lerps
// their phase offset so dragging visibly slides the second grid
// against the first. Like the data-storage gap conversion, this takes
// the bench's full runtime range as additional inputs so the slider's
// full travel always produces visible variation regardless of which
// fromUnit is picked.

const BG_GRID_OFFSET_DIMENSION = 'bg.grid_offset' as const;

const pxGridOffset = defineUnit({
  id: 'bg-grid-offset-px',
  label: 'Background grid offset (px)',
  symbol: 'px',
  dimension: BG_GRID_OFFSET_DIMENSION,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

const GRID_OFFSET_MIN_PX = 0;
// Doubled from 32 so the slider's full travel produces a clearly
// noticeable phase swing rather than a subtle nudge.
const GRID_OFFSET_MAX_PX = 64;

const gridOffsetFromLength = defineConversion({
  inputs: {
    length: 'length' as const,
    minLength: 'length' as const,
    maxLength: 'length' as const,
  },
  output: BG_GRID_OFFSET_DIMENSION,
  compute: ({ length, minLength, maxLength }) => {
    const range = maxLength - minLength;
    const t = range > 0 ? clamp((length - minLength) / range, 0, 1) : 0;
    return GRID_OFFSET_MIN_PX + t * (GRID_OFFSET_MAX_PX - GRID_OFFSET_MIN_PX);
  },
});

/**
 * Returns the phase-offset px for the bench slider's current position,
 * lerped over the bench's UI bounds so the full slider travel always
 * uses the full offset range regardless of the picked fromUnit.
 */
export function gridOffsetPxFor(
  fromUnit: Unit<'length', number>,
  amount: number,
  minAmount: number,
  maxAmount: number,
): number {
  return forge({ length: fromUnit, minLength: fromUnit, maxLength: fromUnit }, pxGridOffset, {
    via: gridOffsetFromLength,
  })({ length: amount, minLength: minAmount, maxLength: maxAmount });
}
