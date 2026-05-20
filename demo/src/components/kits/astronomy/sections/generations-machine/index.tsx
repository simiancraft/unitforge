// Generations machine. How many lifespans does it take to get there?
// The forge does the elegant part: converting a distance into
// light-years IS converting it into the years light itself needs to
// cross it, because a light-year is defined as exactly that distance.
// So forge(distance, lightYear) gives the one-way travel time in years
// at light speed; dividing by a speed fraction and a species lifespan
// turns it into generations.
//
//   travelYearsAtC = forge(dest.unit, lightYear)(dest.value)
//   generations    = travelYearsAtC / (v / c) / lifespanYears
//
// The payoff is visceral: ~600 million human generations to reach
// Andromeda at Voyager's actual speed.

import { Bug, Dog, Footprints, type LucideIcon, PersonStanding, Turtle } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { astronomicalUnit, lightYear } from 'unitforge/kits/astronomy';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { formatMagnitude } from '~/lib/format.js';
import { head } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';
import { type AstronomyUnit } from '../../units.js';

interface Destination {
  id: string;
  name: string;
  value: number;
  unit: AstronomyUnit;
}

interface Species {
  id: string;
  name: string;
  plural: string;
  /** Adult lifespan in years. */
  lifespan: number;
  Icon: LucideIcon;
}

interface Speed {
  id: string;
  name: string;
  /** Fraction of the speed of light. */
  fraction: number;
}

const DESTINATIONS: readonly Destination[] = [
  { id: 'mars', name: 'Mars', value: 1.5, unit: astronomicalUnit },
  { id: 'proxima', name: 'Proxima Centauri', value: 4.2465, unit: lightYear },
  { id: 'pillars', name: 'Pillars of Creation', value: 7000, unit: lightYear },
  { id: 'andromeda', name: 'Andromeda Galaxy', value: 2.5e6, unit: lightYear },
];

const SPECIES: readonly Species[] = [
  { id: 'human', name: 'human', plural: 'human generations', lifespan: 73, Icon: PersonStanding },
  { id: 'dog', name: 'dog', plural: 'dog generations', lifespan: 12, Icon: Dog },
  { id: 'tortoise', name: 'Galápagos tortoise', plural: 'tortoise generations', lifespan: 150, Icon: Turtle },
  { id: 'mayfly', name: 'mayfly', plural: 'mayfly generations', lifespan: 0.0027, Icon: Bug },
];

// Voyager 1's heliocentric speed is ~17 km/s; c is 299,792.458 km/s.
const SPEEDS: readonly Speed[] = [
  { id: 'light', name: 'light speed', fraction: 1 },
  { id: 'voyager', name: "Voyager 1 (17 km/s)", fraction: 17 / 299792.458 },
];

const FALLBACK_DEST: Destination = head(DESTINATIONS);
const FALLBACK_SPECIES: Species = head(SPECIES);
const FALLBACK_SPEED: Speed = head(SPEEDS);
const ICON_CAP = 28;

export function GenerationsMachine() {
  const [destId, setDestId] = useState('andromeda');
  const [speciesId, setSpeciesId] = useState('human');
  const [speedId, setSpeedId] = useState('voyager');

  const dest = DESTINATIONS.find((d) => d.id === destId) ?? FALLBACK_DEST;
  const species = SPECIES.find((s) => s.id === speciesId) ?? FALLBACK_SPECIES;
  const speed = SPEEDS.find((s) => s.id === speedId) ?? FALLBACK_SPEED;

  const travelYearsAtC = forge(dest.unit, lightYear)(dest.value);
  const travelYears = travelYearsAtC / speed.fraction;
  const generations = travelYears / species.lifespan;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 04"
          title="generations to get there"
          kicker="the trip in lifespans"
          iconZone={<Footprints size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          A light-year is the distance light crosses in a year, so forging a distance into
          light-years hands you the one-way travel time at light speed for free. Divide by a real
          craft's speed and a species' lifespan and you get generations. At Voyager's actual pace, it
          is roughly 600 million human generations to Andromeda. Pick a trip.
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
  return (
    <div className="flex flex-col gap-4">
      <PillGroup label="destination">
        {DESTINATIONS.map((d) =>
          d.id === dest.id ? (
            <PillActive key={d.id} label={d.name} id={d.id} onPick={onDest} />
          ) : (
            <PillIdle key={d.id} label={d.name} id={d.id} onPick={onDest} />
          ),
        )}
      </PillGroup>

      <PillGroup label="traveler">
        {SPECIES.map((s) =>
          s.id === species.id ? (
            <PillActive key={s.id} label={s.name} id={s.id} onPick={onSpecies} />
          ) : (
            <PillIdle key={s.id} label={s.name} id={s.id} onPick={onSpecies} />
          ),
        )}
      </PillGroup>

      <PillGroup label="speed">
        {SPEEDS.map((s) =>
          s.id === speed.id ? (
            <PillActive key={s.id} label={s.name} id={s.id} onPick={onSpeed} />
          ) : (
            <PillIdle key={s.id} label={s.name} id={s.id} onPick={onSpeed} />
          ),
        )}
      </PillGroup>

      <Result
        label={`${dest.name}, at ${speed.name}`}
        value={`${formatMagnitude(generations)} ${species.plural}`}
        variant="hero"
        valueClassName="text-base"
      />
      <p className="text-xs text-uf-muted">
        one-way travel time: {formatMagnitude(travelYears)} years
      </p>

      <GenerationsIcons species={species} count={generations} />
    </div>
  );
}

// Decorative cluster of traveler icons. The real count lives in the
// Result; this just gives the "a whole lot of little dogs" feel, capped
// so we never try to render millions of nodes.
function GenerationsIcons({ species, count }: { species: Species; count: number }) {
  const shown = Math.max(1, Math.min(ICON_CAP, Math.round(count)));
  const Icon = species.Icon;
  return (
    <div
      className="flex flex-wrap gap-1.5 rounded-md border border-uf-border bg-uf-card p-3"
      aria-hidden
    >
      {Array.from({ length: shown }, (_, i) => (
        <Icon key={i} size={16} strokeWidth={1.5} className="text-uf-accent-2" />
      ))}
      {count > ICON_CAP ? (
        <span className="self-center text-xs text-uf-muted">+{formatMagnitude(count - shown)} more</span>
      ) : null}
    </div>
  );
}

function PillGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="uf-eyebrow">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PillActive({ label, id, onPick }: { label: string; id: string; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      aria-pressed="true"
      className="rounded-full border-2 border-uf-accent bg-uf-card px-3 py-1.5 text-xs font-semibold text-uf-accent"
    >
      {label}
    </button>
  );
}

function PillIdle({ label, id, onPick }: { label: string; id: string; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      aria-pressed="false"
      className="rounded-full border border-uf-border bg-uf-card px-3 py-1.5 text-xs text-uf-muted transition-colors hover:border-uf-accent hover:text-uf-fg"
    >
      {label}
    </button>
  );
}

function buildCode(dest: Destination, species: Species, speed: Speed, generations: number): string {
  const unitName = dest.unit === astronomicalUnit ? 'astronomicalUnit' : 'lightYear';
  const imports = unitName === 'lightYear' ? 'lightYear' : `${unitName}, lightYear`;
  const speedExpr = speed.fraction === 1 ? '1' : '(17 / 299792.458)';
  return `import { forge } from 'unitforge';
import { ${imports} } from 'unitforge/kits/astronomy';

// a light-year is how far light travels in a year, so converting a
// distance to light-years gives the one-way travel time at light speed.
const travelYearsAtC = forge(${unitName}, lightYear)(${formatMagnitude(dest.value)});
const travelYears = travelYearsAtC / ${speedExpr};
const generations = travelYears / ${species.lifespan}; // ${species.name} lifespan, years
// → ${formatMagnitude(generations)} ${species.plural}
`;
}
