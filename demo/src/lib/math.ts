// Small math helpers reused across widgets.

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
