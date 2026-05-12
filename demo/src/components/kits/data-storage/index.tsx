// Data-storage kit chassis. CRT-phosphor dark + datasheet-silkscreen light.
// Owns Bench state so the circuit backdrop's pulse animation toggles
// whenever the user is actively moving the bench. Sections live in
// ./sections/ as SectionLayout composers.
//
// All theme orchestration (CSS variable cascade, shiki theme selection,
// CRT chrome class) lives at the root ThemeProvider; the kit is a pure
// renderer.

import { Database } from 'lucide-react';
import { useState } from 'react';
import { DATA_ALL_UNITS, type DataKey, findByKey } from '~/lib/units.js';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { usePulse } from '../use-pulse.js';
import { DataStorageBackdrop } from './parts/data-storage-backdrop.js';
import { DriveVsOs } from './sections/drive-vs-os.js';
import { HelloBytes } from './sections/hello-bytes.js';
import { RamStick } from './sections/ram-stick.js';
import { ThroughputViz } from './sections/throughput-viz.js';
import './data-storage.css';

export function DataStorageScreen() {
  const [bench, setBench] = useState<BenchState<DataKey>>({
    fromKey: 'GB',
    toKey: 'GiB',
    value: 500,
  });

  // Pulse the circuit traces briefly each time the bench moves; 1.6s
  // lets the keyframe play out and then rest.
  const pulse = usePulse([bench.fromKey, bench.toKey, bench.value], 1600);

  return (
    <KitLayout
      backdropZone={<DataStorageBackdrop pulse={pulse} />}
      headerZone={
        <header className="relative uf-scanlines flex flex-col gap-2">
          <p className="uf-eyebrow">kit · 02</p>
          <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">data-storage</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-uf-muted">
            Decimal bytes (kilobyte through petabyte), IEC binary bytes (kibibyte through pebibyte),
            and bits. The board pulses as you scrub the bench; every conversion is a real forge call
            against the built package.
          </p>
        </header>
      }
      benchZone={
        <Bench
          state={bench}
          onChange={setBench}
          options={DATA_ALL_UNITS}
          min={1}
          max={2000}
          step={1}
          codeFor={(s, r) =>
            `forge(${findByKey(DATA_ALL_UNITS, s.fromKey).label}, ${findByKey(DATA_ALL_UNITS, s.toKey).label})(${s.value}); // ${r.toExponential(3)}`
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
  previewBg: ({ hovered }) => <DataStorageBackdrop inline pulse={hovered} />,
};
