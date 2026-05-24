// Telescope time machine. To look out is to look back: the light
// reaching you left its source as long ago as the distance, in
// light-travel time, says. Nearby bodies are catalogued in light-
// seconds to light-hours (the Moon is barely a second away, the Sun
// eight minutes); stars and galaxies in parsecs. Forging any of those
// distances into light-years gives a duration that reads directly as
// "ago", which we render at whatever scale fits (seconds up to millions
// of years). Pair the number with what was happening when the light left.

import { History } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import {
  kiloparsec,
  lightHour,
  lightMinute,
  lightSecond,
  lightYear,
  parsec,
} from 'unitforge/kits/astronomy';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { head } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';
import { GroupedSelect, type PickerGroup } from '../../parts/grouped-select.js';
import type { AstronomyUnit } from '../../units.js';

interface SkyObject {
  id: string;
  name: string;
  value: number;
  unit: AstronomyUnit;
  /** What was happening when this light left. */
  era: string;
}

// Julian year in seconds; the rung-picker's base for sub-year durations.
const SECONDS_PER_YEAR = 365.25 * 24 * 3600;

// Nearby bodies, in light-travel time from the Sun (the Moon from
// Earth). Light-time straight from the catalogued distance, so the forge
// to light-years is a genuine conversion. Outer-planet light-times use
// heliocentric distance, within a few light-minutes of the Earth value.
const SOLAR_SYSTEM: readonly SkyObject[] = [
  {
    id: 'moon',
    name: 'the Moon',
    value: 1.282,
    unit: lightSecond,
    era: 'barely a second ago; as live as the night sky ever gets',
  },
  {
    id: 'sun',
    name: 'the Sun',
    value: 8.317,
    unit: lightMinute,
    era: 'eight minutes ago; if it blinked out, you would not yet know',
  },
  { id: 'mars', name: 'Mars', value: 12.67, unit: lightMinute, era: 'a few minutes ago' },
  {
    id: 'jupiter',
    name: 'Jupiter',
    value: 43.27,
    unit: lightMinute,
    era: 'about three quarters of an hour ago',
  },
  { id: 'saturn', name: 'Saturn', value: 1.328, unit: lightHour, era: 'a bit over an hour ago' },
  { id: 'uranus', name: 'Uranus', value: 2.66, unit: lightHour, era: 'a couple of hours ago' },
  { id: 'neptune', name: 'Neptune', value: 4.17, unit: lightHour, era: 'about four hours ago' },
  { id: 'pluto', name: 'Pluto', value: 5.47, unit: lightHour, era: 'more than five hours ago' },
  {
    id: 'sedna',
    name: 'Sedna (at aphelion)',
    value: 129.9,
    unit: lightHour,
    era: 'days ago, out near the far end of its orbit',
  },
];

// Distances in their commonly-catalogued units (parsecs for stars,
// kiloparsecs for the galaxy). Betelgeuse's distance is uncertain
// (~500-650 ly); 168 pc is a mid-range modern estimate.
const DEEP_SKY: readonly SkyObject[] = [
  {
    id: 'proxima',
    name: 'Proxima Centauri',
    value: 1.302,
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

const OBJECTS: readonly SkyObject[] = [...SOLAR_SYSTEM, ...DEEP_SKY];
const FALLBACK: SkyObject = head(OBJECTS);

function toObjectOption(o: SkyObject) {
  return { id: o.id, label: o.name, hint: `${formatMagnitude(o.value)} ${o.unit.symbol}` };
}

const OBJECT_GROUPS: readonly PickerGroup[] = [
  { label: 'in the solar system', options: SOLAR_SYSTEM.map(toObjectOption) },
  { label: 'deep sky', options: DEEP_SKY.map(toObjectOption) },
];

// Render a light-travel duration (in years) at the largest rung that
// keeps the number readable: seconds for the Moon, minutes for the Sun,
// up to plain years for deep sky.
function formatLookback(years: number): string {
  const seconds = years * SECONDS_PER_YEAR;
  if (seconds < 90) return `${formatMagnitude(seconds)} seconds`;
  const minutes = seconds / 60;
  if (minutes < 90) return `${formatMagnitude(minutes)} minutes`;
  const hours = minutes / 60;
  if (hours < 36) return `${formatMagnitude(hours)} hours`;
  const days = hours / 24;
  if (days < 365) return `${formatMagnitude(days)} days`;
  return `${formatMagnitude(years)} years`;
}

export function TelescopeMachine() {
  const [id, setId] = useState('andromeda');
  const obj = OBJECTS.find((o) => o.id === id) ?? FALLBACK;
  // light-travel distance == light-travel time == how long ago.
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
          Light is fast but not instant, so everything you see in the sky is old news. A distance is
          also a duration: the time the light spent in transit. The Moon you see is a second old,
          the Sun eight minutes; Andromeda's light left before our species existed.
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
      <GroupedSelect label="object" value={obj.id} groups={OBJECT_GROUPS} onChange={onPick} />

      <Result
        label={`light from ${obj.name} left`}
        value={`${formatLookback(yearsAgo)} ago`}
        variant="hero"
        valueClassName="text-base"
      />
      <p className="text-sm leading-relaxed text-uf-muted">
        That is {formatMagnitude(obj.value)} {obj.unit.symbol} away; the light left {obj.era}.
      </p>
    </div>
  );
}

function buildCode(obj: SkyObject, yearsAgo: number): string {
  const unitName = toJsName(obj.unit.id);
  return `import { forge } from 'unitforge';
import { ${unitName}, lightYear } from 'unitforge/kits/astronomy';

// a light-travel distance is also the time the light spent travelling
const yearsAgo = forge(${unitName}, lightYear)(${formatMagnitude(obj.value)});
// → ${formatLookback(yearsAgo)} ago (${obj.name})
`;
}
