// Chocolate cake. Classic American 9-inch round, single layer (scale
// the batch slider 2× to bake two layers and stack with frosting).
// One batch yields 8 slices. Heavy on sugar and cocoa by volume;
// mixes the cup ladder with tablespoons of cocoa and teaspoons of
// leavener.

import { CakeSlice } from 'lucide-react';
import { useState } from 'react';
import {
  cupUk,
  cupUs,
  milliliter,
  stickOfButter,
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
    id: 'butter',
    name: 'butter (room temp)',
    amount: 2,
    sourceUnit: stickOfButter,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'sugar',
    name: 'sugar',
    amount: 2,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'flour',
    name: 'flour (scoop & sweep)',
    amount: 1.75,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    // 1/2 cup cocoa (= 8 tbsp ≈ 42 g) is the lower bound of a real
    // chocolate cake; less than this and you have a vanilla cake
    // that's seen a photograph of a chocolate cake.
    id: 'cocoa',
    name: 'cocoa powder',
    amount: 8,
    sourceUnit: tablespoonUs,
    ukUnit: tablespoonUk,
    metricUnit: milliliter,
  },
  {
    // 3 large eggs by volume; ~1/4 cup of beaten whole egg per large
    // egg is the standard cookbook conversion. Listing as volume keeps
    // the table consistent with the kit's volume-only scope.
    id: 'eggs',
    name: 'eggs (3 large)',
    amount: 0.75,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'milk',
    name: 'buttermilk',
    amount: 1,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'baking-soda',
    name: 'baking soda',
    amount: 1.5,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'salt',
    name: 'salt',
    amount: 0.5,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'vanilla',
    name: 'vanilla extract',
    amount: 2,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
];

const ITEMS_PER_BATCH = 8;

export function useChocolateCake() {
  const [scale, setScale] = useState(1);

  return {
    menuZone: <CakeSlice size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <RecipeCard
            title="chocolate cake"
            scale={scale}
            ingredients={INGREDIENTS}
            itemsPerBatch={ITEMS_PER_BATCH}
            itemNoun="slices"
            ItemIcon={CakeSlice}
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
            value={`${Math.round(ITEMS_PER_BATCH * scale)} slices (one 9-inch round, single layer)`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={`import { forge } from 'unitforge';
import { stickOfButter, milliliter } from 'unitforge/kits/cooking';

// Butter is the structural fat; everything else scales off it.
forge(stickOfButter, milliliter)(${(2 * scale).toFixed(2)}); // ${(2 * scale * 118.29411825).toFixed(2)}
`}
      />
    ),
  };
}
