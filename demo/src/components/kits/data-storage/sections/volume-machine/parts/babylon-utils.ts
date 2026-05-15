// Shared Babylon helpers for volume-machine scenes. Both babylon-cubes
// (tier scrub) and babylon-fill (compare flagship) read kit CSS tokens
// for their scene colors and convert hex → Color4 for clear-color +
// edge tinting. Hosted as a sibling parts file rather than inline so
// the two scenes can't drift on color handling.

import { Color4 } from '@babylonjs/core';

/**
 * Resolve a CSS custom property value with fallback. Tries the element
 * first, then `:root`, then the literal fallback. Used at mount time
 * to bridge the kit's theme tokens into Babylon material colors.
 */
export function readCssColor(el: Element, varName: string, fallback: string): string {
  const v =
    getComputedStyle(el).getPropertyValue(varName).trim() ||
    getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

/** Convert a 6-digit hex string ("#abcdef" or "abcdef") to a Babylon
 *  Color4 with the given alpha. */
export function hexToColor4(hex: string, alpha = 1): Color4 {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return new Color4(r, g, b, alpha);
}
