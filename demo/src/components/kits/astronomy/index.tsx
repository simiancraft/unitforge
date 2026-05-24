// Astronomy kit chassis. Two themes: star-chart (light) and deep-space
// (dark). Owns the page bench state; sections live in ./sections/. All
// nine kit atoms are LENGTH, so the bench is a straight unit-to-unit
// converter across the astronomical scale ladder. The backdrop is
// bench-reactive: the selected unit's place on that ladder drives the
// BabylonJS camera dolly (kilometer holds tight on the system,
// gigaparsec pulls back to deep field).

import { Telescope } from 'lucide-react';
import { useState } from 'react';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { SolarSystemBackdrop } from './parts/solar-system-backdrop.js';
import { DistanceLadder } from './sections/distance-ladder.js';
import { GenerationsMachine } from './sections/generations-machine/index.js';
import { HubbleMachine } from './sections/hubble-machine/index.js';
import { LightDelayMachine } from './sections/light-delay-machine/index.js';
import { ScaleModelMachine } from './sections/scale-model-machine/index.js';
import { StandingStillMachine } from './sections/standing-still-machine/index.js';
import { TelescopeMachine } from './sections/telescope-machine/index.js';
import { ASTRONOMY_ALL_UNITS, ASTRONOMY_UNIT_IDS, astronomyBoundsFor } from './units.js';
import './astronomy.css';

export function AstronomyScreen() {
  const [bench, setBench] = useState<BenchState>({
    fromId: 'astronomical-unit',
    toId: 'light-minute',
    value: 1,
  });
  const benchBounds = astronomyBoundsFor(bench.fromId);

  // Backdrop zoom is driven by the `from` unit: kilometer (index 0)
  // holds the camera tight on the system, gigaparsec (last) pulls it to
  // deep field. Each unit pick is a step.
  const fromIndex = ASTRONOMY_UNIT_IDS.indexOf(bench.fromId as (typeof ASTRONOMY_UNIT_IDS)[number]);
  const zoom = fromIndex < 0 ? 0.35 : fromIndex / (ASTRONOMY_UNIT_IDS.length - 1);

  // The `to` unit picks the camera's focus: there is one celestial body
  // per unit (index 0 = the star, 1..n = the planets), so changing the
  // target unit flies the camera over to a different body.
  const toIndex = ASTRONOMY_UNIT_IDS.indexOf(bench.toId as (typeof ASTRONOMY_UNIT_IDS)[number]);
  const focus = toIndex < 0 ? 0 : toIndex;

  // The bench value slider sweeps the camera's orbit (alpha) around its
  // focused body: dragging it left to right walks the camera around the
  // point of interest. Normalize value to 0..1 within the unit's band.
  const span = benchBounds.max - benchBounds.min;
  const orbit = span > 0 ? (bench.value - benchBounds.min) / span : 0;

  const handleBenchChange = (next: BenchState) => {
    if (next.fromId !== bench.fromId) {
      setBench({ ...next, value: astronomyBoundsFor(next.fromId).init });
      return;
    }
    setBench(next);
  };

  return (
    <KitLayout
      backdropZone={<SolarSystemBackdrop zoom={zoom} focus={focus} orbit={orbit} />}
      headerZone={
        <header className="relative flex flex-col gap-2">
          <p className="uf-eyebrow">kit · 07</p>
          <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">astronomy</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-uf-muted">
            Nine length atoms from the astronomical unit to the gigaparsec, all exact per IAU
            resolutions. The bench converts across the scale ladder; the sections measure the solar
            system in minutes of light and turn the Hubble constant into the age of the universe.
          </p>
        </header>
      }
      benchZone={
        <Bench
          state={bench}
          onChange={handleBenchChange}
          options={ASTRONOMY_ALL_UNITS}
          min={benchBounds.min}
          max={benchBounds.max}
          step={benchBounds.step}
          codeFor={(s, r) =>
            `forge(${toJsName(findById(ASTRONOMY_ALL_UNITS, s.fromId).id)}, ${toJsName(findById(ASTRONOMY_ALL_UNITS, s.toId).id)})(${formatMagnitude(s.value)}); // ${formatMagnitude(r)}`
          }
          label="forge bench · astronomy"
        />
      }
      sectionsZone={
        <>
          <DistanceLadder />
          <LightDelayMachine />
          <GenerationsMachine />
          <HubbleMachine />
          <TelescopeMachine />
          <ScaleModelMachine />
          <StandingStillMachine />
        </>
      }
    />
  );
}

export const meta: KitMeta = {
  id: 'astronomy',
  label: 'astronomy',
  blurb:
    'au, light-year, parsec, and the cosmological ladder up to the gigaparsec. Measure the solar system in light-minutes; turn H0 into the age of the universe.',
  defaultThemeId: 'astronomy-dark',
  icon: Telescope,
  previewBg: () => <SolarSystemBackdrop inline />,
};
