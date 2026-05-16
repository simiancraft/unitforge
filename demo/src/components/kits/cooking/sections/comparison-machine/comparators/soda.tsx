// Soda comparator. Flagship of the comparison machine. The user picks
// a soda on the left and a food on the right; the page marches food
// icons across showing how many of THAT food carry the same grams of
// sugar as one of THAT soda. The dimension is a kit-local custom
// `'sugar'` declared in `parts/sugar-units.ts`; every unit in that
// file measures one item, with `toBase` returning grams of sugar per
// item. This is the Settlers-of-Crouton pattern applied to a domain
// the reader recognizes on sight.

import type { LucideIcon } from 'lucide-react';
import { Cake, Candy, Cookie, CupSoda, Donut, IceCream, Square } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { ControlPanel } from '../../../control-panel.js';
import { MarchingIcons } from '../parts/marching-icons.js';
import { cokeCan, FOODS, SODAS, type SugarUnit, sugarCube } from '../parts/sugar-units.js';

// Lucide icon per food id; chosen for instant visual recognition.
const FOOD_ICONS: Record<string, LucideIcon> = {
  'sugar-cube': Square,
  'oreo-cookie': Cookie,
  'glazed-donut': Donut,
  'ice-cream-scoop': IceCream,
  'cake-slice': Cake,
  'snickers-bar': Candy,
};

const SODA_NAMES: Record<string, string> = {
  'coke-can': 'cokeCan',
  'coke-bottle': 'cokeBottle',
  'mtn-dew-can': 'mtnDewCan',
  'sprite-can': 'spriteCan',
  'red-bull-can': 'redBullCan',
};

const FOOD_NAMES: Record<string, string> = {
  'sugar-cube': 'sugarCube',
  'oreo-cookie': 'oreoCookie',
  'glazed-donut': 'glazedDonut',
  'ice-cream-scoop': 'iceCreamScoop',
  'cake-slice': 'cakeSlice',
  'snickers-bar': 'snickersBar',
};

export function useSoda() {
  const [sodaId, setSodaId] = useState<string>(cokeCan.id);
  const [foodId, setFoodId] = useState<string>(sugarCube.id);

  const soda = findSoda(sodaId);
  const food = findFood(foodId);

  // forge across two units in the SAME custom 'sugar' dimension. Both
  // sides resolve to grams-of-sugar at base; the ratio falls out.
  const foodPerSoda = forge(soda, food)(1);
  const sodaSugarG = soda.toBase(1);
  const FoodIcon = FOOD_ICONS[food.id] ?? Cookie;

  return {
    menuZone: <CupSoda size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        pickersZone={
          <>
            <ItemPicker label="one of these…" units={SODAS} value={sodaId} onChange={setSodaId} />
            <span className="hidden self-end justify-self-center text-sm uppercase tracking-wider text-uf-muted sm:block">
              has the sugar of
            </span>
            <ItemPicker
              label="…this many of these"
              units={FOODS}
              value={foodId}
              onChange={setFoodId}
            />
          </>
        }
        visualZone={
          <SugarBoard
            soda={soda}
            food={food}
            FoodIcon={FoodIcon}
            foodCount={foodPerSoda}
            sodaSugarG={sodaSugarG}
          />
        }
        resultsZone={
          <Result
            label={`one ${soda.symbol} ≈`}
            value={`${foodPerSoda.toFixed(1)} ${food.symbol}${foodPerSoda === 1 ? '' : 's'} of sugar`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(soda, food, foodPerSoda)} />,
  };
}

interface ItemPickerProps {
  label: string;
  units: ReadonlyArray<SugarUnit>;
  value: string;
  onChange: (next: string) => void;
}

function ItemPicker({ label, units, value, onChange }: ItemPickerProps) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="uf-eyebrow">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mono rounded border border-uf-border bg-uf-card px-2 py-1.5 text-sm text-uf-fg focus:border-uf-accent focus:outline-none"
      >
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface SugarBoardProps {
  soda: SugarUnit;
  food: SugarUnit;
  FoodIcon: LucideIcon;
  foodCount: number;
  sodaSugarG: number;
}

function SugarBoard({ soda, food, FoodIcon, foodCount, sodaSugarG }: SugarBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-md border border-uf-border bg-uf-card p-5 uf-grease-spot sm:grid-cols-[auto_auto_1fr] sm:items-center">
      <figure className="m-0 flex flex-col items-center gap-2">
        <CupSoda size={64} strokeWidth={1.4} className="text-uf-accent" aria-hidden />
        <figcaption className="text-center">
          <div className="mono text-sm text-uf-fg">{soda.label}</div>
          <div className="mono text-[10px] uppercase tracking-wider text-uf-muted">
            {sodaSugarG.toFixed(0)} g sugar
          </div>
        </figcaption>
      </figure>
      <span className="text-center text-2xl text-uf-muted" aria-hidden>
        ≈
      </span>
      <div className="flex flex-col gap-2">
        <span className="uf-eyebrow">
          {foodCount.toFixed(1)} × {food.label}
        </span>
        <MarchingIcons
          count={foodCount}
          Icon={FoodIcon}
          iconClassName="h-7 w-7"
          colorClassName="text-uf-accent-2"
          ariaLabel={`${foodCount.toFixed(1)} ${food.symbol} icons representing the sugar in one ${soda.symbol}`}
        />
      </div>
    </div>
  );
}

function findSoda(id: string): SugarUnit {
  return SODAS.find((s) => s.id === id) ?? cokeCan;
}

function findFood(id: string): SugarUnit {
  return FOODS.find((f) => f.id === id) ?? sugarCube;
}

function buildCode(soda: SugarUnit, food: SugarUnit, count: number): string {
  const sodaName = SODA_NAMES[soda.id] ?? 'cokeCan';
  const foodName = FOOD_NAMES[food.id] ?? 'sugarCube';
  return `import { defineUnit, forge } from 'unitforge';

// Userland custom dimension; nothing comes from a kit.
const ${sodaName} = defineUnit({
  id: '${soda.id}', dimension: 'sugar',
  toBase: (n) => n * ${soda.toBase(1)}, // g of sugar per ${soda.symbol}
  fromBase: (g) => g / ${soda.toBase(1)},
});
const ${foodName} = defineUnit({
  id: '${food.id}', dimension: 'sugar',
  toBase: (n) => n * ${food.toBase(1)},
  fromBase: (g) => g / ${food.toBase(1)},
});

// One forge call across the custom dimension does the comparison:
forge(${sodaName}, ${foodName})(1); // ${count.toFixed(1)}
`;
}
