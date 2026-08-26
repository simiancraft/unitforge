/**
 * inventory kit barrel. Manufacturing, supply-chain, and crafting.
 *
 * Composition kit. It re-exports the COUNT atoms from `kits/count` and
 * the bulk-side anchors from `kits/length`, `kits/mass`, and
 * `kits/volume`, so a caller doing packaging math has one import, and
 * adds the conversions that turn bulk into pieces.
 *
 * **This kit defines no units of its own, and that is the point.** Every
 * unit it needs already exists. What did not exist is the handful of
 * places where a quantity gets destroyed on purpose: cutting stock into
 * pieces, portioning bulk into packages, gating an assembly on its
 * scarcest component. Those are lossy and non-invertible, so they cannot
 * live in a unit, and the rule they establish is worth stating plainly:
 *
 *   **Units must round-trip. Recipes do not have to.**
 *
 * A `Unit`'s `toBase` / `fromBase` stays linear and reversible because
 * `forge` composes it in both directions and the fuzz suite enforces it.
 * A floor, a yield loss, a scrap rate, or a minimum over components
 * belongs in a `defineConversion`'s `compute`, which is under no such
 * obligation. Encoding a recipe rate into a unit's `toBase` is the
 * anti-pattern already flagged as debt on `butterBlockEu250g` in
 * `kits/cooking`.
 *
 * Two things this kit deliberately leaves to you:
 *
 * **Packaging units.** A case-pack is a fact about your product, not a
 * convention, so `case`, `pallet`, and `container` are not shipped. Yours
 * is four lines and composes exactly like a built-in:
 *
 * @example
 *   import { defineUnit, forge } from 'unitforge';
 *   import { COUNT } from 'unitforge/dimensions';
 *   import { each } from 'unitforge/kits/inventory';
 *
 *   const retailCase = defineUnit({
 *     id: 'case-coffee-12oz',
 *     label: 'Case (24 bags)',
 *     symbol: 'cs',
 *     dimension: COUNT,
 *     toBase: (v) => v * 24,
 *     fromBase: (b) => b / 24,
 *   });
 *
 *   forge(retailCase, each)(7); // 168
 *
 * **Multi-component bills of materials.** One component is
 * `assembliesFromComponentsAndPerAssembly`; several is a fold over it
 * taking the minimum, and the scarcest input gates the build:
 *
 * @example
 *   const per = forge(
 *     { components: each, perAssembly: each },
 *     each,
 *     { via: assembliesFromComponentsAndPerAssembly },
 *   );
 *   const shields = Math.min(
 *     per({ components: 9, perAssembly: 2 }), // ingots -> 4
 *     per({ components: 5, perAssembly: 1 }), // planks -> 5
 *   ); // 4
 *
 * A shipped version of that fold would have to take a position on
 * substitutes, partial kits, and where the leftovers go, none of which
 * generalize across a game, a bakery, and a machine shop.
 */

// Re-exported atoms. These resolve to the same `Unit` objects the
// foundational kits export (JS identity, not copies), which
// test/kits/cross-kit-identity.test.ts pins.
export { dozen, each, greatGross, gross, pair, ream } from '../count/units.js';
export { centimeter, foot, inch, meter, millimeter, yard } from '../length/units.js';
export { gram, kilogram, ounceAvoirdupois, pound } from '../mass/units.js';
export { liter, milliliter } from '../volume/units.js';
export * from './conversions.js';
