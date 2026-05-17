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
 * Define a unit-driven backdrop axis: kit-local output dimension, base
 * unit on it, conversion from `{ amount }` (in the input dimension) to
 * a scalar in the output dimension. The returned wrapper invokes
 * forge with `(fromUnit, 1)` so callers read `axis(fromUnit)`; this
 * captures "the natural magnitude of one of this unit, mapped to a
 * px / s / ratio." Sister of `defineRuntimeBoundedAxis`; pick this
 * one when the axis varies with unit choice rather than with slider
 * position.
 */
export function defineUnitDrivenAxis<D extends Dimension>(opts: {
  /** Stable id used both as the kit-local output dimension and as the
   *  base unit's id. Must be unique across all axes the demo declares
   *  (collisions would alias dimension namespaces). */
  axisId: string;
  /** Display unit symbol for the output (e.g. 'px', 's', '×'). */
  axisSymbol: string;
  /** Display label. */
  axisLabel: string;
  /** Input dimension (matches the unit family the kit drives this
   *  axis from: 'volume', 'length', 'data', etc.). */
  inputDimension: D;
  /** Pure compute over `{ amount }`. The helper passes 1 of the
   *  chosen `fromUnit` through forge into base units of the input
   *  dimension; `compute({ amount })` receives that value. The
   *  `lerpLog10` helper covers the wide-range case. */
  compute: (inputs: { amount: number }) => number;
}): (fromUnit: Unit<D, number>) => number {
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
    inputs: { amount: opts.inputDimension },
    output: outputDimension,
    compute: opts.compute,
  });

  return (fromUnit) => forge({ amount: fromUnit }, baseUnit, { via: conversion })({ amount: 1 });
}

/**
 * Define a runtime-bounded backdrop axis: kit-local output dimension,
 * base unit on it, conversion from `{ amount, minAmount, maxAmount }`
 * (all in the input dimension) to a scalar in the output dimension.
 * The returned wrapper invokes forge with the unit + amount triple so
 * callers read `axis(fromUnit, value, min, max)` instead of building
 * the forge call site themselves.
 *
 * Three kits (geometry, data-storage, cooking) share this shape; the
 * helper lifts the boilerplate so each new axis is a one-call
 * declaration.
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
