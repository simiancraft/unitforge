// Three-jins machine. The killer regional-disambiguation demo: pick an
// order quantity (in jin), see what you'd actually get in each region.
// PRC mainland market jin (500 g), HK / Taiwan catty (600 g), and
// Singapore / Malaysia statutory catty (604.79 g) all share the
// character 斤 and look identical on a wholesale invoice; they differ
// by up to 21% on the kilogram outcome.
//
// Visual: three side-by-side cards, one per region, each rendering the
// same nominal jin value into kg and lb. A delta pill against the PRC
// baseline makes the gap loud. A footer narrative grounds the gap in a
// concrete cross-border-procurement scenario.

import { Coins } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { cattySg, jinHk, jinPrc, kilogram, pound } from 'unitforge/kits/mass';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Slider } from '~/components/ui/slider.js';
import { formatMagnitude } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';

interface JinCard {
  /** Region label rendered above the value. */
  region: string;
  /** Short code label rendered as a chip. */
  shortLabel: string;
  /** kg value for a given jin quantity. */
  inKg: number;
  /** lb value for a given jin quantity. */
  inLb: number;
  /** Percentage delta from the PRC baseline; rendered as a pill. */
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
      region: 'Hong Kong / Taiwan',
      shortLabel: '司馬斤 / sī mǎ jīn',
      inKg: hkKg,
      inLb: forge(jinHk, pound)(quantity),
      deltaPct: ((hkKg - prcKg) / prcKg) * 100,
    },
    {
      region: 'Singapore / Malaysia',
      shortLabel: 'catty (4/3 lb)',
      inKg: sgKg,
      inLb: forge(cattySg, pound)(quantity),
      deltaPct: ((sgKg - prcKg) / prcKg) * 100,
    },
  ];

  // The cross-border-procurement gap in absolute kg; what the headline
  // sentence quantifies for a working buyer.
  const hkMinusPrcKg = hkKg - prcKg;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="three jins"
          kicker="same character, three different weights"
          iconZone={<Coins size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          斤 is one character with three modern weights. PRC mainland market jin is 500 g exactly
          (1959 metrology reform). HK and Taiwan keep the historical 司馬斤 at 600 g. Singapore and
          Malaysia codified the customs catty at 604.79 g (4/3 lb avoirdupois exact) under the
          Straits Settlements. Three regions, one character, up to 21% drift. Pick a quantity below;
          watch the kilogram outcomes diverge.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <ThreeJinsWidget
              quantity={quantity}
              onQuantityChange={setQuantity}
              cards={cards}
              hkMinusPrcKg={hkMinusPrcKg}
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
  hkMinusPrcKg: number;
}

function ThreeJinsWidget({
  quantity,
  onQuantityChange,
  cards,
  hkMinusPrcKg,
}: ThreeJinsWidgetProps) {
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

      <ProcurementCaveat quantity={quantity} hkMinusPrcKg={hkMinusPrcKg} />
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

function ProcurementCaveat({ quantity, hkMinusPrcKg }: { quantity: number; hkMinusPrcKg: number }) {
  return (
    <p className="text-sm leading-relaxed text-uf-muted">
      <span className="mono text-uf-accent">
        {quantity} 斤 PRC → {quantity} 斤 HK
      </span>{' '}
      is a <span className="mono text-uf-accent-2">+{formatMagnitude(hkMinusPrcKg)} kg</span> gap.
      Same character on the wholesale invoice, same nominal quantity; the kilogram total diverges by
      20%. The Singapore catty closes the gap a hair further (+0.8% vs HK). Cross-border dried-goods
      procurement runs on this disambiguation; this kit ships all three.
    </p>
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
