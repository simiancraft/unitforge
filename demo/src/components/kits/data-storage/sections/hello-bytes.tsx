// "Hello bytes" — pick a value in any byte/bit unit; render the same value
// across every other data-storage unit at once. The point: every row in the
// readout is the SAME quantity expressed in a different unit. Decimal and
// binary are clearly different; the user sees the gap.

import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { forge } from 'unitforge';
import { byte } from 'unitforge/kits/data-storage';
import { CodeBlock } from '../../../CodeBlock.js';
import { Result } from '../../../Result.js';
import { Slider } from '../../../Slider.js';
import { UnitPicker } from '../../../UnitPicker.js';
import { SectionHeader, SectionLayout } from '../../section-layout.js';
import {
  DATA_BINARY_UNITS,
  DATA_BIT_UNITS,
  DATA_DECIMAL_UNITS,
  findByKey,
  pickerOptions,
  DATA_ALL_UNITS,
} from '../../../../lib/units.js';

// Per-unit slider bounds so the range stays pedagogical at every scale:
// 1-1e6 bytes is interesting; 1-2000 GB is the canonical drive-size range.
const SLIDER_RANGE: Record<string, { min: number; max: number; step: number; init: number }> = {
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

function rangeFor(key: string) {
  return SLIDER_RANGE[key] ?? { min: 1, max: 2000, step: 1, init: 500 };
}

const CODE = `import { forge } from 'unitforge';
import {
  byte, gigabyte, gibibyte, megabit,
} from 'unitforge/kits/data-storage';

const bytes = forge(gigabyte, byte)(500); // 5e11
const inGiB = forge(byte, gibibyte)(bytes); // 465.66
const inMbit = forge(byte, megabit)(bytes); // 4e6
`;

export function HelloBytes() {
  const [value, setValue] = useState(500);
  const [unitKey, setUnitKeyRaw] = useState('GB');

  const range = rangeFor(unitKey);
  const clamped = Math.min(Math.max(value, range.min), range.max);

  const setUnitKey = (next: string) => {
    setUnitKeyRaw(next);
    setValue(rangeFor(next).init);
  };

  const fromUnit = findByKey(DATA_ALL_UNITS, unitKey);
  const inBytes = forge(fromUnit.unit, byte)(clamped);

  const renderRows = (
    list: ReadonlyArray<{ key: string; label: string; unit: typeof byte }>,
    family: string,
  ): React.ReactNode => (
    <div className="flex flex-col gap-1">
      <span className="uf-eyebrow">{family}</span>
      {list.map((opt) => {
        const v = forge(byte, opt.unit)(inBytes);
        return (
          <Result
            key={opt.key}
            label={opt.label}
            value={`${formatNum(v)} ${opt.key}`}
          />
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
          icon={<Cpu size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
        />
      }
      introZone={
        <>
          Pick a number and a unit; every other byte and bit unit renders
          side by side. Decimal and binary columns sit next to each other
          so the gap between (say) GB and GiB is visible at a glance.
        </>
      }
      widgetZone={
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <UnitPicker
              label="input unit"
              value={unitKey}
              options={pickerOptions(DATA_ALL_UNITS)}
              onChange={setUnitKey}
            />
            <Slider
              label={`value (${fromUnit.key})`}
              value={clamped}
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

function formatNum(n: number): string {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e15) return n.toExponential(3);
  if (abs >= 1000) return n.toFixed(2);
  if (abs >= 1) return n.toFixed(3);
  if (abs >= 1e-3) return n.toFixed(5);
  return n.toExponential(3);
}
