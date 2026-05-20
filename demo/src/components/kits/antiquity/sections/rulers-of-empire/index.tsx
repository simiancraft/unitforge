// Rulers of empire. The headline cross-civilization comparator: every
// culture standardized a "foot" and a "cubit", and they landed at
// different magnitudes. Laying them side by side as metric-scaled bars
// makes the spread legible at a glance: the Attic pous and Roman pes
// are within a millimeter of each other, the Han chi is visibly
// shorter, the Edo shaku longer.
//
// A menu toggle switches the bar set between foot-class (the everyday
// ~0.3 m foot) and cubit-class (the older forearm-length ~0.5 m
// measure). Each bar's width is the unit's length in meters scaled to
// the longest entry in the current class.

import { Ruler } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { meter } from 'unitforge/kits/antiquity';
import { CodeBlock } from '~/components/ui/code-block.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';
import { type RulerEntry, RULERS_CUBIT_CLASS, RULERS_FOOT_CLASS } from '../../units.js';

type ClassId = 'foot' | 'cubit';

interface RulerClass {
  id: ClassId;
  label: string;
  entries: readonly RulerEntry[];
}

const CLASSES: readonly RulerClass[] = [
  { id: 'foot', label: 'foot-class (~0.3 m)', entries: RULERS_FOOT_CLASS },
  { id: 'cubit', label: 'cubit-class (~0.5 m)', entries: RULERS_CUBIT_CLASS },
];

const FALLBACK_CLASS = CLASSES[0] as RulerClass;

export function RulersOfEmpire() {
  const [classId, setClassId] = useState<ClassId>('foot');
  const active = CLASSES.find((c) => c.id === classId) ?? FALLBACK_CLASS;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="rulers of empire"
          kicker="every culture's foot, to scale"
          iconZone={<Ruler size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Every civilization standardized a foot and a cubit; none of them agreed on how long. The
          Attic pous and the Roman pes land within a millimeter of each other, the Han chi is
          visibly shorter, the Edo shaku longer. Each bar is the unit's length in meters, a real
          forge call, scaled to the longest in the set.
        </>
      }
      menuZone={
        <>
          {CLASSES.map((c) =>
            c.id === classId ? (
              <ClassPillActive key={c.id} cls={c} />
            ) : (
              <ClassPillIdle key={c.id} cls={c} onPick={setClassId} />
            ),
          )}
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={<RulerChart entries={active.entries} />}
          codeZone={<CodeBlock code={buildCode(active.entries)} />}
        />
      }
    />
  );
}

function ClassPillActive({ cls }: { cls: RulerClass }) {
  return (
    <button
      type="button"
      aria-pressed="true"
      className="rounded-full border-2 border-uf-accent bg-uf-card px-3 py-1.5 text-xs font-semibold text-uf-accent"
    >
      {cls.label}
    </button>
  );
}

function ClassPillIdle({ cls, onPick }: { cls: RulerClass; onPick: (id: ClassId) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(cls.id)}
      aria-pressed="false"
      className="rounded-full border border-uf-border bg-uf-card px-3 py-1.5 text-xs text-uf-muted transition-colors hover:border-uf-accent hover:text-uf-fg"
    >
      {cls.label}
    </button>
  );
}

// Bar chart. Forges each entry to meters, scales bar widths to the
// longest in the set. Sink component; bounded prop surface (entries).
function RulerChart({ entries }: { entries: readonly RulerEntry[] }) {
  const measured = entries.map((e) => ({ entry: e, meters: forge(e.unit, meter)(1) }));
  const maxMeters = Math.max(...measured.map((m) => m.meters));

  return (
    <div className="flex flex-col gap-3 rounded-md border border-uf-border bg-uf-card p-4">
      <span className="uf-eyebrow">1 unit, in meters</span>
      {measured.map(({ entry, meters }) => (
        <RulerBar
          key={entry.unit.id}
          civ={entry.civ}
          symbol={entry.unit.symbol}
          meters={meters}
          widthPct={(meters / maxMeters) * 100}
        />
      ))}
    </div>
  );
}

interface RulerBarProps {
  civ: string;
  symbol: string;
  meters: number;
  widthPct: number;
}

function RulerBar({ civ, symbol, meters, widthPct }: RulerBarProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="mono text-xs uppercase tracking-wider text-uf-muted">{civ}</span>
        <span className="mono text-sm">
          <span className="text-uf-fg tabular-nums">{formatMagnitude(meters)}</span>
          <span className="ml-1 text-xs text-uf-muted">m · {symbol}</span>
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-sm bg-uf-bg">
        <div
          className="h-full rounded-sm bg-uf-accent"
          style={{ width: `${widthPct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function buildCode(entries: readonly RulerEntry[]): string {
  const names = entries.map((e) => toJsName(e.unit.id));
  const lines = entries
    .map((e) => {
      const m = forge(e.unit, meter)(1);
      return `forge(${toJsName(e.unit.id)}, meter)(1); // ${e.civ}: ${formatMagnitude(m)} m`;
    })
    .join('\n');

  return `import { forge } from 'unitforge';
import { meter, ${names.join(', ')} } from 'unitforge/kits/antiquity';

// one unit of each, in meters
${lines}
`;
}
