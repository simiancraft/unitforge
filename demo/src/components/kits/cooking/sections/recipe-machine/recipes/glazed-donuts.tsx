// Glazed donuts. Classic yeast-raised, US-style ring donut. One batch
// yields a baker's dozen (13 donuts; one extra for the baker). Uses
// cups of flour and milk plus eggs, butter, and sugar by volume;
// powdered sugar thinned with milk for the glaze. The teaspoon ladder
// shows up for yeast, salt, and nutmeg.

import { Donut } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
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
    id: 'flour',
    name: 'flour (scoop & sweep)',
    amount: 3.5,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'milk',
    name: 'milk, warm',
    amount: 1,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'sugar',
    name: 'sugar',
    amount: 0.25,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    // 2 large eggs ≈ 1/2 cup beaten. Enriched yeast dough needs eggs
    // for tenderness and color; without them you have a dinner roll
    // fried in oil.
    id: 'eggs',
    name: 'eggs (2 large)',
    amount: 0.5,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    // 1/2 stick (1/4 cup) softened butter is the fat that makes a
    // donut a donut. Without it the crumb is bread, not cake-donut.
    id: 'butter',
    name: 'butter (softened)',
    amount: 0.5,
    sourceUnit: stickOfButter,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    id: 'yeast',
    name: 'active dry yeast',
    amount: 2.25,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'salt',
    name: 'salt',
    amount: 1,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'nutmeg',
    name: 'nutmeg, grated',
    amount: 0.25,
    sourceUnit: teaspoonUs,
    ukUnit: teaspoonUk,
    metricUnit: milliliter,
  },
  {
    id: 'glaze-sugar',
    name: 'glaze: powdered sugar',
    amount: 1.5,
    sourceUnit: cupUs,
    ukUnit: cupUk,
    metricUnit: milliliter,
  },
  {
    // Glaze liquid: powdered sugar alone is not glaze. 2 tbsp milk
    // (or water) makes a pourable opaque coat at typical room temp.
    id: 'glaze-milk',
    name: 'glaze: milk',
    amount: 2,
    sourceUnit: tablespoonUs,
    ukUnit: tablespoonUk,
    metricUnit: milliliter,
  },
];

const ITEMS_PER_BATCH = 13;

export function useGlazedDonuts() {
  const [scale, setScale] = useState(1);
  // INGREDIENTS is a literal-defined non-empty array; index 0 is always
  // `flour` (the row the yield row inflates). The `!` clears
  // noUncheckedIndexedAccess; runtime safety is enforced by the file
  // shape itself.
  const flourCups = INGREDIENTS[0]!.amount * scale;
  const flourMl = forge(cupUs, milliliter)(flourCups);

  return {
    menuZone: <Donut size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <RecipeCard
            title="glazed donuts"
            scale={scale}
            ingredients={INGREDIENTS}
            itemsPerBatch={ITEMS_PER_BATCH}
            itemNoun="donuts (baker's dozen)"
            ItemIcon={Donut}
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
            value={`${Math.round(ITEMS_PER_BATCH * scale)} donuts`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={`import { forge } from 'unitforge';
import { cupUs, cupUk, milliliter } from 'unitforge/kits/cooking';

// Yeast donuts are flour-driven; the rest of the dough scales off this.
const flourCups = ${flourCups.toFixed(2)};
forge(cupUs, milliliter)(flourCups); // ${flourMl.toFixed(2)}
forge(cupUs, cupUk)(flourCups); // ${forge(cupUs, cupUk)(flourCups).toFixed(2)}
`}
      />
    ),
  };
}
