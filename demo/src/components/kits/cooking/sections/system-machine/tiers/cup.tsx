// Cup tier of the system machine. The headline split: a US cup is 8 US
// fluid ounces (236.588 mL); a UK cup is 10 UK fluid ounces
// (284.131 mL). Same word, ~20% different volume; mixing them ruins
// the dish. `useCup` returns the menu glyph, the side-by-side pour
// visualization with a count slider and a hero "apparent gap" readout,
// and the live code template.

import { Coffee } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { cupUk, cupUs, milliliter } from 'unitforge/kits/cooking';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { ControlPanel } from '../../../control-panel.js';
import { PourPair } from '../parts/pour-pair.js';

const MAX_COUNT = 8;
const MAX_ML = forge(cupUk, milliliter)(MAX_COUNT);

export function useCup() {
  const [count, setCount] = useState(1);
  const usMl = forge(cupUs, milliliter)(count);
  const ukMl = forge(cupUk, milliliter)(count);
  const gapMl = ukMl - usMl;

  return {
    menuZone: <Coffee size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <PourPair
            count={count}
            usMl={usMl}
            ukMl={ukMl}
            usSymbol={cupUs.symbol}
            ukSymbol={cupUk.symbol}
            maxMl={MAX_ML}
          />
        }
        controlsZone={
          <Slider
            label="how many cups?"
            value={count}
            min={0.25}
            max={MAX_COUNT}
            step={0.25}
            onChange={setCount}
            suffix="cups"
          />
        }
        resultsZone={
          <Result
            label={`${count} cup${count === 1 ? '' : 's'} · UK − US gap`}
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
import { cupUs, cupUk, milliliter } from 'unitforge/kits/cooking';

const usMl = forge(cupUs, milliliter)(${count.toFixed(2)}); // ${usMl.toFixed(2)}
const ukMl = forge(cupUk, milliliter)(${count.toFixed(2)}); // ${ukMl.toFixed(2)}

// Mixing US cup vs UK cup ruins the dish:
forge(cupUs, cupUk)(1); // ≈ 0.833 (NOT 1)
`;
}
