// Glyph table for the inventory page. Every countable thing on the page
// (ore, logs, ingots, planks, shields, beans, bags, labels, valves,
// cans) resolves to a lucide icon through this one lookup, so a section
// can render "N of X" without importing an icon per material.
//
// Kept as plain `.ts` (icon *components*, not JSX) so the demo-invariants
// test can import it under the library's bun-test run, which has no JSX
// runtime in scope.

import {
  Award,
  Box,
  CircleDot,
  type LucideIcon,
  Package,
  Shield,
  Sprout,
  Tag,
  TreePine,
  Wind,
} from 'lucide-react';

/** Every glyph key the page's sections reference. Declared as a union
 *  so `GLYPHS` below is a total Record and a typo surfaces at compile
 *  time rather than as a blank slot. */
export const GLYPH_KEYS = [
  'ore',
  'log',
  'ingot',
  'plank',
  'shield',
  'bean',
  'bag',
  'label',
  'valve',
  'can',
] as const;

export type GlyphKey = (typeof GLYPH_KEYS)[number];

export const GLYPHS: Record<GlyphKey, LucideIcon> = {
  ore: CircleDot,
  log: TreePine,
  ingot: Box,
  plank: Package,
  shield: Shield,
  bean: Sprout,
  bag: Package,
  label: Tag,
  valve: Wind,
  can: Award,
};

/** Resolves a glyph key to its icon. Parameter is `string` because
 *  callers drive from recipe data whose ids widen; unknown keys fall
 *  back to a neutral box rather than throwing, since a missing glyph
 *  should degrade the picture, not blank the page. */
export function glyphFor(key: string): LucideIcon {
  if (key in GLYPHS) return GLYPHS[key as GlyphKey];
  return Box;
}
