// Antiquity kit chassis. Two themes: papyrus (light) and lamplit-
// bronze (dark). Owns the page bench state; sections live in
// ./sections/. The bench is length-only (the Bench is generic over a
// single dimension, and length is the iconic antiquity story: every
// civilization's "foot"). The backdrop is bench-reactive: the slider's
// normalized position drives the tally-field density.

import { Landmark } from 'lucide-react';
import { useState } from 'react';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { AntiquityBackdrop } from './parts/antiquity-backdrop.js';
import { CoinScale } from './sections/coin-scale/index.js';
import { HelloAntiquity } from './sections/hello-antiquity.js';
import { RulersOfEmpire } from './sections/rulers-of-empire/index.js';
import { ANTIQUITY_LENGTH_BENCH, antiquityLengthBoundsFor } from './units.js';
import './antiquity.css';

export function AntiquityScreen() {
  const [bench, setBench] = useState<BenchState>({
    fromId: 'pes-romanus',
    toId: 'meter',
    value: 100,
  });
  const benchBounds = antiquityLengthBoundsFor(bench.fromId);

  // Normalized slider position (0..1) for backdrop intensity.
  const intensity =
    benchBounds.max > benchBounds.min
      ? (bench.value - benchBounds.min) / (benchBounds.max - benchBounds.min)
      : 0.4;

  const handleBenchChange = (next: BenchState) => {
    if (next.fromId !== bench.fromId) {
      setBench({ ...next, value: antiquityLengthBoundsFor(next.fromId).init });
      return;
    }
    setBench(next);
  };

  return (
    <KitLayout
      backdropZone={<AntiquityBackdrop intensity={intensity} />}
      headerZone={
        <header className="relative flex flex-col gap-2">
          <p className="uf-eyebrow">kit · 06</p>
          <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">antiquity</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-uf-muted">
            ~90 pre-modern atoms across eight civilizations: Egyptian, Mesopotamian, Greek, Roman,
            Hebrew, Chinese, Japanese, and pre-1835 English. Every culture invented a "foot" and a
            "cubit" at its own magnitude; the bench converts an ancient length into a modern meter,
            and the sections below lay the empires' rulers and coins side by side. For classics
            translation, numismatics, and archaeology; not for clinical or commercial use.
          </p>
        </header>
      }
      benchZone={
        <Bench
          state={bench}
          onChange={handleBenchChange}
          options={ANTIQUITY_LENGTH_BENCH}
          min={benchBounds.min}
          max={benchBounds.max}
          step={benchBounds.step}
          codeFor={(s, r) =>
            `forge(${toJsName(findById(ANTIQUITY_LENGTH_BENCH, s.fromId).id)}, ${toJsName(findById(ANTIQUITY_LENGTH_BENCH, s.toId).id)})(${formatMagnitude(s.value)}); // ${formatMagnitude(r)}`
          }
          label="forge bench · antiquity (length)"
        />
      }
      sectionsZone={
        <>
          <HelloAntiquity />
          <RulersOfEmpire />
          <CoinScale />
        </>
      }
    />
  );
}

export const meta: KitMeta = {
  id: 'antiquity',
  label: 'antiquity',
  blurb:
    '~90 atoms across 8 civilizations. The foot every empire reinvented, the coins of antiquity, and the cubits that built the pyramids. For Herodotus, not the clinic.',
  defaultThemeId: 'antiquity-dark',
  icon: Landmark,
  previewBg: () => <AntiquityBackdrop inline />,
};
