// International cup comparator. The word "cup" means at least seven
// different volumes depending on which country's cookbook you opened.
// One slider — "how many cups?" — drives a horizontal-bar visualization
// that shows every cup variant the kit ships, sorted by size. The point
// is the SPREAD: 1 Japanese rice cup (gō, 180.4 mL) is 36% smaller than
// 1 UK imperial cup (284.1 mL). Mixing them ruins the dish.

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
import { EASE_OUT_EXPO } from '~/lib/use-animated-number.js';
import { ControlPanel } from '../../../control-panel.js';

interface CupVariant {
  /** Display name (e.g. "Japanese rice (gō)"). */
  label: string;
  /** Region tag (e.g. "JP", "US", "UK"). */
  region: string;
  /** The unit itself. */
  unit: Unit<'volume', number>;
  /** Camel-cased export name for the code-block. */
  exportName: string;
}

// Sorted smallest → largest so the bars read as a clean ramp; the
// 36% spread between top and bottom is the visualization's point.
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

export function useInternational() {
  const [count, setCount] = useState(1);

  // Each variant resolved to mL at the user's chosen count.
  const rows = VARIANTS.map((v) => ({
    ...v,
    ml: forge(v.unit, milliliter)(count),
  }));
  const maxMl = Math.max(...rows.map((r) => r.ml));
  const minMl = Math.min(...rows.map((r) => r.ml));
  const spreadPct = ((maxMl - minMl) / minMl) * 100;

  return {
    menuZone: <Globe size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
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
            label={`${count.toFixed(2)} cups · smallest → largest gap`}
            value={`${(maxMl - minMl).toFixed(1)} mL (≈ ${spreadPct.toFixed(0)}% larger UK than gō)`}
            variant="hero"
            // Same long-string-wrap fix as the atlantic comparator.
            valueClassName="text-xl"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(count, rows[0]!, rows[rows.length - 1]!)} />,
  };
}

interface CupLineupProps {
  rows: ReadonlyArray<CupVariant & { ml: number }>;
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
  row: CupVariant & { ml: number };
  maxMl: number;
}

function CupRow({ row, maxMl }: CupRowProps) {
  const pct = maxMl > 0 ? (row.ml / maxMl) * 100 : 0;
  return (
    <li className="grid grid-cols-[10rem_1fr_5rem] items-center gap-2 text-xs">
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
            background: 'var(--uf-accent)',
            opacity: 0.7,
            transition: `width 220ms ${EASE_OUT_EXPO}`,
          }}
        />
      </div>
      <span className="mono text-right text-uf-fg">{row.ml.toFixed(1)} mL</span>
    </li>
  );
}

function buildCode(
  count: number,
  smallest: CupVariant & { ml: number },
  largest: CupVariant & { ml: number },
): string {
  return `import { forge } from 'unitforge';
import {
  ${smallest.exportName},
  ${largest.exportName},
  milliliter,
} from 'unitforge/kits/cooking';

// Smallest (${smallest.label}) at ${count.toFixed(2)} cups:
const smallMl = forge(${smallest.exportName}, milliliter)(${count.toFixed(2)});
// → ${smallest.ml.toFixed(2)} mL

// Largest (${largest.label}) at ${count.toFixed(2)} cups:
const bigMl = forge(${largest.exportName}, milliliter)(${count.toFixed(2)});
// → ${largest.ml.toFixed(2)} mL

// Cross-region cup conversion (a real recipe hazard):
forge(${largest.exportName}, ${smallest.exportName})(1);
// → ${forge(largest.unit, smallest.unit)(1).toFixed(4)}
`;
}
