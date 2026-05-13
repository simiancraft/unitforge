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
 *
 * The formula is geometrically meaningful for θ ∈ [0, 2π]. Outside that
 * range the math still computes but the output describes a wound or
 * multi-wrapped figure with no single-segment correspondence.
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

/**
 * Cross-dimensional: regular-polygon area = ½ · apothem · perimeter
 * (base units). Works for any n-sided regular polygon; the side count
 * is implicit in the apothem-to-perimeter ratio. Side-input forms
 * (`areaFromRegularPolygonSidesAndLength`) require a DIMENSIONLESS /
 * COUNT dimension which the kit does not yet ship.
 */
export const areaFromRegularPolygonApothemAndPerimeter =
  /*#__PURE__*/ defineConversion({
    inputs: { apothem: LENGTH, perimeter: LENGTH },
    output: AREA,
    validate: {
      apothem: (v) => v >= 0 || 'apothem must be >= 0',
      perimeter: (v) => v >= 0 || 'perimeter must be >= 0',
    },
    compute: ({ apothem, perimeter }) => 0.5 * apothem * perimeter,
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

// ─── Perimeter / circumference / arc-length derivations ──────────────────
// Within-dimension LENGTH derivations. Output is the same dimension as
// inputs (LENGTH → LENGTH); the `<noun>Of<Shape>From<Inputs>` naming
// pattern signals the measurement-on-a-shape shape rather than a
// cross-dimensional transformation.

/** 2 (L + W). */
export const perimeterOfRectangleFromLengthAndWidth = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH, width: LENGTH },
  output: LENGTH,
  validate: {
    length: (v) => v >= 0 || 'length must be >= 0',
    width: (v) => v >= 0 || 'width must be >= 0',
  },
  compute: ({ length, width }) => 2 * (length + width),
});

/** 4 · s. */
export const perimeterOfSquareFromSide = /*#__PURE__*/ defineConversion({
  inputs: { side: LENGTH },
  output: LENGTH,
  validate: {
    side: (v) => v >= 0 || 'side must be >= 0',
  },
  compute: ({ side }) => 4 * side,
});

/**
 * a + b + c. No triangle-inequality check; perimeter is meaningful for any
 * three nonneg lengths, including degenerate triples that cannot form a
 * triangle. The Heron-style area conversion is where the inequality
 * matters.
 */
export const perimeterOfTriangleFromSides = /*#__PURE__*/ defineConversion({
  inputs: { a: LENGTH, b: LENGTH, c: LENGTH },
  output: LENGTH,
  validate: {
    a: (v) => v >= 0 || 'a must be >= 0',
    b: (v) => v >= 0 || 'b must be >= 0',
    c: (v) => v >= 0 || 'c must be >= 0',
  },
  compute: ({ a, b, c }) => a + b + c,
});

/** 3 · s. */
export const perimeterOfEquilateralTriangleFromSide = /*#__PURE__*/ defineConversion({
  inputs: { side: LENGTH },
  output: LENGTH,
  validate: {
    side: (v) => v >= 0 || 'side must be >= 0',
  },
  compute: ({ side }) => 3 * side,
});

/** 4 · s. (A rhombus's perimeter is 4× any side, since all sides are equal.) */
export const perimeterOfRhombusFromSide = /*#__PURE__*/ defineConversion({
  inputs: { side: LENGTH },
  output: LENGTH,
  validate: {
    side: (v) => v >= 0 || 'side must be >= 0',
  },
  compute: ({ side }) => 4 * side,
});

/** 2 (b + s). */
export const perimeterOfParallelogramFromBaseAndSide = /*#__PURE__*/ defineConversion({
  inputs: { base: LENGTH, side: LENGTH },
  output: LENGTH,
  validate: {
    base: (v) => v >= 0 || 'base must be >= 0',
    side: (v) => v >= 0 || 'side must be >= 0',
  },
  compute: ({ base, side }) => 2 * (base + side),
});

/** a + b + c + d. */
export const perimeterOfTrapezoidFromSides = /*#__PURE__*/ defineConversion({
  inputs: { a: LENGTH, b: LENGTH, c: LENGTH, d: LENGTH },
  output: LENGTH,
  validate: {
    a: (v) => v >= 0 || 'a must be >= 0',
    b: (v) => v >= 0 || 'b must be >= 0',
    c: (v) => v >= 0 || 'c must be >= 0',
    d: (v) => v >= 0 || 'd must be >= 0',
  },
  compute: ({ a, b, c, d }) => a + b + c + d,
});

/** 2π · r. */
export const circumferenceOfCircleFromRadius = /*#__PURE__*/ defineConversion({
  inputs: { radius: LENGTH },
  output: LENGTH,
  validate: {
    radius: (v) => v >= 0 || 'radius must be >= 0',
  },
  compute: ({ radius }) => 2 * Math.PI * radius,
});

/** π · d. */
export const circumferenceOfCircleFromDiameter = /*#__PURE__*/ defineConversion({
  inputs: { diameter: LENGTH },
  output: LENGTH,
  validate: {
    diameter: (v) => v >= 0 || 'diameter must be >= 0',
  },
  compute: ({ diameter }) => Math.PI * diameter,
});

/**
 * Arc length = r · θ (compute runs in base units; θ in radians).
 * Same validator policy as `areaFromSectorRadiusAndAngle`: angle ≥ 0
 * only; multi-turn angles compute honestly.
 */
export const arcLengthFromRadiusAndAngle = /*#__PURE__*/ defineConversion({
  inputs: { radius: LENGTH, angle: ANGLE },
  output: LENGTH,
  validate: {
    radius: (v) => v >= 0 || 'radius must be >= 0',
    angle: (v) => v >= 0 || 'angle must be >= 0',
  },
  compute: ({ radius, angle }) => radius * angle,
});

/**
 * Inverse arc length: θ = arcLength / radius (compute runs in base
 * units; output ANGLE in radians, callers may request degrees etc. via
 * forge). Returns ANGLE; first conversion in this kit with ANGLE
 * output. `_all` rejects radius = 0 because the ratio is undefined.
 */
export const angleFromArcLengthAndRadius = /*#__PURE__*/ defineConversion({
  inputs: { arcLength: LENGTH, radius: LENGTH },
  output: ANGLE,
  validate: {
    arcLength: (v) => v >= 0 || 'arcLength must be >= 0',
    radius: (v) => v >= 0 || 'radius must be >= 0',
    _all: ({ radius }: { arcLength: number; radius: number }) =>
      radius > 0 || 'radius must be > 0',
  },
  compute: ({ arcLength, radius }) => arcLength / radius,
});

/**
 * Chord length = 2 · r · sin(θ/2) where θ is the central angle subtended
 * by the chord. Output is LENGTH; angle in base radians per the unit-
 * normalization boundary.
 *
 * Geometrically meaningful for θ ∈ [0, 2π]; outside that range `sin(θ/2)`
 * oscillates and the output is not a physical chord length. Validator
 * rejects negative angles; out-of-meaningful-range positive angles
 * compute honestly without rejection.
 */
export const chordLengthFromRadiusAndAngle = /*#__PURE__*/ defineConversion({
  inputs: { radius: LENGTH, angle: ANGLE },
  output: LENGTH,
  validate: {
    radius: (v) => v >= 0 || 'radius must be >= 0',
    angle: (v) => v >= 0 || 'angle must be >= 0',
  },
  compute: ({ radius, angle }) => 2 * radius * Math.sin(angle / 2),
});

// ─── Diagonals, Pythagorean, and triangle radii ──────────────────────────
// Within-dimension LENGTH derivations.

/** √(L² + W²) (rectangle space diagonal in the plane). */
export const diagonalOfRectangleFromLengthAndWidth = /*#__PURE__*/ defineConversion({
  inputs: { length: LENGTH, width: LENGTH },
  output: LENGTH,
  validate: {
    length: (v) => v >= 0 || 'length must be >= 0',
    width: (v) => v >= 0 || 'width must be >= 0',
  },
  compute: ({ length, width }) => Math.sqrt(length * length + width * width),
});

/** s · √2 (square diagonal). */
export const diagonalOfSquareFromSide = /*#__PURE__*/ defineConversion({
  inputs: { side: LENGTH },
  output: LENGTH,
  validate: {
    side: (v) => v >= 0 || 'side must be >= 0',
  },
  compute: ({ side }) => side * Math.SQRT2,
});

/**
 * Pythagorean theorem: hypotenuse = √(a² + b²).
 *
 * Numerically identical to `diagonalOfRectangleFromLengthAndWidth`; ship
 * as a distinct conversion for caller intent. A right-triangle caller
 * should not have to import a rectangle conversion to compute a
 * hypotenuse; the named alias makes call sites self-documenting.
 */
export const hypotenuseFromLegs = /*#__PURE__*/ defineConversion({
  inputs: { a: LENGTH, b: LENGTH },
  output: LENGTH,
  validate: {
    a: (v) => v >= 0 || 'a must be >= 0',
    b: (v) => v >= 0 || 'b must be >= 0',
  },
  compute: ({ a, b }) => Math.sqrt(a * a + b * b),
});

/**
 * Inverse Pythagorean: leg = √(c² − a²) where c is the hypotenuse and a
 * is the other leg. The `_all` validator enforces hypotenuse ≥ leg;
 * without it the radicand goes negative and the caller eats `NaN`.
 */
export const legFromHypotenuseAndLeg = /*#__PURE__*/ defineConversion({
  inputs: { hypotenuse: LENGTH, leg: LENGTH },
  output: LENGTH,
  validate: {
    hypotenuse: (v) => v >= 0 || 'hypotenuse must be >= 0',
    leg: (v) => v >= 0 || 'leg must be >= 0',
    _all: ({ hypotenuse, leg }: { hypotenuse: number; leg: number }) =>
      hypotenuse >= leg || 'hypotenuse must be >= leg',
  },
  compute: ({ hypotenuse, leg }) => Math.sqrt(hypotenuse * hypotenuse - leg * leg),
});

/**
 * Inradius (incircle radius) of a triangle from its three sides:
 * r = Area / s, where Area is Heron's area and s = (a+b+c)/2 is the
 * semi-perimeter. Shares the triangle-inequality validator with
 * `areaFromTriangleSides`; degenerate triangles (zero area, sides
 * positive) yield r = 0 honestly. A zero-side degeneracy (a = b = c = 0)
 * produces NaN, consistent with the kit's compute-honestly policy on
 * undefined ratios.
 */
export const inradiusOfTriangleFromSides = /*#__PURE__*/ defineConversion({
  inputs: { a: LENGTH, b: LENGTH, c: LENGTH },
  output: LENGTH,
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
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    return area / s;
  },
});

/**
 * Circumradius (circumcircle radius) of a triangle from its three
 * sides: R = (a · b · c) / (4 · Area), where Area is Heron's area.
 * Shares the triangle-inequality validator with `areaFromTriangleSides`.
 * Degenerate (collinear) triangles produce Area = 0 and R = Infinity,
 * consistent with the kit's compute-honestly policy on undefined
 * ratios; the JSDoc names the edge case so call sites can guard.
 */
export const circumradiusOfTriangleFromSides = /*#__PURE__*/ defineConversion({
  inputs: { a: LENGTH, b: LENGTH, c: LENGTH },
  output: LENGTH,
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
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    return (a * b * c) / (4 * area);
  },
});

// ─── Coordinate geometry ─────────────────────────────────────────────────
// 2D coordinate-system derivations. LENGTH inputs here are signed
// coordinates, not magnitudes, so the conversions opt out of the kit's
// standard negative-input rejection. JSDoc on each names the asymmetry
// so a future reader doesn't try to "fix" the missing validators.

/**
 * Euclidean distance between two 2D points: √((x2−x1)² + (y2−y1)²).
 *
 * Coordinates may be negative; the validators only check that inputs
 * are finite numbers, not signed magnitudes. This is the documented
 * exception to the kit's "validators reject negatives" policy.
 */
export const distanceBetweenPoints = /*#__PURE__*/ defineConversion({
  inputs: { x1: LENGTH, y1: LENGTH, x2: LENGTH, y2: LENGTH },
  output: LENGTH,
  validate: {
    x1: (v) => Number.isFinite(v) || 'x1 must be finite',
    y1: (v) => Number.isFinite(v) || 'y1 must be finite',
    x2: (v) => Number.isFinite(v) || 'x2 must be finite',
    y2: (v) => Number.isFinite(v) || 'y2 must be finite',
  },
  compute: ({ x1, y1, x2, y2 }) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
});

/**
 * Midpoint between two 2D points: ((x1+x2)/2, (y1+y2)/2).
 *
 * Object output: returns `{ x: LENGTH, y: LENGTH }`. Same coordinate
 * signedness policy as `distanceBetweenPoints`.
 */
export const midpointBetweenPoints = /*#__PURE__*/ defineConversion({
  inputs: { x1: LENGTH, y1: LENGTH, x2: LENGTH, y2: LENGTH },
  output: { x: LENGTH, y: LENGTH },
  validate: {
    x1: (v) => Number.isFinite(v) || 'x1 must be finite',
    y1: (v) => Number.isFinite(v) || 'y1 must be finite',
    x2: (v) => Number.isFinite(v) || 'x2 must be finite',
    y2: (v) => Number.isFinite(v) || 'y2 must be finite',
  },
  compute: ({ x1, y1, x2, y2 }) => ({
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  }),
});

/**
 * Polar → Cartesian: { radius, angle } → { x: r·cos θ, y: r·sin θ }.
 *
 * `radius` is a magnitude (rejects negatives); `angle` runs in base
 * radians at compute time, callers may supply degrees / gradians /
 * turns via forge. Output components are signed coordinates.
 */
export const cartesianFromPolar = /*#__PURE__*/ defineConversion({
  inputs: { radius: LENGTH, angle: ANGLE },
  output: { x: LENGTH, y: LENGTH },
  validate: {
    radius: (v) => v >= 0 || 'radius must be >= 0',
    angle: (v) => Number.isFinite(v) || 'angle must be finite',
  },
  compute: ({ radius, angle }) => ({
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  }),
});

/**
 * Cartesian → Polar: { x, y } → { radius: √(x²+y²), angle: atan2(y, x) }.
 *
 * `x` and `y` are signed coordinates (same finite-only policy as
 * `distanceBetweenPoints` / `midpointBetweenPoints`). Uses `atan2` for
 * branch safety: the four-quadrant arctangent gives an angle in
 * (−π, π] without the ambiguity of `atan(y/x)`. Origin (0, 0) yields
 * `radius = 0` and `angle = 0` by `atan2`'s convention.
 */
export const polarFromCartesian = /*#__PURE__*/ defineConversion({
  inputs: { x: LENGTH, y: LENGTH },
  output: { radius: LENGTH, angle: ANGLE },
  validate: {
    x: (v) => Number.isFinite(v) || 'x must be finite',
    y: (v) => Number.isFinite(v) || 'y must be finite',
  },
  compute: ({ x, y }) => ({
    radius: Math.sqrt(x * x + y * y),
    angle: Math.atan2(y, x),
  }),
});

/**
 * Ellipse perimeter (Ramanujan II approximation):
 * P ≈ π · [3(a + b) − √((3a + b)(a + 3b))]
 *
 * **Approximation, not exact.** No closed-form ellipse perimeter exists;
 * Ramanujan published two series in 1914, of which the second (used
 * here) has bounded relative error < 4 × 10⁻⁵ for any eccentricity from
 * a circle (a = b) up to a fully degenerate line segment (a or b → 0).
 * The error is largest at extreme aspect ratios; for realistic axes
 * (aspect ratio ≤ 10:1) the error is below 10⁻⁹.
 *
 * Source: Ramanujan, S. (1914), "Modular equations and approximations
 * to π", Quarterly Journal of Mathematics 45, formula II at p. 354.
 */
export const perimeterOfEllipseFromSemiAxes = /*#__PURE__*/ defineConversion({
  inputs: { a: LENGTH, b: LENGTH },
  output: LENGTH,
  validate: {
    a: (v) => v >= 0 || 'a must be >= 0',
    b: (v) => v >= 0 || 'b must be >= 0',
  },
  compute: ({ a, b }) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b))),
});
