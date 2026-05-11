// "Hello bytes" — pick a value in any byte/bit unit; render the same value
// across every other data-storage unit at once. The point: every row in the
// readout is the SAME quantity expressed in a different unit. Decimal and
// binary are clearly different; the user sees the gap.

import { useState } from 'react';
import { forge } from 'unitforge';
import { byte } from 'unitforge/kits/data-storage';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';
import { UnitPicker } from '../components/UnitPicker.js';
import {
  DATA_BINARY_UNITS,
  DATA_BIT_UNITS,
  DATA_DECIMAL_UNITS,
  findByKey,
  pickerOptions,
  DATA_ALL_UNITS,
} from '../lib/units.js';

export function HelloBytes() {
  const [value, setValue] = useState(500);
  const [unitKey, setUnitKey] = useState('GB');

  const fromUnit = findByKey(DATA_ALL_UNITS, unitKey);
  const inBytes = forge(fromUnit.unit, byte)(value);

  const renderRows = (
    list: typeof DATA_DECIMAL_UNITS,
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
          value={value}
          min={1}
          max={unitKey === 'B' ? 1_000_000 : 2000}
          step={unitKey === 'B' ? 1000 : 1}
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
