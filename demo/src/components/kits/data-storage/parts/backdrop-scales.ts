// Dogfood: every backdrop visual axis is a forge call from the kit's
// `data` dimension into a kit-local `bg-*` output dimension. Three
// axes today:
//
//   - dash length per layer (unit-driven): how fat each marching dot
//     is. Log-lerp in bytes-of-one-unit so the byte through yottabyte
//     ladder steps visibly rather than pinning to the floor.
//
//   - dash gap (slider-driven): how much space between dots. Lerped
//     over the bench's runtime min/max so the slider's full travel
//     always produces visible variation regardless of which fromUnit
//     is picked.
//
//   - pulse period (slider-driven, inverted): animation duration in
//     seconds. Same runtime-bounded lerp as gap, but inverted so a
//     larger slider value runs faster (shorter period).
//
// All three go through the shared `defineUnitDrivenAxis` /
// `defineRuntimeBoundedAxis` helpers in `~/lib/backdrop-scales`.

import {
  defineRuntimeBoundedAxis,
  defineUnitDrivenAxis,
  lerpBounded,
  lerpLog10,
} from '~/lib/backdrop-scales.js';

// ─── Dash length (unit-driven) ───────────────────────────────────────────

// Input domain in bytes: byte through yottabyte. The kit spans 24
// orders of magnitude and human-pickable units cluster across 10+
// orders, so log10 is the right shape.
const DASH_LENGTH_MIN_BYTES = 1;
const DASH_LENGTH_MAX_BYTES = 1e24;
const DASH_LENGTH_MIN_PX = 2;
const DASH_LENGTH_MAX_PX = 14;

/** Pixel dash length for "1 of `unit`", via a real forge call. */
export const dashLengthPxFor = defineUnitDrivenAxis({
  axisId: 'bg-dash-length',
  axisSymbol: 'px',
  axisLabel: 'Background dash length (px)',
  inputDimension: 'data',
  compute: ({ amount }) =>
    lerpLog10({
      amount,
      minAmount: DASH_LENGTH_MIN_BYTES,
      maxAmount: DASH_LENGTH_MAX_BYTES,
      outMin: DASH_LENGTH_MIN_PX,
      outMax: DASH_LENGTH_MAX_PX,
    }),
});

// ─── Dash gap (slider-driven, runtime-bounded) ───────────────────────────

const DASH_GAP_MIN_PX = 10;
const DASH_GAP_MAX_PX = 42;

/** Pixel dash gap for the bench slider's current value, lerped over
 *  the bench's UI bounds. */
export const dashGapPxFor = defineRuntimeBoundedAxis({
  axisId: 'bg-dash-gap',
  axisSymbol: 'px',
  axisLabel: 'Background dash gap (px)',
  inputDimension: 'data',
  compute: ({ amount, minAmount, maxAmount }) =>
    lerpBounded({
      amount,
      minAmount,
      maxAmount,
      outMin: DASH_GAP_MIN_PX,
      outMax: DASH_GAP_MAX_PX,
    }),
});

// ─── Pulse period (slider-driven, runtime-bounded, inverted) ─────────────

const PULSE_PERIOD_MAX_S = 3.6; // slow at slider min
const PULSE_PERIOD_MIN_S = 1.1; // fast at slider max

/** Animation period in seconds for the bench slider's current value.
 *  Inverted so a higher slider value runs faster (shorter period). */
export const pulsePeriodSecondsFor = defineRuntimeBoundedAxis({
  axisId: 'bg-pulse-period',
  axisSymbol: 's',
  axisLabel: 'Background pulse period (s)',
  inputDimension: 'data',
  compute: ({ amount, minAmount, maxAmount }) =>
    // Inverted: outMin and outMax swapped so slider max → MIN seconds.
    lerpBounded({
      amount,
      minAmount,
      maxAmount,
      outMin: PULSE_PERIOD_MAX_S,
      outMax: PULSE_PERIOD_MIN_S,
    }),
});

// Static fallback for the kit-card preview, which renders the backdrop
// without a live bench in scope. Values picked to match a mid-slider
// look against a GB-tier dash length.
export const BG_DASH_DEFAULTS = {
  dashLength: 5,
  dashGap: 18,
  pulsePeriodSeconds: 2.4,
} as const;
