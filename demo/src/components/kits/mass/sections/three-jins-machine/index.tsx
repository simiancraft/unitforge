// Regional comparator. 斤 is one character with three modern weights;
// this machine makes the spread visible at a glance. PRC mainland
// market jin (500 g), HK / Taiwan 司馬斤 (600 g), Singapore / Malaysia
// statutory catty (604.79 g, 4/3 lb avoirdupois).
//
// Cards are click-to-select. The "last two clicked" form the active
// pair: clicking a third card drops the older selection (LIFO ring
// buffer of size 2). The Result hero reads the gap between the
// active pair, matching the cooking international-comparator cadence
// ("X heavier than Y by N%"). Per zone-composer §1.5 the three card
// states are named subcomponents (JinCardPrimary / JinCardSecondary
// / JinCardIdle) and the parent picks which to render; no role flag
// relayed to a single leaf.

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
  /** Stable id (the unit's id; used for selection equality). */
  id: string;
  /** Region label rendered above the value. */
  region: string;
  /** Region tag used in the Result hero ("PRC", "HK", "SG"). */
  shortTag: string;
  /** Native-script label rendered as a chip under the region. */
  shortLabel: string;
  /** kg value for the current jin quantity. */
  inKg: number;
  /** lb value for the current jin quantity. */
  inLb: number;
}

export function ThreeJinsMachine() {
  const [quantity, setQuantity] = useState(10);
  // Pair: [aId, bId] where aId is the most recently selected. Initial
  // pair is PRC + HK (the canonical 20% case the kit ships). Clicking
  // a third card drops bId; clicking an already-selected card is a
  // no-op (the pair is preserved).
  const [pair, setPair] = useState<readonly [string, string]>([jinPrc.id, jinHk.id]);

  const cards: readonly JinCard[] = [
    {
      id: jinPrc.id,
      region: 'PRC mainland',
      shortTag: 'PRC',
      shortLabel: '市斤 / shìjīn',
      inKg: forge(jinPrc, kilogram)(quantity),
      inLb: forge(jinPrc, pound)(quantity),
    },
    {
      id: jinHk.id,
      region: 'HK / Taiwan',
      shortTag: 'HK',
      shortLabel: '司馬斤 / sī mǎ jīn',
      inKg: forge(jinHk, kilogram)(quantity),
      inLb: forge(jinHk, pound)(quantity),
    },
    {
      id: cattySg.id,
      region: 'Singapore / Malaysia',
      shortTag: 'SG',
      shortLabel: 'catty · 4/3 lb',
      inKg: forge(cattySg, kilogram)(quantity),
      inLb: forge(cattySg, pound)(quantity),
    },
  ];

  const [aId, bId] = pair;
  const aCard = cards.find((c) => c.id === aId) ?? cards[0];
  const bCard = cards.find((c) => c.id === bId) ?? cards[1];
  const heroValue = buildHeroValue(aCard as JinCard, bCard as JinCard);

  // Selection shift: click any card to make it the new A; the old A
  // becomes the new B; the old B falls off. Clicking an
  // already-selected card preserves the pair (no-op).
  const handleSelect = (id: string) => {
    if (id === aId || id === bId) return;
    setPair([id, aId]);
  };

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
          Pick a quantity, then click any two regions to compare.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <ThreeJinsWidget
              quantity={quantity}
              onQuantityChange={setQuantity}
              cards={cards}
              aId={aId}
              bId={bId}
              onSelect={handleSelect}
              heroValue={heroValue}
            />
          }
          codeZone={<CodeBlock code={buildCode(quantity, aCard as JinCard, bCard as JinCard)} />}
        />
      }
    />
  );
}

interface ThreeJinsWidgetProps {
  quantity: number;
  onQuantityChange: (next: number) => void;
  cards: readonly JinCard[];
  aId: string;
  bId: string;
  onSelect: (id: string) => void;
  heroValue: string;
}

function ThreeJinsWidget({
  quantity,
  onQuantityChange,
  cards,
  aId,
  bId,
  onSelect,
  heroValue,
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
          <JinCardSwap
            key={card.id}
            card={card}
            role={card.id === aId ? 'primary' : card.id === bId ? 'secondary' : 'idle'}
            onSelect={onSelect}
          />
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

// Mini-chassis: pick the per-state subcomponent. Each leaf is named
// for its state (primary / secondary / idle); no `selected` boolean
// flag travels into the rendered JSX.
function JinCardSwap({
  card,
  role,
  onSelect,
}: {
  card: JinCard;
  role: 'primary' | 'secondary' | 'idle';
  onSelect: (id: string) => void;
}) {
  if (role === 'primary') return <JinCardPrimary card={card} onSelect={onSelect} />;
  if (role === 'secondary') return <JinCardSecondary card={card} onSelect={onSelect} />;
  return <JinCardIdle card={card} onSelect={onSelect} />;
}

function JinCardPrimary({ card, onSelect }: { card: JinCard; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(card.id)}
      aria-pressed="true"
      className="flex flex-col gap-2 rounded-lg border-2 border-uf-accent bg-uf-card p-4 text-left ring-1 ring-uf-accent transition-colors"
    >
      <RolePill label="A" tone="primary" />
      <JinCardBody card={card} tone="primary" />
    </button>
  );
}

function JinCardSecondary({ card, onSelect }: { card: JinCard; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(card.id)}
      aria-pressed="true"
      className="flex flex-col gap-2 rounded-lg border-2 border-uf-accent-2 bg-uf-card p-4 text-left ring-1 ring-uf-accent-2 transition-colors"
    >
      <RolePill label="B" tone="secondary" />
      <JinCardBody card={card} tone="secondary" />
    </button>
  );
}

function JinCardIdle({ card, onSelect }: { card: JinCard; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(card.id)}
      aria-pressed="false"
      className="flex flex-col gap-2 rounded-lg border border-uf-border bg-uf-card p-4 text-left transition-colors hover:border-uf-accent"
    >
      <RolePill label="click to compare" tone="idle" />
      <JinCardBody card={card} tone="idle" />
    </button>
  );
}

function JinCardBody({ card, tone }: { card: JinCard; tone: 'primary' | 'secondary' | 'idle' }) {
  const kgClass =
    tone === 'primary'
      ? 'mono text-3xl font-semibold text-uf-accent tabular-nums'
      : tone === 'secondary'
        ? 'mono text-3xl font-semibold text-uf-accent-2 tabular-nums'
        : 'mono text-3xl font-semibold text-uf-fg tabular-nums';
  return (
    <>
      <span className="uf-eyebrow">{card.region}</span>
      <span className="mono text-xs text-uf-muted">{card.shortLabel}</span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={kgClass}>{formatMagnitude(card.inKg)}</span>
        <span className="text-sm text-uf-muted">kg</span>
      </div>
      <div className="mono text-sm text-uf-muted tabular-nums">{formatMagnitude(card.inLb)} lb</div>
    </>
  );
}

function RolePill({ label, tone }: { label: string; tone: 'primary' | 'secondary' | 'idle' }) {
  if (tone === 'primary') {
    return (
      <span className="inline-block w-fit rounded-full bg-uf-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-uf-bg">
        {label}
      </span>
    );
  }
  if (tone === 'secondary') {
    return (
      <span className="inline-block w-fit rounded-full bg-uf-accent-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-uf-bg">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-block w-fit rounded-full border border-uf-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-uf-muted">
      {label}
    </span>
  );
}

function buildHeroValue(a: JinCard, b: JinCard): string {
  const gap = Math.abs(a.inKg - b.inKg);
  if (gap < 0.001) {
    return `equal at ${formatMagnitude(a.inKg)} kg`;
  }
  const heavier = a.inKg > b.inKg ? a : b;
  const lighter = a.inKg > b.inKg ? b : a;
  const pct = ((heavier.inKg - lighter.inKg) / lighter.inKg) * 100;
  return `${heavier.shortTag} heavier than ${lighter.shortTag} by ${pct.toFixed(0)}% (+${formatMagnitude(gap)} kg)`;
}

function buildCode(quantity: number, a: JinCard, b: JinCard): string {
  const aImport = importNameFor(a.id);
  const bImport = importNameFor(b.id);
  return `import { forge } from 'unitforge';
import { ${[aImport, bImport, 'kilogram'].sort().join(', ')} } from 'unitforge/kits/mass';

// A: ${a.region} at ${quantity} jin
const aKg = forge(${aImport}, kilogram)(${quantity}); // ${formatMagnitude(a.inKg)}

// B: ${b.region} at ${quantity} jin
const bKg = forge(${bImport}, kilogram)(${quantity}); // ${formatMagnitude(b.inKg)}
`;
}

function importNameFor(id: string): string {
  if (id === jinPrc.id) return 'jinPrc';
  if (id === jinHk.id) return 'jinHk';
  return 'cattySg';
}
