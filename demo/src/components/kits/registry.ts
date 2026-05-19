// Kit registry; the single place that knows every kit exists.
// App.tsx looks up { Screen, meta } by id to dispatch hash routes; the
// forge kit's kits-grid section iterates KITS to render navigation cards.
//
// A kit's meta declares its `defaultThemeId`; the theme registry
// (components/theme/recipes.ts) owns everything visual. The two
// registries are parallel: a kit references themes by id; themes don't
// reference kits beyond their kit field.
//
// Adding a kit: drop a folder at components/kits/<kit>/ exporting
// { <Kit>Screen, meta }, then import + append it below.

import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import type { KitId, ThemeId } from '../theme/recipes.js';
import { CookingScreen, meta as cookingMeta } from './cooking/index.js';
import { DataStorageScreen, meta as dataStorageMeta } from './data-storage/index.js';
import { ForgeScreen, meta as forgeMeta } from './forge/index.js';
import { GeometryScreen, meta as geometryMeta } from './geometry/index.js';
import { MassScreen, meta as massMeta } from './mass/index.js';

export interface KitMeta {
  id: KitId;
  label: string;
  blurb: string;
  /** Theme to activate when the user navigates to this kit and has no stored preference. */
  defaultThemeId: ThemeId;
  /** Lucide icon for the navigation card. */
  icon: LucideIcon;
  /**
   * Inline backdrop preview component used by the navigation card.
   * Optional because some kits (currently: forge) never appear as a
   * card on the home grid (forge IS the home). KitsGrid filters them
   * out by absence.
   */
  previewBg?: ComponentType<{ hovered: boolean }>;
}

export interface KitEntry {
  meta: KitMeta;
  Screen: ComponentType;
}

// Order matters: forge is element [0] because it's the home/default
// route. App.tsx's hash-router falls back to KITS[0] when the URL hash
// doesn't match any kit id. Subsequent entries surface as cards in the
// home page's kits-grid in declaration order.
//
// Non-empty tuple type so KITS[0] is statically known to be defined; the
// "empty registry" branch becomes unreachable at the type layer.
export const KITS: readonly [KitEntry, ...KitEntry[]] = [
  { meta: forgeMeta, Screen: ForgeScreen },
  { meta: geometryMeta, Screen: GeometryScreen },
  { meta: dataStorageMeta, Screen: DataStorageScreen },
  { meta: cookingMeta, Screen: CookingScreen },
  { meta: massMeta, Screen: MassScreen },
];

/** Look up a kit by its id; returns undefined if no match. */
export function findKit(id: string): KitEntry | undefined {
  return KITS.find((k) => k.meta.id === id);
}
