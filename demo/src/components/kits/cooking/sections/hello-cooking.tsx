// "Hello cooking"; pick a value in any culinary volume unit; render the
// same value across every other unit at once. The point: every row in
// the readout is the SAME quantity expressed in a different unit. The
// US column drifts away from the UK column as you climb the ladder; the
// gap is right there in the readout, with the metric ground-truth
// alongside.

import { CookingPot } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { cupUs, milliliter } from 'unitforge/kits/cooking';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import {
  COOKING_ALL_UNITS,
  COOKING_METRIC_UNITS,
  COOKING_TRADITION_UNITS,
  COOKING_US_UK_PAIRS,
  cookingBoundsFor,
  type SliderBounds,
} from '../units.js';

interface CookingState {
  unitId: string;
  value: number;
}

export function HelloCooking() {
  // value + unitId held atomically: switching units resets value to that
  // unit's pedagogical default in the same render, so the slider never
  // briefly shows a clamped position that disagrees with the underlying
  // state.
  const [state, setState] = useState<CookingState>({ unitId: 'cup-us', value: 1 });
  const range = cookingBoundsFor(state.unitId);

  const handleUnitIdChange = (next: string) => {
    setState({ unitId: next, value: cookingBoundsFor(next).init });
  };
  const handleValueChange = (next: number) => {
    setState((s) => ({ ...s, value: next }));
  };

  const fromUnit = findById(COOKING_ALL_UNITS, state.unitId);
  const inMl = forge(fromUnit, milliliter)(state.value);
  const inUsCup = forge(milliliter, cupUs)(inMl);

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 01"
          title="hello, cooking"
          kicker="one value, every unit"
          iconZone={<CookingPot size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          One quantity, expressed in every culinary volume unit at once. The US column drifts away
          from the UK column as you climb the ladder: a US cup is ~20% smaller than a UK cup, but a
          US fluid ounce is LARGER than a UK fluid ounce. The metric column is the ground truth
          underneath both; the tradition column carries stick of butter, dash, and pinch.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <HelloCookingWidget
              unitId={state.unitId}
              value={state.value}
              range={range}
              inMl={inMl}
              onUnitIdChange={handleUnitIdChange}
              onValueChange={handleValueChange}
            />
          }
          codeZone={<CodeBlock code={buildCode(fromUnit.id, state.value, inMl, inUsCup)} />}
        />
      }
    />
  );
}

interface HelloCookingWidgetProps {
  unitId: string;
  value: number;
  range: SliderBounds;
  inMl: number;
  onUnitIdChange: (next: string) => void;
  onValueChange: (next: number) => void;
}

function HelloCookingWidget({
  unitId,
  value,
  range,
  inMl,
  onUnitIdChange,
  onValueChange,
}: HelloCookingWidgetProps) {
  const fromUnit = findById(COOKING_ALL_UNITS, unitId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <UnitPicker
          label="input unit"
          value={unitId}
          units={COOKING_ALL_UNITS}
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

      <ReadoutMatrix inMl={inMl} />
    </div>
  );
}

// Three-column readout matrix; one canonical milliliter quantity mapped
// to every unit-family at once. Customary collapses US + UK into a
// single column with the UK value stacked above the US value per family
// (cup / tablespoon / teaspoon / fluid ounce), so the eye reads the
// Atlantic gap inside one cell instead of comparing across columns.
// Named Organ extraction: sink (no state of its own), bounded prop
// surface (just inMl).

function ReadoutMatrix({ inMl }: { inMl: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricColumn inMl={inMl} />
      <CustomaryColumn inMl={inMl} />
      <TraditionColumn inMl={inMl} />
    </div>
  );
}

function MetricColumn({ inMl }: { inMl: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uf-eyebrow">metric (SI)</span>
      {COOKING_METRIC_UNITS.map((unit) => (
        <ValueRow
          key={unit.id}
          label={unit.label}
          value={forge(milliliter, unit)(inMl)}
          symbol={unit.symbol}
        />
      ))}
    </div>
  );
}

function CustomaryColumn({ inMl }: { inMl: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uf-eyebrow">customary · UK above US</span>
      {COOKING_US_UK_PAIRS.map((pair) => (
        <div key={pair.family} className="flex flex-col">
          <span className="mono text-[10px] uppercase tracking-wider text-uf-muted">
            {pair.family}
          </span>
          <PairedValue
            ukValue={forge(milliliter, pair.uk)(inMl)}
            ukSymbol={pair.uk.symbol}
            usValue={forge(milliliter, pair.us)(inMl)}
            usSymbol={pair.us.symbol}
          />
        </div>
      ))}
    </div>
  );
}

function TraditionColumn({ inMl }: { inMl: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uf-eyebrow">tradition</span>
      {COOKING_TRADITION_UNITS.map((unit) => (
        <ValueRow
          key={unit.id}
          label={unit.label}
          value={forge(milliliter, unit)(inMl)}
          symbol={unit.symbol}
        />
      ))}
    </div>
  );
}

function ValueRow({ label, value, symbol }: { label: string; value: number; symbol: string }) {
  return (
    <div className="flex flex-col">
      <span className="mono text-[10px] uppercase tracking-wider text-uf-muted">{label}</span>
      <span className="mono leading-tight">
        <span className="text-base text-uf-fg tabular-nums">{formatMagnitude(value)}</span>
        <span className="ml-1 text-xs text-uf-muted">{symbol}</span>
      </span>
    </div>
  );
}

interface PairedValueProps {
  ukValue: number;
  ukSymbol: string;
  usValue: number;
  usSymbol: string;
}

function PairedValue({ ukValue, ukSymbol, usValue, usSymbol }: PairedValueProps) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="mono">
        <span className="text-base text-uf-accent-2 tabular-nums">{formatMagnitude(ukValue)}</span>
        <span className="ml-1 text-xs text-uf-muted">{ukSymbol}</span>
      </span>
      <span className="mono">
        <span className="text-base text-uf-accent tabular-nums">{formatMagnitude(usValue)}</span>
        <span className="ml-1 text-xs text-uf-muted">{usSymbol}</span>
      </span>
    </div>
  );
}

function buildCode(fromId: string, value: number, ml: number, usCup: number): string {
  const fromName = toJsName(fromId);
  const imports = Array.from(new Set(['milliliter', 'cupUs', fromName]));
  return `import { forge } from 'unitforge';
import {
  ${imports.join(', ')},
} from 'unitforge/kits/cooking';

const ml = forge(${fromName}, milliliter)(${formatMagnitude(value)}); // ${formatMagnitude(ml)}
const inUsCup = forge(milliliter, cupUs)(ml); // ${formatMagnitude(usCup)}
`;
}
