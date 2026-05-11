// Geometry kit chassis. Engineering-paper theme. Owns Bench state so the
// grid background reticks its cell size to the currently-selected "from"
// unit. The bench itself is the shared kit Bench; sections live in
// ./sections/ as self-contained SectionLayout-composers.

import { useEffect, useRef, useState } from 'react';
import { Box, type LucideIcon } from 'lucide-react';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { KitThemeProvider } from '../theme.js';
import { GeometryBackdrop } from './parts/geometry-backdrop.js';
import { CircleMachine } from './sections/circle-machine.js';
import { HelloUnit } from './sections/hello-unit.js';
import { RectangleMachine } from './sections/rectangle-machine.js';
import { findByKey, LENGTH_UNITS } from '../../../lib/units.js';
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
  const [bench, setBench] = useState<BenchState<'length'>>({
    fromKey: 'm',
    toKey: 'ft',
    value: 5,
  });
  const cellSize = CELL_PX_BY_UNIT[bench.fromKey] ?? 12;

  // Brief "the paper rippled" flash when the bench changes; mirrors the
  // data-storage pulse so geometry also breathes when interacted with.
  const [paperPulse, setPaperPulse] = useState(false);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    setPaperPulse(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPaperPulse(false), 600);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [bench.fromKey, bench.toKey, bench.value]);

  return (
    <KitThemeProvider values={{ shikiTheme: 'vitesse-light' }}>
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
            options={LENGTH_UNITS.map((o) => ({ key: o.key, label: o.label, unit: o.unit }))}
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
    </KitThemeProvider>
  );
}

export const meta: KitMeta & { icon: LucideIcon } = {
  id: 'geometry',
  label: 'geometry',
  blurb:
    'length, area, volume; metric and imperial; rectangle, circle, sphere derivations.',
  theme: 'geometry',
  icon: Box,
  previewBg: ({ hovered }) => <GeometryBackdrop inline scale={hovered ? 1.5 : 1} />,
};
