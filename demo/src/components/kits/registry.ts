// Kit registry — the single place that knows every kit exists.
// App.tsx looks up { Page, meta } by id to dispatch hash routes; the forge
// kit's kits-grid section iterates KITS to render navigation cards.
//
// Adding a kit: drop a folder at components/kits/<kit>/ exporting
// { Page, meta }, then import + append it below. Two consumers, one source
// of truth.

import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Page as ForgePage, meta as forgeMeta } from './forge/index.js';
import { Page as GeometryPage, meta as geometryMeta } from './geometry/index.js';
import {
  Page as DataStoragePage,
  meta as dataStorageMeta,
} from './data-storage/index.js';

export interface KitMeta {
  id: string;
  label: string;
  blurb: string;
  /** data-theme value applied to <html> when this kit is active. */
  theme: string;
  /** Lucide icon for the navigation card. */
  icon: LucideIcon;
  /** Inline backdrop preview component used by the navigation card. */
  previewBg: ComponentType<{ hovered: boolean }>;
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
