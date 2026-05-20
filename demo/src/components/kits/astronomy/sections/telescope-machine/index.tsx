// Telescope time machine. To look out is to look back: the light
// reaching you left its source as long ago as the distance, in
// light-years, says. Stars and galaxies are usually catalogued in
// parsecs, so forging that distance into light-years is a real
// conversion that also reads directly as "years ago." Pair the number
// with what was happening on Earth when the light departed.

import { History } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { kiloparsec, lightYear, parsec } from 'unitforge/kits/astronomy';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { formatMagnitude } from '~/lib/format.js';
import { head } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';
import type { AstronomyUnit } from '../../units.js';

interface SkyObject {
  id: string;
  name: string;
  value: number;
  unit: AstronomyUnit;
  /** What was happening on Earth when this light left. */
  era: string;
}

// Distances in their commonly-catalogued units (parsecs for stars,
// kiloparsecs for the galaxy), so the forge to light-years is a genuine
// conversion. Betelgeuse's distance is uncertain (~500-650 ly); 168 pc
// is a mid-range modern estimate.
const OBJECTS: readonly SkyObject[] = [
  {
    id: 'proxima',
    name: 'Proxima Centauri',
    value: 1.301,
    unit: parsec,
    era: 'about four years ago; recent enough to feel like now',
  },
  {
    id: 'sirius',
    name: 'Sirius',
    value: 2.637,
    unit: parsec,
    era: 'less than a decade ago, the brightest star in our sky',
  },
  {
    id: 'betelgeuse',
    name: 'Betelgeuse',
    value: 168,
    unit: parsec,
    era: 'around the 1470s, the height of the Italian Renaissance',
  },
  {
    id: 'pillars',
    name: 'Pillars of Creation',
    value: 2147,
    unit: parsec,
    era: 'around 5000 BCE, as the first cities were rising in Mesopotamia',
  },
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy',
    value: 765,
    unit: kiloparsec,
    era: 'about 2.5 million years ago, before Homo sapiens existed',
  },
];

const FALLBACK: SkyObject = head(OBJECTS);

export function TelescopeMachine() {
  const [id, setId] = useState('andromeda');
  const obj = OBJECTS.find((o) => o.id === id) ?? FALLBACK;
  // light-years of distance == years of light travel == years ago.
  const yearsAgo = forge(obj.unit, lightYear)(obj.value);

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 05"
          title="the telescope is a time machine"
          kicker="every photo of the sky is a photo of the past"
          iconZone={<History size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Light is fast but not instant, so everything you see in the sky is old news. A distance in
          light-years is also a duration: the years that light spent in transit. Catalogues list
          these distances in parsecs, so the forge into light-years doubles as a clock counting
          backward. Pick an object; see when its light left.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={<TelescopeWidget obj={obj} yearsAgo={yearsAgo} onPick={setId} />}
          codeZone={<CodeBlock code={buildCode(obj, yearsAgo)} />}
        />
      }
    />
  );
}

interface TelescopeWidgetProps {
  obj: SkyObject;
  yearsAgo: number;
  onPick: (id: string) => void;
}

function TelescopeWidget({ obj, yearsAgo, onPick }: TelescopeWidgetProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {OBJECTS.map((o) =>
          o.id === obj.id ? (
            <ObjectPillActive key={o.id} obj={o} onPick={onPick} />
          ) : (
            <ObjectPillIdle key={o.id} obj={o} onPick={onPick} />
          ),
        )}
      </div>

      <Result
        label={`light from ${obj.name} left`}
        value={`${formatMagnitude(yearsAgo)} years ago`}
        variant="hero"
        valueClassName="text-base"
      />
      <p className="text-sm leading-relaxed text-uf-muted">
        That is {formatMagnitude(obj.value)} {obj.unit.symbol} away; the light left {obj.era}.
      </p>
    </div>
  );
}

function ObjectPillActive({ obj, onPick }: { obj: SkyObject; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(obj.id)}
      aria-pressed="true"
      className="rounded-full border-2 border-uf-accent bg-uf-card px-3 py-1.5 text-xs font-semibold text-uf-accent"
    >
      {obj.name}
    </button>
  );
}

function ObjectPillIdle({ obj, onPick }: { obj: SkyObject; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(obj.id)}
      aria-pressed="false"
      className="rounded-full border border-uf-border bg-uf-card px-3 py-1.5 text-xs text-uf-muted transition-colors hover:border-uf-accent hover:text-uf-fg"
    >
      {obj.name}
    </button>
  );
}

function buildCode(obj: SkyObject, yearsAgo: number): string {
  const unitName = obj.unit === kiloparsec ? 'kiloparsec' : 'parsec';
  return `import { forge } from 'unitforge';
import { ${unitName}, lightYear } from 'unitforge/kits/astronomy';

// a distance in light-years is also the years the light spent travelling
const yearsAgo = forge(${unitName}, lightYear)(${formatMagnitude(obj.value)});
// → ${formatMagnitude(yearsAgo)} years ago (${obj.name})
`;
}
