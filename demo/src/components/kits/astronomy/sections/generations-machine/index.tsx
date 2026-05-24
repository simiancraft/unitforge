// Generations machine. How many lifespans does it take to get there?
// The forge does the elegant part: converting a distance into
// light-years IS converting it into the years light itself needs to
// cross it, because a light-year is defined as exactly that distance.
// So forge(distance, lightYear) gives the one-way travel time in years
// at light speed; dividing by a speed fraction and a species lifespan
// turns it into generations.
//
//   travelYearsAtC = forge(dest.unit, lightYear)(dest.value)
//   travelYears    = travelYearsAtC / (kms / c)
//   generations    = travelYears / lifespanYears
//
// Examples the widget can answer: an ark of Galápagos tortoises bound
// for the Pillars of Creation, or mayfly generations out to Neptune.
// The control panel reads left to right as one sentence: a traveler,
// at a speed, to a destination.

import { Bug, Dog, type LucideIcon, PersonStanding, Rocket, Turtle } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { astronomicalUnit, lightYear } from 'unitforge/kits/astronomy';
import { CodeBlock } from '~/components/ui/code-block.js';
import { formatMagnitude } from '~/lib/format.js';
import { head } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';
import { GroupedSelect, type PickerGroup } from '../../parts/grouped-select.js';
import type { AstronomyUnit } from '../../units.js';

// Speed of light in km/s; the denominator for every speed fraction.
const C_KMS = 299792.458;
const ICON_CAP = 28;

interface Destination {
  id: string;
  name: string;
  value: number;
  unit: AstronomyUnit;
}

interface Species {
  id: string;
  name: string;
  /** Plural noun for the summary sentence ("mayflies", "humans"). */
  pluralNoun: string;
  /** Adult lifespan in years. */
  lifespan: number;
  Icon: LucideIcon;
}

interface Speed {
  id: string;
  name: string;
  /** Speed in km/s; the fraction of c is kms / C_KMS. */
  kms: number;
  /** Human-readable rate shown beside the name. */
  rate: string;
}

// Destinations, grouped by scale. Planets carry their mean distance from
// the Sun in au (so the implied origin is the Sun, and Earth is a real
// 1 au rung rather than a degenerate zero); everything past the solar
// system is catalogued in light-years.
const PLANETS: readonly Destination[] = [
  { id: 'mercury', name: 'Mercury', value: 0.387, unit: astronomicalUnit },
  { id: 'venus', name: 'Venus', value: 0.723, unit: astronomicalUnit },
  { id: 'earth', name: 'Earth', value: 1.0, unit: astronomicalUnit },
  { id: 'mars', name: 'Mars', value: 1.524, unit: astronomicalUnit },
  { id: 'jupiter', name: 'Jupiter', value: 5.203, unit: astronomicalUnit },
  { id: 'saturn', name: 'Saturn', value: 9.582, unit: astronomicalUnit },
  { id: 'uranus', name: 'Uranus', value: 19.191, unit: astronomicalUnit },
  { id: 'neptune', name: 'Neptune', value: 30.07, unit: astronomicalUnit },
  { id: 'pluto', name: 'Pluto', value: 39.482, unit: astronomicalUnit },
];

const EXOPLANETS: readonly Destination[] = [
  { id: 'proxima-b', name: 'Proxima Centauri b', value: 4.2465, unit: lightYear },
  { id: 'trappist', name: 'TRAPPIST-1', value: 40.7, unit: lightYear },
  { id: 'kepler-186f', name: 'Kepler-186f', value: 582, unit: lightYear },
  { id: 'kepler-452b', name: 'Kepler-452b', value: 1402, unit: lightYear },
];

const DEEP_SKY: readonly Destination[] = [
  { id: 'pillars', name: 'Pillars of Creation', value: 7000, unit: lightYear },
  { id: 'galactic-center', name: 'the galactic center', value: 26000, unit: lightYear },
  { id: 'andromeda', name: 'Andromeda Galaxy', value: 2.5e6, unit: lightYear },
  { id: 'edge', name: 'edge of the observable universe', value: 4.65e10, unit: lightYear },
];

const DESTINATIONS: readonly Destination[] = [...PLANETS, ...EXOPLANETS, ...DEEP_SKY];

const SPECIES: readonly Species[] = [
  { id: 'human', name: 'humans', pluralNoun: 'humans', lifespan: 73, Icon: PersonStanding },
  { id: 'dog', name: 'dogs', pluralNoun: 'dogs', lifespan: 12, Icon: Dog },
  {
    id: 'tortoise',
    name: 'Galápagos tortoises',
    pluralNoun: 'Galápagos tortoises',
    lifespan: 150,
    Icon: Turtle,
  },
  { id: 'mayfly', name: 'mayflies', pluralNoun: 'mayflies', lifespan: 0.0027, Icon: Bug },
];

// Slowest to fastest: an everyday anchor, then the fastest things people
// have actually built, then light itself. Parker Solar Probe is the
// fastest human-made object; Voyager 1 is the farthest.
const SPEEDS: readonly Speed[] = [
  { id: 'car', name: 'a car', kms: 0.027778, rate: '100 km/h' },
  { id: 'jet', name: 'a jet', kms: 0.25, rate: '900 km/h' },
  { id: 'voyager', name: 'Voyager 1', kms: 17, rate: '17 km/s' },
  { id: 'parker', name: 'Parker Solar Probe', kms: 190, rate: '190 km/s' },
  { id: 'light', name: 'light speed', kms: C_KMS, rate: '299,792 km/s' },
];

const FALLBACK_DEST: Destination = head(DESTINATIONS);
const FALLBACK_SPECIES: Species = head(SPECIES);
const FALLBACK_SPEED: Speed = head(SPEEDS);

const SPEED_GROUPS: readonly PickerGroup[] = [
  { options: SPEEDS.map((s) => ({ id: s.id, label: s.name, hint: s.rate })) },
];

const DESTINATION_GROUPS: readonly PickerGroup[] = [
  { label: 'the planets', options: PLANETS.map(toDestOption) },
  { label: 'exoplanets & nearby stars', options: EXOPLANETS.map(toDestOption) },
  { label: 'deep sky', options: DEEP_SKY.map(toDestOption) },
];

function toDestOption(d: Destination) {
  return { id: d.id, label: d.name, hint: `${formatMagnitude(d.value)} ${d.unit.symbol}` };
}

export function GenerationsMachine() {
  const [destId, setDestId] = useState('pillars');
  const [speciesId, setSpeciesId] = useState('tortoise');
  const [speedId, setSpeedId] = useState('voyager');

  const dest = DESTINATIONS.find((d) => d.id === destId) ?? FALLBACK_DEST;
  const species = SPECIES.find((s) => s.id === speciesId) ?? FALLBACK_SPECIES;
  const speed = SPEEDS.find((s) => s.id === speedId) ?? FALLBACK_SPEED;

  const travelYearsAtC = forge(dest.unit, lightYear)(dest.value);
  const travelYears = travelYearsAtC / (speed.kms / C_KMS);
  const generations = travelYears / species.lifespan;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 03"
          title="generations to get there"
          kicker="the trip in lifespans"
          iconZone={<Rocket size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          How many generations of Galápagos tortoises, crewing an ark at Voyager's pace, would reach
          the Pillars of Creation? How many mayfly generations to limp out to Neptune? A light-year
          is the distance light crosses in a year, so forging a distance into light-years measures
          it against a lifespan instead: the one-way trip, counted in generations. Pick a traveler,
          a speed, and a destination.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <GenerationsWidget
              dest={dest}
              species={species}
              speed={speed}
              generations={generations}
              travelYears={travelYears}
              onDest={setDestId}
              onSpecies={setSpeciesId}
              onSpeed={setSpeedId}
            />
          }
          codeZone={<CodeBlock code={buildCode(dest, species, speed, generations)} />}
        />
      }
    />
  );
}

interface GenerationsWidgetProps {
  dest: Destination;
  species: Species;
  speed: Speed;
  generations: number;
  travelYears: number;
  onDest: (id: string) => void;
  onSpecies: (id: string) => void;
  onSpeed: (id: string) => void;
}

function GenerationsWidget({
  dest,
  species,
  speed,
  generations,
  travelYears,
  onDest,
  onSpecies,
  onSpeed,
}: GenerationsWidgetProps) {
  // Traveler options carry the species glyph; built here (not at module
  // scope) so the JSX lives inside a component.
  const travelerGroups: PickerGroup[] = [
    {
      options: SPECIES.map((s) => {
        const Icon = s.Icon;
        return { id: s.id, label: s.name, icon: <Icon size={14} strokeWidth={1.5} /> };
      }),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* input: traveler → speed → destination, read as one sentence */}
      <div className="grid gap-3 sm:grid-cols-3">
        <GroupedSelect
          label="traveler"
          value={species.id}
          groups={travelerGroups}
          onChange={onSpecies}
        />
        <GroupedSelect label="speed" value={speed.id} groups={SPEED_GROUPS} onChange={onSpeed} />
        <GroupedSelect
          label="destination"
          value={dest.id}
          groups={DESTINATION_GROUPS}
          onChange={onDest}
        />
      </div>

      {/* visual: a cluster of travelers, capped */}
      <GenerationsIcons species={species} count={generations} />

      {/* summary: the templated sentence with the key numbers colored */}
      <GenerationsSummary
        dest={dest}
        species={species}
        generations={generations}
        travelYears={travelYears}
      />
    </div>
  );
}

function GenerationsSummary({
  dest,
  species,
  generations,
  travelYears,
}: {
  dest: Destination;
  species: Species;
  generations: number;
  travelYears: number;
}) {
  return (
    <p className="m-0 text-pretty border-t border-uf-border pt-3 text-sm leading-relaxed text-uf-fg">
      It would take{' '}
      <span className="mono whitespace-nowrap font-semibold tabular-nums text-uf-accent">
        {formatMagnitude(generations)}
      </span>{' '}
      generations of {species.pluralNoun} over{' '}
      <span className="mono whitespace-nowrap font-semibold tabular-nums text-uf-accent-2">
        {formatMagnitude(travelYears)} years
      </span>{' '}
      to reach {dest.name}.
    </p>
  );
}

// Decorative cluster of traveler icons. The real count lives in the
// summary; this just gives the "a whole lot of little mayflies" feel,
// capped so we never try to render millions of nodes.
function GenerationsIcons({ species, count }: { species: Species; count: number }) {
  const shown = Math.max(1, Math.min(ICON_CAP, Math.round(count)));
  const Icon = species.Icon;
  // Stable per-slot keys so the decorative cluster doesn't key on the
  // raw map index (the icons are identical and never reorder).
  const slots = Array.from({ length: shown }, (_, i) => `${species.id}-${i}`);
  return (
    <div
      className="flex flex-wrap gap-1.5 rounded-md border border-uf-border bg-uf-card p-3"
      aria-hidden
    >
      {slots.map((slot) => (
        <Icon key={slot} size={16} strokeWidth={1.5} className="text-uf-accent-2" />
      ))}
      {count > ICON_CAP ? (
        <span className="self-center text-xs text-uf-muted">
          +{formatMagnitude(count - shown)} more
        </span>
      ) : null}
    </div>
  );
}

function buildCode(dest: Destination, species: Species, speed: Speed, generations: number): string {
  const unitName = dest.unit === astronomicalUnit ? 'astronomicalUnit' : 'lightYear';
  const imports = unitName === 'lightYear' ? 'lightYear' : `${unitName}, lightYear`;
  const speedExpr = speed.id === 'light' ? '1' : `${speed.kms} / 299792.458`;
  return `import { forge } from 'unitforge';
import { ${imports} } from 'unitforge/kits/astronomy';

// a light-year is how far light travels in a year, so converting a
// distance to light-years gives the one-way travel time at light speed.
const travelYearsAtC = forge(${unitName}, lightYear)(${formatMagnitude(dest.value)});
const travelYears = travelYearsAtC / (${speedExpr}); // ${speed.name}, ${speed.rate}
const generations = travelYears / ${species.lifespan}; // ${species.name} lifespan, years
// → ${formatMagnitude(generations)} generations of ${species.pluralNoun}
`;
}
