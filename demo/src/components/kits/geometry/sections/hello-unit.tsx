// Hello unit; the simplest possible forge demo. One slider, one input
// unit picker, one output unit picker. Walks the user from "I have a number"
// to "I have that number expressed in any other length unit" in one motion.

import { Ruler } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import { LENGTH_UNITS } from '../units.js';

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
          Pick a value, pick its unit, pick a target unit, read the conversion. Within-dimension
          overload: scalar in, scalar out, no <code className="mono">via</code>, no glue code, no
          unit-system branching at the call site.
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
          <code className="mono">forge(meter, foot)</code> returns a cached converter; the same call
          shape works for <code className="mono">forge(parsec, fathom)</code> or any other length
          pairing the kit ships.
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
        <UnitPicker label="from" value={fromId} units={LENGTH_UNITS} onChange={onFromIdChange} />
        <UnitPicker label="to" value={toId} units={LENGTH_UNITS} onChange={onToIdChange} />
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
