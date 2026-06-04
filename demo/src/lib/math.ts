// Small math helpers reused across widgets.

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Round `n` to the decimal precision implied by `step` (e.g. step 0.01
 * rounds to hundredths, step 1 to integers). Range inputs emit exact
 * step multiples, but float math can still drift; this snaps the value
 * back to the slider's own granularity so the rendered number and the
 * code snippet stay clean.
 */
export function roundToStep(n: number, step: number): number {
  const decimals = (String(step).split('.')[1] ?? '').length;
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}
