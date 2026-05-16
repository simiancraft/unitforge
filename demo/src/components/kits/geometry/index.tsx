// Geometry kit chassis. Engineering-paper light + blueprint-night dark.
// Owns Bench state so the grid background reticks its cell size to the
// currently-selected "from" unit. The bench itself is the shared kit
// Bench; sections live in ./sections/ as SectionLayout composers.
//
// All theme orchestration (CSS variable cascade, shiki theme selection,
// code-frame chrome) lives at the root ThemeProvider; the kit is a pure
// renderer.

import { Box } from 'lucide-react';
import { useState } from 'react';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { Bench, type BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { gridCellPxForUnit, gridOffsetPxFor } from './parts/backdrop-scales.js';
import { GeometryBackdrop } from './parts/geometry-backdrop.js';
import { TwoDShapeMachine } from './sections/2d-shape-machine/index.js';
import { ThreeDShapeMachine } from './sections/3d-shape-machine/index.js';
import { CoordinateMachine } from './sections/coordinate-machine/index.js';
import { HelloUnit } from './sections/hello-unit.js';
import { LENGTH_UNITS } from './units.js';
import './geometry.css';

// Slider bounds for the geometry kit's bench, in the user-selected
// from-unit. Local to this kit; other kits' benches pick their own.
const GEOMETRY_BENCH_MIN = 0.1;
const GEOMETRY_BENCH_MAX = 100;
const GEOMETRY_BENCH_STEP = 0.1;

export function GeometryScreen() {
  const [bench, setBench] = useState<BenchState>({
    fromId: 'meter',
    toId: 'foot',
    value: 5,
  });
  const fromUnit = findById(LENGTH_UNITS, bench.fromId);
  const toUnit = findById(LENGTH_UNITS, bench.toId);
  const cellSize = gridCellPxForUnit(fromUnit);
  const cellSizeTo = gridCellPxForUnit(toUnit);
  const offsetPx = gridOffsetPxFor(fromUnit, bench.value, GEOMETRY_BENCH_MIN, GEOMETRY_BENCH_MAX);

  return (
    <KitLayout
      backdropZone={
        <GeometryBackdrop cellSize={cellSize} cellSizeTo={cellSizeTo} offsetPx={offsetPx} />
      }
      headerZone={
        <header className="flex flex-col gap-2">
          <p className="uf-eyebrow">kit · 01</p>
          <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">geometry</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-uf-muted">
            Length, area, volume, and angle, across metric, imperial, marine, and astronomy units;
            one call shape for every conversion. Derive every member of the rectangle, square,
            triangle (SAS, Heron, equilateral), quadrilateral (trapezoid, parallelogram, rhombus,
            kite), circle (sector, segment, annulus, arc length), ellipse, and regular-polygon
            families. Get volume out of any cuboid, cube, sphere, or cylinder in any unit you ask
            for, no manual cubing. Round-trip cartesian and polar through forge's multi-output
            object form. Change units on the bench below; the engineering paper reticks to match.
          </p>
        </header>
      }
      benchZone={
        <Bench
          state={bench}
          onChange={setBench}
          options={LENGTH_UNITS}
          min={GEOMETRY_BENCH_MIN}
          max={GEOMETRY_BENCH_MAX}
          step={GEOMETRY_BENCH_STEP}
          codeFor={(s, r) =>
            `forge(${toJsName(findById(LENGTH_UNITS, s.fromId).id)}, ${toJsName(findById(LENGTH_UNITS, s.toId).id)})(${formatMagnitude(s.value)}); // ${formatMagnitude(r)}`
          }
          label="forge bench · length"
        />
      }
      sectionsZone={
        <>
          <HelloUnit />
          <TwoDShapeMachine />
          <ThreeDShapeMachine />
          <CoordinateMachine />
        </>
      }
    />
  );
}

export const meta: KitMeta = {
  id: 'geometry',
  label: 'geometry',
  blurb:
    'length, area, volume, angle; 2D + 3D shape machines + coordinate geometry; metric, imperial, marine, astronomy.',
  defaultThemeId: 'geometry-light',
  icon: Box,
  previewBg: ({ hovered }) => <GeometryBackdrop inline scale={hovered ? 1.5 : 1} />,
};
