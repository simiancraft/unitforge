// Chocolate chip cookies, US classic. Sticks of butter, cups of sugar,
// cups of flour-by-volume (the famous US "scoop and sweep"; not strictly
// accurate vs mass-based baking but the conventional measure in US
// recipes), teaspoons of vanilla and baking soda. Translated to UK
// imperial: every cup becomes a UK cup with the ~20% gap baked in,
// every tablespoon becomes a UK tablespoon.

import { Cookie } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import {
  cupUk,
  cupUs,
  milliliter,
  stickOfButter,
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
    name: 'butter',
    amount: 2,
    sourceUnit: stickOfButter,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'granulated-sugar',
    name: 'granulated sugar',
    amount: 0.75,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'brown-sugar',
    name: 'brown sugar',
    amount: 0.75,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'flour',
    name: 'flour (scoop & sweep)',
    amount: 2.25,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'vanilla',
    name: 'vanilla extract',
    amount: 1,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'baking-soda',
    name: 'baking soda',
    amount: 1,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'chocolate-chips',
    name: 'chocolate chips',
    amount: 2,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
];

const ITEMS_PER_BATCH = 24;

export function useChocolateChipCookies() {
  const [scale, setScale] = useState(1);

  return {
    menuZone: <Cookie size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <RecipeCard
            title="chocolate chip cookies"
            scale={scale}
            ingredients={INGREDIENTS}
            itemsPerBatch={ITEMS_PER_BATCH}
            itemNoun="cookies"
            ItemIcon={Cookie}
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
            value={`${Math.round(ITEMS_PER_BATCH * scale)} cookies`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(scale)} />,
  };
}

function buildCode(scale: number): string {
  const flourCups = 2.25 * scale;
  const butterSticks = 2 * scale;
  const flourMl = forge(cupUs, milliliter)(flourCups);
  const flourUkCup = forge(cupUs, cupUk)(flourCups);
  const butterMl = forge(stickOfButter, milliliter)(butterSticks);
  return `import { forge } from 'unitforge';
import { cupUs, cupUk, stickOfButter, milliliter } from 'unitforge/kits/cooking';

// One row from the recipe card, computed live:
const flourCups = ${flourCups.toFixed(2)}; // 2.25 cup_us × ${scale.toFixed(2)} batch
const flourMl   = forge(cupUs, milliliter)(flourCups); // ${flourMl.toFixed(2)}
const flourUkCup = forge(cupUs, cupUk)(flourCups);     // ${flourUkCup.toFixed(2)}

// 2 sticks of butter, scaled:
const butterMl = forge(stickOfButter, milliliter)(${butterSticks.toFixed(2)}); // ${butterMl.toFixed(2)}
`;
}
