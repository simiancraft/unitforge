// Cross-dimensional and within-dimension derivations native to the geometry
// kit. Co-located with the kit's units so `import * from
// 'unitforge/kits/geometry'` gives the consumer everything geometry-shaped
// in one place.
//
// Compute functions are written in BASE units (meter, square-meter,
// cubic-meter, radian); the library decorates them so the call site may
// use any compatible unit (centimeter, foot, degree, etc.).
//
// Validators reject negative values for length / area / volume inputs by
// convention; pure shapes have no negative-side semantics. Coordinate-
// geometry derivations are the documented exception, since their LENGTH
// inputs are signed coordinates rather than magnitudes. Degenerate inputs
// (zero radius, zero side) are legal and produce zero outputs; validators
// reject negatives, not zeros. Validators are aggregating: a call with
// multiple bad inputs yields one ValidationError with one failure per
// rejected input.
//
// Naming sub-patterns used in this file (consistent across all
// conversions; document new ones at the source if they appear):
//
//   - `<output>From<Shape><Inputs>`: a transformation that produces a
//     value in a different dimension than its inputs. Example:
//     `areaFromRectangleLengthAndWidth` is LENGTH² → AREA.
//
//   - `<noun>Of<Shape>From<Inputs>`: a measurement-on-a-shape derivation
//     where output dimension matches one of the inputs. Example:
//     `perimeterOfRectangleFromLengthAndWidth` is LENGTH² → LENGTH;
//     `circumferenceOfCircleFromRadius` is LENGTH → LENGTH;
//     `diagonalOfRectangleFromLengthAndWidth` is LENGTH² → LENGTH.
//
// The two patterns are deliberate. The prefix-noun in pattern 2 signals
// that you're asking for a named measurement, not a cross-dimensional
// transformation.

import { defineConversion } from '../../define.js';
import { AREA, LENGTH, VOLUME } from '../../dimensions.js';

// ─── AREA derivations ────────────────────────────────────────────────────

/** Cross-dimensional: rectangle area = length × width (base units). */
export const areaFromRectangleLengthAndWidth = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH, width: LENGTH },
  output: AREA,
  validate: {
    length: (v) => v >= 0 || 'length must be >= 0',
    width: (v) => v >= 0 || 'width must be >= 0',
  },
  compute: ({ length, width }) => length * width,
});

/** Cross-dimensional: square area = side² (base units). */
export const areaFromSquareSide = /*#__PURE__*/ defineConversion({
  inputs: { side: LENGTH },
  output: AREA,
  validate: {
    side: (v) => v >= 0 || 'side must be >= 0',
  },
  compute: ({ side }) => side * side,
});

/** Cross-dimensional: circle area = π · r² (base units). */
export const areaFromCircleRadius = /*#__PURE__*/ defineConversion({
  inputs: { radius: LENGTH },
  output: AREA,
  validate: {
    radius: (v) => v >= 0 || 'radius must be >= 0',
  },
  compute: ({ radius }) => Math.PI * radius * radius,
});

// ─── VOLUME derivations ──────────────────────────────────────────────────

/** Cross-dimensional: cuboid (rectangular-prism) volume = length × width × height (base units). */
export const volumeFromCuboidLengthAndWidthAndHeight = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH, width: LENGTH, height: LENGTH },
  output: VOLUME,
  validate: {
    length: (v) => v >= 0 || 'length must be >= 0',
    width: (v) => v >= 0 || 'width must be >= 0',
    height: (v) => v >= 0 || 'height must be >= 0',
  },
  compute: ({ length, width, height }) => length * width * height,
});

/** Cross-dimensional: cube volume = side³ (base units). */
export const volumeFromCubeSide = /*#__PURE__*/ defineConversion({
  inputs: { side: LENGTH },
  output: VOLUME,
  validate: {
    side: (v) => v >= 0 || 'side must be >= 0',
  },
  compute: ({ side }) => side * side * side,
});

/** Cross-dimensional: sphere volume = (4/3) π r³ (base units). */
export const volumeFromSphereRadius = /*#__PURE__*/ defineConversion({
  inputs: { radius: LENGTH },
  output: VOLUME,
  validate: {
    radius: (v) => v >= 0 || 'radius must be >= 0',
  },
  compute: ({ radius }) => (4 / 3) * Math.PI * radius * radius * radius,
});

/** Cross-dimensional: cylinder volume = π r² h (base units). */
export const volumeFromCylinderRadiusAndHeight = /*#__PURE__*/ defineConversion({
  inputs: { radius: LENGTH, height: LENGTH },
  output: VOLUME,
  validate: {
    radius: (v) => v >= 0 || 'radius must be >= 0',
    height: (v) => v >= 0 || 'height must be >= 0',
  },
  compute: ({ radius, height }) => Math.PI * radius * radius * height,
});
