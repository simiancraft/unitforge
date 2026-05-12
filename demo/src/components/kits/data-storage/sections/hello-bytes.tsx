// "Hello bytes"; pick a value in any byte/bit unit; render the same value
// across every other data-storage unit at once. The point: every row in the
// readout is the SAME quantity expressed in a different unit. Decimal and
// binary are clearly different; the user sees the gap.

import { Cpu } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { byte, gibibyte, megabit } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/CodeBlock.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { UnitPicker } from '~/components/UnitPicker.js';
import { cn } from '~/lib/cn.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById, pickerOptions } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import {
  DATA_ALL_UNITS,
  DATA_BINARY_UNITS,
  DATA_BIT_UNITS,
  DATA_DECIMAL_UNITS,
  type DataUnit,
} from '../units.js';

interface SliderBounds {
  min: number;
  max: number;
  step: number;
  init: number;
}

// Per-unit slider bounds, keyed by the unit's stable id. 1-1e6 bytes is
// interesting; 1-2000 GB is the canonical drive-size range. Missing ids
// fall back to DEFAULT_BOUNDS at lookup time.
const SLIDER_RANGE: Record<string, SliderBounds> = {
  byte: { min: 1, max: 1_000_000, step: 1000, init: 500_000 },
  kilobyte: { min: 1, max: 10_000, step: 1, init: 500 },
  megabyte: { min: 1, max: 10_000, step: 1, init: 500 },
  gigabyte: { min: 1, max: 2000, step: 1, init: 500 },
  terabyte: { min: 0.1, max: 100, step: 0.1, init: 1 },
  petabyte: { min: 0.01, max: 10, step: 0.01, init: 1 },
  kibibyte: { min: 1, max: 10_000, step: 1, init: 500 },
  mebibyte: { min: 1, max: 10_000, step: 1, init: 500 },
  gibibyte: { min: 1, max: 2000, step: 1, init: 500 },
  tebibyte: { min: 0.1, max: 100, step: 0.1, init: 1 },
  pebibyte: { min: 0.01, max: 10, step: 0.01, init: 1 },
  bit: { min: 1, max: 1_000_000, step: 1000, init: 1000 },
  kilobit: { min: 1, max: 10_000, step: 1, init: 1000 },
  megabit: { min: 1, max: 10_000, step: 1, init: 100 },
  gigabit: { min: 0.1, max: 100, step: 0.1, init: 1 },
};

const DEFAULT_BOUNDS: SliderBounds = { min: 1, max: 1000, step: 1, init: 100 };

interface BytesState {
  unitId: string;
  value: number;
}

export function HelloBytes() {
  // value + unitId held atomically: switching units resets value to that
  // unit's pedagogical default in the same render, so the slider never
  // briefly shows a clamped position that disagrees with the underlying
  // state.
  const [state, setState] = useState<BytesState>({ unitId: 'gigabyte', value: 500 });
  const range = SLIDER_RANGE[state.unitId] ?? DEFAULT_BOUNDS;

  const handleUnitIdChange = (next: string) => {
    setState({ unitId: next, value: (SLIDER_RANGE[next] ?? DEFAULT_BOUNDS).init });
  };
  const handleValueChange = (next: number) => {
    setState((s) => ({ ...s, value: next }));
  };

  const fromUnit = findById(DATA_ALL_UNITS, state.unitId);
  const inBytes = forge(fromUnit, byte)(state.value);
  const inGiB = forge(byte, gibibyte)(inBytes);
  const inMbit = forge(byte, megabit)(inBytes);

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
        <WidgetLayout
          interactionZone={
            <HelloBytesWidget
              unitId={state.unitId}
              value={state.value}
              range={range}
              inBytes={inBytes}
              onUnitIdChange={handleUnitIdChange}
              onValueChange={handleValueChange}
            />
          }
          codeZone={
            <CodeBlock code={buildCode(fromUnit.id, state.value, inBytes, inGiB, inMbit)} />
          }
        />
      }
    />
  );
}

interface HelloBytesWidgetProps {
  unitId: string;
  value: number;
  range: SliderBounds;
  inBytes: number;
  onUnitIdChange: (next: string) => void;
  onValueChange: (next: number) => void;
}

function HelloBytesWidget({
  unitId,
  value,
  range,
  inBytes,
  onUnitIdChange,
  onValueChange,
}: HelloBytesWidgetProps) {
  const fromUnit = findById(DATA_ALL_UNITS, unitId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <UnitPicker
          label="input unit"
          value={unitId}
          options={pickerOptions(DATA_ALL_UNITS)}
          onChange={onUnitIdChange}
        />
        <Slider
          label={`value (${fromUnit.symbol})`}
          value={value}
          min={range.min}
          max={range.max}
          step={range.step}
          onChange={onValueChange}
          suffix={fromUnit.symbol}
        />
      </div>

      <ReadoutMatrix inBytes={inBytes} />
    </div>
  );
}

// Three-column readout matrix; a "billboard" that maps one canonical
// byte count to every unit-family at once. Named Organ extraction: sink
// (no state of its own), bounded prop surface (just inBytes), runs on
// the slider-driven cadence while pickers above it tick on rare unit
// changes. Pulling it out lets the compiler memoize each Result row
// inside without re-walking the SectionLayout chrome.
interface ReadoutColumn {
  family: string;
  units: ReadonlyArray<DataUnit>;
}

const READOUT_COLUMNS: readonly ReadoutColumn[] = [
  { family: 'decimal (SI)', units: DATA_DECIMAL_UNITS },
  { family: 'binary (IEC)', units: DATA_BINARY_UNITS },
  { family: 'bits', units: DATA_BIT_UNITS },
];

// Digit-count threshold above which a value gets shrunk one font step.
// bit/byte rows in PiB-scale inputs reach 16+ digits; at the default
// text-sm those overflow the column and crowd the label above. Counted
// in digit chars (no commas, no decimal point, no unit suffix) so the
// threshold is about the value itself, not the formatter's separators.
const LONG_DIGIT_THRESHOLD = 11;

function ReadoutMatrix({ inBytes }: { inBytes: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {READOUT_COLUMNS.map((col) => (
        <div key={col.family} className="flex flex-col gap-1">
          <span className="uf-eyebrow">{col.family}</span>
          {col.units.map((unit) => {
            const v = forge(byte, unit)(inBytes);
            const formatted = formatMagnitude(v);
            const digitCount = formatted.match(/\d/g)?.length ?? 0;
            return (
              <Result
                key={unit.id}
                layout="stack"
                label={unit.label}
                value={`${formatted} ${unit.symbol}`}
                valueClassName={cn(digitCount > LONG_DIGIT_THRESHOLD && 'text-xs')}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function buildCode(
  fromId: string,
  value: number,
  bytes: number,
  inGiB: number,
  inMbit: number,
): string {
  const fromName = toJsName(fromId);
  const imports = Array.from(new Set(['byte', 'gibibyte', 'megabit', fromName]));
  return `import { forge } from 'unitforge';
import {
  ${imports.join(', ')},
} from 'unitforge/kits/data-storage';

const bytes = forge(${fromName}, byte)(${formatMagnitude(value)}); // ${formatMagnitude(bytes)}
const inGiB = forge(byte, gibibyte)(bytes); // ${formatMagnitude(inGiB)}
const inMbit = forge(byte, megabit)(bytes); // ${formatMagnitude(inMbit)}
`;
}
