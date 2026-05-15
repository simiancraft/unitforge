/**
 * Plain-decimal number formatter for demo readouts. No scientific
 * notation: the readout cells have horizontal space, and the demo's
 * pedagogy is hurt by "4.260e+2" when "426.000" would communicate the
 * same fact more directly. Precision widens for sub-1 magnitudes so
 * very-small conversions (mm radius into m², mm radius into miles)
 * don't collapse to zero.
 */
export function formatMagnitude(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (abs >= 1) return n.toFixed(3);
  // For abs < 1, count leading zeros after the decimal point and add
  // 4 significant digits, so 4.5e-5 renders as 0.00004500.
  const leadingZeros = -Math.floor(Math.log10(abs)) - 1;
  return n.toFixed(leadingZeros + 4);
}

/**
 * Turn a kit unit's kebab-case `id` ("square-millimeter") into the
 * JS export name the kit actually ships ("squareMillimeter"). Used by
 * section files when templating import statements and forge call sites
 * into the displayed code samples.
 */
export function toJsName(id: string): string {
  return id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Render a raw byte count at the most legible SI-decimal ladder rung
 * (B, kB, MB, GB, TB, PB, EB, ZB, YB). Picks the largest rung whose
 * value is ≤ the input, then formats to 2-3 significant figures.
 * Generic across kits; consumers anywhere needing a human-readable
 * byte size should reach for this instead of hand-rolling a ladder
 * lookup. For per-instance unit conversion (forge into a specific
 * unit) use `forge` directly.
 */
const BYTE_LADDER: ReadonlyArray<readonly [number, string]> = [
  [1, 'B'],
  [1e3, 'kB'],
  [1e6, 'MB'],
  [1e9, 'GB'],
  [1e12, 'TB'],
  [1e15, 'PB'],
  [1e18, 'EB'],
  [1e21, 'ZB'],
  [1e24, 'YB'],
];

export function formatBytesShort(bytes: number): string {
  let scale = 1;
  let symbol = 'B';
  for (const [rung, sym] of BYTE_LADDER) {
    if (bytes >= rung) {
      scale = rung;
      symbol = sym;
    }
  }
  const scaled = bytes / scale;
  if (scaled >= 100) return `${scaled.toFixed(0)} ${symbol}`;
  if (scaled >= 10) return `${scaled.toFixed(1)} ${symbol}`;
  return `${scaled.toFixed(2)} ${symbol}`;
}
