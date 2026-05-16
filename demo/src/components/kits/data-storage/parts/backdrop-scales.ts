// Dogfood: every backdrop visual axis is its own dimension + unit +
// conversion, so the data-storage chassis reads "forge a storage value
// into pixels" rather than "look up a number". Three axes today:
//
//   - dash length per layer (driven by a unit selection): how fat each
//     marching dot is. Linear lerp in bytes-of-one-unit, clamped to a
//     readable px range. Byte = thin, GB = chunky, anything past 1 TB
//     pins to the max.
//
//   - dash gap (driven by the slider): how much space between dots.
//     Lerped over the bench's runtime min/max so the slider's full
//     travel always produces visible variation regardless of which
//     fromUnit you've picked.
//
//   - pulse period (driven by the slider): animation duration in
//     seconds. Same runtime-bounded lerp as gap, but inverted so a
//     larger slider value runs faster (shorter period).
//
// All three are cross-dimensional defineConversion values; the math
// (linear lerp + clamp) lives in `compute`. Output dimensions are
// kit-local strings the rest of the demo doesn't import.

import { defineConversion, defineUnit, forge, type Unit } from 'unitforge';
import { clamp } from '~/lib/math.js';

type DataUnit = Unit<'data', number>;

// ─── Output dimensions + base units ─────────────────────────────────────

const BG_DASH_LENGTH_DIMENSION = 'bg.dash_length' as const;
const BG_DASH_GAP_DIMENSION = 'bg.dash_gap' as const;
const BG_PULSE_PERIOD_DIMENSION = 'bg.pulse_period' as const;

const pxDashLength = defineUnit({
  id: 'bg-dash-length-px',
  label: 'Background dash length (px)',
  symbol: 'px',
  dimension: BG_DASH_LENGTH_DIMENSION,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

const pxDashGap = defineUnit({
  id: 'bg-dash-gap-px',
  label: 'Background dash gap (px)',
  symbol: 'px',
  dimension: BG_DASH_GAP_DIMENSION,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

const secPulsePeriod = defineUnit({
  id: 'bg-pulse-period-s',
  label: 'Background pulse period (s)',
  symbol: 's',
  dimension: BG_PULSE_PERIOD_DIMENSION,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

// ─── Dash length (unit-driven) ───────────────────────────────────────────

// Input domain in bytes: byte through yottabyte. The kit spans 24
// orders of magnitude (byte to yobibyte) and human-pickable units
// cluster across 10+ orders, so a linear lerp over byte-scale pins
// almost every unit to the floor (a kilobyte is one billionth of a
// terabyte). We lerp over log10(bytes) instead, so each rung of the
// ladder steps the visible dash one notch larger.
const DASH_LENGTH_MIN_BYTES = 1;
const DASH_LENGTH_MAX_BYTES = 1e24;
const DASH_LENGTH_MIN_PX = 2;
const DASH_LENGTH_MAX_PX = 14;

const dashLengthFromBytes = defineConversion({
  inputs: { amount: 'data' as const },
  output: BG_DASH_LENGTH_DIMENSION,
  compute: ({ amount }) => {
    const logAmount = Math.log10(Math.max(amount, DASH_LENGTH_MIN_BYTES));
    const logMin = Math.log10(DASH_LENGTH_MIN_BYTES);
    const logMax = Math.log10(DASH_LENGTH_MAX_BYTES);
    const t = clamp((logAmount - logMin) / (logMax - logMin), 0, 1);
    return DASH_LENGTH_MIN_PX + t * (DASH_LENGTH_MAX_PX - DASH_LENGTH_MIN_PX);
  },
});

/** Pixel dash length for "1 of `unit`", via a real forge call. */
export function dashLengthPxFor(unit: DataUnit): number {
  return forge({ amount: unit }, pxDashLength, { via: dashLengthFromBytes })({ amount: 1 });
}

// ─── Dash gap (slider-driven, runtime-bounded) ───────────────────────────

const DASH_GAP_MIN_PX = 10;
const DASH_GAP_MAX_PX = 42;

const dashGapFromBytes = defineConversion({
  inputs: {
    amount: 'data' as const,
    minAmount: 'data' as const,
    maxAmount: 'data' as const,
  },
  output: BG_DASH_GAP_DIMENSION,
  compute: ({ amount, minAmount, maxAmount }) => {
    const range = maxAmount - minAmount;
    const t = range > 0 ? clamp((amount - minAmount) / range, 0, 1) : 0;
    return DASH_GAP_MIN_PX + t * (DASH_GAP_MAX_PX - DASH_GAP_MIN_PX);
  },
});

/**
 * Pixel dash gap for the bench slider's current value, lerped over
 * the bench's UI bounds (so the full slider travel always uses the
 * full gap range, regardless of which fromUnit is picked).
 */
export function dashGapPxFor(
  fromUnit: DataUnit,
  amount: number,
  minAmount: number,
  maxAmount: number,
): number {
  return forge({ amount: fromUnit, minAmount: fromUnit, maxAmount: fromUnit }, pxDashGap, {
    via: dashGapFromBytes,
  })({ amount, minAmount, maxAmount });
}

// ─── Pulse period (slider-driven, runtime-bounded, inverted) ─────────────

const PULSE_PERIOD_MAX_S = 3.6; // slow at slider min
const PULSE_PERIOD_MIN_S = 1.1; // fast at slider max

const pulsePeriodFromBytes = defineConversion({
  inputs: {
    amount: 'data' as const,
    minAmount: 'data' as const,
    maxAmount: 'data' as const,
  },
  output: BG_PULSE_PERIOD_DIMENSION,
  compute: ({ amount, minAmount, maxAmount }) => {
    const range = maxAmount - minAmount;
    const t = range > 0 ? clamp((amount - minAmount) / range, 0, 1) : 0;
    return PULSE_PERIOD_MAX_S - t * (PULSE_PERIOD_MAX_S - PULSE_PERIOD_MIN_S);
  },
});

/** Animation period in seconds for the bench slider's current value. */
export function pulsePeriodSecondsFor(
  fromUnit: DataUnit,
  amount: number,
  minAmount: number,
  maxAmount: number,
): number {
  return forge({ amount: fromUnit, minAmount: fromUnit, maxAmount: fromUnit }, secPulsePeriod, {
    via: pulsePeriodFromBytes,
  })({ amount, minAmount, maxAmount });
}

// Static fallback for the kit-card preview, which renders the backdrop
// without a live bench in scope. Values picked to match a mid-slider
// look against a GB-tier dash length.
export const BG_DASH_DEFAULTS = {
  dashLength: 5,
  dashGap: 18,
  pulsePeriodSeconds: 2.4,
} as const;
