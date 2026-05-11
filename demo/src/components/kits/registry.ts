// Kit registry — the single place that knows every kit exists.
// App.tsx looks up { Page, meta } by id to dispatch hash routes; the forge
// kit's kits-grid section iterates KITS to render navigation cards.
//
// Adding a kit: drop a folder at components/kits/<kit>/ exporting
// { Page, meta }, then import + append it below. Two consumers, one source
// of truth.
//
// Step 1 scaffold: array is empty. Populated incrementally as each kit is
// migrated (steps 2-4); routing flips from the hardcoded ladder in App.tsx
// to registry-driven dispatch in step 5.

import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

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

export const KITS: ReadonlyArray<KitEntry> = [];
