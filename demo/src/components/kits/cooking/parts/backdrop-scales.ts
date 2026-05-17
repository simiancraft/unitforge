// Dogfood: the cooking backdrop's slider-driven glyph-scale axis is a
// real forge() call from the volume dimension to a kit-local
// `bg-glyph-scale` dimension. Built on the shared
// `defineRuntimeBoundedAxis` helper so the kit-side declaration is
// just (id, symbol, label, dimension, compute).

import { defineRuntimeBoundedAxis, lerpBounded } from '~/lib/backdrop-scales.js';

// Subtle but visible swing. At slider min the glyphs read as denser
// background texture; at slider max they puff up into more present
// recipe-card stamps. Same lerp shape as the other backdrop axes
// (linear, runtime-bounded so the slider's full travel always uses
// the full range regardless of the picked fromUnit).
const GLYPH_SCALE_MIN = 0.6;
const GLYPH_SCALE_MAX = 1.4;

/**
 * Returns the multiplicative scale factor applied to every visible
 * glyph in the cooking backdrop, lerped over the bench's UI bounds.
 */
export const glyphScaleFor = defineRuntimeBoundedAxis({
  axisId: 'bg-glyph-scale',
  axisSymbol: '×',
  axisLabel: 'Background glyph scale (ratio)',
  inputDimension: 'volume',
  compute: ({ amount, minAmount, maxAmount }) =>
    lerpBounded({
      amount,
      minAmount,
      maxAmount,
      outMin: GLYPH_SCALE_MIN,
      outMax: GLYPH_SCALE_MAX,
    }),
});

/** Constant scroll speed in px/sec for the recipe-card horizontal
 *  scan lines. Very slow; meant to read as ambient page texture
 *  drifting, not as a marquee. */
export const SCAN_LINE_SPEED_PX_S = 2;
