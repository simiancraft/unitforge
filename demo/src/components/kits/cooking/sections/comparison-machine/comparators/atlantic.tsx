// Atlantic comparator. The same English word ("cup", "tablespoon",
// "teaspoon", "fluid ounce") means two different volumes depending on
// which side of the Atlantic the recipe came from. One comparator,
// inner tool-toggle: the four culinary tools where the US/UK split
// bites all share the same comparison shape (one number, two volumes,
// one ratio gap), so they live behind a single dispatch instead of
// four sibling tiers.

import { Coffee, type LucideIcon, Scale, Soup, Utensils, Wine } from 'lucide-react';
import { useState } from 'react';
import type { Unit } from 'unitforge';
import { forge } from 'unitforge';
import {
  cupUk,
  cupUs,
  fluidOunceUk,
  fluidOunceUs,
  milliliter,
  tablespoonUk,
  tablespoonUs,
  teaspoonUk,
  teaspoonUs,
} from 'unitforge/kits/cooking';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { cn } from '~/lib/cn.js';
import { ControlPanel } from '../../../control-panel.js';
import { PourPair } from '../parts/pour-pair.js';

type ToolKey = 'cup' | 'tablespoon' | 'teaspoon' | 'fluidOunce';

interface ToolDef {
  label: string;
  icon: LucideIcon;
  us: Unit<'volume', number>;
  uk: Unit<'volume', number>;
  usName: string;
  ukName: string;
  /** Bigger of the two; drives the shared y-axis. */
  maxCount: number;
  defaultCount: number;
  step: number;
  unitWord: string;
}

const TOOLS: Record<ToolKey, ToolDef> = {
  cup: {
    label: 'cup',
    icon: Coffee,
    us: cupUs,
    uk: cupUk,
    usName: 'cupUs',
    ukName: 'cupUk',
    maxCount: 8,
    defaultCount: 1,
    step: 0.25,
    unitWord: 'cups',
  },
  tablespoon: {
    label: 'tablespoon',
    icon: Utensils,
    us: tablespoonUs,
    uk: tablespoonUk,
    usName: 'tablespoonUs',
    ukName: 'tablespoonUk',
    maxCount: 16,
    defaultCount: 3,
    step: 1,
    unitWord: 'tbsp',
  },
  teaspoon: {
    label: 'teaspoon',
    icon: Soup,
    us: teaspoonUs,
    uk: teaspoonUk,
    usName: 'teaspoonUs',
    ukName: 'teaspoonUk',
    maxCount: 24,
    defaultCount: 6,
    step: 1,
    unitWord: 'tsp',
  },
  fluidOunce: {
    label: 'fluid ounce',
    icon: Wine,
    us: fluidOunceUs,
    uk: fluidOunceUk,
    usName: 'fluidOunceUs',
    ukName: 'fluidOunceUk',
    maxCount: 16,
    defaultCount: 8,
    step: 1,
    unitWord: 'fl oz',
  },
};

const ORDER: readonly ToolKey[] = ['cup', 'tablespoon', 'teaspoon', 'fluidOunce'];

export function useAtlantic() {
  const [tool, setTool] = useState<ToolKey>('cup');
  const [count, setCount] = useState(TOOLS.cup.defaultCount);
  const def = TOOLS[tool];

  const handleToolChange = (next: ToolKey) => {
    setTool(next);
    setCount(TOOLS[next].defaultCount);
  };

  const usMl = forge(def.us, milliliter)(count);
  const ukMl = forge(def.uk, milliliter)(count);
  const maxMl = forge(def.uk, milliliter)(def.maxCount);
  const gapMl = ukMl - usMl;
  const gapAbsPct = Math.abs(gapMl / Math.min(usMl, ukMl)) * 100;
  const ukIsLarger = ukMl > usMl;

  return {
    menuZone: <Scale size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        pickersZone={<ToolToolbar active={tool} order={ORDER} onChange={handleToolChange} />}
        visualZone={
          <PourPair
            count={count}
            usMl={usMl}
            ukMl={ukMl}
            usSymbol={def.us.symbol}
            ukSymbol={def.uk.symbol}
            maxMl={maxMl}
          />
        }
        controlsZone={
          <Slider
            label={`how many ${def.unitWord}?`}
            value={count}
            min={def.step}
            max={def.maxCount}
            step={def.step}
            onChange={setCount}
            suffix={def.unitWord}
          />
        }
        resultsZone={
          <Result
            label={`${count} ${def.unitWord} · ${ukIsLarger ? 'UK − US' : 'US − UK'} gap`}
            value={`${Math.abs(gapMl).toFixed(2)} mL (≈ ${gapAbsPct.toFixed(1)}% larger ${ukIsLarger ? 'UK' : 'US'})`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(def, count, usMl, ukMl)} />,
  };
}

interface ToolToolbarProps {
  active: ToolKey;
  order: readonly ToolKey[];
  onChange: (next: ToolKey) => void;
}

function ToolToolbar({ active, order, onChange }: ToolToolbarProps) {
  return (
    <div className="sm:col-span-3 flex flex-wrap gap-1.5">
      {order.map((key) => {
        const def = TOOLS[key];
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
  );
}

function buildCode(def: ToolDef, count: number, usMl: number, ukMl: number): string {
  return `import { forge } from 'unitforge';
import { ${def.usName}, ${def.ukName}, milliliter } from 'unitforge/kits/cooking';

const usMl = forge(${def.usName}, milliliter)(${count.toFixed(2)}); // ${usMl.toFixed(2)}
const ukMl = forge(${def.ukName}, milliliter)(${count.toFixed(2)}); // ${ukMl.toFixed(2)}

// Mixing the two ruins the dish:
forge(${def.usName}, ${def.ukName})(1); // ${forge(def.us, def.uk)(1).toFixed(4)}
`;
}
