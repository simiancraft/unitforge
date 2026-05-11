// Three primitives, side-by-side. Each card is the one-line pitch + the
// signature + a tiny representative call. Above-the-fold proof that the
// library is small; deep enough to send a reader into a kit or into the
// "build your own kit" demo below.

import { CodeBlock } from '../components/CodeBlock.js';

const FORGE_CODE = `import { forge } from 'unitforge';
import { meter, foot } from 'unitforge/kits/geometry';

forge(meter, foot)(5); // 16.4042`;

const DEFINE_UNIT_CODE = `import { defineUnit } from 'unitforge';

const handspan = defineUnit({
  name: 'handspan',
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

const CARDS: Card[] = [
  {
    name: 'forge',
    blurb: 'the consumer; pick units, get a converter.',
    code: FORGE_CODE,
  },
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
];

export function CoreApiIntro() {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="uf-eyebrow">core api</p>
        <h2 className="display text-3xl font-bold leading-tight md:text-4xl">
          the three verbs you just used
        </h2>
      </header>
      <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
        That's the whole surface. The Catan demo above stitched all three
        together. Kits are values built from the same primitives; you can use
        the kits, build your own, or both.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.name} className="flex flex-col gap-3">
            <div>
              <code
                className="mono text-base font-semibold"
                style={{ color: 'var(--uf-accent)' }}
              >
                {c.name}
              </code>
              <p
                className="mt-1 text-xs leading-relaxed"
                style={{ color: 'var(--uf-muted)' }}
              >
                {c.blurb}
              </p>
            </div>
            <CodeBlock code={c.code} />
          </div>
        ))}
      </div>
    </section>
  );
}
