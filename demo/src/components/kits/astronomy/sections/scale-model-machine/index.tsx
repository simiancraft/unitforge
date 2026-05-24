// Cosmic scale model. The solar system is mostly empty space, and no
// textbook diagram admits it. Shrink the Sun to something you can hold
// and every distance collapses to a walkable scale: a basketball Sun
// puts Earth a 2 mm bead twenty-six meters down the block, and Neptune
// most of a kilometer away. Blow the Sun back up to the size of the
// Earth and the planets spread across millions of kilometres. forge
// supplies the real units (au into meters); a small ladder then renders
// each length at whatever rung reads cleanly, from microns to AU.

import { Globe } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { astronomicalUnit } from 'unitforge/kits/astronomy';
import { meter } from 'unitforge/kits/length';
import { CodeBlock } from '~/components/ui/code-block.js';
import { formatMagnitude } from '~/lib/format.js';
import { head } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';

interface Body {
  id: string;
  name: string;
  /** Mean orbital radius, au. */
  au: number;
  /** Equatorial diameter, km. */
  diameterKm: number;
}

// The Sun's true diameter, km; the scale anchor.
const SUN_DIAMETER_KM = 1_391_000;
const METERS_PER_AU = 1.495978707e11;

const BODIES: readonly Body[] = [
  { id: 'mercury', name: 'Mercury', au: 0.387, diameterKm: 4879 },
  { id: 'venus', name: 'Venus', au: 0.723, diameterKm: 12104 },
  { id: 'earth', name: 'Earth', au: 1.0, diameterKm: 12742 },
  { id: 'mars', name: 'Mars', au: 1.524, diameterKm: 6779 },
  { id: 'jupiter', name: 'Jupiter', au: 5.203, diameterKm: 139820 },
  { id: 'saturn', name: 'Saturn', au: 9.582, diameterKm: 116460 },
  { id: 'uranus', name: 'Uranus', au: 19.191, diameterKm: 50724 },
  { id: 'neptune', name: 'Neptune', au: 30.07, diameterKm: 49244 },
  { id: 'pluto', name: 'Pluto', au: 39.482, diameterKm: 2377 },
];

interface ModelSize {
  id: string;
  name: string;
  /** Model diameter of the Sun, meters. */
  meters: number;
}

// Smallest to largest. The top rung blows the Sun up to the Earth's true
// diameter, which spreads the planets across millions of kilometres.
const MODEL_SIZES: readonly ModelSize[] = [
  { id: 'sand', name: 'grain of sand (1 mm)', meters: 0.001 },
  { id: 'marble', name: 'marble (1.5 cm)', meters: 0.015 },
  { id: 'basketball', name: 'basketball (24 cm)', meters: 0.24 },
  { id: 'car', name: 'car (4.5 m)', meters: 4.5 },
  { id: 'house', name: 'house (15 m)', meters: 15 },
  { id: 'earth', name: 'the Sun as the Earth (12,742 km)', meters: 12_742_000 },
];

const FALLBACK_SIZE: ModelSize = head(MODEL_SIZES);

// Length rungs for the readout, ascending. Each model length renders at
// the largest rung whose threshold it clears, so a bead can read in
// microns and a distance in AU without scientific notation.
const LENGTH_RUNGS: ReadonlyArray<readonly [number, string]> = [
  [1e-6, 'µm'],
  [1e-3, 'mm'],
  [1e-2, 'cm'],
  [1, 'm'],
  [1e3, 'km'],
  [METERS_PER_AU, 'au'],
];

function formatLength(meters: number): string {
  const abs = Math.abs(meters);
  let [scale, symbol] = LENGTH_RUNGS[0] ?? [1, 'm'];
  for (const [rung, sym] of LENGTH_RUNGS) {
    if (abs >= rung) {
      scale = rung;
      symbol = sym;
    }
  }
  return `${formatMagnitude(meters / scale)} ${symbol}`;
}

export function ScaleModelMachine() {
  const [sizeId, setSizeId] = useState('basketball');
  const size = MODEL_SIZES.find((s) => s.id === sizeId) ?? FALLBACK_SIZE;
  // Dimensionless scale: model Sun / real Sun.
  const scale = size.meters / (SUN_DIAMETER_KM * 1000);

  const earth = BODIES.find((b) => b.id === 'earth') ?? head(BODIES);
  const earthDistM = forge(astronomicalUnit, meter)(earth.au) * scale;
  const earthDiamM = earth.diameterKm * 1000 * scale;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 06"
          title="cosmic scale model"
          kicker="the solar system is mostly nothing"
          iconZone={<Globe size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Diagrams lie about scale because the truth does not fit on a page. Shrink the Sun to
          something you can hold and the planets spread out across a neighborhood, most of them
          specks. forge supplies the honest units: astronomical units into meters, then each length
          rendered at whatever rung reads cleanly.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <ScaleWidget
              size={size}
              scale={scale}
              earthDistM={earthDistM}
              earthDiamM={earthDiamM}
              onPick={setSizeId}
            />
          }
          codeZone={<CodeBlock code={buildCode(size, scale, earthDistM)} />}
        />
      }
    />
  );
}

interface ScaleWidgetProps {
  size: ModelSize;
  scale: number;
  earthDistM: number;
  earthDiamM: number;
  onPick: (id: string) => void;
}

function ScaleWidget({ size, scale, earthDistM, earthDiamM, onPick }: ScaleWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {MODEL_SIZES.map((s) =>
          s.id === size.id ? (
            <SizePillActive key={s.id} size={s} onPick={onPick} />
          ) : (
            <SizePillIdle key={s.id} size={s} onPick={onPick} />
          ),
        )}
      </div>

      {/* Hero readout, split at the comma: bead on the left, distance
          on the right, so neither half wraps into the other. */}
      <dl className="m-0 flex flex-col gap-0.5 border-t border-uf-border pt-2">
        <dt className="uf-eyebrow">Sun as a {size.name.split(' (')[0]}</dt>
        <dd className="m-0 mono self-start text-base text-uf-fg">
          Earth is a <span className="tabular-nums text-uf-accent">{formatLength(earthDiamM)}</span>{' '}
          bead
        </dd>
        <dd className="m-0 mono self-end text-base text-uf-fg">
          <span className="tabular-nums text-uf-accent">{formatLength(earthDistM)}</span> away
        </dd>
      </dl>

      <div className="flex flex-col gap-2 rounded-md border border-uf-border bg-uf-card p-4">
        <span className="uf-eyebrow">the whole model</span>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="uf-eyebrow text-uf-muted">
              <th className="pb-1.5 text-left font-normal">body</th>
              <th className="pb-1.5 text-right font-normal">bead</th>
              <th className="pb-1.5 text-right font-normal">from the Sun</th>
            </tr>
          </thead>
          <tbody>
            {BODIES.map((b) => (
              <ScaleRow key={b.id} body={b} scale={scale} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScaleRow({ body, scale }: { body: Body; scale: number }) {
  const distM = forge(astronomicalUnit, meter)(body.au) * scale;
  const diamM = body.diameterKm * 1000 * scale;
  return (
    <tr className="border-t border-uf-border">
      <td className="mono py-1.5 text-xs uppercase tracking-wider text-uf-muted">{body.name}</td>
      <td className="mono py-1.5 text-right tabular-nums text-uf-fg">{formatLength(diamM)}</td>
      <td className="mono py-1.5 text-right tabular-nums text-uf-accent">{formatLength(distM)}</td>
    </tr>
  );
}

function SizePillActive({ size, onPick }: { size: ModelSize; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(size.id)}
      aria-pressed="true"
      className="rounded-full border-2 border-uf-accent bg-uf-card px-3 py-1.5 text-xs font-semibold text-uf-accent"
    >
      {size.name}
    </button>
  );
}

function SizePillIdle({ size, onPick }: { size: ModelSize; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(size.id)}
      aria-pressed="false"
      className="rounded-full border border-uf-border bg-uf-card px-3 py-1.5 text-xs text-uf-muted transition-colors hover:border-uf-accent hover:text-uf-fg"
    >
      {size.name}
    </button>
  );
}

function buildCode(size: ModelSize, scale: number, earthDistM: number): string {
  return `import { forge } from 'unitforge';
import { astronomicalUnit } from 'unitforge/kits/astronomy';
import { meter } from 'unitforge/kits/length';

// Sun shrunk to a ${size.name.split(' (')[0]}: scale = model / real
const scale = ${size.meters} / (1391000 * 1000); // ${formatMagnitude(scale)}
const earthDistM = forge(astronomicalUnit, meter)(1) * scale;
// → ${formatLength(earthDistM)} from the model Sun
`;
}
