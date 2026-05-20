// "The distance ladder" (hello). Pick any astronomical distance; read
// it across every scale band at once. The point is the ratios: 1 pc is
// 3.26 ly is 206,265 au, and the same distance reads as a tidy number
// on one rung and an unwieldy one on the next. The active rung (the
// unit you picked) reads in the accent color.

import { Orbit } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { parsec } from 'unitforge/kits/astronomy';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import {
  ASTRONOMY_ALL_UNITS,
  type AstronomyUnit,
  astronomyBoundsFor,
  LADDER_RUNGS,
  type SliderBounds,
} from '../units.js';

interface LadderState {
  unitId: string;
  value: number;
}

export function DistanceLadder() {
  const [state, setState] = useState<LadderState>({ unitId: 'light-year', value: 4.2 });
  const range = astronomyBoundsFor(state.unitId);
  const unit = findById(ASTRONOMY_ALL_UNITS, state.unitId);
  // Everything converts through parsec under the hood; one real forge
  // gives the canonical base the rungs all read from.
  const inParsec = forge(unit, parsec)(state.value);

  const handleUnitIdChange = (next: string) => {
    setState({ unitId: next, value: astronomyBoundsFor(next).init });
  };
  const handleValueChange = (next: number) => setState((s) => ({ ...s, value: next }));

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 01"
          title="the distance ladder"
          kicker="one distance, every scale"
          iconZone={<Orbit size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Pick any distance; read it on every rung of the ladder. Proxima Centauri at 4.2 light-years
          is 1.3 parsecs is 268,000 au; the same distance is a tidy number on one rung and an
          unwieldy one on the next. That is the whole reason the ladder exists, and every rung below
          is a real forge call.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <LadderWidget
              unitId={state.unitId}
              value={state.value}
              range={range}
              inParsec={inParsec}
              onUnitIdChange={handleUnitIdChange}
              onValueChange={handleValueChange}
            />
          }
          codeZone={<CodeBlock code={buildCode(unit, state.value, inParsec)} />}
        />
      }
    />
  );
}

interface LadderWidgetProps {
  unitId: string;
  value: number;
  range: SliderBounds;
  inParsec: number;
  onUnitIdChange: (next: string) => void;
  onValueChange: (next: number) => void;
}

function LadderWidget({
  unitId,
  value,
  range,
  inParsec,
  onUnitIdChange,
  onValueChange,
}: LadderWidgetProps) {
  const unit = findById(ASTRONOMY_ALL_UNITS, unitId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <UnitPicker
          label="distance unit"
          value={unitId}
          units={ASTRONOMY_ALL_UNITS}
          onChange={onUnitIdChange}
        />
        <Slider
          label={`value (${unit.symbol})`}
          value={value}
          min={range.min}
          max={range.max}
          step={range.step}
          onChange={onValueChange}
          suffix={unit.symbol}
        />
      </div>

      <LadderMatrix inParsec={inParsec} activeId={unitId} />
    </div>
  );
}

// Every ladder rung rendered for the current distance. The active rung
// (the unit being entered) reads in accent. Sink component; bounded
// prop surface (inParsec + activeId).
function LadderMatrix({ inParsec, activeId }: { inParsec: number; activeId: string }) {
  return (
    <ul className="flex list-none flex-col gap-2 rounded-md border border-uf-border bg-uf-card p-4">
      <span className="uf-eyebrow">this distance, on every rung</span>
      {LADDER_RUNGS.map((rung) =>
        rung.id === activeId ? (
          <LadderRowActive key={rung.id} unit={rung} value={forge(parsec, rung)(inParsec)} />
        ) : (
          <LadderRowIdle key={rung.id} unit={rung} value={forge(parsec, rung)(inParsec)} />
        ),
      )}
    </ul>
  );
}

interface LadderRowProps {
  unit: AstronomyUnit;
  value: number;
}

function LadderRowActive({ unit, value }: LadderRowProps) {
  return (
    <li
      className="flex items-baseline justify-between border-b border-uf-border pb-1.5 last:border-b-0 last:pb-0"
      aria-label={`${unit.label}: ${formatMagnitude(value)} ${unit.symbol}`}
    >
      <span className="mono text-xs uppercase tracking-wider text-uf-accent" aria-hidden>
        {unit.label}
      </span>
      <span className="mono leading-tight" aria-hidden>
        <span className="text-lg text-uf-accent tabular-nums">{formatMagnitude(value)}</span>
        <span className="ml-1 text-xs text-uf-muted">{unit.symbol}</span>
      </span>
    </li>
  );
}

function LadderRowIdle({ unit, value }: LadderRowProps) {
  return (
    <li
      className="flex items-baseline justify-between border-b border-uf-border pb-1.5 last:border-b-0 last:pb-0"
      aria-label={`${unit.label}: ${formatMagnitude(value)} ${unit.symbol}`}
    >
      <span className="mono text-xs uppercase tracking-wider text-uf-muted" aria-hidden>
        {unit.label}
      </span>
      <span className="mono leading-tight" aria-hidden>
        <span className="text-lg text-uf-fg tabular-nums">{formatMagnitude(value)}</span>
        <span className="ml-1 text-xs text-uf-muted">{unit.symbol}</span>
      </span>
    </li>
  );
}

function buildCode(unit: AstronomyUnit, value: number, pc: number): string {
  const name = toJsName(unit.id);
  return `import { forge } from 'unitforge';
import { ${name === 'parsec' ? 'parsec' : `parsec, ${name}`} } from 'unitforge/kits/astronomy';

const inParsec = forge(${name}, parsec)(${formatMagnitude(value)});
// → ${formatMagnitude(pc)} pc
`;
}
