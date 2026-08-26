/**
 * count kit barrel. Re-exports every unit shipped by this kit.
 *
 * Six groupings of discrete things: `each` (base), `pair`, `dozen`,
 * `gross`, `greatGross`, and `ream`.
 *
 * Packaging units are not shipped, on purpose. A case-pack is data about
 * your product, not a convention anyone can look up, so it belongs in
 * your codebase next to the rest of that product's facts:
 *
 * @example
 *   import { defineUnit, forge } from 'unitforge';
 *   import { COUNT } from 'unitforge/dimensions';
 *   import { each } from 'unitforge/kits/count';
 *
 *   const caseOfCola = defineUnit({
 *     id: 'case-cola-12',
 *     label: 'Case (12 cans)',
 *     symbol: 'cs',
 *     dimension: COUNT,
 *     toBase: (v) => v * 12,
 *     fromBase: (b) => b / 12,
 *   });
 *
 *   forge(caseOfCola, each)(7); // 84
 *
 * That unit composes with everything in `kits/inventory` exactly as a
 * built-in would; nothing in the library needed to know your case-pack.
 */

export * from './units.js';
