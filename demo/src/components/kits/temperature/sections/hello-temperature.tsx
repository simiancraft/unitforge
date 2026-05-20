// "Hello temperature"; pick a value in any scale; render the same
// temperature across every other scale at once. The four-row matrix
// makes the -40 cross-point (-40 °F ≡ -40 °C) and the freezing /
// boiling cross-references visible at a glance. The current scale's
// row reads in the accent color so the eye finds it without
// scanning.

import { Thermometer } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { kelvin } from 'unitforge/kits/temperature';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import { type SliderBounds, TEMPERATURE_ALL_UNITS, temperatureBoundsFor } from '../units.js';

interface TempState {
  unitId: string;
  value: number;
}

export function HelloTemperature() {
  const [state, setState] = useState<TempState>({ unitId: 'celsius', value: 20 });
  const range = temperatureBoundsFor(state.unitId);

  const handleUnitIdChange = (next: string) => {
    setState({ unitId: next, value: temperatureBoundsFor(next).init });
  };
  const handleValueChange = (next: number) => {
    setState((s) => ({ ...s, value: next }));
  };

  const fromUnit = findById(TEMPERATURE_ALL_UNITS, state.unitId);
  const inK = forge(fromUnit, kelvin)(state.value);

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 01"
          title="hello, temperature"
          kicker="one value, every scale"
          iconZone={<Thermometer size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Pick any scale; see the same temperature in all four. The -40 cross-point (-40 °F ≡ -40
          °C) shows up as soon as you slide there. Kelvin and Rankine share an origin at absolute
          zero; Celsius and Fahrenheit don't. The kit converts through Kelvin under the hood, so
          every readout below is a real forge call.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <HelloTempWidget
              unitId={state.unitId}
              value={state.value}
              range={range}
              inK={inK}
              activeId={state.unitId}
              onUnitIdChange={handleUnitIdChange}
              onValueChange={handleValueChange}
            />
          }
          codeZone={<CodeBlock code={buildCode(fromUnit.id, state.value, inK)} />}
        />
      }
    />
  );
}

interface HelloTempWidgetProps {
  unitId: string;
  value: number;
  range: SliderBounds;
  inK: number;
  activeId: string;
  onUnitIdChange: (next: string) => void;
  onValueChange: (next: number) => void;
}

function HelloTempWidget({
  unitId,
  value,
  range,
  inK,
  activeId,
  onUnitIdChange,
  onValueChange,
}: HelloTempWidgetProps) {
  const fromUnit = findById(TEMPERATURE_ALL_UNITS, unitId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <UnitPicker
          label="input scale"
          value={unitId}
          units={TEMPERATURE_ALL_UNITS}
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

      <ScaleMatrix inK={inK} activeId={activeId} />
    </div>
  );
}

// All four scales rendered as a vertical column. The active scale
// (the one the user is currently entering) reads in the accent
// color so the input-vs-output relationship is visible. Sink
// component; bounded prop surface (inK + activeId).
function ScaleMatrix({ inK, activeId }: { inK: number; activeId: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-uf-border bg-uf-card p-4">
      <span className="uf-eyebrow">every scale at this temperature</span>
      {TEMPERATURE_ALL_UNITS.map((unit) =>
        unit.id === activeId ? (
          <ScaleRowActive key={unit.id} unit={unit} value={forge(kelvin, unit)(inK)} />
        ) : (
          <ScaleRowIdle key={unit.id} unit={unit} value={forge(kelvin, unit)(inK)} />
        ),
      )}
    </div>
  );
}

interface ScaleRowProps {
  unit: { label: string; symbol: string };
  value: number;
}

function ScaleRowActive({ unit, value }: ScaleRowProps) {
  return (
    <div className="flex items-baseline justify-between border-b border-uf-border pb-1.5 last:border-b-0 last:pb-0">
      <span className="mono text-xs uppercase tracking-wider text-uf-accent">{unit.label}</span>
      <span className="mono leading-tight">
        <span className="text-lg text-uf-accent tabular-nums">{formatMagnitude(value)}</span>
        <span className="ml-1 text-xs text-uf-muted">{unit.symbol}</span>
      </span>
    </div>
  );
}

function ScaleRowIdle({ unit, value }: ScaleRowProps) {
  return (
    <div className="flex items-baseline justify-between border-b border-uf-border pb-1.5 last:border-b-0 last:pb-0">
      <span className="mono text-xs uppercase tracking-wider text-uf-muted">{unit.label}</span>
      <span className="mono leading-tight">
        <span className="text-lg text-uf-fg tabular-nums">{formatMagnitude(value)}</span>
        <span className="ml-1 text-xs text-uf-muted">{unit.symbol}</span>
      </span>
    </div>
  );
}

function buildCode(fromId: string, value: number, k: number): string {
  const fromName = toJsName(fromId);
  return `import { forge } from 'unitforge';
import { kelvin, ${fromName} } from 'unitforge/kits/temperature';

const inK = forge(${fromName}, kelvin)(${formatMagnitude(value)});
// → ${formatMagnitude(k)} K
`;
}
