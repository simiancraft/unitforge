// "Hello unit" — the simplest possible forge demo. One slider, one input
// unit picker, one output unit picker. Walks the user from "I have a number"
// to "I have that number expressed in any other length unit" in one motion.

import { useState } from 'react';
import { forge } from 'unitforge';
import { Result } from '../../../components/Result.js';
import { Slider } from '../../../components/Slider.js';
import { UnitPicker } from '../../../components/UnitPicker.js';
import { findByKey, LENGTH_UNITS, pickerOptions } from '../../../lib/units.js';

export function HelloUnit() {
  const [value, setValue] = useState(5);
  const [fromKey, setFromKey] = useState('m');
  const [toKey, setToKey] = useState('ft');

  const from = findByKey(LENGTH_UNITS, fromKey);
  const to = findByKey(LENGTH_UNITS, toKey);
  const result = forge(from.unit, to.unit)(value);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <UnitPicker
          label="from"
          value={fromKey}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={setFromKey}
        />
        <UnitPicker
          label="to"
          value={toKey}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={setToKey}
        />
      </div>
      <Slider
        label={`value (${from.key})`}
        value={value}
        min={0.1}
        max={10}
        step={0.1}
        onChange={setValue}
        suffix={from.key}
      />
      <Result
        label={`${value.toFixed(2)} ${from.key} =`}
        value={`${result.toFixed(4)} ${to.key}`}
        emphasis
      />
    </div>
  );
}
