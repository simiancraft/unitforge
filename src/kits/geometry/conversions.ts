// Cross-dimensional conversions native to the geometry kit. Co-located with
// the kit's units so `import * from 'unitforge/kits/geometry'` gives the
// consumer everything geometry-shaped in one place.
//
// Compute functions are written in BASE units (meter, square-meter,
// cubic-meter); the library decorates them so the call site may use any
// compatible unit (centimeter, foot, etc.).
//
// Validators reject negative values for any geometric dimension; pure shapes
// have no negative-side semantics. Validators are aggregating: a call with
// multiple negative inputs yields one ValidationError with one failure per
// rejected input.

import { defineConversion } from '../../define.js';
import { AREA, LENGTH, VOLUME } from '../../dimensions.js';

// ─── AREA derivations ────────────────────────────────────────────────────

/** Cross-dimensional: rectangle area = length × width (base units). */
export const areaFromLengthAndWidth = /*#__PURE__*/ defineConversion({
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

/** Cross-dimensional: rectangular-box volume = length × width × height (base units). */
export const volumeFromLengthAndWidthAndHeight = /*#__PURE__*/ defineConversion({
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
