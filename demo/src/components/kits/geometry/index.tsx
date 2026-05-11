// Geometry kit chassis. Engineering-paper light + blueprint-night dark.
// Owns Bench state so the grid background reticks its cell size to the
// currently-selected "from" unit. The bench itself is the shared kit
// Bench; sections live in ./sections/ as SectionLayout composers.
//
// All theme orchestration (CSS variable cascade, shiki theme selection,
// code-frame chrome) lives at the root ThemeProvider; the kit is a pure
// renderer.

import { useState } from 'react';
import { Box } from 'lucide-react';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { usePulse } from '../use-pulse.js';
import { GeometryBackdrop } from './parts/geometry-backdrop.js';
import { CircleMachine } from './sections/circle-machine.js';
import { HelloUnit } from './sections/hello-unit.js';
import { RectangleMachine } from './sections/rectangle-machine.js';
import { findByKey, LENGTH_UNITS, type LengthKey } from '~/lib/units.js';
import './geometry.css';

// Grid cell size in pixels, per "from" unit. The grid background reads
// this and reticks; the effect is "the paper resamples when you change
// units".
const CELL_PX_BY_UNIT: Record<string, number> = {
  mm: 8,
  cm: 12,
  m: 18,
  km: 26,
  in: 14,
  ft: 20,
  yd: 24,
  mi: 28,
};

export function Page() {
  const [bench, setBench] = useState<BenchState<'length', LengthKey>>({
    fromKey: 'm',
    toKey: 'ft',
    value: 5,
  });
  const cellSize = CELL_PX_BY_UNIT[bench.fromKey] ?? 12;

  // Brief "the paper rippled" flash whenever the bench changes; mirrors
  // the data-storage trace pulse so geometry also breathes on interact.
  const paperPulse = usePulse([bench.fromKey, bench.toKey, bench.value], 600);

  return (
    <KitLayout
      backdropZone={<GeometryBackdrop cellSize={cellSize} pulse={paperPulse} />}
      headerZone={
        <header className="flex flex-col gap-2">
          <p className="uf-eyebrow">kit · 01</p>
          <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">geometry</h1>
          <p
            className="mt-2 max-w-2xl text-sm leading-relaxed"
            style={{ color: 'var(--uf-muted)' }}
          >
            Length, area, and volume; metric and imperial; cross-dimensional
            conversions for rectangles, circles, and spheres. Pick any unit for
            any input. Watch the engineering paper retick as you change units
            on the bench below.
          </p>
        </header>
      }
      benchZone={
        <Bench
          state={bench}
          onChange={setBench}
          options={LENGTH_UNITS}
          min={0.1}
          max={100}
          step={0.1}
          codeFor={(s, r) =>
            `forge(${findByKey(LENGTH_UNITS, s.fromKey).label}, ${findByKey(LENGTH_UNITS, s.toKey).label})(${s.value}); // ${r.toFixed(4)}`
          }
          label="forge bench · length"
        />
      }
      sectionsZone={
        <>
          <HelloUnit />
          <RectangleMachine />
          <CircleMachine />
        </>
      }
    />
  );
}

export const meta: KitMeta = {
  id: 'geometry',
  label: 'geometry',
  blurb:
    'length, area, volume; metric and imperial; rectangle, circle, sphere derivations.',
  defaultThemeId: 'geometry-light',
  icon: Box,
  previewBg: ({ hovered }) => <GeometryBackdrop inline scale={hovered ? 1.5 : 1} />,
};
