// "Build your own units": Settlers-of-Crouton resource economy as a
// custom-dimension demo. One invented dimension (COUNT), three units
// inside it (wheat, ore, city); a conversion that turns the first two
// into the third at the 2:3 Catan-style city recipe. All userland, no
// kit; same shape the library uses for its own kits.
//
// One dimension, many units: wheat and ore aren't interconvertible
// directly, but they're both *countables*. The conversion's input
// keys ("wheat", "ore") plus each unit's own name carry identity;
// the dimension just says "this is a discrete count of something".
//
// Resource glyphs are emoji (lucide lacks wheat/sheep/etc.), keeping
// the demo playful and instantly recognizable.

import { useState } from 'react';
import { defineConversion, defineUnit, forge } from 'unitforge';
import { CodeBlock } from '~/components/CodeBlock.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { cn } from '~/lib/cn.js';
import { formatMagnitude } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';

const COUNT = 'count' as const;

const wheatUnit = defineUnit({
  name: 'wheat',
  dimension: COUNT,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});
const oreUnit = defineUnit({
  name: 'ore',
  dimension: COUNT,
  toBase: (v) => v,
  fromBase: (b) => b,
});
const cityUnit = defineUnit({
  name: 'city',
  dimension: COUNT,
  toBase: (v) => v,
  fromBase: (b) => b,
});

// 2 wheat + 3 ore = 1 city; you build floor(min(wheat/2, ore/3)) of them.
const buildCities = defineConversion({
  inputs: { wheat: COUNT, ore: COUNT },
  output: COUNT,
  validate: {
    wheat: (v) => v >= 0 || 'wheat must be >= 0',
    ore: (v) => v >= 0 || 'ore must be >= 0',
  },
  compute: ({ wheat, ore }) => Math.floor(Math.min(wheat / 2, ore / 3)),
});

const citiesFromResources = forge({ wheat: wheatUnit, ore: oreUnit }, cityUnit, {
  via: buildCities,
});

// Slider max + the size of the stable glyph-key pool below. Bumping this
// requires bumping both literals; they're the same upper bound on a
// single render's glyph count.
const CROUTON_MAX_COUNT = 30;

// Pile glyph: resource accumulation. Font size shrinks as count grows so
// the row stays a single line up to slider max.
const PILE_SIZE_BUCKETS = [
  { upTo: 5, size: 'text-2xl md:text-3xl' },
  { upTo: 10, size: 'text-xl md:text-2xl' },
  { upTo: 20, size: 'text-lg md:text-xl' },
  { upTo: Number.POSITIVE_INFINITY, size: 'text-base md:text-lg' },
] as const;

// Stable key tokens, one per max-count slot; sliced by render `count` so
// the glyph spans keep identity across re-renders without index-as-key.
const GLYPH_SLOTS = Array.from({ length: CROUTON_MAX_COUNT }, (_, i) => ({ id: `slot-${i}` }));

export function CroutonDemo() {
  const [wheat, setWheat] = useState(6);
  const [ore, setOre] = useState(9);
  const cities = citiesFromResources({ wheat, ore });

  return (
    <SectionLayout
      id="crouton"
      headerZone={<SectionHeader eyebrow="build your own kit" title="forge a city" />}
      introZone={
        <>
          Custom dimensions are first-class. Invent one called <code className="mono">COUNT</code>
          {'; '}build three units inside it with <code className="mono">defineUnit</code>; declare
          the city recipe (2 wheat + 3 ore = 1 city) with{' '}
          <code className="mono">defineConversion</code>
          {'; '}and <code className="mono">forge()</code> the converter. Same shape the library uses
          for its own kits.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <CroutonWidget
              wheat={wheat}
              ore={ore}
              cities={cities}
              onWheatChange={setWheat}
              onOreChange={setOre}
            />
          }
          codeZone={<CodeBlock code={buildCode(wheat, ore, cities)} />}
        />
      }
    />
  );
}

interface CroutonWidgetProps {
  wheat: number;
  ore: number;
  cities: number;
  onWheatChange: (next: number) => void;
  onOreChange: (next: number) => void;
}

function CroutonWidget({ wheat, ore, cities, onWheatChange, onOreChange }: CroutonWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <ResourceSlider glyph="🌾" label="wheat" value={wheat} onChange={onWheatChange} />
        <ResourceSlider glyph="🪨" label="ore" value={ore} onChange={onOreChange} />
      </div>

      <div className="grid items-center gap-4 grid-cols-[1fr_auto_1fr]">
        <div className="flex justify-center">
          <PileGlyph glyph="🌾" count={wheat} label="wheat" />
        </div>
        <span className="text-xl text-uf-muted">+</span>
        <div className="flex justify-center">
          <PileGlyph glyph="🪨" count={ore} label="ore" />
        </div>
      </div>

      <Result label="cities built" value={`${cities}`} variant="hero" />

      <div className="flex items-center justify-center">
        <HeroGlyph glyph="🏰" count={cities} label="cities" />
      </div>
    </div>
  );
}

interface ResourceSliderProps {
  glyph: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
}

function ResourceSlider({ glyph, label, value, onChange }: ResourceSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl" aria-hidden>
        {glyph}
      </span>
      <div className="flex-1">
        <Slider
          label={label}
          value={value}
          min={0}
          max={CROUTON_MAX_COUNT}
          step={1}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

interface GlyphProps {
  glyph: string;
  count: number;
  label: string;
}

function PileGlyph({ glyph, count, label }: GlyphProps) {
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
          {glyph}
        </span>
      ))}
      <span className="sr-only">
        {count} {label}
      </span>
    </span>
  );
}

// Hero glyph: the city payoff. Fixed large size, accent color.
function HeroGlyph({ glyph, count, label }: GlyphProps) {
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-0.5 text-4xl leading-none text-uf-accent md:text-5xl">
      {GLYPH_SLOTS.slice(0, count).map((slot) => (
        <span key={slot.id} aria-hidden>
          {glyph}
        </span>
      ))}
      <span className="sr-only">
        {count} {label}
      </span>
    </span>
  );
}

function buildCode(wheat: number, ore: number, cities: number): string {
  return `import { defineUnit, defineConversion, forge } from 'unitforge';

// One dimension, many units. wheat and ore aren't directly
// interconvertible, but they're both countable things.
const COUNT = 'count' as const;

const wheat = defineUnit({ name: 'wheat', dimension: COUNT, toBase: (v) => v, fromBase: (b) => b, base: true });
const ore   = defineUnit({ name: 'ore',   dimension: COUNT, toBase: (v) => v, fromBase: (b) => b });
const city  = defineUnit({ name: 'city',  dimension: COUNT, toBase: (v) => v, fromBase: (b) => b });

// 2 wheat + 3 ore = 1 city.
const buildCities = defineConversion({
  inputs: { wheat: COUNT, ore: COUNT },
  output: COUNT,
  compute: ({ wheat, ore }) => Math.floor(Math.min(wheat / 2, ore / 3)),
});

const cities = forge({ wheat, ore }, city, { via: buildCities });

cities({ wheat: ${formatMagnitude(wheat)}, ore: ${formatMagnitude(ore)} }); // ${formatMagnitude(cities)}`;
}
