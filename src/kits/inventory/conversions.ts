// Bulk-to-piece conversions. This kit ships NO units of its own, which is
// its whole argument: the units already exist (LENGTH, MASS, VOLUME, AREA
// for the bulk; COUNT for the pieces), and what was missing is the small
// set of lossy decisions that turn one into the other.
//
// Every conversion here is a place where a real quantity gets destroyed.
// A 3.7 m bar cut into 1 m pieces yields 3 pieces and 0.7 m of offcut;
// no unit may model that, because a `Unit`'s toBase/fromBase must stay
// reversible for `forge` to compose it in both directions, and the fuzz
// suite holds every unit to that round trip. `compute` is under no such
// obligation. That asymmetry is the rule this kit exists to demonstrate:
//
//   Units must round-trip. Recipes do not have to.
//
// Naming follows kits/geometry: `<output>From<Inputs>` when the output
// dimension differs from the inputs, with every input named. LENGTH bulk
// is `stock` in both directions (a bar of stock, cut or bought); MASS and
// VOLUME bulk is `bulk`. Forms whose name begins
// `piecesAndRemainder` return an object so the offcut comes back in the
// same call; forms that return a bare count discard it, which is the
// right shape when the caller genuinely does not want the leftover.
//
// Two things worth knowing before reading the computes:
//
//   1. `compute` runs on BASE-NORMALIZED values. That is what makes the
//      snap helper below necessary rather than fussy.
//   2. Validators run on the RAW caller-supplied values, before
//      normalization. Sign and finiteness survive that (every unit here
//      has a positive linear scale); integrality and magnitude
//      thresholds do not. A `pieces >= 3` check would reject a valid
//      dodecagon passed as `1` in `dozen`, so no validator here tests
//      either. Callers who need those checks make them at their own call
//      site, where they know the unit.

import { defineConversion } from '../../define.js';
import { AREA, COUNT, LENGTH, MASS, VOLUME } from '../../dimensions.js';

// Relative tolerance for treating a quotient as a whole number.
//
// Sized to sit far above accumulated floating-point error from a few
// multiplications and divisions (which lands around 1e-16 relative) and
// far below any physically meaningful shortfall. A caller who is
// genuinely one part in a billion short of a piece has a measurement
// problem, not a counting problem.
const INTEGER_SNAP_TOLERANCE = 1e-9;

// Absolute ceiling on the snap window. A purely relative window grows
// with the quotient and passes 0.5 at 5e8 pieces, at which point every
// fractional quotient rounds to nearest and the floor this kit promises
// silently becomes a round. A tonne of milligram tablets is 1e9 pieces,
// so that range is reachable. Capped, the window is never wider than a
// millionth of a piece.
const INTEGER_SNAP_WINDOW_MAX = 1e-6;

/**
 * Whole pieces of size `piece` obtainable from `bulk`, both in base units.
 *
 * Exists because the naive `Math.floor(bulk / piece)` is wrong on inputs
 * that are exactly divisible in the caller's units but not in base. A
 * 12-inch board cut into 1-inch pieces normalizes to 0.3048 / 0.0254,
 * which evaluates to 11.999999999999998, and flooring that ships an
 * off-by-one to anyone who measures in inches. Snapping to the nearest
 * integer first, but only within a relative tolerance, keeps the honest
 * floors honest: a true quotient of 2.7 still floors to 2.
 */
function wholePieces(bulk: number, piece: number): number {
  const quotient = bulk / piece;
  const nearest = Math.round(quotient);
  const window = Math.min(Math.abs(quotient) * INTEGER_SNAP_TOLERANCE, INTEGER_SNAP_WINDOW_MAX);
  return Math.abs(quotient - nearest) <= window ? nearest : Math.floor(quotient);
}

/**
 * Bulk left over after cutting `pieces` of size `piece`, in base units.
 *
 * Clamped at zero: when `wholePieces` snaps upward, `pieces * piece` can
 * exceed `bulk` by an ulp or two, and a remainder of -5.5e-17 would be
 * both meaningless and alarming in a UI.
 */
function leftover(bulk: number, piece: number, pieces: number): number {
  return Math.max(0, bulk - pieces * piece);
}

// Validators are written out inline at every call site rather than
// produced by a shared factory. A factory read better, but a
// `CallExpression` inside a spec literal defeats the `/*#__PURE__*/`
// annotation, so a bundler would retain every conversion in this file
// the moment a consumer imported one of them. Same rule kits/mass
// documents for `...linear(scale)`.
//
// Divisors are validated strictly positive, not merely non-negative: a
// zero divisor yields Infinity, which denormalizes to garbage and is
// then memoized, so the bad value outlives the call that produced it.

// ─── LENGTH bulk → COUNT pieces ──────────────────────────────────────────

/**
 * Cross-dimensional: whole pieces of `pieceLength` cut from `stockLength`.
 *
 * The offcut is discarded. Use `piecesAndRemainderFromStockLengthAndPieceLength` when
 * you need it back.
 *
 * @example
 *   import { forge } from 'unitforge';
 *   import { each, foot, inch, piecesFromStockLengthAndPieceLength } from 'unitforge/kits/inventory';
 *
 *   const cuts = forge(
 *     { stockLength: foot, pieceLength: inch },
 *     each,
 *     { via: piecesFromStockLengthAndPieceLength },
 *   );
 *   cuts({ stockLength: 8, pieceLength: 14 }); // 6
 */
export const piecesFromStockLengthAndPieceLength = /*#__PURE__*/ defineConversion({
  inputs: { stockLength: LENGTH, pieceLength: LENGTH },
  output: COUNT,
  validate: {
    stockLength: (v) => (Number.isFinite(v) && v >= 0) || 'stockLength must be a finite value >= 0',
    pieceLength: (v) => (Number.isFinite(v) && v > 0) || 'pieceLength must be a finite value > 0',
  },
  compute: ({ stockLength, pieceLength }) => wholePieces(stockLength, pieceLength),
});

/**
 * Cross-dimensional: whole pieces cut from stock, plus the offcut.
 *
 * Object output: `{ pieces: COUNT, remainder: LENGTH }`. The remainder
 * comes back in the LENGTH dimension (a real offcut you can measure),
 * not as a fraction of a piece.
 */
export const piecesAndRemainderFromStockLengthAndPieceLength = /*#__PURE__*/ defineConversion({
  inputs: { stockLength: LENGTH, pieceLength: LENGTH },
  output: { pieces: COUNT, remainder: LENGTH },
  validate: {
    stockLength: (v) => (Number.isFinite(v) && v >= 0) || 'stockLength must be a finite value >= 0',
    pieceLength: (v) => (Number.isFinite(v) && v > 0) || 'pieceLength must be a finite value > 0',
  },
  compute: ({ stockLength, pieceLength }) => {
    const pieces = wholePieces(stockLength, pieceLength);
    return { pieces, remainder: leftover(stockLength, pieceLength, pieces) };
  },
});

/**
 * Cross-dimensional: whole pieces cut from stock, accounting for the
 * material the blade turns into sawdust.
 *
 * Every cut consumes `kerf` of stock, but the last piece needs no cut
 * after it, so the arithmetic is not "subtract kerf per piece". Adding
 * one kerf to both the stock and the piece size models it exactly:
 * n pieces fit when `n·piece + (n−1)·kerf <= stock`, which rearranges to
 * `n <= (stock + kerf) / (piece + kerf)`.
 *
 * A 3 m bar cut into 300 mm pieces yields 10 with an idealized zero-width
 * blade and 9 with a 3 mm one. Ignoring kerf overstates yield on exactly
 * the jobs where the count matters.
 */
export const piecesFromStockLengthPieceLengthAndKerf = /*#__PURE__*/ defineConversion({
  inputs: { stockLength: LENGTH, pieceLength: LENGTH, kerf: LENGTH },
  output: COUNT,
  validate: {
    stockLength: (v) => (Number.isFinite(v) && v >= 0) || 'stockLength must be a finite value >= 0',
    pieceLength: (v) => (Number.isFinite(v) && v > 0) || 'pieceLength must be a finite value > 0',
    kerf: (v) => (Number.isFinite(v) && v >= 0) || 'kerf must be a finite value >= 0',
  },
  compute: ({ stockLength, pieceLength, kerf }) =>
    wholePieces(stockLength + kerf, pieceLength + kerf),
});

// ─── MASS bulk → COUNT pieces ────────────────────────────────────────────

/**
 * Cross-dimensional: whole portions of `pieceMass` from `bulkMass`.
 * The short-weight remainder is discarded.
 */
export const piecesFromBulkMassAndPieceMass = /*#__PURE__*/ defineConversion({
  inputs: { bulkMass: MASS, pieceMass: MASS },
  output: COUNT,
  validate: {
    bulkMass: (v) => (Number.isFinite(v) && v >= 0) || 'bulkMass must be a finite value >= 0',
    pieceMass: (v) => (Number.isFinite(v) && v > 0) || 'pieceMass must be a finite value > 0',
  },
  compute: ({ bulkMass, pieceMass }) => wholePieces(bulkMass, pieceMass),
});

/**
 * Cross-dimensional: whole portions from a bulk mass, plus what is left
 * in the hopper.
 *
 * Object output: `{ pieces: COUNT, remainder: MASS }`. The canonical
 * packaging question: 57.96 kg of roasted coffee fills 170 bags at 340 g
 * and leaves 160 g, which is not rounding error, it is inventory.
 *
 * Note the `precision` on this example. The remainder is a subtraction
 * of two base-normalized floats, so it lands at 159.99999999999659 g
 * unrounded; `precision` exists for exactly this and is a display-layer
 * decision, not a correctness one. It rounds and never floors, so it can
 * clean up a remainder but cannot make a piece count whole.
 *
 * @example
 *   import { forge } from 'unitforge';
 *   import {
 *     each, gram, kilogram, piecesAndRemainderFromBulkMassAndPieceMass,
 *   } from 'unitforge/kits/inventory';
 *
 *   const bag = forge(
 *     { bulkMass: kilogram, pieceMass: gram },
 *     { pieces: each, remainder: gram },
 *     { via: piecesAndRemainderFromBulkMassAndPieceMass, precision: 6 },
 *   );
 *   bag({ bulkMass: 57.96, pieceMass: 340 }); // { pieces: 170, remainder: 160 }
 */
export const piecesAndRemainderFromBulkMassAndPieceMass = /*#__PURE__*/ defineConversion({
  inputs: { bulkMass: MASS, pieceMass: MASS },
  output: { pieces: COUNT, remainder: MASS },
  validate: {
    bulkMass: (v) => (Number.isFinite(v) && v >= 0) || 'bulkMass must be a finite value >= 0',
    pieceMass: (v) => (Number.isFinite(v) && v > 0) || 'pieceMass must be a finite value > 0',
  },
  compute: ({ bulkMass, pieceMass }) => {
    const pieces = wholePieces(bulkMass, pieceMass);
    return { pieces, remainder: leftover(bulkMass, pieceMass, pieces) };
  },
});

// ─── VOLUME bulk → COUNT pieces ──────────────────────────────────────────

/**
 * Cross-dimensional: whole servings of `pieceVolume` from `bulkVolume`.
 * The heel left in the container is discarded.
 */
export const piecesFromBulkVolumeAndPieceVolume = /*#__PURE__*/ defineConversion({
  inputs: { bulkVolume: VOLUME, pieceVolume: VOLUME },
  output: COUNT,
  validate: {
    bulkVolume: (v) => (Number.isFinite(v) && v >= 0) || 'bulkVolume must be a finite value >= 0',
    pieceVolume: (v) => (Number.isFinite(v) && v > 0) || 'pieceVolume must be a finite value > 0',
  },
  compute: ({ bulkVolume, pieceVolume }) => wholePieces(bulkVolume, pieceVolume),
});

/**
 * Cross-dimensional: whole servings from a bulk volume, plus the heel.
 *
 * Object output: `{ pieces: COUNT, remainder: VOLUME }`. A 225 L barrel
 * fills 300 bottles at 750 mL exactly; a 230 L one fills 306 and leaves
 * 0.5 L with nowhere to go.
 */
export const piecesAndRemainderFromBulkVolumeAndPieceVolume = /*#__PURE__*/ defineConversion({
  inputs: { bulkVolume: VOLUME, pieceVolume: VOLUME },
  output: { pieces: COUNT, remainder: VOLUME },
  validate: {
    bulkVolume: (v) => (Number.isFinite(v) && v >= 0) || 'bulkVolume must be a finite value >= 0',
    pieceVolume: (v) => (Number.isFinite(v) && v > 0) || 'pieceVolume must be a finite value > 0',
  },
  compute: ({ bulkVolume, pieceVolume }) => {
    const pieces = wholePieces(bulkVolume, pieceVolume);
    return { pieces, remainder: leftover(bulkVolume, pieceVolume, pieces) };
  },
});

// ─── AREA bulk → COUNT pieces ────────────────────────────────────────────

/**
 * Cross-dimensional: an UPPER BOUND on pieces of `pieceArea` obtainable
 * from `sheetArea`. Not a yield.
 *
 * This is the one form in the kit whose name does not promise what the
 * others do, and the asymmetry is deliberate rather than an oversight.
 * Dividing a length by a length is exact because a bar has one axis to
 * cut along. Dividing an area by an area is not, because the pieces have
 * shapes and the offcut has a boundary: how many actually fit is a 2D
 * nesting problem, which is NP-hard in general and depends on dimensions
 * this conversion is never given.
 *
 * A 1 m² sheet divided by a 300 mm square piece bounds at 11. Nine fit.
 * The other two exist only as area, distributed around the edges in
 * strips 100 mm wide.
 *
 * Use this for costing and feasibility ("could this possibly fit?"), and
 * never as a cut list. There is no remainder form, because a remainder
 * would imply the eleven were real. When you know the piece and sheet
 * dimensions, cut along each axis with
 * `piecesFromStockLengthAndPieceLength` and multiply; that answer is
 * achievable, if not always optimal.
 *
 * AREA units are not re-exported by this kit; import `squareMeter`,
 * `squareFoot`, or `squareInch` from `unitforge/kits/geometry`, where
 * the AREA atoms currently live.
 */
export const maxPiecesFromSheetAreaAndPieceArea = /*#__PURE__*/ defineConversion({
  inputs: { sheetArea: AREA, pieceArea: AREA },
  output: COUNT,
  validate: {
    sheetArea: (v) => (Number.isFinite(v) && v >= 0) || 'sheetArea must be a finite value >= 0',
    pieceArea: (v) => (Number.isFinite(v) && v > 0) || 'pieceArea must be a finite value > 0',
  },
  compute: ({ sheetArea, pieceArea }) => wholePieces(sheetArea, pieceArea),
});

// ─── COUNT pieces → bulk required ────────────────────────────────────────
// The inverse direction, and the more common purchasing question: not
// "what does this bar yield" but "how much bar do I buy". These are exact
// multiplications with nothing to floor, so they lose nothing, and they
// deliberately do not add scrap or safety stock; those are business
// policy, not arithmetic.

/** Cross-dimensional: stock length needed for `pieces` at `pieceLength`.
 *  Ignores kerf, so it understates the buy length by `(pieces - 1) * kerf`
 *  on a saw; add that at the call site when it matters. */
export const stockLengthFromPiecesAndPieceLength = /*#__PURE__*/ defineConversion({
  inputs: { pieces: COUNT, pieceLength: LENGTH },
  output: LENGTH,
  validate: {
    pieces: (v) => (Number.isFinite(v) && v >= 0) || 'pieces must be a finite value >= 0',
    pieceLength: (v) => (Number.isFinite(v) && v >= 0) || 'pieceLength must be a finite value >= 0',
  },
  compute: ({ pieces, pieceLength }) => pieces * pieceLength,
});

/** Cross-dimensional: bulk mass needed for `pieces` at `pieceMass`. */
export const bulkMassFromPiecesAndPieceMass = /*#__PURE__*/ defineConversion({
  inputs: { pieces: COUNT, pieceMass: MASS },
  output: MASS,
  validate: {
    pieces: (v) => (Number.isFinite(v) && v >= 0) || 'pieces must be a finite value >= 0',
    pieceMass: (v) => (Number.isFinite(v) && v >= 0) || 'pieceMass must be a finite value >= 0',
  },
  compute: ({ pieces, pieceMass }) => pieces * pieceMass,
});

/** Cross-dimensional: bulk volume needed for `pieces` at `pieceVolume`. */
export const bulkVolumeFromPiecesAndPieceVolume = /*#__PURE__*/ defineConversion({
  inputs: { pieces: COUNT, pieceVolume: VOLUME },
  output: VOLUME,
  validate: {
    pieces: (v) => (Number.isFinite(v) && v >= 0) || 'pieces must be a finite value >= 0',
    pieceVolume: (v) => (Number.isFinite(v) && v >= 0) || 'pieceVolume must be a finite value >= 0',
  },
  compute: ({ pieces, pieceVolume }) => pieces * pieceVolume,
});

// ─── COUNT → COUNT kitting ───────────────────────────────────────────────
// Within-dimension, but not a unit conversion: `perAssembly` is a recipe
// rate, and applying it floors. These stay conversions rather than units
// for exactly that reason.

/**
 * Within-dimension COUNT: complete assemblies buildable from a stock of
 * one component.
 *
 * Handles ONE component. A bill of materials with several is a fold over
 * this conversion taking the minimum, which is three lines at the call
 * site and needs no library surface:
 *
 * @example
 *   import { forge } from 'unitforge';
 *   import { assembliesFromComponentsAndPerAssembly, each } from 'unitforge/kits/inventory';
 *
 *   const per = forge(
 *     { components: each, perAssembly: each },
 *     each,
 *     { via: assembliesFromComponentsAndPerAssembly },
 *   );
 *   const bom = [
 *     { have: 9, need: 2 }, // ingots
 *     { have: 5, need: 1 }, // planks
 *   ];
 *   const shields = Math.min(
 *     ...bom.map((b) => per({ components: b.have, perAssembly: b.need })),
 *   ); // 4, gated by ingots
 *
 * A library function for that fold would have to take a position on
 * substitutes, partial kits, and what to do with the leftovers, none of
 * which generalize. `Math.min` does not have that problem.
 */
export const assembliesFromComponentsAndPerAssembly = /*#__PURE__*/ defineConversion({
  inputs: { components: COUNT, perAssembly: COUNT },
  output: COUNT,
  validate: {
    components: (v) => (Number.isFinite(v) && v >= 0) || 'components must be a finite value >= 0',
    perAssembly: (v) => (Number.isFinite(v) && v > 0) || 'perAssembly must be a finite value > 0',
  },
  compute: ({ components, perAssembly }) => wholePieces(components, perAssembly),
});

/**
 * Within-dimension COUNT: components consumed by `assemblies`. Exact.
 *
 * The purchasing counterpart to the conversion above: how many rivets to
 * order for a production run.
 */
export const componentsFromAssembliesAndPerAssembly = /*#__PURE__*/ defineConversion({
  inputs: { assemblies: COUNT, perAssembly: COUNT },
  output: COUNT,
  validate: {
    assemblies: (v) => (Number.isFinite(v) && v >= 0) || 'assemblies must be a finite value >= 0',
    perAssembly: (v) => (Number.isFinite(v) && v >= 0) || 'perAssembly must be a finite value >= 0',
  },
  compute: ({ assemblies, perAssembly }) => assemblies * perAssembly,
});
