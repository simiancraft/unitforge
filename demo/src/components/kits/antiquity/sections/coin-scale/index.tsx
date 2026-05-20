// The coin scale. Numismatic mass comparator. Coin weights are the
// antiquity kit's killer everyday referent: a denarius was a day's
// wage, the Tyrian shekel was the thirty pieces of silver, the
// Constantinian solidus held its weight for ~700 years as the
// Byzantine gold standard.
//
// The bars forge each coin to grams. Because every antiquity MASS atom
// shares `dimension: MASS` with kits/mass, the gram anchor is imported
// from kits/mass and the forge is a real within-dimension call; the
// code sample shows the cross-kit import, which is the dimension-
// sharing point the kit's docs warn about (great for numismatics, not
// for clinical dosing).

import { Coins } from 'lucide-react';
import { forge } from 'unitforge';
import { gram } from 'unitforge/kits/mass';
import { CodeBlock } from '~/components/ui/code-block.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';
import { COIN_SCALE, type CoinEntry } from '../../units.js';

const METAL_CHIP: Record<CoinEntry['metal'], string> = {
  gold: 'border-uf-accent text-uf-accent',
  silver: 'border-uf-accent-2 text-uf-accent-2',
};

export function CoinScale() {
  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 03"
          title="the coin scale"
          kicker="the weight of antiquity, in grams"
          iconZone={<Coins size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          A denarius was a laborer's daily wage; thirty Tyrian shekels was the betrayal price; the
          solidus held its weight for seven centuries. Coin masses are the antiquity kit's most
          tangible referent. Each bar forges a coin to grams; because these atoms share the MASS
          dimension with the modern mass kit, the gram anchor comes from kits/mass. Numismatics, not
          clinical dosing.
        </>
      }
      widgetZone={
        <WidgetLayout interactionZone={<CoinChart />} codeZone={<CodeBlock code={buildCode()} />} />
      }
    />
  );
}

// Bar chart. Forges each coin to grams, scales bar widths to the
// heaviest coin in the set. Sink component; no props (the coin set is
// module-constant).
function CoinChart() {
  const measured = COIN_SCALE.map((c) => ({ coin: c, grams: forge(c.unit, gram)(1) }));
  const maxGrams = Math.max(...measured.map((m) => m.grams));

  return (
    <div className="flex flex-col gap-4 rounded-md border border-uf-border bg-uf-card p-4">
      <span className="uf-eyebrow">1 coin, in grams</span>
      {measured.map(({ coin, grams }) => (
        <CoinBar key={coin.unit.id} coin={coin} grams={grams} widthPct={(grams / maxGrams) * 100} />
      ))}
    </div>
  );
}

interface CoinBarProps {
  coin: CoinEntry;
  grams: number;
  widthPct: number;
}

function CoinBar({ coin, grams, widthPct }: CoinBarProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-2">
          <span className="mono text-xs uppercase tracking-wider text-uf-fg">
            {coin.unit.label}
          </span>
          <span
            className={`rounded-full border px-1.5 py-px text-[9px] uppercase tracking-wider ${METAL_CHIP[coin.metal]}`}
          >
            {coin.metal}
          </span>
        </span>
        <span className="mono text-sm">
          <span className="text-uf-fg tabular-nums">{formatMagnitude(grams)}</span>
          <span className="ml-1 text-xs text-uf-muted">g</span>
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-sm bg-uf-bg">
        <div
          className="h-full rounded-sm bg-uf-accent"
          style={{ width: `${widthPct}%` }}
          aria-hidden
        />
      </div>
      <p className="text-[11px] leading-snug text-uf-muted">
        {coin.civ}: {coin.hook}
      </p>
    </div>
  );
}

function buildCode(): string {
  const names = [...new Set(COIN_SCALE.map((c) => toJsName(c.unit.id)))];
  const lines = COIN_SCALE.map((c) => {
    const g = forge(c.unit, gram)(1);
    return `forge(${toJsName(c.unit.id)}, gram)(1); // ${c.civ}: ${formatMagnitude(g)} g`;
  }).join('\n');

  return `import { forge } from 'unitforge';
import { ${names.join(', ')} } from 'unitforge/kits/antiquity';
import { gram } from 'unitforge/kits/mass'; // shared MASS dimension

// one coin of each, in grams
${lines}
`;
}
