// Hello unit; the simplest possible forge demo. One slider, one input
// unit picker, one output unit picker. Walks the user from "I have a number"
// to "I have that number expressed in any other length unit" in one motion.

import { Ruler } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { CodeBlock } from '~/components/CodeBlock.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { UnitPicker } from '~/components/UnitPicker.js';
import { formatMagnitude } from '~/lib/format.js';
import { findByKey, LENGTH_UNITS, type LengthKey, pickerOptions } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';

function buildCode(fromName: string, toName: string, value: number, result: number): string {
  return `import { forge } from 'unitforge';
import { ${fromName}, ${toName} } from 'unitforge/kits/geometry';

const convert = forge(${fromName}, ${toName});

convert(${formatMagnitude(value)}); // ${formatMagnitude(result)}
`;
}

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
          iconZone={<Ruler size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          The smallest forge call: pick a value, pick its unit, pick a target unit, and read out the
          conversion. Within-dimension overload: scalar in, scalar out, no{' '}
          <code className="mono">via</code>.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
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
          codeZone={<CodeBlock code={buildCode(from.label, to.label, value, result)} />}
        />
      }
      notesZone={
        <>
          <code className="mono">forge(meter, foot)</code> returns a cached converter; the call
          signature is the same for any pair of LENGTH units shipped by the kit.
        </>
      }
    />
  );
}
