// Light-delay machine. The solar system measured in how long light
// takes to cross it. Pick a destination; the distance (heliocentric,
// in au) forges into light-minutes and light-hours, the units mission
// controllers actually use for one-way communication delay. A command
// to Voyager 1 takes the better part of a day to arrive.

import { Radio } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { astronomicalUnit, lightHour, lightMinute } from 'unitforge/kits/astronomy';
import { kilometer } from 'unitforge/kits/length';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { formatMagnitude } from '~/lib/format.js';
import { head } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';

interface Destination {
  id: string;
  name: string;
  /** Distance from the Sun in astronomical units (heliocentric mean). */
  au: number;
  /** Editorial caveat shown under the readout. */
  hint: string;
}

// Heliocentric mean distances (au). Voyager 1 is its ~2026 distance
// from the Sun; the others are mean orbital radii.
const DESTINATIONS: readonly Destination[] = [
  { id: 'mercury', name: 'Mercury', au: 0.387, hint: 'innermost planet' },
  { id: 'earth', name: 'Earth', au: 1.0, hint: 'the Sun-to-Earth benchmark' },
  { id: 'mars', name: 'Mars', au: 1.524, hint: 'mean orbital radius' },
  { id: 'jupiter', name: 'Jupiter', au: 5.203, hint: 'the gas giant' },
  { id: 'saturn', name: 'Saturn', au: 9.582, hint: 'the ringed planet' },
  { id: 'neptune', name: 'Neptune', au: 30.07, hint: 'outermost planet' },
  { id: 'voyager-1', name: 'Voyager 1', au: 167, hint: 'farthest human-made object (~2026)' },
];

const FALLBACK: Destination = head(DESTINATIONS);

export function LightDelayMachine() {
  const [id, setId] = useState<string>('voyager-1');
  const dest = DESTINATIONS.find((d) => d.id === id) ?? FALLBACK;

  const minutes = forge(astronomicalUnit, lightMinute)(dest.au);
  const hours = forge(astronomicalUnit, lightHour)(dest.au);
  // Read in the unit that gives a legible number: hours past 90 min.
  const delay =
    minutes >= 90
      ? `${formatMagnitude(hours)} light-hours`
      : `${formatMagnitude(minutes)} light-minutes`;
  const km = forge(astronomicalUnit, kilometer)(dest.au);

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="the speed of a command"
          kicker="the solar system in light-minutes"
          iconZone={<Radio size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Type a command to Voyager 1 and it spends most of a day in flight before the spacecraft
          hears it. Light is the speed limit, so distance is delay; pick a destination and its
          heliocentric distance forges into the light-minutes and light-hours mission control plans
          around. Sunlight, for the record, is already 8.3 minutes old when it reaches you.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={<DelayWidget dest={dest} delay={delay} km={km} onPick={setId} />}
          codeZone={<CodeBlock code={buildCode(dest)} />}
        />
      }
    />
  );
}

interface DelayWidgetProps {
  dest: Destination;
  delay: string;
  km: number;
  onPick: (id: string) => void;
}

function DelayWidget({ dest, delay, km, onPick }: DelayWidgetProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {DESTINATIONS.map((d) =>
          d.id === dest.id ? (
            <DestPillActive key={d.id} dest={d} onPick={onPick} />
          ) : (
            <DestPillIdle key={d.id} dest={d} onPick={onPick} />
          ),
        )}
      </div>

      <Result
        label={`light to ${dest.name}`}
        value={`${delay} · ${formatMagnitude(dest.au)} au · ${formatMagnitude(km)} km`}
        variant="hero"
        valueClassName="text-base"
      />
      <p className="text-xs text-uf-muted">{dest.hint}</p>
    </div>
  );
}

function DestPillActive({ dest, onPick }: { dest: Destination; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(dest.id)}
      aria-pressed="true"
      className="rounded-full border-2 border-uf-accent bg-uf-card px-3 py-1.5 text-xs font-semibold text-uf-accent"
    >
      {dest.name}
    </button>
  );
}

function DestPillIdle({ dest, onPick }: { dest: Destination; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(dest.id)}
      aria-pressed="false"
      className="rounded-full border border-uf-border bg-uf-card px-3 py-1.5 text-xs text-uf-muted transition-colors hover:border-uf-accent hover:text-uf-fg"
    >
      {dest.name}
    </button>
  );
}

function buildCode(dest: Destination): string {
  const min = forge(astronomicalUnit, lightMinute)(dest.au);
  const hr = forge(astronomicalUnit, lightHour)(dest.au);
  return `import { forge } from 'unitforge';
import { astronomicalUnit, lightMinute, lightHour } from 'unitforge/kits/astronomy';

// ${dest.name}: ${formatMagnitude(dest.au)} au from the Sun
forge(astronomicalUnit, lightMinute)(${formatMagnitude(dest.au)}); // ${formatMagnitude(min)} lmin
forge(astronomicalUnit, lightHour)(${formatMagnitude(dest.au)});   // ${formatMagnitude(hr)} lh
`;
}
