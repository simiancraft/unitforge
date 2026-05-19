// Temperature kit chassis. Two themes: lab-paper (light) and arctic-
// to-ember (dark). Owns Bench state; sections live in ./sections/.
// The backdrop is bench-reactive: the slider's normalized position
// drives the gradient hue mix (cold→warm) and the particle jitter
// rate (slow → fast, mapping the molecular-motion picture of
// temperature).

import { Thermometer } from 'lucide-react';
import { useState } from 'react';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { TemperatureBackdrop } from './parts/temperature-backdrop.js';
import { HelloTemperature } from './sections/hello-temperature.js';
import { TEMPERATURE_ALL_UNITS, temperatureBoundsFor } from './units.js';
import './temperature.css';

export function TemperatureScreen() {
  const [bench, setBench] = useState<BenchState>({
    fromId: 'celsius',
    toId: 'fahrenheit',
    value: 20,
  });
  const benchBounds = temperatureBoundsFor(bench.fromId);

  // Normalized slider position (0..1) for backdrop intensity. The
  // bounds here run from cold-edge to baking-hot, so the t-value
  // maps directly to "how warm is the current selection."
  const intensity =
    benchBounds.max > benchBounds.min
      ? (bench.value - benchBounds.min) / (benchBounds.max - benchBounds.min)
      : 0.4;

  const handleBenchChange = (next: BenchState) => {
    if (next.fromId !== bench.fromId) {
      setBench({ ...next, value: temperatureBoundsFor(next.fromId).init });
      return;
    }
    setBench(next);
  };

  return (
    <KitLayout
      backdropZone={<TemperatureBackdrop intensity={intensity} />}
      headerZone={
        <header className="relative flex flex-col gap-2">
          <p className="uf-eyebrow">kit · 05</p>
          <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">temperature</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-uf-muted">
            Kelvin, Celsius, Fahrenheit, Rankine. The kit's first-affine surface: every conversion
            carries an offset (water freezes at 273.15 K = 0 °C = 32 °F = 491.67 °R). The headline
            gotcha is values vs deltas; the kit ships values for v1, and the demo below makes the
            distinction visible.
          </p>
        </header>
      }
      benchZone={
        <Bench
          state={bench}
          onChange={handleBenchChange}
          options={TEMPERATURE_ALL_UNITS}
          min={benchBounds.min}
          max={benchBounds.max}
          step={benchBounds.step}
          codeFor={(s, r) =>
            `forge(${toJsName(findById(TEMPERATURE_ALL_UNITS, s.fromId).id)}, ${toJsName(findById(TEMPERATURE_ALL_UNITS, s.toId).id)})(${formatMagnitude(s.value)}); // ${formatMagnitude(r)}`
          }
          label="forge bench · temperature"
        />
      }
      sectionsZone={
        <>
          <HelloTemperature />
        </>
      }
    />
  );
}

export const meta: KitMeta = {
  id: 'temperature',
  label: 'temperature',
  blurb:
    'K, °C, °F, °R. Affine conversions, the -40 cross-point, and the values-vs-deltas gotcha that every other lib gets wrong.',
  defaultThemeId: 'temperature-dark',
  icon: Thermometer,
  previewBg: () => <TemperatureBackdrop inline />,
};
