// Thermal-landmarks machine. The kit's third teaching surface; the
// goal is to make the four scales' ranges legible by pinning them
// to physically meaningful anchors. Pick a landmark (absolute zero
// → photosphere); the readout matrix renders the same physical
// state in K, °C, °F, °R simultaneously.
//
// Pedagogically, the row spread shows two things at once: (a) the
// scales' relative slopes (Fahrenheit ticks finer than Celsius;
// Kelvin and Rankine share an absolute origin) and (b) the orders
// of magnitude the kit must handle (310 K body heat vs 5778 K sun
// surface, on the same screen, with the same forge() call).

import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { kelvin } from 'unitforge/kits/temperature';
import { CodeBlock } from '~/components/ui/code-block.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';
import { TEMPERATURE_ALL_UNITS, TEMPERATURE_REFERENCE_POINTS } from '../../units.js';

type ReferencePoint = (typeof TEMPERATURE_REFERENCE_POINTS)[number];

export function ReferencePointsMachine() {
  const [activeId, setActiveId] = useState<ReferencePoint['id']>('room-temperature');
  const active =
    TEMPERATURE_REFERENCE_POINTS.find((p) => p.id === activeId) ?? TEMPERATURE_REFERENCE_POINTS[2];

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 03"
          title="thermal landmarks"
          kicker="absolute zero → photosphere"
          iconZone={<Sparkles size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Seven physical anchors spanning the kit's pedagogical range. Pick one; the readout shows
          the same state in every scale. The row spread is the point: Kelvin and Rankine share an
          origin at absolute zero; Celsius and Fahrenheit don't. Each forge call in the code panel
          is a real conversion through the kit's Kelvin base.
        </>
      }
      menuZone={
        <>
          {TEMPERATURE_REFERENCE_POINTS.map((point) =>
            point.id === activeId ? (
              <LandmarkPillActive key={point.id} point={point} />
            ) : (
              <LandmarkPillIdle key={point.id} point={point} onPick={setActiveId} />
            ),
          )}
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={<LandmarkMatrix point={active} />}
          codeZone={<CodeBlock code={buildCode(active)} />}
        />
      }
    />
  );
}

interface LandmarkPillIdleProps {
  point: ReferencePoint;
  onPick: (id: ReferencePoint['id']) => void;
}

function LandmarkPillIdle({ point, onPick }: LandmarkPillIdleProps) {
  return (
    <button
      type="button"
      onClick={() => onPick(point.id)}
      aria-pressed={false}
      className="rounded-full border border-uf-border bg-uf-card px-3 py-1.5 text-xs text-uf-muted transition-colors hover:border-uf-accent hover:text-uf-fg"
    >
      {point.label}
    </button>
  );
}

function LandmarkPillActive({ point }: { point: ReferencePoint }) {
  return (
    <button
      type="button"
      aria-pressed={true}
      className="rounded-full border-2 border-uf-accent bg-uf-card px-3 py-1.5 text-xs font-semibold text-uf-accent"
    >
      {point.label}
    </button>
  );
}

// Readout matrix. Receives the selected landmark and converts its
// kelvin anchor into every kit-shipped scale. Sink component;
// bounded prop surface (one point); zone-composer §1.5 compliant.
function LandmarkMatrix({ point }: { point: ReferencePoint }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="uf-eyebrow text-uf-accent">{point.label}</span>
        <p className="text-xs text-uf-muted">{point.hint}</p>
      </div>

      <div className="flex flex-col gap-1.5 rounded-md border border-uf-border bg-uf-card p-4">
        <span className="uf-eyebrow">every scale at this landmark</span>
        {TEMPERATURE_ALL_UNITS.map((unit) => (
          <ScaleRow
            key={unit.id}
            label={unit.label}
            symbol={unit.symbol}
            value={forge(kelvin, unit)(point.kelvin)}
          />
        ))}
      </div>
    </div>
  );
}

interface ScaleRowProps {
  label: string;
  symbol: string;
  value: number;
}

function ScaleRow({ label, symbol, value }: ScaleRowProps) {
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

function buildCode(point: ReferencePoint): string {
  const importList = TEMPERATURE_ALL_UNITS.map((u) => toJsName(u.id)).join(', ');
  const lines = TEMPERATURE_ALL_UNITS.map((unit) => {
    const name = toJsName(unit.id);
    const out = forge(kelvin, unit)(point.kelvin);
    return `forge(kelvin, ${name})(${point.kelvin}); // → ${formatMagnitude(out)} ${unit.symbol}`;
  }).join('\n');

  return `import { forge } from 'unitforge';
import { ${importList} } from 'unitforge/kits/temperature';

// ${point.label} (${point.hint})
${lines}
`;
}
