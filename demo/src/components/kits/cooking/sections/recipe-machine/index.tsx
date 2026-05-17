// Recipe machine chassis. Six recipes: cookies, donuts, chocolate
// cake, pizza, simple syrup, and vinaigrette. Each pairs a US-customary
// ingredient table with a live UK + metric translation, scaled by a
// batch slider that drives both the table and a marching-icons yield
// row up top (24 cookies become 48 cookies at ×2 batch). Each recipe
// hook composes at this chassis; menu state is local useState;
// WidgetLayout is keyed by activeKey so the recipe subtree remounts
// on swap.

import { ChefHat } from 'lucide-react';
import { useState } from 'react';
import { MenuPill } from '~/components/kits/menu-pill.js';
import {
  SectionHeader,
  SectionLayout,
  type SectionMachineChild,
  WidgetLayout,
} from '~/components/kits/section-layout.js';
import { useChocolateCake } from './recipes/chocolate-cake.js';
import { useChocolateChipCookies } from './recipes/chocolate-chip-cookies.js';
import { useGlazedDonuts } from './recipes/glazed-donuts.js';
import { usePizzaDough } from './recipes/pizza-dough.js';
import { useSimpleSyrup } from './recipes/simple-syrup.js';
import { useVinaigrette } from './recipes/vinaigrette.js';

type RecipeKey =
  | 'chocolateChipCookies'
  | 'glazedDonuts'
  | 'chocolateCake'
  | 'pizzaDough'
  | 'simpleSyrup'
  | 'vinaigrette';

interface RecipeMeta {
  label: string;
  hint: string;
}

// Keep this as a flat array literal; test/demo-invariants.test.ts
// source-greps it to assert ORDER stays in sync with the recipes
// Record. Refactoring to `[...BASE, 'newKey']` or `concat()` would
// silently bypass the count check.
const ORDER: readonly RecipeKey[] = [
  'chocolateChipCookies',
  'glazedDonuts',
  'chocolateCake',
  'pizzaDough',
  'simpleSyrup',
  'vinaigrette',
];

const RECIPE_META: Record<RecipeKey, RecipeMeta> = {
  chocolateChipCookies: { label: 'cookies', hint: '24 per batch; sticks + cups' },
  glazedDonuts: { label: 'glazed donuts', hint: "baker's dozen per batch" },
  chocolateCake: { label: 'chocolate cake', hint: '8 slices, single 9-inch round' },
  pizzaDough: { label: 'pizza', hint: '12-inch, 8 slices' },
  simpleSyrup: { label: 'simple syrup', hint: '1:1 by volume; cocktails per batch' },
  vinaigrette: { label: 'vinaigrette', hint: 'dresses 6 salads per batch' },
};

export function RecipeMachine() {
  const chocolateChipCookies = useChocolateChipCookies();
  const glazedDonuts = useGlazedDonuts();
  const chocolateCake = useChocolateCake();
  const pizzaDough = usePizzaDough();
  const simpleSyrup = useSimpleSyrup();
  const vinaigrette = useVinaigrette();

  const recipes: Record<RecipeKey, SectionMachineChild> = {
    chocolateChipCookies,
    glazedDonuts,
    chocolateCake,
    pizzaDough,
    simpleSyrup,
    vinaigrette,
  };

  const [activeKey, setActiveKey] = useState<RecipeKey>('chocolateChipCookies');
  const active = recipes[activeKey];

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 03"
          title="recipe machine"
          kicker="ingredients in, yield out, every column"
          iconZone={<ChefHat size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          A recipe is a list of forge calls waiting to happen. Pick a recipe, scrub the batch
          slider, watch the yield march up top and the ingredient table translate live across US,
          UK, and metric. Six recipes range from a baker's dozen donuts to a single pizza.
        </>
      }
      menuZone={ORDER.map((key) => {
        const meta = RECIPE_META[key];
        return (
          <MenuPill
            key={key}
            active={key === activeKey}
            onClick={() => setActiveKey(key)}
            label={meta.label}
            hint={meta.hint}
          >
            {recipes[key].menuZone}
          </MenuPill>
        );
      })}
      widgetZone={
        <WidgetLayout
          key={activeKey}
          interactionZone={active.interactivityZone}
          codeZone={active.codeZone}
        />
      }
    />
  );
}
