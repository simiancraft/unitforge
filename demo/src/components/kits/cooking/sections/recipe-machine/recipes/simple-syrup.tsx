// Simple syrup. The bartender's 1:1 by volume of sugar and water,
// dissolved by gentle heat. The recipe is unit-agnostic — what matters
// is the RATIO — but you still need to pick a unit and scale it. This
// recipe demonstrates the conversion ladder from cup down to teaspoon
// for a tiny "I just need a few drinks" batch.

import { Wine } from 'lucide-react';
import { useState } from 'react';
import { cupUk, cupUs, milliliter, tablespoonUk, tablespoonUs } from 'unitforge/kits/cooking';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { ControlPanel } from '../../../control-panel.js';
import { type Ingredient, RecipeCard } from '../parts/recipe-card.js';

const INGREDIENTS: ReadonlyArray<Ingredient> = [
  {
    id: 'sugar',
    name: 'granulated sugar',
    amount: 1,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'water',
    name: 'water',
    amount: 1,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'lemon-zest',
    name: 'lemon zest (optional)',
    amount: 2,
    sourceUnit: tablespoonUs,
    ukUnit: tablespoonUk,
    metricUnit: milliliter,
  },
];

export function useSimpleSyrup() {
  const [scale, setScale] = useState(1);

  return {
    menuZone: <Wine size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <RecipeCard title="simple syrup (1:1)" scale={scale} ingredients={INGREDIENTS} />
        }
        controlsZone={
          <Slider
            label="batch size"
            value={scale}
            min={0.25}
            max={4}
            step={0.25}
            onChange={setScale}
            suffix="× batch"
          />
        }
        resultsZone={
          <Result
            label="ratio invariant"
            value="sugar:water stays 1:1 by volume in any unit; only the absolute number changes"
            variant="hero"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(scale)} />,
  };
}

function buildCode(scale: number): string {
  const usCups = scale.toFixed(2);
  const usMl = (scale * 236.5882365).toFixed(2);
  const ukCups = (scale * 0.8326741882).toFixed(2);
  return `import { forge } from 'unitforge';
import { cupUs, cupUk, milliliter, tablespoonUs } from 'unitforge/kits/cooking';

// Sugar AND water at the same scale; the 1:1 ratio is the invariant.
const sugarUs = ${usCups}; // cup_us
const waterUs = ${usCups}; // cup_us

// Same recipe in three unit systems:
forge(cupUs, milliliter)(${usCups}); // ${usMl}
forge(cupUs, cupUk)(${usCups});      // ${ukCups}
forge(cupUs, tablespoonUs)(${usCups}); // ${(scale * 16).toFixed(2)}
`;
}
