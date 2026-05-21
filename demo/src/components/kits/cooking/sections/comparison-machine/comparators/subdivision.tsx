// Subdivision comparator. The tiny end of the kitchen drawer: a
// teaspoon is not an atom, it is sixteen pinches (or eight dashes).
// Pick a spoon on the left and a small measure on the right; one forge
// call across the shared VOLUME dimension gives the count. Unlike the
// atlantic comparator, there is no US/UK split here: dash and pinch are
// tradition measures anchored to the US teaspoon, so the spread is a
// clean integer ladder rather than a transatlantic gap.
//
// There is no UK pinch to ship; "pinch" is folk measure in Britain as
// much as in America, never codified. If one existed by analogy to the
// atlantic split (1/16 of a UK teaspoon, the 5 mL metric spoon), it
// would be 5 / 16 = 0.3125 mL, versus the US pinch's 4.92892 / 16 =
// 0.30806 mL: a ~1.4% gap, smaller than the difference between two
// people's fingers, which is exactly why the kit ships a single pinch.

import { Droplets, type LucideIcon, Soup, Sparkle, Sparkles, Utensils } from 'lucide-react';
import { useState } from 'react';
import type { Unit } from 'unitforge';
import { forge } from 'unitforge';
import { dash, pinch, tablespoonUs, teaspoonUs } from 'unitforge/kits/cooking';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { cn } from '~/lib/cn.js';
import { ControlPanel } from '../../../control-panel.js';
import { MarchingIcons } from '../parts/marching-icons.js';

interface SpoonDef {
  label: string;
  icon: LucideIcon;
  unit: Unit<'volume', number>;
  name: string;
}

interface SmallDef {
  label: string;
  plural: string;
  icon: LucideIcon;
  unit: Unit<'volume', number>;
  name: string;
}

type SpoonKey = 'teaspoon' | 'tablespoon';
type SmallKey = 'pinch' | 'dash';

const SPOONS: Record<SpoonKey, SpoonDef> = {
  teaspoon: { label: 'teaspoon', icon: Soup, unit: teaspoonUs, name: 'teaspoonUs' },
  tablespoon: { label: 'tablespoon', icon: Utensils, unit: tablespoonUs, name: 'tablespoonUs' },
};

const SMALLS: Record<SmallKey, SmallDef> = {
  pinch: { label: 'pinch', plural: 'pinches', icon: Sparkle, unit: pinch, name: 'pinch' },
  dash: { label: 'dash', plural: 'dashes', icon: Droplets, unit: dash, name: 'dash' },
};

const SPOON_ORDER: readonly SpoonKey[] = ['teaspoon', 'tablespoon'];
const SMALL_ORDER: readonly SmallKey[] = ['pinch', 'dash'];

export function useSubdivision() {
  const [spoonKey, setSpoonKey] = useState<SpoonKey>('teaspoon');
  const [smallKey, setSmallKey] = useState<SmallKey>('pinch');

  const spoon = SPOONS[spoonKey];
  const small = SMALLS[smallKey];
  // Same VOLUME dimension on both sides; the ratio falls out of one
  // forge call. The tradition measures are anchored to the US teaspoon,
  // so these come out as exact integers (tsp→pinch = 16, tsp→dash = 8).
  const count = forge(spoon.unit, small.unit)(1);

  return {
    menuZone: <Sparkles size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        pickersZone={
          <>
            <MeasureToolbar
              label="one of these…"
              order={SPOON_ORDER}
              defs={SPOONS}
              active={spoonKey}
              onChange={setSpoonKey}
            />
            <MeasureToolbar
              label="…is how many of these"
              order={SMALL_ORDER}
              defs={SMALLS}
              active={smallKey}
              onChange={setSmallKey}
            />
          </>
        }
        visualZone={<SubdivisionBoard spoon={spoon} small={small} count={count} />}
        resultsZone={
          <Result
            label={`one ${spoon.label} ≈`}
            value={`${count} ${count === 1 ? small.label : small.plural}`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(spoon, small, count)} />,
  };
}

interface MeasureToolbarProps<K extends string> {
  label: string;
  order: readonly K[];
  defs: Record<K, { label: string; icon: LucideIcon }>;
  active: K;
  onChange: (next: K) => void;
}

function MeasureToolbar<K extends string>({
  label,
  order,
  defs,
  active,
  onChange,
}: MeasureToolbarProps<K>) {
  return (
    <div className="flex flex-col gap-1 text-xs sm:col-span-3">
      <span className="uf-eyebrow">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {order.map((key) => {
          const def = defs[key];
          const Icon = def.icon;
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={isActive}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition focus:outline-none focus-visible:ring-1 focus-visible:ring-uf-accent',
                isActive
                  ? 'border-uf-accent bg-uf-accent/15 text-uf-accent'
                  : 'border-uf-fg/15 bg-transparent text-uf-fg hover:border-uf-accent/50',
              )}
            >
              <Icon size={16} strokeWidth={1.6} />
              <span className="mono uppercase tracking-wider">{def.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SubdivisionBoardProps {
  spoon: SpoonDef;
  small: SmallDef;
  count: number;
}

function SubdivisionBoard({ spoon, small, count }: SubdivisionBoardProps) {
  const SpoonIcon = spoon.icon;
  const SmallIcon = small.icon;
  return (
    <div className="grid grid-cols-1 gap-4 rounded-md border border-uf-border bg-uf-card p-5 uf-grease-spot sm:grid-cols-[auto_auto_1fr] sm:items-center">
      <figure
        className="m-0 flex flex-col items-center justify-end gap-2"
        style={{ minHeight: 90 }}
      >
        <SpoonIcon size={56} strokeWidth={1.4} className="text-uf-accent" aria-hidden />
        <figcaption className="mono text-sm text-uf-fg">{spoon.label}</figcaption>
      </figure>
      <span className="text-center text-2xl text-uf-muted" aria-hidden>
        ≈
      </span>
      <div className="flex flex-col gap-2">
        <span className="uf-eyebrow">
          {count} × {small.label}
        </span>
        <MarchingIcons
          count={count}
          Icon={SmallIcon}
          iconClassName="h-4 w-4"
          colorClassName="text-uf-accent-2"
          ariaLabel={`${count} ${small.plural} in one ${spoon.label}`}
        />
      </div>
    </div>
  );
}

function buildCode(spoon: SpoonDef, small: SmallDef, count: number): string {
  return `import { forge } from 'unitforge';
import { ${spoon.name}, ${small.name} } from 'unitforge/kits/cooking';

// dash and pinch are anchored to the US teaspoon, so this is exact:
forge(${spoon.name}, ${small.name})(1); // ${count}
`;
}
