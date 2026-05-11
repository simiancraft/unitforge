// "Build your own units": Settlers-of-Crouton resource economy as a custom-dimensions
// demo. Two resources (wood, brick) and a conversion (roads = min(wood,
// brick)) — all userland, no kit. Proves that any dimension you invent
// gets the same forge() treatment as the library's own.
//
// Resources use emoji glyphs (lucide lacks sheep/wool), keeping the demo
// playful and instantly recognizable.

import { useState } from 'react';
import { defineConversion, defineUnit, forge } from 'unitforge';
import { CodeBlock } from '../components/CodeBlock.js';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';

// Each resource is its own dimension (wood and brick aren't
// directly interconvertible). ROAD is the produced structure.
const WOOD = 'wood' as const;
const BRICK = 'brick' as const;
const ROAD = 'road' as const;

const woodUnit = defineUnit({
  name: 'wood',
  dimension: WOOD,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});
const brickUnit = defineUnit({
  name: 'brick',
  dimension: BRICK,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});
const roadUnit = defineUnit({
  name: 'road',
  dimension: ROAD,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

// 1 wood + 1 brick = 1 road. Roads built = min(wood, brick).
const buildRoads = defineConversion({
  inputs: { wood: WOOD, brick: BRICK },
  output: ROAD,
  validate: {
    wood: (v) => v >= 0 || 'wood must be >= 0',
    brick: (v) => v >= 0 || 'brick must be >= 0',
  },
  compute: ({ wood, brick }) => Math.floor(Math.min(wood, brick)),
});

const roadsFromResources = forge(
  { wood: woodUnit, brick: brickUnit },
  roadUnit,
  { via: buildRoads },
);

const CODE = `import { defineUnit, defineConversion, forge } from 'unitforge';

const WOOD = 'wood' as const;
const BRICK = 'brick' as const;
const ROAD = 'road' as const;

const wood  = defineUnit({ name: 'wood',  dimension: WOOD,  toBase: (v) => v, fromBase: (b) => b, base: true });
const brick = defineUnit({ name: 'brick', dimension: BRICK, toBase: (v) => v, fromBase: (b) => b, base: true });
const road  = defineUnit({ name: 'road',  dimension: ROAD,  toBase: (v) => v, fromBase: (b) => b, base: true });

// 1 wood + 1 brick = 1 road; you can build as many as the smaller pile allows.
const buildRoads = defineConversion({
  inputs: { wood: WOOD, brick: BRICK },
  output: ROAD,
  compute: ({ wood, brick }) => Math.floor(Math.min(wood, brick)),
});

const roads = forge({ wood, brick }, road, { via: buildRoads });

roads({ wood: 3, brick: 2 }); // 2`;

export function CroutonDemo() {
  const [wood, setWood] = useState(3);
  const [brick, setBrick] = useState(2);
  const roads = roadsFromResources({ wood, brick });

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="uf-eyebrow">build your own kit</p>
        <h2 className="display flex items-center gap-3 text-3xl font-bold leading-tight md:text-4xl">
          forge a road
        </h2>
      </header>
      <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
        Custom dimensions are first-class. Define <code className="mono">WOOD</code>,{' '}
        <code className="mono">BRICK</code>, and <code className="mono">ROAD</code> as
        string-literal dimensions; build their units with{' '}
        <code className="mono">defineUnit</code>; declare a recipe with{' '}
        <code className="mono">defineConversion</code>; and{' '}
        <code className="mono">forge()</code> the converter. Same shape the library uses
        for its own kits.
      </p>

      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
        <div className="uf-card relative flex flex-col gap-4 overflow-hidden rounded-lg p-5">
          <div className="flex flex-col gap-3">
            <ResourceSlider
              glyph="🌲"
              label="wood"
              value={wood}
              onChange={setWood}
            />
            <ResourceSlider
              glyph="🧱"
              label="brick"
              value={brick}
              onChange={setBrick}
            />
          </div>

          <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl">
            <Glyph glyph="🌲" count={wood} label="wood" />
            <span style={{ color: 'var(--uf-muted)' }}>+</span>
            <Glyph glyph="🧱" count={brick} label="brick" />
          </div>

          <Result label="roads built" value={`${roads}`} emphasis />

          <div className="flex items-center justify-center text-2xl md:text-3xl">
            <Glyph
              glyph="🛣️"
              count={roads}
              label="roads"
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
          max={10}
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
  // Render up to maxVisible glyphs as a horizontal "stack". The visible
  // trailing "× n" count is the source of truth for the actual quantity
  // when it's shown; the road row hides it because the Result line
  // above already names the count.
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
        <span className="mono text-sm" style={{ color: 'var(--uf-muted)' }} aria-hidden>
          × {count}
        </span>
      )}
    </span>
  );
}
