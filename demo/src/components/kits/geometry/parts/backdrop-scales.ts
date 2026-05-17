// Dogfood: every visual axis the geometry backdrop drives is a real
// forge() call from the kit's `length` dimension into a kit-local
// `bg-*` output dimension. Three axes today: grid cell size (unit-
// driven, drives the engineering-paper tick spacing), scroll speed
// (slider-driven, drives the parallax to-grid's velocity), scale
// multiplier (slider-driven, compounds the depth cue by enlarging
// the to-grid as it accelerates).
//
// All three axes go through `defineUnitDrivenAxis` /
// `defineRuntimeBoundedAxis` so the kit-side file reads as data
// (axis id + lerp closure) rather than forge plumbing.

import {
  defineRuntimeBoundedAxis,
  defineUnitDrivenAxis,
  lerpBounded,
  lerpLog10,
} from '~/lib/backdrop-scales.js';

// ─── Grid cell size (unit-driven) ────────────────────────────────────────
//
// The kit spans many orders of magnitude (nanometer through parsec);
// a linear lerp over meters would pin almost every human-pickable
// unit (mm, cm, in, ft, m) to the floor because they cluster within 4
// orders. Lerping over log10(meters) instead so each rung of the
// ladder steps the visible cell one notch larger.

const MIN_LENGTH_M = 1e-9;
const MAX_LENGTH_M = 1e9;
const MIN_CELL_PX = 8;
const MAX_CELL_PX = 64;

/** Returns the grid cell size in px for "1 of `unit`", via a real
 *  forge() call. Called per-render from the geometry chassis; the
 *  underlying converter is cheap (one log + a clamp). */
export const gridCellPxForUnit = defineUnitDrivenAxis({
  axisId: 'bg-grid-cell',
  axisSymbol: 'px',
  axisLabel: 'Background grid cell (px)',
  inputDimension: 'length',
  compute: ({ amount }) =>
    lerpLog10({
      amount,
      minAmount: MIN_LENGTH_M,
      maxAmount: MAX_LENGTH_M,
      outMin: MIN_CELL_PX,
      outMax: MAX_CELL_PX,
    }),
});

// ─── To-grid scroll speed (slider-driven, runtime-bounded) ───────────────
//
// Both grids translate continuously via patternTransform; the from-
// grid has a fixed base speed (slow, "background") and the to-grid
// scrolls at a slider-driven speed (fast, "foreground"). The
// DIFFERENTIAL between the two layer speeds is the parallax depth
// the eye reads.

const GRID_SPEED_MIN_PX_S = 2;
const GRID_SPEED_MAX_PX_S = 32;

/** Returns the to-grid scroll speed in px/sec for the bench slider's
 *  current position, lerped over the bench's UI bounds. */
export const gridSpeedPxPerSecFor = defineRuntimeBoundedAxis({
  axisId: 'bg-grid-speed',
  axisSymbol: 'px/s',
  axisLabel: 'Background grid speed (px/s)',
  inputDimension: 'length',
  compute: ({ amount, minAmount, maxAmount }) =>
    lerpBounded({
      amount,
      minAmount,
      maxAmount,
      outMin: GRID_SPEED_MIN_PX_S,
      outMax: GRID_SPEED_MAX_PX_S,
    }),
});

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
// further away); at slider max it returns to 1.0x.

const GRID_SCALE_MIN = 0.85;
const GRID_SCALE_MAX = 1.0;

/** Returns the multiplicative scale factor for the to-grid's cell
 *  size, lerped over the bench's UI bounds. */
export const gridScaleFor = defineRuntimeBoundedAxis({
  axisId: 'bg-grid-scale',
  axisSymbol: '×',
  axisLabel: 'Background grid scale (ratio)',
  inputDimension: 'length',
  compute: ({ amount, minAmount, maxAmount }) =>
    lerpBounded({
      amount,
      minAmount,
      maxAmount,
      outMin: GRID_SCALE_MIN,
      outMax: GRID_SCALE_MAX,
    }),
});
