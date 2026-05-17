// Cooking kit chassis. Recipe-card light + late-night-kitchen dark.
// Owns Bench state; sections live in ./sections/ as SectionLayout
// composers. The recipe-card backdrop's drip animation is always on
// (ambient page texture); no pulse-on-interact hook.
//
// All theme orchestration (CSS variable cascade, shiki theme selection)
// lives at the root ThemeProvider; the kit is a pure renderer.

import { ChefHat } from 'lucide-react';
import { useState } from 'react';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { glyphScaleFor } from './parts/backdrop-scales.js';
import { CookingBackdrop } from './parts/cooking-backdrop.js';
import { ComparisonMachine } from './sections/comparison-machine/index.js';
import { HelloCooking } from './sections/hello-cooking.js';
import { RecipeMachine } from './sections/recipe-machine/index.js';
import { COOKING_ALL_UNITS, cookingBoundsFor } from './units.js';
import './cooking.css';

export function CookingScreen() {
  const [bench, setBench] = useState<BenchState>({
    fromId: 'cup-us',
    toId: 'cup-uk',
    value: 1,
  });
  const benchBounds = cookingBoundsFor(bench.fromId);
  const fromUnit = findById(COOKING_ALL_UNITS, bench.fromId);
  const glyphScale = glyphScaleFor(fromUnit, bench.value, benchBounds.min, benchBounds.max);

  // Bench owns no per-unit bounds awareness; intercept its `onChange`
  // so a from-unit swap also snaps `value` to that unit's pedagogical
  // init. Otherwise the user picks `pinch` from the dropdown and
  // inherits a value like `1` clamped against pinch's `(1..32, step 1)`
  // range, which is fine, but a switch from `pinch` to `cup-us`
  // strands `value` at 32 inside a `(0.25..8)` cup range and the slider
  // visually pegs the right edge.
  const handleBenchChange = (next: BenchState) => {
    if (next.fromId !== bench.fromId) {
      setBench({ ...next, value: cookingBoundsFor(next.fromId).init });
      return;
    }
    setBench(next);
  };

  return (
    <KitLayout
      backdropZone={
        <CookingBackdrop fromUnitId={bench.fromId} toUnitId={bench.toId} glyphScale={glyphScale} />
      }
      headerZone={
        <header className="relative flex flex-col gap-2">
          <p className="uf-eyebrow">kit · 03</p>
          <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">cooking</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-uf-muted">
            Culinary volumes across US, UK, metric, Australian, and Japanese / Russian variants,
            plus tradition (stick of butter, dash, pinch). The US/UK split is the trap: same names,
            different volumes. Every readout below is a real forge call against the built package.
          </p>
        </header>
      }
      benchZone={
        <Bench
          state={bench}
          onChange={handleBenchChange}
          options={COOKING_ALL_UNITS}
          min={benchBounds.min}
          max={benchBounds.max}
          step={benchBounds.step}
          codeFor={(s, r) =>
            `forge(${toJsName(findById(COOKING_ALL_UNITS, s.fromId).id)}, ${toJsName(findById(COOKING_ALL_UNITS, s.toId).id)})(${formatMagnitude(s.value)}); // ${formatMagnitude(r)}`
          }
          label="forge bench · cooking"
        />
      }
      sectionsZone={
        <>
          <HelloCooking />
          <ComparisonMachine />
          <RecipeMachine />
        </>
      }
    />
  );
}

export const meta: KitMeta = {
  id: 'cooking',
  label: 'cooking',
  blurb:
    'teaspoons, teacups, the usual suspects, but also international units, sugar comparisons, and more.',
  defaultThemeId: 'cooking-light',
  icon: ChefHat,
  previewBg: () => <CookingBackdrop inline />,
};
