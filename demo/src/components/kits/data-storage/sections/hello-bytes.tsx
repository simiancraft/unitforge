// "Hello bytes"; pick a value in any byte/bit unit; render the same value
// across every other data-storage unit at once. The point: every row in the
// readout is the SAME quantity expressed in a different unit. Decimal and
// binary are clearly different; the user sees the gap.

import { Cpu } from 'lucide-react';
import { useState } from 'react';
import type { Unit } from 'unitforge';
import { forge } from 'unitforge';
import { byte } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/CodeBlock.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { UnitPicker } from '~/components/UnitPicker.js';
import { formatMagnitude } from '~/lib/format.js';
import {
  DATA_ALL_UNITS,
  DATA_BINARY_UNITS,
  DATA_BIT_UNITS,
  DATA_DECIMAL_UNITS,
  type DataKey,
  findByKey,
  pickerOptions,
} from '~/lib/units.js';
import { SectionHeader, SectionLayout } from '../../section-layout.js';

// Per-unit slider bounds so the range stays pedagogical at every scale:
// 1-1e6 bytes is interesting; 1-2000 GB is the canonical drive-size range.
// Record<DataKey,...> means TS enforces a row for every unit; adding a
// new data unit without a range here is a compile error.
const SLIDER_RANGE: Record<DataKey, { min: number; max: number; step: number; init: number }> = {
  B: { min: 1, max: 1_000_000, step: 1000, init: 500_000 },
  kB: { min: 1, max: 10_000, step: 1, init: 500 },
  MB: { min: 1, max: 10_000, step: 1, init: 500 },
  GB: { min: 1, max: 2000, step: 1, init: 500 },
  TB: { min: 0.1, max: 100, step: 0.1, init: 1 },
  PB: { min: 0.01, max: 10, step: 0.01, init: 1 },
  KiB: { min: 1, max: 10_000, step: 1, init: 500 },
  MiB: { min: 1, max: 10_000, step: 1, init: 500 },
  GiB: { min: 1, max: 2000, step: 1, init: 500 },
  TiB: { min: 0.1, max: 100, step: 0.1, init: 1 },
  PiB: { min: 0.01, max: 10, step: 0.01, init: 1 },
  bit: { min: 1, max: 1_000_000, step: 1000, init: 1000 },
  kbit: { min: 1, max: 10_000, step: 1, init: 1000 },
  Mbit: { min: 1, max: 10_000, step: 1, init: 100 },
  Gbit: { min: 0.1, max: 100, step: 0.1, init: 1 },
};

const CODE = `import { forge } from 'unitforge';
import {
  byte, gigabyte, gibibyte, megabit,
} from 'unitforge/kits/data-storage';

const bytes = forge(gigabyte, byte)(500); // 5e11
const inGiB = forge(byte, gibibyte)(bytes); // 465.66
const inMbit = forge(byte, megabit)(bytes); // 4e6
`;

interface BytesState {
  unitKey: DataKey;
  value: number;
}

export function HelloBytes() {
  // value + unitKey held atomically: switching units resets value to that
  // unit's pedagogical default in the same render, so the slider never
  // briefly shows a clamped position that disagrees with the underlying
  // state.
  const [state, setState] = useState<BytesState>({ unitKey: 'GB', value: 500 });
  const range = SLIDER_RANGE[state.unitKey];

  const setUnitKey = (next: DataKey) => {
    setState({ unitKey: next, value: SLIDER_RANGE[next].init });
  };
  const setValue = (next: number) => {
    setState((s) => ({ ...s, value: next }));
  };

  const fromUnit = findByKey(DATA_ALL_UNITS, state.unitKey);
  const inBytes = forge(fromUnit.unit, byte)(state.value);

  const renderRows = (
    list: ReadonlyArray<{ key: string; label: string; unit: Unit<'data', number> }>,
    family: string,
  ): React.ReactNode => (
    <div className="flex flex-col gap-1">
      <span className="uf-eyebrow">{family}</span>
      {list.map((opt) => {
        const v = forge(byte, opt.unit)(inBytes);
        return (
          <Result key={opt.key} label={opt.label} value={`${formatMagnitude(v)} ${opt.key}`} />
        );
      })}
    </div>
  );

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 01"
          title="hello, bytes"
          kicker="one value, every unit"
          iconZone={<Cpu size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Pick a number and a unit; every other byte and bit unit renders side by side. Decimal and
          binary columns sit next to each other so the gap between (say) GB and GiB is visible at a
          glance.
        </>
      }
      widgetZone={
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <UnitPicker
              label="input unit"
              value={state.unitKey}
              options={pickerOptions(DATA_ALL_UNITS)}
              onChange={setUnitKey}
            />
            <Slider
              label={`value (${fromUnit.key})`}
              value={state.value}
              min={range.min}
              max={range.max}
              step={range.step}
              onChange={setValue}
              suffix={fromUnit.key}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {renderRows(DATA_DECIMAL_UNITS, 'decimal (SI)')}
            {renderRows(DATA_BINARY_UNITS, 'binary (IEC)')}
            {renderRows(DATA_BIT_UNITS, 'bits')}
          </div>
        </div>
      }
      codeZone={<CodeBlock code={CODE} />}
    />
  );
}
