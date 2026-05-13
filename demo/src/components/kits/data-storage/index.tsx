// Data-storage kit chassis. CRT-phosphor dark + datasheet-silkscreen light.
// Owns Bench state; sections live in ./sections/ as SectionLayout
// composers. The circuit backdrop's trace animation is always on
// (ambient page texture); no pulse-on-interact hook.
//
// All theme orchestration (CSS variable cascade, shiki theme selection,
// CRT chrome class) lives at the root ThemeProvider; the kit is a pure
// renderer.

import { Database } from 'lucide-react';
import { useState } from 'react';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { DataStorageBackdrop } from './parts/data-storage-backdrop.js';
import { DriveVsOs } from './sections/drive-vs-os.js';
import { HelloBytes } from './sections/hello-bytes.js';
import { RamStick } from './sections/ram-stick.js';
import { ThroughputViz } from './sections/throughput-viz.js';
import { DATA_ALL_UNITS } from './units.js';
import './data-storage.css';

// Slider bounds for the data-storage kit's bench, in the user-selected
// from-unit. Local to this kit; other kits' benches pick their own.
const DATA_STORAGE_BENCH_MIN = 1;
const DATA_STORAGE_BENCH_MAX = 2000;
const DATA_STORAGE_BENCH_STEP = 1;

export function DataStorageScreen() {
  const [bench, setBench] = useState<BenchState>({
    fromId: 'gigabyte',
    toId: 'gibibyte',
    value: 500,
  });

  return (
    <KitLayout
      backdropZone={<DataStorageBackdrop />}
      headerZone={
        <header className="relative uf-scanlines flex flex-col gap-2">
          <p className="uf-eyebrow">kit · 02</p>
          <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">data-storage</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-uf-muted">
            Decimal bytes (kilobyte through petabyte), IEC binary bytes (kibibyte through pebibyte),
            and bits. Every conversion is a real forge call against the built package.
          </p>
        </header>
      }
      benchZone={
        <Bench
          state={bench}
          onChange={setBench}
          options={DATA_ALL_UNITS}
          min={DATA_STORAGE_BENCH_MIN}
          max={DATA_STORAGE_BENCH_MAX}
          step={DATA_STORAGE_BENCH_STEP}
          codeFor={(s, r) =>
            `forge(${toJsName(findById(DATA_ALL_UNITS, s.fromId).id)}, ${toJsName(findById(DATA_ALL_UNITS, s.toId).id)})(${formatMagnitude(s.value)}); // ${formatMagnitude(r)}`
          }
          label="forge bench · data"
        />
      }
      sectionsZone={
        <>
          <HelloBytes />
          <DriveVsOs />
          <ThroughputViz />
          <RamStick />
        </>
      }
    />
  );
}

export const meta: KitMeta = {
  id: 'data-storage',
  label: 'data-storage',
  blurb: 'bytes (decimal and IEC binary), bits; GB vs GiB, network throughput, RAM scaling.',
  defaultThemeId: 'data-storage-dark',
  icon: Database,
  previewBg: () => <DataStorageBackdrop inline />,
};
