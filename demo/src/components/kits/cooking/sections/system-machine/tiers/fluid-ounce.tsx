// Fluid-ounce tier of the system machine. The inversion: a US fluid
// ounce (29.574 mL) is LARGER than a UK fluid ounce (28.413 mL),
// even though the US cup is SMALLER than the UK cup. The arithmetic:
// US has 8 fl oz per cup, UK has 10 fl oz per cup; the per-ounce
// volume falls out the other way.

import { Wine } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { fluidOunceUk, fluidOunceUs, milliliter } from 'unitforge/kits/cooking';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { ControlPanel } from '../../../control-panel.js';
import { PourPair } from '../parts/pour-pair.js';

const MAX_COUNT = 16;
const MAX_ML = forge(fluidOunceUs, milliliter)(MAX_COUNT);

export function useFluidOunce() {
  const [count, setCount] = useState(8);
  const usMl = forge(fluidOunceUs, milliliter)(count);
  const ukMl = forge(fluidOunceUk, milliliter)(count);
  const gapMl = usMl - ukMl;

  return {
    menuZone: <Wine size={22} strokeWidth={1.6} />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <PourPair
            count={count}
            usMl={usMl}
            ukMl={ukMl}
            usSymbol={fluidOunceUs.symbol}
            ukSymbol={fluidOunceUk.symbol}
            maxMl={MAX_ML}
          />
        }
        controlsZone={
          <Slider
            label="how many fluid ounces?"
            value={count}
            min={1}
            max={MAX_COUNT}
            step={1}
            onChange={setCount}
            suffix="fl oz"
          />
        }
        resultsZone={
          <Result
            label={`${count} fl oz · US − UK gap (US is larger here, despite smaller cup)`}
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
import { fluidOunceUs, fluidOunceUk, milliliter } from 'unitforge/kits/cooking';

const usMl = forge(fluidOunceUs, milliliter)(${count}); // ${usMl.toFixed(3)}
const ukMl = forge(fluidOunceUk, milliliter)(${count}); // ${ukMl.toFixed(3)}

// Inversion: US cup is SMALLER than UK cup, but US fl oz is LARGER.
// The arithmetic: 1 US cup = 8 fl oz vs 1 UK cup = 10 fl oz.
`;
}
