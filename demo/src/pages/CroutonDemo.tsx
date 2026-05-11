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
import { CodeBlock } from '../components/CodeBlock.js';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';

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

const citiesFromResources = forge(
  { wheat: wheatUnit, ore: oreUnit },
  cityUnit,
  { via: buildCities },
);

const CODE = `import { defineUnit, defineConversion, forge } from 'unitforge';

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

cities({ wheat: 6, ore: 9 }); // 3`;

export function CroutonDemo() {
  const [wheat, setWheat] = useState(6);
  const [ore, setOre] = useState(9);
  const cities = citiesFromResources({ wheat, ore });

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="uf-eyebrow">build your own kit</p>
        <h2 className="display flex items-center gap-3 text-3xl font-bold leading-tight md:text-4xl">
          forge a city
        </h2>
      </header>
      <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
        Custom dimensions are first-class. Invent one called{' '}
        <code className="mono">COUNT</code>; build three units inside it with{' '}
        <code className="mono">defineUnit</code>; declare the city recipe (2 wheat
        + 3 ore = 1 city) with <code className="mono">defineConversion</code>;
        and <code className="mono">forge()</code> the converter. Same shape the
        library uses for its own kits.
      </p>

      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
        <div className="uf-card relative flex flex-col gap-4 overflow-hidden rounded-lg p-5">
          <div className="flex flex-col gap-3">
            <ResourceSlider
              glyph="🌾"
              label="wheat"
              value={wheat}
              onChange={setWheat}
            />
            <ResourceSlider
              glyph="🪨"
              label="ore"
              value={ore}
              onChange={setOre}
            />
          </div>

          <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl">
            <Glyph glyph="🌾" count={wheat} label="wheat" />
            <span style={{ color: 'var(--uf-muted)' }}>+</span>
            <Glyph glyph="🪨" count={ore} label="ore" />
          </div>

          <Result label="cities built" value={`${cities}`} emphasis />

          <div className="flex items-center justify-center text-2xl md:text-3xl">
            <Glyph
              glyph="🏰"
              count={cities}
              label="cities"
              maxVisible={10}
              showCount={false}
              highlight
            />
          </div>
        </div>

        <CodeBlock code={CODE} />
      </div>
    </section>
  );
}

function ResourceSlider({
  glyph,
  label,
  value,
  onChange,
}: {
  glyph: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
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
          max={30}
          step={1}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function Glyph({
  glyph,
  count,
  label,
  highlight,
  maxVisible = 5,
  showCount = true,
}: {
  glyph: string;
  count: number;
  label: string;
  highlight?: boolean;
  maxVisible?: number;
  showCount?: boolean;
}) {
  // Render up to maxVisible glyphs as a horizontal "stack". When the
  // count exceeds the cap the trailing "× n" is the source of truth;
  // the city row hides it because the Result line above already names
  // the count.
  const visible = Math.min(count, maxVisible);
  return (
    <span
      className="inline-flex items-baseline gap-1 tabular-nums"
      style={{ color: highlight ? 'var(--uf-accent)' : 'var(--uf-fg)' }}
    >
      <span aria-hidden>{glyph.repeat(visible)}</span>
      <span className="sr-only">
        {count} {label}
      </span>
      {showCount && (
        <span className="mono text-base font-semibold" aria-hidden>
          × {count}
        </span>
      )}
    </span>
  );
}
