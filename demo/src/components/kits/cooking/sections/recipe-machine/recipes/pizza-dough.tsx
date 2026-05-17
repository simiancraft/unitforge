// Pizza dough. Neapolitan-leaning, a respectable home-oven version
// using all-purpose flour rather than 00 (00 needs a 900°F oven to
// behave). One batch makes one 12-inch pizza, sliced 8 ways. The
// teaspoons of yeast and salt are where the pinch / tsp ladder
// matters; everything else is cup-scale.

import { Pizza } from 'lucide-react';
import { useState } from 'react';
import {
  cupUk,
  cupUs,
  milliliter,
  tablespoonUk,
  tablespoonUs,
  teaspoonUk,
  teaspoonUs,
} from 'unitforge/kits/cooking';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { ControlPanel } from '../../../control-panel.js';
import { type Ingredient, RecipeCard } from '../parts/recipe-card.js';

const INGREDIENTS: ReadonlyArray<Ingredient> = [
  {
    id: 'flour',
    name: 'flour, AP or bread (scoop & sweep)',
    amount: 2.5,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'water',
    name: 'water, warm',
    amount: 1,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'olive-oil',
    name: 'olive oil',
    amount: 2,
    sourceUnit: tablespoonUs,
    ukUnit: tablespoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'yeast',
    name: 'instant yeast',
    amount: 1,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'salt',
    name: 'salt',
    amount: 1.5,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'sauce',
    name: 'crushed tomatoes',
    amount: 0.75,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    // 1 cup shredded low-moisture mozzarella for a 12-inch pie is the
    // standard US pizzeria amount; less and the cheese doesn't cover,
    // more and it pools.
    id: 'mozzarella',
    name: 'mozzarella, shredded',
    amount: 1,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
];

const ITEMS_PER_BATCH = 8;

export function usePizzaDough() {
  const [scale, setScale] = useState(1);

  return {
    menuZone: <Pizza size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <RecipeCard
            title="pizza, 12-inch"
            scale={scale}
            ingredients={INGREDIENTS}
            itemsPerBatch={ITEMS_PER_BATCH}
            itemNoun="slices"
            ItemIcon={Pizza}
          />
        }
        controlsZone={
          <Slider
            label="batch size"
            value={scale}
            min={0.5}
            max={4}
            step={0.5}
            onChange={setScale}
            suffix="× batch"
          />
        }
        resultsZone={
          <Result
            label="yield"
            value={`${Math.round(ITEMS_PER_BATCH * scale)} slices (1 × 12-inch pizza)`}
            variant="hero"
            valueClassName="text-base"
          />
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={`import { forge } from 'unitforge';
import { cupUs, cupUk, milliliter } from 'unitforge/kits/cooking';

// Pizza dough is hydration-driven; at scoop-and-sweep (~150 g/cup),
// 2.5 cups flour to 1 cup water = ~64% hydration, a beginner-friendly
// home-oven dough.
forge(cupUs, milliliter)(${(2.5 * scale).toFixed(2)}); // ${(2.5 * scale * 236.5882365).toFixed(2)}
`}
      />
    ),
  };
}
