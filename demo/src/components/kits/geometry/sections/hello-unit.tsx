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
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById, LENGTH_UNITS, pickerOptions } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';

export function HelloUnit() {
  // The chassis owns the forge call so buildCode can pick up `result`
  // and the slider readout can show it without re-forging. The Widget
  // re-derives `from`/`to` from the ids via findById; that lookup is
  // cheap and avoids relaying the resolved units through props.
  const [value, setValue] = useState(5);
  const [fromId, setFromId] = useState('meter');
  const [toId, setToId] = useState('foot');

  const from = findById(LENGTH_UNITS, fromId);
  const to = findById(LENGTH_UNITS, toId);
  const result = forge(from, to)(value);

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
            <HelloUnitWidget
              value={value}
              fromId={fromId}
              toId={toId}
              result={result}
              onValueChange={setValue}
              onFromIdChange={setFromId}
              onToIdChange={setToId}
            />
          }
          codeZone={<CodeBlock code={buildCode(from.id, to.id, value, result)} />}
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

interface HelloUnitWidgetProps {
  value: number;
  fromId: string;
  toId: string;
  result: number;
  onValueChange: (next: number) => void;
  onFromIdChange: (next: string) => void;
  onToIdChange: (next: string) => void;
}

function HelloUnitWidget({
  value,
  fromId,
  toId,
  result,
  onValueChange,
  onFromIdChange,
  onToIdChange,
}: HelloUnitWidgetProps) {
  const from = findById(LENGTH_UNITS, fromId);
  const to = findById(LENGTH_UNITS, toId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <UnitPicker
          label="from"
          value={fromId}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={onFromIdChange}
        />
        <UnitPicker
          label="to"
          value={toId}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={onToIdChange}
        />
      </div>
      <Slider
        label={`value (${from.symbol})`}
        value={value}
        min={0.1}
        max={10}
        step={0.1}
        onChange={onValueChange}
        suffix={from.symbol}
      />
      <Result
        label={`${value.toFixed(2)} ${from.symbol} =`}
        value={`${result.toFixed(4)} ${to.symbol}`}
        variant="hero"
      />
    </div>
  );
}

function buildCode(fromId: string, toId: string, value: number, result: number): string {
  const fromName = toJsName(fromId);
  const toName = toJsName(toId);
  return `import { forge } from 'unitforge';
import { ${fromName}, ${toName} } from 'unitforge/kits/geometry';

const convert = forge(${fromName}, ${toName});

convert(${formatMagnitude(value)}); // ${formatMagnitude(result)}
`;
}
