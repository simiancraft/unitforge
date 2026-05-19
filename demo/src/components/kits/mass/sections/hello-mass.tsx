// "Hello mass"; pick a value in any mass unit; render the same quantity
// across every other unit at once. Three columns by family (SI metric,
// US/UK customary, Asian regional). The Asian column is the visual
// payload: PRC jin (500 g) vs HK jin (600 g) vs Singapore catty (604.79
// g), three closely-spaced rows that share a character but diverge by
// up to 20%. The killer regional-disambiguation story lands as a column
// glance.

import { Weight } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { kilogram } from 'unitforge/kits/mass';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import {
  MASS_ALL_UNITS,
  MASS_ASIAN_UNITS,
  MASS_CUSTOMARY_UNITS,
  MASS_SI_UNITS,
  massBoundsFor,
  type SliderBounds,
} from '../units.js';

interface MassState {
  unitId: string;
  value: number;
}

export function HelloMass() {
  // unitId + value held atomically; switching units resets value to that
  // unit's pedagogical default in the same render so the slider never
  // briefly shows a clamped position that disagrees with the underlying
  // state.
  const [state, setState] = useState<MassState>({ unitId: 'kilogram', value: 1 });
  const range = massBoundsFor(state.unitId);

  const handleUnitIdChange = (next: string) => {
    setState({ unitId: next, value: massBoundsFor(next).init });
  };
  const handleValueChange = (next: number) => {
    setState((s) => ({ ...s, value: next }));
  };

  const fromUnit = findById(MASS_ALL_UNITS, state.unitId);
  const inKg = forge(fromUnit, kilogram)(state.value);

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 01"
          title="hello, mass"
          kicker="one quantity, every unit"
          iconZone={<Weight size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          One quantity, expressed in every mass unit at once. SI is the ground truth on the left;
          customary (avoirdupois ounce through long ton) in the middle; the Asian regional column on
          the right is where the kit earns its keep. PRC jin, HK jin, and Singapore catty all share
          the character 斤 but differ by up to 20%. Stare at the three rows; that gap is the
          headline.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <HelloMassWidget
              unitId={state.unitId}
              value={state.value}
              range={range}
              inKg={inKg}
              onUnitIdChange={handleUnitIdChange}
              onValueChange={handleValueChange}
            />
          }
          codeZone={<CodeBlock code={buildCode(fromUnit.id, state.value, inKg)} />}
        />
      }
    />
  );
}

interface HelloMassWidgetProps {
  unitId: string;
  value: number;
  range: SliderBounds;
  inKg: number;
  onUnitIdChange: (next: string) => void;
  onValueChange: (next: number) => void;
}

function HelloMassWidget({
  unitId,
  value,
  range,
  inKg,
  onUnitIdChange,
  onValueChange,
}: HelloMassWidgetProps) {
  const fromUnit = findById(MASS_ALL_UNITS, unitId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <UnitPicker
          label="input unit"
          value={unitId}
          units={MASS_ALL_UNITS}
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

      <ReadoutMatrix inKg={inKg} />
    </div>
  );
}

// Three-column readout. SI on the left, customary in the middle, Asian
// regional on the right. The Asian column is the visual payload: three
// rows that look almost the same but encode the kit's headline gap.
// Named Organ extraction: sink (no state of its own), bounded prop
// surface (just inKg).
function ReadoutMatrix({ inKg }: { inKg: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SiColumn inKg={inKg} />
      <CustomaryColumn inKg={inKg} />
      <AsianColumn inKg={inKg} />
    </div>
  );
}

function SiColumn({ inKg }: { inKg: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uf-eyebrow">SI metric</span>
      {MASS_SI_UNITS.map((unit) => (
        <ValueRow
          key={unit.id}
          label={unit.label}
          value={forge(kilogram, unit)(inKg)}
          symbol={unit.symbol}
        />
      ))}
    </div>
  );
}

function CustomaryColumn({ inKg }: { inKg: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uf-eyebrow">customary (avoirdupois)</span>
      {MASS_CUSTOMARY_UNITS.map((unit) => (
        <ValueRow
          key={unit.id}
          label={unit.label}
          value={forge(kilogram, unit)(inKg)}
          symbol={unit.symbol}
        />
      ))}
    </div>
  );
}

function AsianColumn({ inKg }: { inKg: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uf-eyebrow">Asian regional (斤 / catty)</span>
      {MASS_ASIAN_UNITS.map((unit) => (
        <ValueRow
          key={unit.id}
          label={unit.label}
          value={forge(kilogram, unit)(inKg)}
          symbol={unit.symbol}
          accent
        />
      ))}
    </div>
  );
}

function ValueRow({
  label,
  value,
  symbol,
  accent = false,
}: {
  label: string;
  value: number;
  symbol: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="mono text-[10px] uppercase tracking-wider text-uf-muted">{label}</span>
      <span className="mono leading-tight">
        <span
          className={
            accent ? 'text-base text-uf-accent-2 tabular-nums' : 'text-base text-uf-fg tabular-nums'
          }
        >
          {formatMagnitude(value)}
        </span>
        <span className="ml-1 text-xs text-uf-muted">{symbol}</span>
      </span>
    </div>
  );
}

function buildCode(fromId: string, value: number, kg: number): string {
  const fromName = toJsName(fromId);
  const imports = Array.from(new Set(['kilogram', fromName]));
  return `import { forge } from 'unitforge';
import {
  ${imports.join(', ')},
} from 'unitforge/kits/mass';

const inKg = forge(${fromName}, kilogram)(${formatMagnitude(value)}); // ${formatMagnitude(kg)}
`;
}
