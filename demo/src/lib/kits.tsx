// Kit catalog for the demo. Each entry carries everything the
// home/router needs to mount a kit's card and route to it — including
// the lucide icon and the inline background preview component that
// makes the home tile look like a peephole into that kit's visual
// world. Adding a new kit means appending here, building its widgets,
// and adding its page module to kits/<kit>/.
//
// The previewBg signature receives `hovered` so the kit owns the
// "rest" vs "active" treatment of its own preview without the home
// page needing to switch on `kit.id`.

import type { ComponentType } from 'react';
import { Box, Database, type LucideIcon } from 'lucide-react';
import { GridPaperBg } from '../kits/geometry/components/GridPaperBg.js';
import { CircuitBg } from '../kits/data-storage/components/CircuitBg.js';

export type KitId = 'geometry' | 'data-storage';

export interface KitMeta {
  id: KitId;
  label: string;
  blurb: string;
  /** Theme attribute applied to the route container. */
  theme: KitId;
  /** Lucide icon component shown on the kit card. */
  icon: LucideIcon;
  /** Inline background component for the kit card preview on home. */
  previewBg: ComponentType<{ hovered: boolean }>;
}

export const KITS: ReadonlyArray<KitMeta> = [
  {
    id: 'geometry',
    label: 'geometry',
    blurb: 'length, area, volume; metric and imperial; rectangle, circle, sphere derivations.',
    theme: 'geometry',
    icon: Box,
    previewBg: ({ hovered }) => <GridPaperBg inline scale={hovered ? 1.5 : 1} />,
  },
  {
    id: 'data-storage',
    label: 'data-storage',
    blurb:
      'bytes (decimal and IEC binary), bits; GB vs GiB, network throughput, RAM scaling.',
    theme: 'data-storage',
    icon: Database,
    previewBg: ({ hovered }) => <CircuitBg inline pulse={hovered} />,
  },
];
