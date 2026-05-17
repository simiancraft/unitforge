// Three primitives, side-by-side. Each card is the one-line pitch + the
// signature + a tiny representative call. Above-the-fold proof that the
// library is small; deep enough to send a reader into a kit or into the
// "build your own kit" demo below.

import { CodeBlock } from '~/components/ui/code-block.js';

const FORGE_CODE = `import { forge } from 'unitforge';
import { foot, squareFoot } from 'unitforge/kits/geometry';

// Within-dimension: the handspan unit from card 1 → foot.
const inFeet = forge(handspan, foot);
inFeet(12);  // 9.252

// Cross-dimensional: two handspans piped through the
// areaFromRectangle conversion from card 2; result lands
// in square feet.
const inSqFt = forge(
  { length: handspan, width: handspan },
  squareFoot,
  { via: areaFromRectangle },
);
inSqFt({ length: 12, width: 8 });  // 57.067`;

const DEFINE_UNIT_CODE = `import { defineUnit } from 'unitforge';

const handspan = defineUnit({
  id: 'handspan',
  label: 'Handspan',
  symbol: 'hsp',
  dimension: 'length',
  toBase: (v) => v * 0.235,
  fromBase: (b) => b / 0.235,
});`;

const DEFINE_CONVERSION_CODE = `import { defineConversion } from 'unitforge';

const areaFromRectangle = defineConversion({
  inputs: { length: 'length', width: 'length' },
  output: 'area',
  compute: ({ length, width }) => length * width,
});`;

interface Card {
  name: string;
  blurb: string;
  code: string;
}

// Left-to-right flow matches the heading: define this, then that, then boom.
const CARDS: Card[] = [
  {
    name: 'defineUnit',
    blurb: 'declare a unit value in any dimension you want.',
    code: DEFINE_UNIT_CODE,
  },
  {
    name: 'defineConversion',
    blurb: 'cross-dimensional recipes; inputs in, outputs out.',
    code: DEFINE_CONVERSION_CODE,
  },
  {
    name: 'forge',
    blurb: 'a converter is born. forge it once; call it forever.',
    code: FORGE_CODE,
  },
];

export function CoreApi() {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="uf-eyebrow">core api</p>
        <h2 className="display text-3xl font-bold leading-tight md:text-4xl">
          Define, then Forge!
        </h2>
      </header>
      <p className="max-w-2xl text-sm leading-relaxed text-uf-muted">
        Three primitives is the whole surface. The Arpy Gee Shop demo below stitches them together.
        Kits are values built from the same primitives; use the kits, build your own, or both.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.name} className="flex flex-col gap-3">
            <div>
              <code className="mono text-base font-semibold text-uf-accent">{c.name}</code>
              <p className="mt-1 text-xs leading-relaxed text-uf-muted">{c.blurb}</p>
            </div>
            <CodeBlock code={c.code} className="min-h-[200px]" />
          </div>
        ))}
      </div>
    </section>
  );
}
