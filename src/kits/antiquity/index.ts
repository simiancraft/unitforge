/** Units of Antiquity kit barrel. The kit ships pre-modern and
 *  obsolete units of measure, organized by civilization. Each
 *  civilization lives in its own file (`egypt.ts`, `rome.ts`, etc.);
 *  this barrel re-exports them all under the single subpath
 *  `unitforge/kits/antiquity`.
 *
 *  Scope: classical antiquity (Egyptian, Mesopotamian, Greek, Roman,
 *  Hebrew) is the core, but post-classical material (Edo-period
 *  Japanese shaku, Qing-era Chinese chi, pre-1835 English trade
 *  stones) ships here too. The pragmatic rule: if a unit is no longer
 *  in active modern statutory or commercial practice, it belongs in
 *  this kit. Modern in-practice variants (PRC market jin, HK catty,
 *  modern Russian stakan, modern Japanese gō) stay in their
 *  foundational kits.
 *
 *  Re-exports from foundational kits: the kit selectively re-exports
 *  `meter`, `kilogram`, `pound`, `liter`, and `statuteMile` so that
 *  benchmarking phrases in JSDoc ("1 stadion ≈ 185 m, about 1/8
 *  mile") and consumer code can pull both an ancient unit and a
 *  familiar modern anchor from the same subpath. JS identity is
 *  preserved per the foundational-kit refactor invariant.
 */

export { meter, statuteMile } from '../length/units.js';

// Benchmarking anchors from foundational kits (re-exported for
// consumer convenience; JS identity preserved).
export { kilogram, pound } from '../mass/units.js';
export { liter } from '../volume/units.js';
export * from './egypt.js';
export * from './greece.js';
export * from './hebrew.js';
export * from './mesopotamia.js';
export * from './rome.js';
