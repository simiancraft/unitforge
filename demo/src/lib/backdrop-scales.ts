// Shared scaffolding for the dogfood pattern every kit's backdrop
// uses: a kit-local dimension + a base unit on it + a defineConversion
// whose inputs include the bench slider's runtime min/max so the
// slider's full travel always produces visible variation regardless
// of which fromUnit is picked. Geometry, data-storage, and cooking
// all express their backdrop visual axes through this shape; the
// helper here collapses the three-line input block into a one-line
// declaration so a kit adding a new axis writes only the compute
// closure.

import { type Dimension, defineConversion, defineUnit, forge, type Unit } from 'unitforge';
import { clamp } from '~/lib/math.js';

/**
 * Linear lerp from a value within (minAmount, maxAmount) to (outMin,
 * outMax). Clamped at both ends so anything outside the input range
 * pins to the nearest output endpoint instead of producing visually
 * broken values.
 */
export function lerpBounded(opts: {
  amount: number;
  minAmount: number;
  maxAmount: number;
  outMin: number;
  outMax: number;
}): number {
  const { amount, minAmount, maxAmount, outMin, outMax } = opts;
  const range = maxAmount - minAmount;
  const t = range > 0 ? clamp((amount - minAmount) / range, 0, 1) : 0;
  return outMin + t * (outMax - outMin);
}

/**
 * Log10 variant of lerpBounded. Used when the input domain spans many
 * orders of magnitude (byte through yottabyte; nanometer through
 * parsec) and a linear lerp would pin almost every picked unit to
 * the floor.
 */
export function lerpLog10(opts: {
  amount: number;
  minAmount: number;
  maxAmount: number;
  outMin: number;
  outMax: number;
}): number {
  const { amount, minAmount, maxAmount, outMin, outMax } = opts;
  const logAmount = Math.log10(Math.max(amount, minAmount));
  const logMin = Math.log10(minAmount);
  const logMax = Math.log10(maxAmount);
  const t = clamp((logAmount - logMin) / (logMax - logMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

/**
 * Define a runtime-bounded backdrop axis: kit-local output dimension,
 * base unit on it, conversion from `{ amount, minAmount, maxAmount }`
 * (all in the input dimension) to a scalar in the output dimension.
 * The returned wrapper invokes forge with the unit + amount triple so
 * callers read `axis(fromUnit, value, min, max)` instead of building
 * the forge call site themselves.
 *
 * Three kits (geometry, data-storage, cooking) shared this exact
 * shape one declaration at a time; lifting collapses each new axis
 * to two arguments (id + compute closure).
 */
export function defineRuntimeBoundedAxis<D extends Dimension>(opts: {
  /** Stable id used both as the kit-local output dimension and as the
   *  base unit's id (`<axisId>-<unit-symbol>` style). */
  axisId: string;
  /** Display unit symbol for the output (e.g. 'px', 's', '×'). */
  axisSymbol: string;
  /** Display label. */
  axisLabel: string;
  /** Input dimension (matches the unit family the kit drives this
   *  axis from: 'volume', 'length', 'data', etc.). */
  inputDimension: D;
  /** Pure compute over (amount, minAmount, maxAmount). The helpers
   *  `lerpBounded` and `lerpLog10` cover the common cases. */
  compute: (inputs: { amount: number; minAmount: number; maxAmount: number }) => number;
}): (fromUnit: Unit<D, number>, amount: number, minAmount: number, maxAmount: number) => number {
  const outputDimension = opts.axisId as Dimension;
  const baseUnit = defineUnit({
    id: `${opts.axisId}-base`,
    label: opts.axisLabel,
    symbol: opts.axisSymbol,
    dimension: outputDimension,
    toBase: (v) => v,
    fromBase: (b) => b,
    base: true,
  });

  const conversion = defineConversion({
    inputs: {
      amount: opts.inputDimension,
      minAmount: opts.inputDimension,
      maxAmount: opts.inputDimension,
    },
    output: outputDimension,
    compute: opts.compute,
  });

  return (fromUnit, amount, minAmount, maxAmount) =>
    forge({ amount: fromUnit, minAmount: fromUnit, maxAmount: fromUnit }, baseUnit, {
      via: conversion,
    })({ amount, minAmount, maxAmount });
}
