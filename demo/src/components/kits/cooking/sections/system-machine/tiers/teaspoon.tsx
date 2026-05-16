// Teaspoon tier of the system machine. US tsp = 1/6 US fl oz ≈
// 4.929 mL; UK tsp = 1/8 UK fl oz ≈ 3.553 mL. The US teaspoon is the
// LARGER teaspoon (the relationship inverts because US has 6 tsp per
// fl oz, UK has 8). Common cookbook rounding uses 5 mL for both;
// downstream call sites can apply via `forge`'s precision option.

import { Soup } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { milliliter, teaspoonUk, teaspoonUs } from 'unitforge/kits/cooking';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { ControlPanel } from '../../../control-panel.js';
import { PourPair } from '../parts/pour-pair.js';

const MAX_COUNT = 24;
const MAX_ML = forge(teaspoonUs, milliliter)(MAX_COUNT);

export function useTeaspoon() {
  const [count, setCount] = useState(6);
  const usMl = forge(teaspoonUs, milliliter)(count);
  const ukMl = forge(teaspoonUk, milliliter)(count);
  const gapMl = usMl - ukMl;

  return {
    menuZone: <Soup size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <PourPair
            count={count}
            usMl={usMl}
            ukMl={ukMl}
            usSymbol={teaspoonUs.symbol}
            ukSymbol={teaspoonUk.symbol}
            maxMl={MAX_ML}
          />
        }
        controlsZone={
          <Slider
            label="how many teaspoons?"
            value={count}
            min={1}
            max={MAX_COUNT}
            step={1}
            onChange={setCount}
            suffix="tsp"
          />
        }
        resultsZone={
          <Result
            label={`${count} tsp · US − UK gap (US is larger)`}
            value={`${gapMl.toFixed(2)} mL (≈ ${((gapMl / ukMl) * 100).toFixed(1)}% larger US)`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(count, usMl, ukMl)} />,
  };
}

function buildCode(count: number, usMl: number, ukMl: number): string {
  return `import { forge } from 'unitforge';
import { teaspoonUs, teaspoonUk, milliliter } from 'unitforge/kits/cooking';

const usMl = forge(teaspoonUs, milliliter)(${count}); // ${usMl.toFixed(2)}
const ukMl = forge(teaspoonUk, milliliter)(${count}); // ${ukMl.toFixed(2)}

// US teaspoon is LARGER than UK teaspoon — the cup/oz pairing
// inverts at the teaspoon level (6 tsp per US fl oz vs 8 tsp per UK).
`;
}
