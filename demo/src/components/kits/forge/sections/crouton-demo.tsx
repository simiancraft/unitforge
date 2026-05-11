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
import { CodeBlock } from '../../../CodeBlock.js';
import { Result } from '../../../Result.js';
import { Slider } from '../../../Slider.js';
import { SectionHeader, SectionLayout } from '../../section-layout.js';

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
    <SectionLayout
      headerZone={<SectionHeader eyebrow="build your own kit" title="forge a city" />}
      introZone={
        <>
          Custom dimensions are first-class. Invent one called{' '}
          <code className="mono">COUNT</code>; build three units inside it with{' '}
          <code className="mono">defineUnit</code>; declare the city recipe (2 wheat
          + 3 ore = 1 city) with <code className="mono">defineConversion</code>;
          and <code className="mono">forge()</code> the converter. Same shape the
          library uses for its own kits.
        </>
      }
      widgetZone={
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <ResourceSlider glyph="🌾" label="wheat" value={wheat} onChange={setWheat} />
            <ResourceSlider glyph="🪨" label="ore" value={ore} onChange={setOre} />
          </div>

          <div className="grid items-center gap-4 grid-cols-[1fr_auto_1fr]">
            <div className="flex justify-center">
              <Glyph glyph="🌾" count={wheat} label="wheat" />
            </div>
            <span className="text-xl" style={{ color: 'var(--uf-muted)' }}>
              +
            </span>
            <div className="flex justify-center">
              <Glyph glyph="🪨" count={ore} label="ore" />
            </div>
          </div>

          <Result label="cities built" value={`${cities}`} emphasis />

          <div className="flex items-center justify-center">
            <Glyph glyph="🏰" count={cities} label="cities" variant="large" highlight />
          </div>
        </div>
      }
      codeZone={<CodeBlock code={CODE} />}
    />
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
  variant = 'auto',
}: {
  glyph: string;
  count: number;
  label: string;
  highlight?: boolean;
  /**
   * `auto` (resource piles) shrinks the per-glyph font size as count grows
   * so 30 items don't overflow the card. `large` (the city payoff) holds
   * a fixed prominent size regardless of count.
   */
  variant?: 'auto' | 'large';
}) {
  const sizeClass =
    variant === 'large'
      ? 'text-4xl md:text-5xl'
      : count <= 5
        ? 'text-2xl md:text-3xl'
        : count <= 10
          ? 'text-xl md:text-2xl'
          : count <= 20
            ? 'text-lg md:text-xl'
            : 'text-base md:text-lg';

  return (
    <span
      className={`inline-flex flex-wrap items-center justify-center gap-0.5 leading-none ${sizeClass}`}
      style={{ color: highlight ? 'var(--uf-accent)' : 'var(--uf-fg)' }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span key={i} aria-hidden>
          {glyph}
        </span>
      ))}
      <span className="sr-only">
        {count} {label}
      </span>
    </span>
  );
}
