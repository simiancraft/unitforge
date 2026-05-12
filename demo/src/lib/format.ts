// Plain-decimal number formatter for demo readouts. No scientific
// notation: the readout cells have horizontal space, and the demo's
// pedagogy is hurt by "4.260e+2" when "426.000" would communicate the
// same fact more directly. Precision widens for sub-1 magnitudes so
// very-small conversions (mm radius into m², mm radius into miles)
// don't collapse to zero.

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
