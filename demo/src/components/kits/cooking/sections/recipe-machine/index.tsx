// Recipe machine chassis. Different recipes, same kind of forge moment:
// a US-customary recipe card translated into UK imperial alongside the
// metric ground truth, scaled by a batch slider that multiplies every
// ingredient row at once. Each recipe hook composes at this chassis;
// menu state is local useState; WidgetLayout is keyed by activeKey so
// the recipe subtree remounts on swap.

import { ChefHat } from 'lucide-react';
import { useState } from 'react';
import { MenuPill } from '~/components/kits/menu-pill.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '~/components/kits/section-layout.js';
import { useChocolateChipCookies } from './recipes/chocolate-chip-cookies.js';
import { useSimpleSyrup } from './recipes/simple-syrup.js';
import { useVinaigrette } from './recipes/vinaigrette.js';

type RecipeKey = 'chocolateChipCookies' | 'simpleSyrup' | 'vinaigrette';

interface RecipeMeta {
  label: string;
  hint: string;
}

const ORDER: readonly RecipeKey[] = ['chocolateChipCookies', 'simpleSyrup', 'vinaigrette'];

const RECIPE_META: Record<RecipeKey, RecipeMeta> = {
  chocolateChipCookies: {
    label: 'chocolate chip cookies',
    hint: 'sticks of butter, cups of flour, US classic',
  },
  simpleSyrup: { label: 'simple syrup', hint: '1:1 by volume; ratio is the invariant' },
  vinaigrette: { label: 'vinaigrette', hint: 'cup → tbsp → tsp → pinch full ladder' },
};

export function RecipeMachine() {
  const chocolateChipCookies = useChocolateChipCookies();
  const simpleSyrup = useSimpleSyrup();
  const vinaigrette = useVinaigrette();

  const recipes: Record<RecipeKey, ReturnType<typeof useChocolateChipCookies>> = {
    chocolateChipCookies,
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
          kicker="every cup, every column"
          iconZone={<ChefHat size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          A recipe is a list of forge calls waiting to happen. Pick a recipe, scrub the batch
          slider, watch the same dish translate live across US customary, UK imperial, and metric.
          The ingredient table is the readout; the slider is the input; the kit is the math.
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
