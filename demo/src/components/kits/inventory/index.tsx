// Inventory kit chassis. Two takes on the same idea (a warehouse is a
// place where continuous things become countable ones): stock-card
// (light) and bin-wall (dark). Owns Bench state; sections live in
// ./sections/ as SectionLayout composers.
//
// Section arc, deliberately paired: the first two sections tell the
// fantasy-crafting story (ore into ingots, ingots into a shield), the
// third isolates the pattern that makes both work (packaging as a
// unit), and the fourth replays all three beats in a coffee roastery so
// the reader can see that the game and the factory are the same
// program.
//
// All theme orchestration (CSS variable cascade, shiki theme selection)
// lives at the root ThemeProvider; the kit is a pure renderer.

import { Boxes } from 'lucide-react';
import { useState } from 'react';
import { formatCount, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { InventoryBackdrop } from './parts/inventory-backdrop.js';
import { CasePack } from './sections/case-pack.js';
import { Roastery } from './sections/roastery.js';
import { Smelter } from './sections/smelter.js';
import { Workbench } from './sections/workbench.js';
import { INVENTORY_ALL_UNITS, inventoryBoundsFor } from './units.js';
import './inventory.css';

export function InventoryScreen() {
  const [bench, setBench] = useState<BenchState>({
    fromId: 'gross',
    toId: 'dozen',
    value: 1,
  });
  const benchBounds = inventoryBoundsFor(bench.fromId);
  const fromUnit = findById(INVENTORY_ALL_UNITS, bench.fromId);
  const toUnit = findById(INVENTORY_ALL_UNITS, bench.toId);

  // Normalized slider position (0..1). Drives how much of the bin wall
  // is lit. Falls back to 0.5 on a degenerate bounds entry.
  const intensity =
    benchBounds.max > benchBounds.min
      ? (bench.value - benchBounds.min) / (benchBounds.max - benchBounds.min)
      : 0.5;

  // Same intercept the cooking and mass kits use: a from-unit swap
  // resets value to that unit's pedagogical init so the slider never
  // strands at a position that disagrees with the new unit's range.
  const handleBenchChange = (next: BenchState) => {
    if (next.fromId !== bench.fromId) {
      setBench({ ...next, value: inventoryBoundsFor(next.fromId).init });
      return;
    }
    setBench(next);
  };

  return (
    <KitLayout
      backdropZone={<InventoryBackdrop fromUnit={fromUnit} toUnit={toUnit} intensity={intensity} />}
      headerZone={
        <header className="relative flex flex-col gap-2">
          <p className="uf-eyebrow">kit · 08</p>
          <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">inventory</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-uf-muted">
            Counting is a dimension. Ten ore make three ingots and leave one in the hopper; a 69 kg
            sack of green coffee makes 170 retail bags and leaves 160 g on the scale. Same shape,
            same three primitives. The rule the whole page turns on: units must round-trip, recipes
            do not have to, so every floor and every yield loss lives inside a{' '}
            <code>defineConversion</code>.
          </p>
        </header>
      }
      benchZone={
        <Bench
          state={bench}
          onChange={handleBenchChange}
          options={INVENTORY_ALL_UNITS}
          min={benchBounds.min}
          max={benchBounds.max}
          step={benchBounds.step}
          codeFor={(s, r) =>
            `forge(${toJsName(findById(INVENTORY_ALL_UNITS, s.fromId).id)}, ${toJsName(findById(INVENTORY_ALL_UNITS, s.toId).id)})(${formatCount(s.value)}); // ${formatCount(r)}`
          }
          label="forge bench · inventory"
        />
      }
      sectionsZone={
        <>
          <Smelter />
          <Workbench />
          <CasePack />
          <Roastery />
        </>
      }
    />
  );
}

export const meta: KitMeta = {
  id: 'inventory',
  label: 'inventory',
  blurb:
    'each, pair, dozen, gross, ream. Counting as a dimension, bulk stock floored into whole pieces, and bills of materials gated by their scarcest line.',
  defaultThemeId: 'inventory-dark',
  icon: Boxes,
  previewBg: () => <InventoryBackdrop inline />,
};
