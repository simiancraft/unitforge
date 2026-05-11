// Hello unit — the simplest possible forge demo. One slider, one input
// unit picker, one output unit picker. Walks the user from "I have a number"
// to "I have that number expressed in any other length unit" in one motion.

import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { forge } from 'unitforge';
import { CodeBlock } from '~/components/CodeBlock.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { UnitPicker } from '~/components/UnitPicker.js';
import { SectionHeader, SectionLayout } from '../../section-layout.js';
import {
  findByKey,
  LENGTH_UNITS,
  pickerOptions,
  type LengthKey,
} from '~/lib/units.js';

const CODE = `import { forge } from 'unitforge';
import { meter, foot } from 'unitforge/kits/geometry';

const metersToFeet = forge(meter, foot);

metersToFeet(5);   // 16.4042
metersToFeet(100); // 328.084
`;

export function HelloUnit() {
  const [value, setValue] = useState(5);
  const [fromKey, setFromKey] = useState<LengthKey>('m');
  const [toKey, setToKey] = useState<LengthKey>('ft');

  const from = findByKey(LENGTH_UNITS, fromKey);
  const to = findByKey(LENGTH_UNITS, toKey);
  const result = forge(from.unit, to.unit)(value);

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 01"
          title="hello, unit"
          kicker="within-dimension"
          iconZone={<Ruler size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
        />
      }
      introZone={
        <>
          The smallest forge call: pick a value, pick its unit, pick a
          target unit, and read out the conversion. Within-dimension
          overload: scalar in, scalar out, no <code className="mono">via</code>.
        </>
      }
      widgetZone={
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
            variant="hero"
          />
        </div>
      }
      codeZone={<CodeBlock code={CODE} />}
      notesZone={
        <>
          <code className="mono">forge(meter, foot)</code> returns a cached
          converter; the call signature is the same for any pair of LENGTH
          units shipped by the kit.
        </>
      }
    />
  );
}
