// International cup comparator. Two-picker design: pick A and B from
// the seven cup variants the kit ships, see which is larger and by
// how much. All seven bars stay on screen as context so the spread is
// visible; A and B get accent + accent-2 coloring, the others fade
// back. The picker-driven percentage is the live signal (the old
// static "smallest vs largest" reading never changed with the slider,
// which made it slop, not signal).

import { Globe } from 'lucide-react';
import { useState } from 'react';
import type { Unit } from 'unitforge';
import { forge } from 'unitforge';
import {
  cupJapaneseGeneral,
  cupJapaneseRice,
  cupMetric250,
  cupRussianStakan,
  cupUk,
  cupUs,
  cupUsLegal240,
  milliliter,
} from 'unitforge/kits/cooking';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { EASE_OUT_EXPO } from '~/lib/use-animated-number.js';
import { ControlPanel } from '../../../control-panel.js';

interface CupVariant {
  /** Display name (e.g. "Japanese rice (合, gō)"). */
  label: string;
  /** Region tag (e.g. "JP", "US", "UK"). */
  region: string;
  /** The unit itself. */
  unit: Unit<'volume', number>;
  /** Camel-cased export name for the code-block. */
  exportName: string;
}

type Role = 'a' | 'b' | 'other';

// Sorted smallest → largest so the bar lineup reads as a clean ramp;
// the 36-58% spread between the top and bottom rows is what makes
// the "same word, different volume" lesson visible at a glance.
const VARIANTS: readonly CupVariant[] = [
  {
    label: 'Japanese rice (合, gō)',
    region: 'JP',
    unit: cupJapaneseRice,
    exportName: 'cupJapaneseRice',
  },
  {
    label: 'Japanese general',
    region: 'JP',
    unit: cupJapaneseGeneral,
    exportName: 'cupJapaneseGeneral',
  },
  {
    label: 'US Customary',
    region: 'US',
    unit: cupUs,
    exportName: 'cupUs',
  },
  {
    label: 'US legal (FDA)',
    region: 'US',
    unit: cupUsLegal240,
    exportName: 'cupUsLegal240',
  },
  {
    label: 'Metric (250 mL)',
    region: 'AU/NZ/CA/EU',
    unit: cupMetric250,
    exportName: 'cupMetric250',
  },
  {
    label: 'Russian stakan',
    region: 'RU',
    unit: cupRussianStakan,
    exportName: 'cupRussianStakan',
  },
  {
    label: 'UK imperial',
    region: 'UK',
    unit: cupUk,
    exportName: 'cupUk',
  },
];

const BY_ID: ReadonlyMap<string, CupVariant> = new Map(VARIANTS.map((v) => [v.unit.id, v]));

const PICKER_UNITS = VARIANTS.map((v) => v.unit);

export function useInternational() {
  const [count, setCount] = useState(1);
  // Default to the kit's most extreme cup pair (gō ↔ UK imperial,
  // ~58% spread). The picker invites exploration from there.
  const [aId, setAId] = useState<string>(cupJapaneseRice.id);
  const [bId, setBId] = useState<string>(cupUk.id);

  const a = BY_ID.get(aId) ?? VARIANTS[0]!;
  const b = BY_ID.get(bId) ?? VARIANTS[6]!;

  const rows = VARIANTS.map((v): CupVariant & { ml: number; role: Role } => ({
    ...v,
    ml: forge(v.unit, milliliter)(count),
    role: v.unit.id === aId ? 'a' : v.unit.id === bId ? 'b' : 'other',
  }));
  const maxMl = Math.max(...rows.map((r) => r.ml));

  const aMl = forge(a.unit, milliliter)(count);
  const bMl = forge(b.unit, milliliter)(count);
  const gap = Math.abs(aMl - bMl);
  const equal = gap < 0.01;
  const larger = aMl > bMl ? a : b;
  const gapPct = !equal ? (gap / Math.min(aMl, bMl)) * 100 : 0;

  const resultValue = equal
    ? `equal at ${aMl.toFixed(1)} mL`
    : `${larger.label} larger by ${gapPct.toFixed(0)}% (${gap.toFixed(1)} mL)`;

  return {
    menuZone: <Globe size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        pickersZone={
          <div className="sm:col-span-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <UnitPicker label="compare A" value={aId} units={PICKER_UNITS} onChange={setAId} />
            <UnitPicker label="compare B" value={bId} units={PICKER_UNITS} onChange={setBId} />
          </div>
        }
        visualZone={<CupLineup rows={rows} maxMl={maxMl} count={count} />}
        controlsZone={
          <Slider
            label="how many cups?"
            value={count}
            min={0.25}
            max={4}
            step={0.25}
            onChange={setCount}
            suffix="cups"
          />
        }
        resultsZone={
          <Result
            label={`at ${count.toFixed(2)} cups`}
            value={resultValue}
            variant="hero"
            // Result strings vary widely in length depending on picker
            // selection ("equal at 250.0 mL" vs "Japanese rice (合, gō)
            // larger by 36% (66.4 mL)"); drop to text-base so the
            // longest cases stay one line at typical bench widths.
            valueClassName="text-base"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(count, a, b, aMl, bMl)} />,
  };
}

interface CupLineupProps {
  rows: ReadonlyArray<CupVariant & { ml: number; role: Role }>;
  maxMl: number;
  count: number;
}

function CupLineup({ rows, maxMl, count }: CupLineupProps) {
  return (
    <section
      aria-label={`International cup variants at ${count} cups`}
      className="rounded-md border border-uf-border bg-uf-card p-4 uf-grease-spot"
    >
      <ol className="flex flex-col gap-2">
        {rows.map((r) => (
          <CupRow key={r.unit.id} row={r} maxMl={maxMl} />
        ))}
      </ol>
    </section>
  );
}

interface CupRowProps {
  row: CupVariant & { ml: number; role: Role };
  maxMl: number;
}

function CupRow({ row, maxMl }: CupRowProps) {
  const pct = maxMl > 0 ? (row.ml / maxMl) * 100 : 0;
  // A and B picked rows are color-coded (accent for A, accent-2 for B,
  // matching the two-channel pattern the geometry kit uses for paired
  // results); the other five rows fade to a low-opacity neutral so
  // they read as context, not competition.
  const barColor =
    row.role === 'a'
      ? 'var(--uf-accent)'
      : row.role === 'b'
        ? 'var(--uf-accent-2)'
        : 'var(--uf-fg)';
  const barOpacity = row.role === 'other' ? 0.18 : 0.75;
  const labelOpacityClass = row.role === 'other' ? 'opacity-50' : '';
  return (
    <li
      className={`grid grid-cols-[10rem_1fr_5rem] items-center gap-2 text-xs ${labelOpacityClass}`}
    >
      <div className="flex flex-col">
        <span className="mono text-uf-fg">{row.label}</span>
        <span className="mono text-[10px] uppercase tracking-wider text-uf-muted">
          {row.region}
        </span>
      </div>
      <div className="relative h-5 overflow-hidden rounded border border-uf-border bg-uf-bg">
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${pct}%`,
            background: barColor,
            opacity: barOpacity,
            transition: `width 220ms ${EASE_OUT_EXPO}`,
          }}
        />
      </div>
      <span className="mono text-right text-uf-fg">{row.ml.toFixed(1)} mL</span>
    </li>
  );
}

function buildCode(count: number, a: CupVariant, b: CupVariant, aMl: number, bMl: number): string {
  return `import { forge } from 'unitforge';
import {
  ${a.exportName},
  ${b.exportName},
  milliliter,
} from 'unitforge/kits/cooking';

// A: ${a.label} at ${count.toFixed(2)} cups:
const aMl = forge(${a.exportName}, milliliter)(${count.toFixed(2)});
// → ${aMl.toFixed(2)} mL

// B: ${b.label} at ${count.toFixed(2)} cups:
const bMl = forge(${b.exportName}, milliliter)(${count.toFixed(2)});
// → ${bMl.toFixed(2)} mL

// Cross-region cup conversion (a real recipe hazard):
forge(${a.exportName}, ${b.exportName})(1);
// → ${forge(a.unit, b.unit)(1).toFixed(4)}
`;
}
