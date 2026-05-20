// "Hello, antiquity"; the translator. Browse a civilization, pick one
// of its units, read it in modern terms. This is the "what was this?"
// lookup a classicist reaches for: 1 Egyptian royal cubit is 0.5236 m;
// 1 Roman libra is about 327 g; 1 Attic medimnos is 52.5 L. The modern
// anchor set switches on the selected unit's dimension (meter/foot for
// length, kilogram/pound for mass, liter for volume).

import { ScrollText } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById, head } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import { type AntiquityUnit, anchorsFor, CIVILIZATIONS, type Civilization } from '../units.js';

interface TranslatorState {
  civId: string;
  unitId: string;
  value: number;
}

const FALLBACK_CIV = head(CIVILIZATIONS);

export function HelloAntiquity() {
  const [state, setState] = useState<TranslatorState>({
    civId: 'egypt',
    unitId: 'royal-cubit-egypt',
    value: 1,
  });

  const civ = CIVILIZATIONS.find((c) => c.id === state.civId) ?? FALLBACK_CIV;
  const unit = findById(civ.units, state.unitId);

  const handleCivChange = (civId: string) => {
    const nextCiv = CIVILIZATIONS.find((c) => c.id === civId) ?? FALLBACK_CIV;
    const firstUnit = head(nextCiv.units);
    setState({ civId, unitId: firstUnit.id, value: 1 });
  };
  const handleUnitChange = (unitId: string) => setState((s) => ({ ...s, unitId }));
  const handleValueChange = (value: number) => setState((s) => ({ ...s, value }));

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 01"
          title="hello, antiquity"
          kicker="read any ancient unit in modern terms"
          iconZone={<ScrollText size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Pick a civilization, then one of its units; see it in modern terms. One Egyptian royal
          cubit is 0.5236 m; one Roman libra is about 327 g; one Attic medimnos is 52.5 L. The kit
          values are era-specific (the libra drifted across the Empire), so each civilization is
          tagged with the era its numbers anchor to. Every readout below is a real forge call.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <TranslatorWidget
              civId={state.civId}
              unit={unit}
              units={civ.units}
              value={state.value}
              onCivChange={handleCivChange}
              onUnitChange={handleUnitChange}
              onValueChange={handleValueChange}
            />
          }
          codeZone={<CodeBlock code={buildCode(unit, state.value)} />}
        />
      }
    />
  );
}

interface TranslatorWidgetProps {
  civId: string;
  unit: AntiquityUnit;
  units: readonly AntiquityUnit[];
  value: number;
  onCivChange: (id: string) => void;
  onUnitChange: (id: string) => void;
  onValueChange: (v: number) => void;
}

function TranslatorWidget({
  civId,
  unit,
  units,
  value,
  onCivChange,
  onUnitChange,
  onValueChange,
}: TranslatorWidgetProps) {
  return (
    <div className="flex flex-col gap-5">
      <CivilizationPicker activeId={civId} onPick={onCivChange} />

      <div className="grid gap-3 sm:grid-cols-2">
        <UnitPicker label="unit" value={unit.id} units={units} onChange={onUnitChange} />
        <Slider
          label={`quantity (${unit.symbol})`}
          value={value}
          min={1}
          max={100}
          step={1}
          onChange={onValueChange}
          suffix={unit.symbol}
        />
      </div>

      <ModernReadout unit={unit} value={value} />
    </div>
  );
}

function CivilizationPicker({
  activeId,
  onPick,
}: {
  activeId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {CIVILIZATIONS.map((c) =>
        c.id === activeId ? (
          <CivTileActive key={c.id} civ={c} onPick={onPick} />
        ) : (
          <CivTileIdle key={c.id} civ={c} onPick={onPick} />
        ),
      )}
    </div>
  );
}

// Active tile keeps onPick (idempotent re-select) so Tab + Enter on
// the selected tile isn't a keyboard dead-end; radio-style semantics.
function CivTileActive({ civ, onPick }: { civ: Civilization; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(civ.id)}
      aria-pressed="true"
      className="flex flex-col items-start gap-0.5 rounded-lg border border-uf-accent bg-uf-card p-2 text-left text-uf-accent"
    >
      <span className="mono text-xs font-semibold uppercase tracking-wider">{civ.label}</span>
      <span className="text-[10px] text-uf-muted">{civ.era}</span>
    </button>
  );
}

function CivTileIdle({ civ, onPick }: { civ: Civilization; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(civ.id)}
      aria-pressed="false"
      className="flex flex-col items-start gap-0.5 rounded-lg border border-uf-border bg-uf-card p-2 text-left text-uf-muted transition-colors hover:border-uf-accent hover:text-uf-fg"
    >
      <span className="mono text-xs font-semibold uppercase tracking-wider">{civ.label}</span>
      <span className="text-[10px] text-uf-muted">{civ.era}</span>
    </button>
  );
}

// Readout matrix. Forges the selected unit/value into each modern
// anchor for its dimension. Sink component; bounded prop surface.
function ModernReadout({ unit, value }: { unit: AntiquityUnit; value: number }) {
  const anchors = anchorsFor(unit.dimension);
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-uf-border bg-uf-card p-4">
      <span className="uf-eyebrow">
        {formatMagnitude(value)} {unit.symbol} in modern units
      </span>
      {anchors.map((anchor) => (
        <AnchorRow
          key={anchor.id}
          label={anchor.label}
          symbol={anchor.symbol}
          value={forge(unit, anchor)(value)}
        />
      ))}
    </div>
  );
}

function AnchorRow({ label, symbol, value }: { label: string; symbol: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between border-b border-uf-border pb-1.5 last:border-b-0 last:pb-0">
      <span className="mono text-xs uppercase tracking-wider text-uf-muted">{label}</span>
      <span className="mono leading-tight">
        <span className="text-lg text-uf-fg tabular-nums">{formatMagnitude(value)}</span>
        <span className="ml-1 text-xs text-uf-muted">{symbol}</span>
      </span>
    </div>
  );
}

function buildCode(unit: AntiquityUnit, value: number): string {
  const name = toJsName(unit.id);
  const anchors = anchorsFor(unit.dimension);
  const anchorNames = anchors.map((a) => toJsName(a.id));
  const lines = anchors
    .map((a) => {
      const out = forge(unit, a)(value);
      return `forge(${name}, ${toJsName(a.id)})(${formatMagnitude(value)}); // → ${formatMagnitude(out)} ${a.symbol}`;
    })
    .join('\n');

  return `import { forge } from 'unitforge';
import { ${[name, ...anchorNames].join(', ')} } from 'unitforge/kits/antiquity';

// ${unit.label}
${lines}
`;
}
