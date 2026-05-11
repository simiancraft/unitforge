// Kit registry — the single place that knows every kit exists.
// App.tsx looks up { Page, meta } by id to dispatch hash routes; the forge
// kit's kits-grid section iterates KITS to render navigation cards.
//
// A kit's meta declares its `defaultThemeId`; the theme registry
// (components/theme/recipes.ts) owns everything visual. The two
// registries are parallel: a kit references themes by id; themes don't
// reference kits beyond their kit field.
//
// Adding a kit: drop a folder at components/kits/<kit>/ exporting
// { Page, meta }, then import + append it below.

import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { KitId, ThemeId } from '../theme/recipes.js';
import { Page as ForgePage, meta as forgeMeta } from './forge/index.js';
import { Page as GeometryPage, meta as geometryMeta } from './geometry/index.js';
import {
  Page as DataStoragePage,
  meta as dataStorageMeta,
} from './data-storage/index.js';

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
  Page: ComponentType;
}

export const KITS: ReadonlyArray<KitEntry> = [
  { meta: forgeMeta, Page: ForgePage },
  { meta: geometryMeta, Page: GeometryPage },
  { meta: dataStorageMeta, Page: DataStoragePage },
];

/** Look up a kit by its id; returns undefined if no match. */
export function findKit(id: string): KitEntry | undefined {
  return KITS.find((k) => k.meta.id === id);
}
