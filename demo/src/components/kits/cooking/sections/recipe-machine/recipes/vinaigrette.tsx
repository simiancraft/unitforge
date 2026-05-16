// Vinaigrette. The 3:1 oil-to-acid baseline, plus a teaspoon of mustard
// emulsifier and a pinch of salt. Demonstrates the full ladder of small
// units: cup → tablespoon → teaspoon → pinch, all in one ingredient
// list. The pinch row is the kit's tradition unit; it converts cleanly
// to milliliters because the kit ships an exact 1/16-US-tsp factor for
// it.

import { Salad } from 'lucide-react';
import { useState } from 'react';
import {
  cupUk,
  cupUs,
  milliliter,
  pinch,
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
    id: 'olive-oil',
    name: 'olive oil',
    amount: 0.75,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'red-wine-vinegar',
    name: 'red wine vinegar',
    amount: 4,
    sourceUnit: tablespoonUs,
    ukUnit: tablespoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'dijon-mustard',
    name: 'dijon mustard',
    amount: 1,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'honey',
    name: 'honey',
    amount: 1,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'salt',
    name: 'salt',
    amount: 2,
    sourceUnit: pinch,
    ukUnit: pinch,
    metricUnit: milliliter,
  },
];

export function useVinaigrette() {
  const [scale, setScale] = useState(1);

  return {
    menuZone: <Salad size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <RecipeCard title="vinaigrette (3:1)" scale={scale} ingredients={INGREDIENTS} />
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
            label="full ladder"
            value="cup → tablespoon → teaspoon → pinch all in one ingredient list; same dimension"
            variant="hero"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(scale)} />,
  };
}

function buildCode(scale: number): string {
  const pinchCount = (2 * scale).toFixed(0);
  const pinchMl = (2 * scale * (29.5735295625 / 6 / 16)).toFixed(3);
  return `import { forge } from 'unitforge';
import { pinch, teaspoonUs, milliliter } from 'unitforge/kits/cooking';

// Pinch is a real unit in this kit (1/16 US teaspoon ≈ 0.31 mL).
// It forges against everything else in the VOLUME dimension.
const saltMl = forge(pinch, milliliter)(${pinchCount}); // ${pinchMl}
const saltTsp = forge(pinch, teaspoonUs)(${pinchCount}); // ${((2 * scale) / 16).toFixed(3)}

// Two pinches make one dash (kitchen tradition; exact in this kit):
forge(pinch, teaspoonUs)(2); // ${(2 / 16).toFixed(3)} (= 1/8 tsp = 1 dash)
`;
}
