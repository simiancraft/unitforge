/** Astronomy kit barrel. Composition kit; ships astronomy-specific
 *  LENGTH atoms (astronomicalUnit through gigaparsec, plus the
 *  light-time family). Re-exports `meter` and `kilometer` from
 *  `kits/length` for benchmarking phrases ("1 ly ≈ 9.461 × 10¹⁵
 *  m"; "Hubble constant ≈ 70 km/s/Mpc").
 *
 *  Future scope: solar radius (IAU 2015 B3 nominal 6.957 × 10⁸ m),
 *  Earth radius variants (equatorial / polar / mean), Bohr radius
 *  (CODATA, not exact). Each adds qualifying conventions that
 *  warrant care; deferred until consumer demand surfaces.
 */

// Benchmarking anchors from kits/length (re-exported for consumer
// convenience; JS identity preserved).
export { kilometer, meter } from '../length/units.js';
export * from './units.js';
