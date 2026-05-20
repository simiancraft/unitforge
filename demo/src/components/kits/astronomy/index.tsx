// Astronomy kit chassis. Two themes: star-chart (light) and deep-space
// (dark). Owns the page bench state; sections live in ./sections/. All
// nine kit atoms are LENGTH, so the bench is a straight unit-to-unit
// converter across the astronomical scale ladder. The backdrop is
// bench-reactive: the slider's normalized position drives the starfield
// twinkle rate.

import { Telescope } from 'lucide-react';
import { useState } from 'react';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { AstronomyBackdrop } from './parts/astronomy-backdrop.js';
import { DistanceLadder } from './sections/distance-ladder.js';
import { HubbleMachine } from './sections/hubble-machine/index.js';
import { LightDelayMachine } from './sections/light-delay-machine/index.js';
import { ASTRONOMY_ALL_UNITS, astronomyBoundsFor } from './units.js';
import './astronomy.css';

export function AstronomyScreen() {
  const [bench, setBench] = useState<BenchState>({
    fromId: 'astronomical-unit',
    toId: 'light-minute',
    value: 1,
  });
  const benchBounds = astronomyBoundsFor(bench.fromId);

  const intensity =
    benchBounds.max > benchBounds.min
      ? (bench.value - benchBounds.min) / (benchBounds.max - benchBounds.min)
      : 0.4;

  const handleBenchChange = (next: BenchState) => {
    if (next.fromId !== bench.fromId) {
      setBench({ ...next, value: astronomyBoundsFor(next.fromId).init });
      return;
    }
    setBench(next);
  };

  return (
    <KitLayout
      backdropZone={<AstronomyBackdrop intensity={intensity} />}
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
          <HubbleMachine />
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
  previewBg: () => <AstronomyBackdrop inline />,
};
