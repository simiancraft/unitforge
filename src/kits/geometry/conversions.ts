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
import { ANGLE, AREA, LENGTH, VOLUME } from '../../dimensions.js';

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

/**
 * Cross-dimensional: circle area = π · (d/2)² (base units).
 *
 * Callers measuring drilled holes, pipes, wheels, and machined parts
 * usually have a diameter, not a radius. Ship a diameter-input form so
 * those callers don't have to divide by 2 at the call site.
 */
export const areaFromCircleDiameter = /*#__PURE__*/ defineConversion({
  inputs: { diameter: LENGTH },
  output: AREA,
  validate: {
    diameter: (v) => v >= 0 || 'diameter must be >= 0',
  },
  compute: ({ diameter }) => Math.PI * (diameter / 2) * (diameter / 2),
});

/** Cross-dimensional: triangle area = ½ · b · h (base units). */
export const areaFromTriangleBaseAndHeight = /*#__PURE__*/ defineConversion({
  inputs: { base: LENGTH, height: LENGTH },
  output: AREA,
  validate: {
    base: (v) => v >= 0 || 'base must be >= 0',
    height: (v) => v >= 0 || 'height must be >= 0',
  },
  compute: ({ base, height }) => 0.5 * base * height,
});

/**
 * Cross-dimensional: triangle area via Heron's formula (base units).
 *
 * A = √(s(s−a)(s−b)(s−c)) where s = (a+b+c)/2.
 *
 * The cross-input `_all` validator enforces the triangle inequality
 * (a+b ≥ c ∧ b+c ≥ a ∧ a+c ≥ b). Without it, the radicand goes negative
 * on three sides that cannot form a triangle and the caller sees `NaN`
 * with no useful error. The aggregating ValidationError surface returns
 * one failure naming the violation.
 */
export const areaFromTriangleSides = /*#__PURE__*/ defineConversion({
  inputs: { a: LENGTH, b: LENGTH, c: LENGTH },
  output: AREA,
  validate: {
    a: (v) => v >= 0 || 'a must be >= 0',
    b: (v) => v >= 0 || 'b must be >= 0',
    c: (v) => v >= 0 || 'c must be >= 0',
    _all: ({ a, b, c }: { a: number; b: number; c: number }) =>
      (a + b >= c && b + c >= a && a + c >= b) ||
      'triangle inequality violated: sides do not form a triangle',
  },
  compute: ({ a, b, c }) => {
    const s = (a + b + c) / 2;
    return Math.sqrt(s * (s - a) * (s - b) * (s - c));
  },
});

/** Cross-dimensional: equilateral triangle area = (√3 / 4) · s² (base units). */
export const areaFromEquilateralTriangleSide = /*#__PURE__*/ defineConversion({
  inputs: { side: LENGTH },
  output: AREA,
  validate: {
    side: (v) => v >= 0 || 'side must be >= 0',
  },
  compute: ({ side }) => (Math.sqrt(3) / 4) * side * side,
});

/** Cross-dimensional: trapezoid area = ½ (a + b) · h (base units). */
export const areaFromTrapezoidBasesAndHeight = /*#__PURE__*/ defineConversion({
  inputs: { a: LENGTH, b: LENGTH, height: LENGTH },
  output: AREA,
  validate: {
    a: (v) => v >= 0 || 'a must be >= 0',
    b: (v) => v >= 0 || 'b must be >= 0',
    height: (v) => v >= 0 || 'height must be >= 0',
  },
  compute: ({ a, b, height }) => 0.5 * (a + b) * height,
});

/**
 * Cross-dimensional: parallelogram area = base · height (base units).
 *
 * Numerically identical to rectangle area; ship as a distinct conversion
 * because the caller's input semantics differ. Parallelogram height is
 * the perpendicular distance between the two parallel sides, not the
 * length of the slanted edge. Documentation of intent beats formula
 * deduplication.
 */
export const areaFromParallelogramBaseAndHeight = /*#__PURE__*/ defineConversion({
  inputs: { base: LENGTH, height: LENGTH },
  output: AREA,
  validate: {
    base: (v) => v >= 0 || 'base must be >= 0',
    height: (v) => v >= 0 || 'height must be >= 0',
  },
  compute: ({ base, height }) => base * height,
});

/** Cross-dimensional: rhombus area = ½ · d1 · d2 (base units). */
export const areaFromRhombusDiagonals = /*#__PURE__*/ defineConversion({
  inputs: { d1: LENGTH, d2: LENGTH },
  output: AREA,
  validate: {
    d1: (v) => v >= 0 || 'd1 must be >= 0',
    d2: (v) => v >= 0 || 'd2 must be >= 0',
  },
  compute: ({ d1, d2 }) => 0.5 * d1 * d2,
});

/**
 * Cross-dimensional: kite area = ½ · d1 · d2 (base units).
 *
 * Numerically identical to rhombus area (a rhombus IS a special kite);
 * ship as a distinct conversion because the caller often has kite-shaped
 * inputs (flag dimensions, decorative tile layouts) and the named
 * conversion clarifies intent at the call site.
 */
export const areaFromKiteDiagonals = /*#__PURE__*/ defineConversion({
  inputs: { d1: LENGTH, d2: LENGTH },
  output: AREA,
  validate: {
    d1: (v) => v >= 0 || 'd1 must be >= 0',
    d2: (v) => v >= 0 || 'd2 must be >= 0',
  },
  compute: ({ d1, d2 }) => 0.5 * d1 * d2,
});

/** Cross-dimensional: ellipse area = π · a · b where a, b are semi-axes (base units). */
export const areaFromEllipseSemiAxes = /*#__PURE__*/ defineConversion({
  inputs: { a: LENGTH, b: LENGTH },
  output: AREA,
  validate: {
    a: (v) => v >= 0 || 'a must be >= 0',
    b: (v) => v >= 0 || 'b must be >= 0',
  },
  compute: ({ a, b }) => Math.PI * a * b,
});

/**
 * Cross-dimensional: annulus area = π · (R² − r²) (base units).
 *
 * The cross-input `_all` validator enforces outer radius ≥ inner radius.
 * Without it the result is a negative area for any case where the inner
 * radius exceeds the outer, with no useful error to the caller.
 */
export const areaFromAnnulusRadii = /*#__PURE__*/ defineConversion({
  inputs: { outerRadius: LENGTH, innerRadius: LENGTH },
  output: AREA,
  validate: {
    outerRadius: (v) => v >= 0 || 'outerRadius must be >= 0',
    innerRadius: (v) => v >= 0 || 'innerRadius must be >= 0',
    _all: ({ outerRadius, innerRadius }: { outerRadius: number; innerRadius: number }) =>
      outerRadius >= innerRadius || 'outerRadius must be >= innerRadius',
  },
  compute: ({ outerRadius, innerRadius }) =>
    Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius),
});

/**
 * Cross-dimensional: circular sector area = ½ · r² · θ (compute runs in
 * base units; θ in radians).
 *
 * The angle validator rejects negative inputs only. Validators in this
 * library run on the raw user-supplied value (in whatever ANGLE unit
 * the caller specified), not on the base-normalized radian; an angle-
 * range check in radians would misfire when the caller passes degrees.
 * Angles greater than 2π (more than one full turn) produce
 * non-physical sector areas; the formula computes them honestly
 * without rejection.
 */
export const areaFromSectorRadiusAndAngle = /*#__PURE__*/ defineConversion({
  inputs: { radius: LENGTH, angle: ANGLE },
  output: AREA,
  validate: {
    radius: (v) => v >= 0 || 'radius must be >= 0',
    angle: (v) => v >= 0 || 'angle must be >= 0',
  },
  compute: ({ radius, angle }) => 0.5 * radius * radius * angle,
});

/**
 * Cross-dimensional: circular segment area = ½ · r² · (θ − sin θ)
 * (compute runs in base units; θ in radians).
 *
 * The minor segment cut off by a chord subtending angle θ at the center.
 * Same validator policy as `areaFromSectorRadiusAndAngle`: negative
 * inputs are rejected; out-of-physical-range positive inputs are not.
 */
export const areaFromCircularSegmentRadiusAndAngle = /*#__PURE__*/ defineConversion({
  inputs: { radius: LENGTH, angle: ANGLE },
  output: AREA,
  validate: {
    radius: (v) => v >= 0 || 'radius must be >= 0',
    angle: (v) => v >= 0 || 'angle must be >= 0',
  },
  compute: ({ radius, angle }) => 0.5 * radius * radius * (angle - Math.sin(angle)),
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
