// Cosmic scale model. The solar system is mostly empty space, and no
// textbook diagram admits it. Shrink the Sun to something you can hold
// and every distance collapses to a walkable scale: a basketball Sun
// puts Earth a 2 mm bead twenty-six meters down the block, and Neptune
// most of a kilometer away. forge does the real-unit work: au into
// meters for the true distances, and model meters into feet for the
// readout.

import { Globe } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { astronomicalUnit } from 'unitforge/kits/astronomy';
import { foot, meter } from 'unitforge/kits/length';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
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

const BODIES: readonly Body[] = [
  { id: 'mercury', name: 'Mercury', au: 0.387, diameterKm: 4879 },
  { id: 'earth', name: 'Earth', au: 1.0, diameterKm: 12742 },
  { id: 'mars', name: 'Mars', au: 1.524, diameterKm: 6779 },
  { id: 'jupiter', name: 'Jupiter', au: 5.203, diameterKm: 139820 },
  { id: 'saturn', name: 'Saturn', au: 9.582, diameterKm: 116460 },
  { id: 'neptune', name: 'Neptune', au: 30.07, diameterKm: 49244 },
];

interface ModelSize {
  id: string;
  name: string;
  /** Model diameter of the Sun, meters. */
  meters: number;
}

const MODEL_SIZES: readonly ModelSize[] = [
  { id: 'sand', name: 'grain of sand (1 mm)', meters: 0.001 },
  { id: 'marble', name: 'marble (1.5 cm)', meters: 0.015 },
  { id: 'basketball', name: 'basketball (24 cm)', meters: 0.24 },
  { id: 'car', name: 'car (4.5 m)', meters: 4.5 },
];

const FALLBACK_SIZE: ModelSize = head(MODEL_SIZES);

export function ScaleModelMachine() {
  const [sizeId, setSizeId] = useState('basketball');
  const size = MODEL_SIZES.find((s) => s.id === sizeId) ?? FALLBACK_SIZE;
  // Dimensionless scale: model Sun / real Sun.
  const scale = size.meters / (SUN_DIAMETER_KM * 1000);

  const earth = BODIES.find((b) => b.id === 'earth') ?? head(BODIES);
  const earthDistM = forge(astronomicalUnit, meter)(earth.au) * scale;
  const earthDiamMm = earth.diameterKm * 1000 * scale * 1000;

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
          specks. forge supplies the honest units: astronomical units into meters for the real
          distances, then model meters into feet for the readout.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <ScaleWidget
              size={size}
              scale={scale}
              earthDistM={earthDistM}
              earthDiamMm={earthDiamMm}
              onPick={setSizeId}
            />
          }
          codeZone={<CodeBlock code={buildCode(size, scale)} />}
        />
      }
    />
  );
}

interface ScaleWidgetProps {
  size: ModelSize;
  scale: number;
  earthDistM: number;
  earthDiamMm: number;
  onPick: (id: string) => void;
}

function ScaleWidget({ size, scale, earthDistM, earthDiamMm, onPick }: ScaleWidgetProps) {
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

      <Result
        label={`Sun as a ${size.name.split(' (')[0]}`}
        value={`Earth is a ${formatMagnitude(earthDiamMm)} mm bead, ${formatMagnitude(earthDistM)} m away`}
        variant="hero"
        valueClassName="text-base"
      />

      <div className="flex flex-col gap-2 rounded-md border border-uf-border bg-uf-card p-4">
        <span className="uf-eyebrow">the whole model</span>
        <ul className="flex list-none flex-col gap-2">
          {BODIES.map((b) => (
            <ScaleRow key={b.id} body={b} scale={scale} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ScaleRow({ body, scale }: { body: Body; scale: number }) {
  const distM = forge(astronomicalUnit, meter)(body.au) * scale;
  const distFt = forge(meter, foot)(distM);
  const diamMm = body.diameterKm * 1000 * scale * 1000;
  return (
    <li
      className="flex items-baseline justify-between border-b border-uf-border pb-1.5 last:border-b-0 last:pb-0"
      aria-label={`${body.name}: a ${formatMagnitude(diamMm)} millimeter bead, ${formatMagnitude(distM)} meters from the model Sun`}
    >
      <span className="mono text-xs uppercase tracking-wider text-uf-muted" aria-hidden>
        {body.name}
      </span>
      <span className="mono text-sm" aria-hidden>
        <span className="text-uf-fg tabular-nums">{formatMagnitude(diamMm)}</span>
        <span className="ml-1 text-xs text-uf-muted">mm ·</span>
        <span className="ml-1 text-uf-accent tabular-nums">{formatMagnitude(distM)}</span>
        <span className="ml-1 text-xs text-uf-muted">m ({formatMagnitude(distFt)} ft)</span>
      </span>
    </li>
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

function buildCode(size: ModelSize, scale: number): string {
  return `import { forge } from 'unitforge';
import { astronomicalUnit } from 'unitforge/kits/astronomy';
import { meter, foot } from 'unitforge/kits/length';

// Sun shrunk to a ${size.name.split(' (')[0]}: scale = model / real
const scale = ${size.meters} / (1391000 * 1000); // ${formatMagnitude(scale)}
const earthDistM = forge(astronomicalUnit, meter)(1) * scale;
const earthDistFt = forge(meter, foot)(earthDistM);
`;
}
