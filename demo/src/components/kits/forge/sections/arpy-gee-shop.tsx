// Arpy Gee Shop: the smallest demo that teaches both in-dimension AND
// cross-dimensional conversion in one widget. Two coins (silver, gold)
// share one dimension; gold.toBase: v * 10 carries the 10:1 rate. A
// shield lives in its own dimension; one cross-dim forge accepts mixed
// coin input and outputs how many shields the shopkeeper will sell.
//
// One forge, two lessons. The in-dim story IS gold.toBase; when the
// converter normalizes both sliders to silver-base, 10 silver and 1
// gold turn out to do the same job. The cross-dim story is the
// COIN → GOODS jump the conversion makes.
//
// Resource glyphs are emoji (lucide lacks silver/gold/shield coverage
// at this scale), keeping the demo playful and instantly recognizable.

import { useState } from 'react';
import { defineConversion, defineUnit, forge, type Unit } from 'unitforge';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { cn } from '~/lib/cn.js';
import { formatMagnitude } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';

// Namespaced dimension strings. When a kit ships publicly, prefix the
// dimension with your package or namespace so two third-party kits with
// the same nominal dimension don't silently forge against each other.
// The demo shows the convention by example; the README points here.
const COIN = 'arpygee/coin' as const;
const GOODS = 'arpygee/goods' as const;

const silverUnit = defineUnit({
  id: 'silver',
  label: 'Silver',
  symbol: '🥈',
  dimension: COIN,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});
const goldUnit = defineUnit({
  id: 'gold',
  label: 'Gold',
  symbol: '🥇',
  dimension: COIN,
  toBase: (v) => v * 10,
  fromBase: (b) => b / 10,
});
const shieldUnit = defineUnit({
  id: 'shield',
  label: 'Shield',
  symbol: '🛡️',
  dimension: GOODS,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

// 30 silver-base = 1 shield. Inputs arrive normalized to silver-base,
// so a gold slider tick contributes 10x what a silver slider tick does;
// that's the in-dim lesson made tangible inside the cross-dim compute.
const forgeShield = defineConversion({
  inputs: { silver: COIN, gold: COIN },
  output: GOODS,
  validate: {
    silver: (v) => v >= 0 || 'silver must be >= 0',
    gold: (v) => v >= 0 || 'gold must be >= 0',
  },
  compute: ({ silver, gold }) => Math.floor((silver + gold) / 30),
});

const shieldsFor = forge({ silver: silverUnit, gold: goldUnit }, shieldUnit, {
  via: forgeShield,
});

// Slider maxes + the stable glyph-slot pool below. SILVER_MAX bounds
// the pool because it's the larger of the two; gold piles always fit
// inside it. Set roomy enough that the cross-dim compute can reach
// double-digit shields, which is when the conversion's leverage feels
// real to the slider-scrubber.
const SILVER_MAX = 45;
const GOLD_MAX = 45;

// Pile glyph: coin accumulation. Font size shrinks as count grows so
// the row stays a single line up to slider max.
const PILE_SIZE_BUCKETS = [
  { upTo: 5, size: 'text-2xl md:text-3xl' },
  { upTo: 10, size: 'text-xl md:text-2xl' },
  { upTo: 20, size: 'text-lg md:text-xl' },
  { upTo: Number.POSITIVE_INFINITY, size: 'text-base md:text-lg' },
] as const;

// Stable key tokens, one per max-count slot; sliced by render `count` so
// the glyph spans keep identity across re-renders without index-as-key.
const GLYPH_SLOTS = Array.from({ length: SILVER_MAX }, (_, i) => ({ id: `slot-${i}` }));

export function ArpyGeeShop() {
  const [silver, setSilver] = useState(18);
  const [gold, setGold] = useState(2);
  const shields = shieldsFor({ silver, gold });

  return (
    <SectionLayout
      id="arpy-gee-shop"
      headerZone={<SectionHeader eyebrow="build your own kit" title="forge a shield" />}
      introZone={
        <>
          Two dimensions, two lessons in one converter. <code className="mono">silver</code> and{' '}
          <code className="mono">gold</code> share the <code className="mono">COIN</code> dimension;
          the 10:1 rate lives in <code className="mono">gold.toBase</code>.{' '}
          <code className="mono">shield</code> is its own dimension. The cross-dim{' '}
          <code className="mono">forge</code> takes mixed-coin input, normalizes it through each
          unit's <code className="mono">toBase</code>, and tells you how many shields the shopkeeper
          will sell.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <ShopWidget
              silver={silver}
              gold={gold}
              shields={shields}
              onSilverChange={setSilver}
              onGoldChange={setGold}
            />
          }
          codeZone={<CodeBlock code={buildCode(silver, gold, shields)} />}
        />
      }
    />
  );
}

interface ShopWidgetProps {
  silver: number;
  gold: number;
  shields: number;
  onSilverChange: (next: number) => void;
  onGoldChange: (next: number) => void;
}

function ShopWidget({ silver, gold, shields, onSilverChange, onGoldChange }: ShopWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <CoinSlider unit={silverUnit} value={silver} max={SILVER_MAX} onChange={onSilverChange} />
        <CoinSlider unit={goldUnit} value={gold} max={GOLD_MAX} onChange={onGoldChange} />
      </div>

      <div className="grid items-center gap-4 grid-cols-[1fr_auto_1fr]">
        <div className="flex justify-center">
          <PileGlyph unit={silverUnit} count={silver} />
        </div>
        <span className="text-xl text-uf-muted">+</span>
        <div className="flex justify-center">
          <PileGlyph unit={goldUnit} count={gold} />
        </div>
      </div>

      <Result label="shields forged" value={`${shields}`} variant="hero" />

      <div className="flex items-center justify-center">
        <HeroGlyph unit={shieldUnit} count={shields} />
      </div>
    </div>
  );
}

// CoinSlider / PileGlyph / HeroGlyph take the unit directly; the emoji
// glyph rides on `unit.symbol`, the SR-readable label on `unit.label`.
// No parallel glyph/label props; the unit IS the metadata.
interface CoinSliderProps {
  unit: Unit<typeof COIN, number>;
  value: number;
  max: number;
  onChange: (n: number) => void;
}

function CoinSlider({ unit, value, max, onChange }: CoinSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl" aria-hidden>
        {unit.symbol}
      </span>
      <div className="flex-1">
        <Slider
          label={unit.label.toLowerCase()}
          value={value}
          min={0}
          max={max}
          step={1}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

interface PileGlyphProps {
  unit: Unit<typeof COIN, number>;
  count: number;
}

function PileGlyph({ unit, count }: PileGlyphProps) {
  const sizeClass =
    PILE_SIZE_BUCKETS.find((b) => count <= b.upTo)?.size ?? PILE_SIZE_BUCKETS[0].size;
  return (
    <span
      className={cn(
        'inline-flex flex-wrap items-center justify-center gap-0.5 leading-none text-uf-fg',
        sizeClass,
      )}
    >
      {GLYPH_SLOTS.slice(0, count).map((slot) => (
        <span key={slot.id} aria-hidden>
          {unit.symbol}
        </span>
      ))}
      <span className="sr-only">
        {count} {unit.label.toLowerCase()}
      </span>
    </span>
  );
}

interface HeroGlyphProps {
  unit: Unit<typeof GOODS, number>;
  count: number;
}

// Hero glyph: the shield payoff. Fixed large size, accent color.
function HeroGlyph({ unit, count }: HeroGlyphProps) {
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-0.5 text-4xl leading-none text-uf-accent md:text-5xl">
      {GLYPH_SLOTS.slice(0, count).map((slot) => (
        <span key={slot.id} aria-hidden>
          {unit.symbol}
        </span>
      ))}
      <span className="sr-only">
        {count} {unit.label.toLowerCase()}
      </span>
    </span>
  );
}

function buildCode(silver: number, gold: number, shields: number): string {
  return `import { defineUnit, defineConversion, forge } from 'unitforge';

// Namespace your dimension strings when shipping a kit.
const COIN  = 'arpygee/coin'  as const;
const GOODS = 'arpygee/goods' as const;

const silver = defineUnit({ id: 'silver', label: 'Silver', symbol: '🥈', dimension: COIN,  toBase: (v) => v,      fromBase: (b) => b,      base: true });
const gold   = defineUnit({ id: 'gold',   label: 'Gold',   symbol: '🥇', dimension: COIN,  toBase: (v) => v * 10, fromBase: (b) => b / 10 });
const shield = defineUnit({ id: 'shield', label: 'Shield', symbol: '🛡️', dimension: GOODS, toBase: (v) => v,      fromBase: (b) => b,      base: true });

// 30 silver-base = 1 shield. gold inputs arrive normalized to silver-base.
const forgeShield = defineConversion({
  inputs: { silver: COIN, gold: COIN },
  output: GOODS,
  compute: ({ silver, gold }) => Math.floor((silver + gold) / 30),
});

const shieldsFor = forge({ silver, gold }, shield, { via: forgeShield });

shieldsFor({ silver: ${formatMagnitude(silver)}, gold: ${formatMagnitude(gold)} }); // ${formatMagnitude(shields)}`;
}
