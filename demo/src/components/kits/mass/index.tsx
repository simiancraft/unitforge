// Mass kit chassis. Two abstract themes: balance-paper (light) and
// gravity-well (dark). Owns Bench state; sections live in ./sections/
// as SectionLayout composers. The backdrop is ambient (no pulse-on-
// interact hook today; reactive variant is a follow-up).
//
// All theme orchestration (CSS variable cascade, shiki theme selection)
// lives at the root ThemeProvider; the kit is a pure renderer.

import { Scale } from 'lucide-react';
import { useState } from 'react';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { MassBackdrop } from './parts/mass-backdrop.js';
import { HelloMass } from './sections/hello-mass.js';
import { ThreeJinsMachine } from './sections/three-jins-machine/index.js';
import { MASS_ALL_UNITS, massBoundsFor } from './units.js';
import './mass.css';

export function MassScreen() {
  const [bench, setBench] = useState<BenchState>({
    fromId: 'kilogram',
    toId: 'pound',
    value: 1,
  });
  const benchBounds = massBoundsFor(bench.fromId);

  // Same intercept pattern the cooking kit uses: a from-unit swap
  // resets value to that unit's pedagogical init so the slider never
  // strands at a position that disagrees with the new unit's range.
  const handleBenchChange = (next: BenchState) => {
    if (next.fromId !== bench.fromId) {
      setBench({ ...next, value: massBoundsFor(next.fromId).init });
      return;
    }
    setBench(next);
  };

  return (
    <KitLayout
      backdropZone={<MassBackdrop />}
      headerZone={
        <header className="relative flex flex-col gap-2">
          <p className="uf-eyebrow">kit · 04</p>
          <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">mass</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-uf-muted">
            SI through customary through Asian regional. The killer story is the regional split: PRC
            market jin (500 g), HK / Taiwan catty (600 g), and Singapore statutory catty (604.79 g)
            all share the same character (斤) and differ by up to 20%. Every readout below is a real
            forge call against the built package.
          </p>
        </header>
      }
      benchZone={
        <Bench
          state={bench}
          onChange={handleBenchChange}
          options={MASS_ALL_UNITS}
          min={benchBounds.min}
          max={benchBounds.max}
          step={benchBounds.step}
          codeFor={(s, r) =>
            `forge(${toJsName(findById(MASS_ALL_UNITS, s.fromId).id)}, ${toJsName(findById(MASS_ALL_UNITS, s.toId).id)})(${formatMagnitude(s.value)}); // ${formatMagnitude(r)}`
          }
          label="forge bench · mass"
        />
      }
      sectionsZone={
        <>
          <HelloMass />
          <ThreeJinsMachine />
        </>
      }
    />
  );
}

export const meta: KitMeta = {
  id: 'mass',
  label: 'mass',
  blurb:
    'kg, lb, stone, ton, jin, catty. SI, customary, and the regional disambiguation that surprises people.',
  defaultThemeId: 'mass-dark',
  icon: Scale,
  previewBg: () => <MassBackdrop inline />,
};
