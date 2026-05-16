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

// Input domain (in meters) and output domain (in pixels). The input
// range spans 1 mm to 1 km; the output range is the smallest grid
// line we want to see (cramped but readable) to the largest (loose
// engineering paper, not a literal mile apart). Linear interpolation
// over that, clamped to the bounds; anything outside the range pins
// to the nearest endpoint instead of producing visually broken values.
const MIN_LENGTH_M = 0.001;
const MAX_LENGTH_M = 1000;
const MIN_CELL_PX = 8;
const MAX_CELL_PX = 64;

const gridCellFromLength = defineConversion({
  inputs: { length: 'length' as const },
  output: BG_GRID_CELL_DIMENSION,
  compute: ({ length }) => {
    const t = clamp((length - MIN_LENGTH_M) / (MAX_LENGTH_M - MIN_LENGTH_M), 0, 1);
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
