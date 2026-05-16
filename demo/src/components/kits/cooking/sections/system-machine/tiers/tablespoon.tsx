// Tablespoon tier of the system machine. US tbsp = 1/2 US fl oz ≈
// 14.787 mL; UK tbsp = 5/8 UK fl oz ≈ 17.758 mL. The UK tablespoon is
// ~20% larger than the US one. Australian tablespoons are 20 mL again
// (different from both); not shipped here, define your own kit.

import { Utensils } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { milliliter, tablespoonUk, tablespoonUs } from 'unitforge/kits/cooking';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { ControlPanel } from '../../../control-panel.js';
import { PourPair } from '../parts/pour-pair.js';

const MAX_COUNT = 16;
const MAX_ML = forge(tablespoonUk, milliliter)(MAX_COUNT);

export function useTablespoon() {
  const [count, setCount] = useState(3);
  const usMl = forge(tablespoonUs, milliliter)(count);
  const ukMl = forge(tablespoonUk, milliliter)(count);
  const gapMl = ukMl - usMl;

  return {
    menuZone: <Utensils size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <PourPair
            count={count}
            usMl={usMl}
            ukMl={ukMl}
            usSymbol={tablespoonUs.symbol}
            ukSymbol={tablespoonUk.symbol}
            maxMl={MAX_ML}
          />
        }
        controlsZone={
          <Slider
            label="how many tablespoons?"
            value={count}
            min={1}
            max={MAX_COUNT}
            step={1}
            onChange={setCount}
            suffix="tbsp"
          />
        }
        resultsZone={
          <Result
            label={`${count} tbsp · UK − US gap`}
            value={`${gapMl.toFixed(2)} mL (≈ ${((gapMl / usMl) * 100).toFixed(1)}% larger UK)`}
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
import { tablespoonUs, tablespoonUk, milliliter } from 'unitforge/kits/cooking';

const usMl = forge(tablespoonUs, milliliter)(${count}); // ${usMl.toFixed(2)}
const ukMl = forge(tablespoonUk, milliliter)(${count}); // ${ukMl.toFixed(2)}

// AU tablespoons are 20 mL; not in this kit. defineUnit if you cook
// southern-hemisphere.
`;
}
