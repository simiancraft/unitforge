// Regional comparator. 斤 is one character with three modern weights;
// this machine makes the spread visible at a glance. PRC mainland
// market jin (500 g), HK / Taiwan 司馬斤 (600 g), Singapore / Malaysia
// statutory catty (604.79 g, 4/3 lb avoirdupois).
//
// Layout follows the cooking international-comparator pattern: pick a
// quantity; three region cards render the kg + lb outcome with delta
// pills against PRC; a Result hero at the bottom carries the punchy
// percent gap as a single live readout. No prose blob at the bottom;
// the educational context lives up in the section intro.

import { Coins } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { cattySg, jinHk, jinPrc, kilogram, pound } from 'unitforge/kits/mass';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { formatMagnitude } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';

interface JinCard {
  /** Region label rendered above the value. */
  region: string;
  /** Native-script label rendered as a chip. */
  shortLabel: string;
  /** kg value for the current jin quantity. */
  inKg: number;
  /** lb value for the current jin quantity. */
  inLb: number;
  /** Percentage delta from the PRC baseline. */
  deltaPct: number;
}

export function ThreeJinsMachine() {
  const [quantity, setQuantity] = useState(10);

  const prcKg = forge(jinPrc, kilogram)(quantity);
  const hkKg = forge(jinHk, kilogram)(quantity);
  const sgKg = forge(cattySg, kilogram)(quantity);

  const cards: JinCard[] = [
    {
      region: 'PRC mainland',
      shortLabel: '市斤 / shìjīn',
      inKg: prcKg,
      inLb: forge(jinPrc, pound)(quantity),
      deltaPct: 0,
    },
    {
      region: 'HK / Taiwan',
      shortLabel: '司馬斤 / sī mǎ jīn',
      inKg: hkKg,
      inLb: forge(jinHk, pound)(quantity),
      deltaPct: ((hkKg - prcKg) / prcKg) * 100,
    },
    {
      region: 'Singapore / Malaysia',
      shortLabel: 'catty · 4/3 lb',
      inKg: sgKg,
      inLb: forge(cattySg, pound)(quantity),
      deltaPct: ((sgKg - prcKg) / prcKg) * 100,
    },
  ];

  // Hero result: the headline gap (HK vs PRC, the canonical 20% case
  // every cross-border buyer knows). A single live readout that
  // updates with the slider.
  const hkPct = ((hkKg - prcKg) / prcKg) * 100;
  const hkGapKg = hkKg - prcKg;
  const heroValue = `HK ${hkPct.toFixed(1)}% heavier than PRC (+${formatMagnitude(hkGapKg)} kg)`;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="regional comparator"
          kicker="three jins · 20% spread"
          iconZone={<Coins size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          斤 is one character with three modern weights: PRC market jin at 500 g (1959 metrology
          reform), HK / Taiwan 司馬斤 at 600 g, and Singapore / Malaysia statutory catty at 604.79 g
          (4/3 lb avoirdupois). Cross-border dried-goods procurement runs on this disambiguation.
          Pick a quantity; the cards diverge on the kilogram axis.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <ThreeJinsWidget
              quantity={quantity}
              onQuantityChange={setQuantity}
              cards={cards}
              heroValue={heroValue}
            />
          }
          codeZone={<CodeBlock code={buildCode(quantity, prcKg, hkKg, sgKg)} />}
        />
      }
    />
  );
}

interface ThreeJinsWidgetProps {
  quantity: number;
  onQuantityChange: (next: number) => void;
  cards: JinCard[];
  heroValue: string;
}

function ThreeJinsWidget({ quantity, onQuantityChange, cards, heroValue }: ThreeJinsWidgetProps) {
  return (
    <div className="flex flex-col gap-5">
      <Slider
        label="order quantity"
        value={quantity}
        min={1}
        max={100}
        step={1}
        onChange={onQuantityChange}
        suffix="jin"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <JinCardView key={card.shortLabel} card={card} />
        ))}
      </div>

      <Result
        label={`at ${quantity} jin`}
        value={heroValue}
        variant="hero"
        valueClassName="text-base"
      />
    </div>
  );
}

function JinCardView({ card }: { card: JinCard }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-uf-border bg-uf-card p-4">
      <span className="uf-eyebrow">{card.region}</span>
      <span className="mono text-xs text-uf-muted">{card.shortLabel}</span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="mono text-3xl font-semibold text-uf-fg tabular-nums">
          {formatMagnitude(card.inKg)}
        </span>
        <span className="text-sm text-uf-muted">kg</span>
      </div>
      <div className="mono text-sm text-uf-muted tabular-nums">{formatMagnitude(card.inLb)} lb</div>
      <DeltaPill deltaPct={card.deltaPct} />
    </div>
  );
}

function DeltaPill({ deltaPct }: { deltaPct: number }) {
  if (deltaPct === 0) {
    return (
      <span className="mt-1 inline-block w-fit rounded-full border border-uf-border bg-uf-card px-2 py-0.5 text-[10px] uppercase tracking-wider text-uf-muted">
        baseline
      </span>
    );
  }
  const sign = deltaPct > 0 ? '+' : '';
  return (
    <span className="mt-1 inline-block w-fit rounded-full border border-uf-accent bg-uf-card px-2 py-0.5 text-[10px] font-medium text-uf-accent">
      {sign}
      {deltaPct.toFixed(1)}% vs PRC
    </span>
  );
}

function buildCode(quantity: number, prcKg: number, hkKg: number, sgKg: number): string {
  return `import { forge } from 'unitforge';
import { cattySg, jinHk, jinPrc, kilogram } from 'unitforge/kits/mass';

const prc = forge(jinPrc, kilogram)(${quantity}); // ${formatMagnitude(prcKg)}
const hk  = forge(jinHk,  kilogram)(${quantity}); // ${formatMagnitude(hkKg)}
const sg  = forge(cattySg, kilogram)(${quantity}); // ${formatMagnitude(sgKg)}
`;
}
