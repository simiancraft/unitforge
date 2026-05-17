// Soda comparator. Flagship of the comparison machine. The user picks
// a soda on the left and a food on the right; the page marches food
// icons across showing how many of THAT food carry the same grams of
// sugar as one of THAT soda. The dimension is a kit-local custom
// `'sugar'` declared in `parts/sugar-units.ts`; every unit in that
// file measures one item, with `toBase` returning grams of sugar per
// item. This is the Settlers-of-Crouton pattern applied to a domain
// the reader recognizes on sight.

import type { LucideIcon } from 'lucide-react';
import {
  Beer,
  Cake,
  Candy,
  Coffee,
  Cookie,
  CupSoda,
  Donut,
  IceCream,
  Square,
  Wine,
} from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { EASE_OUT_EXPO } from '~/lib/use-animated-number.js';
import { ControlPanel } from '../../../control-panel.js';
import { MarchingIcons } from '../parts/marching-icons.js';
import {
  cokeCan,
  FOODS,
  type FoodId,
  SODA_FL_OZ,
  SODAS,
  type SodaId,
  type SugarUnit,
  sugarCube,
} from '../parts/sugar-units.js';

// Lucide icon per food id; chosen for instant visual recognition.
// Typed `Record<FoodId, …>` so adding a food without an icon entry
// is a compile error instead of a silent ?? Cookie fallback.
const FOOD_ICONS: Record<FoodId, LucideIcon> = {
  'sugar-cube': Square,
  'oreo-cookie': Cookie,
  'glazed-donut': Donut,
  'ice-cream-scoop': IceCream,
  'cake-slice': Cake,
  'snickers-bar': Candy,
};

// Lucide icon per soda id; chosen so the container shape reads at a
// glance: small Coffee cup for the 8.4 oz Red Bull, CupSoda for the
// 12 oz cans, Wine glass for the 20 oz bottle, Beer stein for the
// hulking 2 L bottle. Plus the rendered size is fl-oz-driven (see
// `sodaIconPx`) so the picker has visible size variation across the
// container ladder. Typed `Record<SodaId, …>` for the same reason as
// FOOD_ICONS.
const SODA_ICONS: Record<SodaId, LucideIcon> = {
  'red-bull-can': Coffee,
  'coke-can': CupSoda,
  'mtn-dew-can': CupSoda,
  'sprite-can': CupSoda,
  'coke-bottle': Wine,
  'coke-2l': Beer,
  'mtn-dew-2l': Beer,
};

const SODA_NAMES: Record<SodaId, string> = {
  'coke-can': 'cokeCan',
  'coke-bottle': 'cokeBottle',
  'mtn-dew-can': 'mtnDewCan',
  'sprite-can': 'spriteCan',
  'red-bull-can': 'redBullCan',
  'coke-2l': 'coke2L',
  'mtn-dew-2l': 'mtnDew2L',
};

// Map a soda's fl oz to a rendered icon size in px. Linear over the
// realistic container ladder (8.4 to 67.6 fl oz) so picking a bigger
// container visibly grows the glyph rather than rendering every soda
// at the same 64 px.
const SODA_PX_MIN = 40;
const SODA_PX_MAX = 96;
const SODA_FL_OZ_MIN = 8;
const SODA_FL_OZ_MAX = 68;

function sodaIconPx(sodaId: SodaId): number {
  const flOz = SODA_FL_OZ[sodaId];
  const t = Math.max(0, Math.min(1, (flOz - SODA_FL_OZ_MIN) / (SODA_FL_OZ_MAX - SODA_FL_OZ_MIN)));
  return SODA_PX_MIN + t * (SODA_PX_MAX - SODA_PX_MIN);
}

const FOOD_NAMES: Record<FoodId, string> = {
  'sugar-cube': 'sugarCube',
  'oreo-cookie': 'oreoCookie',
  'glazed-donut': 'glazedDonut',
  'ice-cream-scoop': 'iceCreamScoop',
  'cake-slice': 'cakeSlice',
  'snickers-bar': 'snickersBar',
};

export function useSoda() {
  const [sodaId, setSodaId] = useState<SodaId>('coke-can');
  const [foodId, setFoodId] = useState<FoodId>('sugar-cube');

  const soda = findSoda(sodaId);
  const food = findFood(foodId);

  // forge across two units in the SAME custom 'sugar' dimension. Both
  // sides resolve to grams-of-sugar at base; the ratio falls out.
  const foodPerSoda = forge(soda, food)(1);
  const sodaSugarG = soda.toBase(1);
  // Indexed off the typed state ids (not the runtime `.id` strings)
  // so the lookups are total over their respective unions.
  const FoodIcon = FOOD_ICONS[foodId];
  const SodaIcon = SODA_ICONS[sodaId];
  const sodaPx = sodaIconPx(sodaId);

  return {
    menuZone: <CupSoda size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        pickersZone={
          <>
            {/* The select's onChange surfaces `string`; cast at this
                boundary because SODAS / FOODS are the source of truth
                for the union and any value the picker emits is one of
                those ids. */}
            <ItemPicker
              label="one of these…"
              units={SODAS}
              value={sodaId}
              onChange={(v) => setSodaId(v as SodaId)}
            />
            <span className="hidden self-end justify-self-center text-sm uppercase tracking-wider text-uf-muted sm:block">
              has the sugar of
            </span>
            <ItemPicker
              label="…this many of these"
              units={FOODS}
              value={foodId}
              onChange={(v) => setFoodId(v as FoodId)}
            />
          </>
        }
        visualZone={
          <SugarBoard
            soda={soda}
            food={food}
            SodaIcon={SodaIcon}
            sodaIconPx={sodaPx}
            FoodIcon={FoodIcon}
            foodCount={foodPerSoda}
            sodaSugarG={sodaSugarG}
          />
        }
        resultsZone={
          <Result
            label={`one ${soda.symbol} ≈`}
            value={`${foodPerSoda.toFixed(1)} ${food.symbol}${
              foodPerSoda === 1 || food.symbol.endsWith('s') ? '' : 's'
            }`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(sodaId, soda, foodId, food, foodPerSoda)} />,
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
  SodaIcon: LucideIcon;
  /** Px size for the picked-soda icon; reflects its container fl oz. */
  sodaIconPx: number;
  FoodIcon: LucideIcon;
  foodCount: number;
  sodaSugarG: number;
}

function SugarBoard({
  soda,
  food,
  SodaIcon,
  sodaIconPx,
  FoodIcon,
  foodCount,
  sodaSugarG,
}: SugarBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-md border border-uf-border bg-uf-card p-5 uf-grease-spot sm:grid-cols-[auto_auto_1fr] sm:items-center">
      <figure
        className="m-0 flex flex-col items-center justify-end gap-2"
        // Reserve a tall slot so the small-can selection (40 px) and the
        // 2-L bottle (96 px) align at the bottom rather than the center;
        // the icon then visibly "grows up" out of the same baseline.
        style={{ minHeight: 110 }}
      >
        <SodaIcon
          size={sodaIconPx}
          strokeWidth={1.4}
          className="text-uf-accent"
          style={{
            transition: `width 320ms ${EASE_OUT_EXPO}, height 320ms ${EASE_OUT_EXPO}`,
          }}
          aria-hidden
        />
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

function buildCode(
  sodaId: SodaId,
  soda: SugarUnit,
  foodId: FoodId,
  food: SugarUnit,
  count: number,
): string {
  const sodaName = SODA_NAMES[sodaId];
  const foodName = FOOD_NAMES[foodId];
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
