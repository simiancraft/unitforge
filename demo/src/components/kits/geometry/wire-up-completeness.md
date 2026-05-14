# Wire up geometry kit completeness in the demo

**Status:** In progress
**Scope:** subsystem
**Date:** 2026-05-14
**Last reviewed:** 2026-05-14
**Context:** The geometry library was iteratively expanded under three rounds with the geometer reviewer and merged via PR #22; the demo page was deliberately left out of that cycle to keep library work unblocked. The demo now lags the library substantially. This plan closes the gap by introducing three Zone-Composer features under `sections/` (one per dimensional axis) and folding existing sections into them. Zone Composer is the established default organization recipe for unitforge demo work; this plan executes against that recipe rather than inventing a one-off shape.

## Goal

The geometry library exports 4 dimensions (LENGTH, AREA, VOLUME, ANGLE) and 30+ named derivations. The demo today reaches LENGTH/AREA/VOLUME unit catalogs (curated subsets) and exercises 2 derivations via `RectangleMachine` and `CircleMachine`; ANGLE is absent and 28 derivations are unwired.

This branch wires the demo to **full library coverage** using Zone Composer's domain-folder pattern: three machine features at `sections/2d-shape-machine/`, `sections/3d-shape-machine/`, and `sections/coordinate-machine/`, each with chassis + parts + (where applicable) a `shapes/` domain folder of child hooks. Each child shape is a `use<Shape>()` hook returning the three ReactNodes the machine's menu dispatches over.

Done = every box in `DEMO_GAPS.md` struck, every dimension and derivation reachable, both `DEMO_GAPS.md` and this plan deleted.

## Domain context

- **Each machine is a zone-composer feature** with the full alphabet: `index.tsx` (chassis), `parts/` (reusable UI atoms), a domain folder (`shapes/` for the 2D and 3D machines; absent for the coordinate machine which has no internal enumeration), and `utils/`.
- **The domain word for children of a shape machine is "shapes,"** consistent across 2D and 3D. We use the same axiom across both for coherency; the dimensional distinction lives in the parent folder name (`2d-shape-machine` vs `3d-shape-machine`), not in renaming the children to "solids" or "volumes."
- **Each shape file exports one hook `use<Shape>()`** that owns its `useState`, bakes current values into JSX, and returns `{ menuZone, interactivityZone, codeZone }` — three ReactNodes. The hook is the Zone-Composer "orchestration hook per unit"; the file also contains the small presentational components the hook composes into its zones.
- **State persists across menu swaps by construction.** The chassis calls every shape hook each render (hooks rules: same order, every time). Switching the menu changes which entry's zones are rendered into the SectionLayout — it does not unmount any hook. Drag a rectangle to 5×3, switch to circle, switch back: rectangle still 5×3.
- **`parts/control-panel.tsx`** is each machine's reusable input chassis. It takes inputs (sliders, unit pickers) as children or as a small declarative array and handles the grid layout. Each shape's `interactivityZone` composes `<ControlPanel>` with whatever inputs that shape needs — one slider for circle's radius, two for rectangle's length+width, an integer stepper for polygon's side count, etc. No uniform-inputs-prop interface; the control panel just renders what it's given.
- **`parts/menu-pill.tsx`** is the per-machine menu-button wrapper. Takes a `menuZone` child + active flag. Lives local to each machine for now; may elevate to a shared `parts/` higher up if 2D and 3D's pills converge identically.
- **3D rendering uses Babylon.js**, not Three.js. The chosen renderer for ergonomic TypeScript and prior contributor familiarity. The Babylon canvas + engine + scene + render-loop wrap into `parts/babylon-mesh.tsx`; each 3D shape passes a renderer function that draws its mesh into the scene. Bundle cost (~1MB minified, lazy-loadable) is the trade.
- **The Coordinate Machine has its own folder** even though it has no menu — there's a non-zero chance the surface grows complexity (multiple coord-system modes, more derivations on points), and starting it as a folder keeps that path open without a later restructure.
- **The `1D → 2D → 3D` ordering** is the section sequence in `geometry/index.tsx`: HelloUnit → TwoDShapeMachine → ThreeDShapeMachine → CoordinateMachine. The kit's Bench (already present, at `benchZone`, not `sectionsZone`) carries the 1D forge story.

## Current surface area

### Files this plan touches

| Path | Today | Role | Disposition |
| --- | --- | --- | --- |
| `demo/src/components/kits/section-layout.tsx` | (existing) | `SectionLayout`, `WidgetLayout`, `SectionHeader` primitives | Extended: optional `menuZone` slot |
| `demo/src/components/kits/geometry/units.ts` | 65 LOC | Catalog arrays | Rewritten: full coverage + `ANGLE_UNITS` |
| `demo/src/components/kits/geometry/sections/rectangle-machine.tsx` | 349 LOC | Existing section | Refactored → `2d-shape-machine/shapes/rectangle.tsx` (as `useRectangle`); file deleted |
| `demo/src/components/kits/geometry/sections/circle-machine.tsx` | ~300 LOC | Existing section | Refactored → `2d-shape-machine/shapes/circle.tsx` (as `useCircle`); file deleted |
| `demo/src/components/kits/geometry/sections/2d-shape-machine/` | — | NEW Zone-Composer feature | Created |
| `demo/src/components/kits/geometry/sections/3d-shape-machine/` | — | NEW Zone-Composer feature | Created |
| `demo/src/components/kits/geometry/sections/coordinate-machine/` | — | NEW feature folder | Created |
| `demo/src/components/kits/geometry/index.tsx` | 100 LOC | Kit chassis | Rewritten: replace 2 section imports with 3 machines; section ordering; `CELL_PX_BY_UNIT`; blurb |
| `demo/package.json` | — | Demo dependencies | Add `@babylonjs/core` (+ `@babylonjs/inspector` only if used) |
| `demo/src/components/kits/geometry/DEMO_GAPS.md` | 105 LOC | Inventory | Struck through then deleted in final commit |
| `demo/src/components/kits/geometry/wire-up-completeness.md` | (this file) | This plan | Deleted in final commit |

### Catalog deltas

| Catalog | Today | After | Delta |
| --- | --- | --- | --- |
| `LENGTH_UNITS` | 8 | 18 | +10 (decimeter, micrometer, nanometer, angstrom, mil, nauticalMile, fathom, astronomicalUnit, lightYear, parsec) |
| `AREA_UNITS` | 7 | 11 | +4 (squareKilometer, are, squareYard, squareMile) |
| `VOLUME_UNITS` | 6 | 12 | +6 (cubicMillimeter, cubicDecimeter, cubicKilometer, cubicYard, centiliter, deciliter) |
| `ANGLE_UNITS` | — | 6 | +6 NEW catalog (radian, degree, gradian, arcminute, arcsecond, turn) |

### Machine inventory (after)

| Machine | Children | Derivations covered |
| --- | --- | --- |
| `2d-shape-machine/` | 7 shapes: rectangle, square, triangle, quadrilateral, circle, ellipse, polygon | 23 derivations across area / perimeter / diagonal / circle-family / Heron / triangle radii |
| `3d-shape-machine/` | 4 shapes: cuboid, cube, sphere, cylinder | 4 volume derivations |
| `coordinate-machine/` | none (single surface) | 4 derivations (distance, midpoint, cartesian↔polar) |

## File structure: before

**Legend:** *(no symbols; starting state)*

```
demo/src/components/kits/
├── bench.tsx
├── geometry/
│   ├── DEMO_GAPS.md
│   ├── geometry.css
│   ├── index.tsx
│   ├── parts/
│   │   └── geometry-backdrop.tsx
│   ├── sections/
│   │   ├── circle-machine.tsx
│   │   ├── hello-unit.tsx
│   │   └── rectangle-machine.tsx
│   ├── units.ts
│   ├── use-svg-pointer-drag.ts
│   └── wire-up-completeness.md  // this plan
├── layout.tsx
├── registry.ts
└── section-layout.tsx
```

## File structure: after

**Legend:** `🆕` created · `✏️` rewritten in place · `🔀` moved (`new ← old`) · `🗑️` deleted

```
demo/src/components/kits/
├── bench.tsx
├── geometry/
│   ├── DEMO_GAPS.md  🗑️
│   ├── geometry.css
│   ├── index.tsx  ✏️                                                  // section ordering, blurb, CELL_PX_BY_UNIT
│   ├── parts/
│   │   └── geometry-backdrop.tsx
│   ├── sections/
│   │   ├── 2d-shape-machine/  🆕
│   │   │   ├── index.tsx  🆕                                          // chassis: composes 7 shape hooks; menu state; SectionLayout
│   │   │   ├── parts/
│   │   │   │   ├── menu-pill.tsx  🆕                                  // button wrapper for menuZone children
│   │   │   │   └── control-panel.tsx  🆕                              // grid-layout chassis for shape inputs
│   │   │   ├── shapes/
│   │   │   │   ├── rectangle.tsx  🔀 ← sections/rectangle-machine.tsx // refactored to useRectangle() hook
│   │   │   │   ├── circle.tsx     🔀 ← sections/circle-machine.tsx    // refactored + expanded with diameter/circumference/arc/sector/segment/annulus/angle-out
│   │   │   │   ├── square.tsx     🆕
│   │   │   │   ├── triangle.tsx   🆕                                  // internal SAS/SSS/equilateral selector
│   │   │   │   ├── quadrilateral.tsx 🆕                               // internal trapezoid/parallelogram/rhombus/kite selector
│   │   │   │   ├── ellipse.tsx    🆕
│   │   │   │   └── polygon.tsx    🆕
│   │   │   └── utils/
│   │   │       └── code-builders.ts  🆕                               // buildRectangleCode(state), etc.
│   │   ├── 3d-shape-machine/  🆕
│   │   │   ├── index.tsx  🆕
│   │   │   ├── parts/
│   │   │   │   ├── menu-pill.tsx  🆕
│   │   │   │   ├── control-panel.tsx  🆕
│   │   │   │   └── babylon-mesh.tsx  🆕                               // Babylon canvas+engine+scene wrapper; renderer prop per shape
│   │   │   ├── shapes/
│   │   │   │   ├── cuboid.tsx  🆕
│   │   │   │   ├── cube.tsx    🆕
│   │   │   │   ├── sphere.tsx  🆕
│   │   │   │   └── cylinder.tsx 🆕
│   │   │   └── utils/
│   │   ├── coordinate-machine/  🆕
│   │   │   ├── index.tsx  🆕                                          // standalone surface; no menu, no shapes/
│   │   │   ├── parts/
│   │   │   │   └── plane-canvas.tsx  🆕                               // 2D plane with draggable points
│   │   │   └── utils/
│   │   └── hello-unit.tsx                                             // unchanged
│   ├── units.ts  ✏️                                                   // 4 catalogs expanded; ANGLE_UNITS added
│   ├── use-svg-pointer-drag.ts
│   └── wire-up-completeness.md  🗑️
├── layout.tsx
├── registry.ts
└── section-layout.tsx  ✏️                                             // optional menuZone slot added
```

**No shared `section-machine.tsx` at the kit level.** Each machine's chassis owns its own menu state via `useState`. A future kit copies the pattern by copying the chassis, not by depending on a kit-level abstraction.

## Shape-file shape

Every shape file is structurally identical and ~150–250 lines. The skeleton:

```tsx
// 2d-shape-machine/shapes/rectangle.tsx
import { useState } from 'react';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { ControlPanel } from '../parts/control-panel.js';
import { buildRectangleCode } from '../utils/code-builders.js';
import { AREA_UNITS, LENGTH_UNITS } from '../../../units.js';

export function useRectangle() {
  const [length, setLength] = useState(3);
  const [width, setWidth] = useState(2);
  const [lengthUnitId, setLengthUnitId] = useState('meter');
  const [widthUnitId, setWidthUnitId] = useState('meter');
  const [areaUnitId, setAreaUnitId] = useState('square-meter');

  return {
    menuZone: <RectangleIcon />,
    interactivityZone: (
      <RectangleInteractivity
        length={length} width={width}
        onLengthChange={setLength} onWidthChange={setWidth}
        lengthUnitId={lengthUnitId} widthUnitId={widthUnitId} areaUnitId={areaUnitId}
        onLengthUnitChange={setLengthUnitId} onWidthUnitChange={setWidthUnitId} onAreaUnitChange={setAreaUnitId}
      />
    ),
    codeZone: <CodeBlock code={buildRectangleCode({ length, width, lengthUnitId, widthUnitId, areaUnitId })} />,
  };
}

function RectangleIcon() { /* small inline SVG */ }
function RectangleInteractivity(props) {
  return (
    <ControlPanel>
      <UnitPicker label="length unit" value={props.lengthUnitId} units={LENGTH_UNITS} onChange={props.onLengthUnitChange} />
      <UnitPicker label="width unit"  value={props.widthUnitId}  units={LENGTH_UNITS} onChange={props.onWidthUnitChange} />
      <UnitPicker label="area unit"   value={props.areaUnitId}   units={AREA_UNITS}   onChange={props.onAreaUnitChange} />
      <Slider label="length" ... />
      <Slider label="width" ... />
      {/* RectangleVisual SVG */}
      {/* Result */}
    </ControlPanel>
  );
}
```

## Chassis shape

```tsx
// 2d-shape-machine/index.tsx
export function TwoDShapeMachine() {
  const rectangle = useRectangle();
  const square = useSquare();
  const triangle = useTriangle();
  const quadrilateral = useQuadrilateral();
  const circle = useCircle();
  const ellipse = useEllipse();
  const polygon = usePolygon();

  const shapes = { rectangle, square, triangle, quadrilateral, circle, ellipse, polygon } as const;
  type ShapeKey = keyof typeof shapes;
  const [activeKey, setActiveKey] = useState<ShapeKey>('rectangle');
  const active = shapes[activeKey];

  return (
    <SectionLayout
      headerZone={<SectionHeader eyebrow="demo 02" title="2D shape machine" kicker="cross-dimensional" ... />}
      introZone={<>Pick a shape; the panel below swaps interaction + code for that shape's derivations.</>}
      menuZone={
        <div className="menu-row">
          {Object.entries(shapes).map(([key, shape]) => (
            <MenuPill key={key} active={key === activeKey} onClick={() => setActiveKey(key as ShapeKey)}>
              {shape.menuZone}
            </MenuPill>
          ))}
        </div>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={active.interactivityZone}
          codeZone={active.codeZone}
        />
      }
    />
  );
}
```

## Commits

### Commit 1: Extend `SectionLayout` with optional `menuZone`

**Goal:** Land the layout extension with no consumer using it yet.

**Files rewritten:**
- `demo/src/components/kits/section-layout.tsx`: add optional `menuZone?: ReactNode` prop on `SectionLayout`; render between `introZone` and `widgetZone` when present. JSDoc the new slot per Zone-Composer "doc every zone prop" rule.

**Gate:** Full check passes. Existing demo renders byte-identical (no existing caller passes `menuZone`).

### Commit 2: Expand unit catalogs across LENGTH / AREA / VOLUME; add `ANGLE_UNITS`

**Goal:** Full library coverage in catalogs; introduce ANGLE so machines that consume / produce angles have a unit source.

**Files rewritten:**
- `demo/src/components/kits/geometry/units.ts`: add 10 entries to `LENGTH_UNITS`; 4 to `AREA_UNITS`; 6 to `VOLUME_UNITS`; create `ANGLE_UNITS` (6 entries) + `ANGLE` import + `AngleUnit` type alias.

**Gate:** Full check passes. Existing sections continue to render with the expanded pickers.

### Commit 3: Scaffold `2d-shape-machine/`; fold in rectangle + circle as `useRectangle` / `useCircle` hooks

**Goal:** First consumer of the new pattern. Refactor existing Rectangle and Circle into Zone-Composer shape entries; delete old section files.

**Files created:**
- `demo/src/components/kits/geometry/sections/2d-shape-machine/index.tsx`: chassis composing the two initial hooks; menu state via `useState`; SectionLayout with `menuZone` and `widgetZone`.
- `demo/src/components/kits/geometry/sections/2d-shape-machine/parts/menu-pill.tsx`: button wrapper.
- `demo/src/components/kits/geometry/sections/2d-shape-machine/parts/control-panel.tsx`: grid-layout input chassis.
- `demo/src/components/kits/geometry/sections/2d-shape-machine/utils/code-builders.ts`: `buildRectangleCode`, `buildCircleCode`.
- `demo/src/components/kits/geometry/sections/2d-shape-machine/shapes/rectangle.tsx`: `useRectangle` hook + local presentational components. Includes new perimeter + diagonal Results.
- `demo/src/components/kits/geometry/sections/2d-shape-machine/shapes/circle.tsx`: `useCircle` hook + local components. Expanded to cover area-from-diameter (mode toggle), circumference (both forms), arc length (with angle picker), `angleFromRadiusAndArcLength`, sector, segment, annulus.

**Files moved/renamed:**
- `2d-shape-machine/shapes/rectangle.tsx ← sections/rectangle-machine.tsx`
- `2d-shape-machine/shapes/circle.tsx ← sections/circle-machine.tsx`

**Files rewritten:**
- `demo/src/components/kits/geometry/index.tsx`: drop `RectangleMachine` and `CircleMachine` imports + JSX; add `TwoDShapeMachine` import + JSX in their place.

**DEMO_GAPS strikethrough:** `perimeterOfRectangleFromLengthAndWidth`, `diagonalOfRectangleFromLengthAndWidth`, `areaFromCircleDiameter`, `circumferenceOfCircleFromDiameter`, `arcLengthFromRadiusAndAngle`, `angleFromRadiusAndArcLength`, `areaFromSectorRadiusAndAngle`, `areaFromCircularSegmentRadiusAndAngle`, `areaFromAnnulusRadii`.

**Gate:** Full check passes. Menu shows 2 entries; selecting an entry mounts that shape's zones; switching the menu and switching back preserves state.

### Commit 4: Add `useSquare` shape

**Goal:** First net-new shape under the established pattern.

**Files created:**
- `2d-shape-machine/shapes/square.tsx`: hook + local components for side slider, area / perimeter / diagonal Results, SVG with edge drag handle.

**Files rewritten:**
- `2d-shape-machine/index.tsx`: import + register `useSquare` in the shapes record.

**DEMO_GAPS strikethrough:** `areaFromSquareSide`, `perimeterOfSquareFromSide`, `diagonalOfSquareFromSide`.

**Gate:** Full check passes. Menu has 3 entries.

### Commit 5: Add `useTriangle` shape

**Goal:** Cover all 7 triangle derivations under one entry with an internal SAS/SSS/equilateral selector.

**Files created:**
- `2d-shape-machine/shapes/triangle.tsx`: hook + internal mode selector + per-mode inputs; area + perimeter Results; inradius + circumradius Results in SSS mode; Heron's formula validator failure surfaces gracefully as a `Result` error variant.

**Files rewritten:**
- `2d-shape-machine/index.tsx`: register `useTriangle`.

**DEMO_GAPS strikethrough:** `areaFromTriangleBaseAndHeight`, `areaFromTriangleSides`, `areaFromEquilateralTriangleSide`, `perimeterOfTriangleFromSides`, `perimeterOfEquilateralTriangleFromSide`, `inradiusOfTriangleFromSides`, `circumradiusOfTriangleFromSides`.

**Gate:** Full check passes. All three modes render; degenerate input states render without crashing.

### Commit 6: Add `useQuadrilateral` shape

**Goal:** Cover trapezoid/parallelogram/rhombus/kite via an internal 4-way mode selector.

**Files created:**
- `2d-shape-machine/shapes/quadrilateral.tsx`: hook + 4-way mode + per-mode inputs; area + perimeter Results.

**Files rewritten:**
- `2d-shape-machine/index.tsx`: register `useQuadrilateral`.

**DEMO_GAPS strikethrough:** `areaFromTrapezoidBasesAndHeight`, `areaFromParallelogramBaseAndHeight`, `areaFromRhombusDiagonals`, `areaFromKiteDiagonals`, `perimeterOfTrapezoidFromSides`, `perimeterOfParallelogramFromBaseAndSide`, `perimeterOfRhombusFromSide`.

**Gate:** Full check passes. Four modes render.

### Commit 7: Add `useEllipse` shape

**Goal:** Cover ellipse area + Ramanujan II perimeter (surface "approximation" caveat in copy).

**Files created:**
- `2d-shape-machine/shapes/ellipse.tsx`: hook + semi-major/semi-minor sliders; area + perimeter Results.

**Files rewritten:**
- `2d-shape-machine/index.tsx`: register `useEllipse`.

**DEMO_GAPS strikethrough:** `areaFromEllipseSemiAxes`, `perimeterOfEllipseFromSemiAxes`.

**Gate:** Full check passes.

### Commit 8: Add `usePolygon` shape

**Goal:** Cover regular-polygon-from-apothem-and-perimeter; inscribed n-gon visual.

**Files created:**
- `2d-shape-machine/shapes/polygon.tsx`: hook + integer side-count stepper (3–24), apothem slider, perimeter slider, area Result, SVG inscribed-polygon visual.

**Files rewritten:**
- `2d-shape-machine/index.tsx`: register `usePolygon`.

**DEMO_GAPS strikethrough:** `areaFromRegularPolygonApothemAndPerimeter`.

**Gate:** Full check passes.

### Commit 9: Add Babylon.js; scaffold `3d-shape-machine/`; add `useCuboid` shape

**Goal:** Install the 3D renderer; scaffold the second machine; add the first 3D shape.

**Files created:**
- `demo/src/components/kits/geometry/sections/3d-shape-machine/index.tsx`: chassis (parallel to 2D's).
- `3d-shape-machine/parts/menu-pill.tsx`, `parts/control-panel.tsx`: per-machine local copies (may dedupe later).
- `3d-shape-machine/parts/babylon-mesh.tsx`: Babylon canvas + engine + scene wrapper. Accepts a renderer prop `(scene: Scene) => () => void` (returns cleanup). Owns the render-loop lifecycle.
- `3d-shape-machine/shapes/cuboid.tsx`: hook + length/width/height sliders + volume Result + renderer passed to BabylonMesh.

**Files rewritten:**
- `demo/package.json`: add `@babylonjs/core` (latest 7.x).
- `demo/src/components/kits/geometry/index.tsx`: import + render `<ThreeDShapeMachine />` in `sectionsZone`.

**DEMO_GAPS strikethrough:** `volumeFromCuboidDimensions`.

**Gate:** Full check passes. Babylon canvas renders cuboid mesh; sliders update mesh in real time. Demo bundle increases as expected (note size in commit body).

### Commit 10: Add `useCube`, `useSphere`, `useCylinder` shapes (bundled)

**Goal:** Complete the 3D family. Pattern established at C9; three small entries follow it.

**Files created:**
- `3d-shape-machine/shapes/cube.tsx`: hook + single side slider + volume + cube mesh.
- `3d-shape-machine/shapes/sphere.tsx`: hook + radius slider + volume + sphere mesh.
- `3d-shape-machine/shapes/cylinder.tsx`: hook + radius + height sliders + volume + cylinder mesh.

**Files rewritten:**
- `3d-shape-machine/index.tsx`: register the three new hooks.

**DEMO_GAPS strikethrough:** `volumeFromCubeSide`, `volumeFromSphereRadius`, `volumeFromCylinderRadiusAndHeight`.

**Gate:** Full check passes. Menu shows 4 entries; each renders its mesh.

### Commit 11: Scaffold `coordinate-machine/`

**Goal:** Cover distance / midpoint / cartesian↔polar in one surface with two draggable points.

**Files created:**
- `coordinate-machine/index.tsx`: standalone feature; uses `SectionLayout` without `menuZone`; renders WidgetLayout with the plane on the interaction side and the code on the other.
- `coordinate-machine/parts/plane-canvas.tsx`: 2D plane with two draggable points; emits points to the parent.

**Files rewritten:**
- `demo/src/components/kits/geometry/index.tsx`: import + render `<CoordinateMachine />`.

**DEMO_GAPS strikethrough:** `distanceBetweenPoints`, `midpointBetweenPoints`, `cartesianFromPolar`, `polarFromCartesian`.

**Gate:** Full check passes. Two-point drag updates all four readouts simultaneously.

### Commit 12: Kit chassis polish (`geometry/index.tsx`)

**Goal:** Catch residual chassis-level wiring.

**Files rewritten:**
- `geometry/index.tsx`:
  - Section ordering in `sectionsZone`: `HelloUnit` → `TwoDShapeMachine` → `ThreeDShapeMachine` → `CoordinateMachine` (the 1D forge story is already covered by the Bench in `benchZone`).
  - Extend `CELL_PX_BY_UNIT` for any newly-bench-pickable length units that warrant custom cell sizes; rely on `?? 18` fallback otherwise.
  - Update header blurb at lines 60–64 and `meta.blurb` at line 95 to name every dimension and shape family the demo now covers.

**Gate:** Full check passes.

### Commit 13: Delete this plan and the demo-gaps inventory

**Goal:** Inspector Gadget Rule. Both planning artifacts self-destruct.

**Files deleted:**
- `demo/src/components/kits/geometry/DEMO_GAPS.md`
- `demo/src/components/kits/geometry/wire-up-completeness.md`

**Gate:** `bun run check` passes from repo root. `grep -r 'DEMO_GAPS\|wire-up-completeness' demo/ src/` returns no matches.

## Verification checklist

- [ ] `SectionLayout` accepts optional `menuZone`; existing callers unchanged.
- [ ] Catalog deltas land: `LENGTH_UNITS` has 18, `AREA_UNITS` 11, `VOLUME_UNITS` 12, `ANGLE_UNITS` 6.
- [ ] `2d-shape-machine/` contains chassis + parts (menu-pill, control-panel) + shapes (7 hooks) + utils.
- [ ] `3d-shape-machine/` contains chassis + parts (menu-pill, control-panel, babylon-mesh) + shapes (4 hooks) + utils.
- [ ] `coordinate-machine/` contains chassis + parts (plane-canvas) + utils.
- [ ] Old `sections/rectangle-machine.tsx` and `sections/circle-machine.tsx` no longer exist.
- [ ] `geometry/index.tsx` renders 4 things in `sectionsZone`: `HelloUnit`, `TwoDShapeMachine`, `ThreeDShapeMachine`, `CoordinateMachine`.
- [ ] Header blurb names every dimension and every shape family.
- [ ] Every box in `DEMO_GAPS.md` struck through before its final deletion.
- [ ] Babylon meshes render and update with their sliders; demo bundle size delta noted in PR description.
- [ ] No new TypeScript errors, no new biome errors, no new knip warnings.
- [ ] `cd demo && bun run dev` renders every machine; menu swaps preserve state per the hook-composition rule.
- [ ] `bun run check` passes from repo root.
- [ ] Plan file deleted; DEMO_GAPS.md deleted.

## Anti-patterns / scope boundaries

- **No shared kit-level "machine" abstraction.** Each machine's chassis owns its menu state with inline `useState`. A future kit copies the chassis, not an abstraction.
- **No tight registry interface.** The shapes record's value type is whatever each `use<Shape>` returns — three ReactNodes that the chassis treats opaquely. Resist any "register input slots" abstraction.
- **No state lifting from shape hooks to chassis.** Each hook owns its state. Chassis just dispatches over which hook's zones to render.
- **No `useMemo` / `useCallback` / `React.memo`.** React Compiler memoizes automatically (Zone-Composer rule).
- **No `useEffect` for user-action side effects.** Babylon's render loop is a genuine lifecycle exception (canvas + engine setup/teardown); other "effects" live in handlers.
- **No 1D LengthMachine.** Bench covers 1D.
- **No library changes.**
- **No RATE / TIME dimension work.** Tracked as a future issue.
- **Three.js not introduced.** Babylon.js is the chosen 3D renderer.

## References

- `demo/src/components/kits/geometry/DEMO_GAPS.md` — inventory this plan executes against.
- `demo/src/components/kits/geometry/sections/rectangle-machine.tsx` — pre-refactor shape; moves to `2d-shape-machine/shapes/rectangle.tsx` in Commit 3.
- `src/kits/geometry/conversions.ts` — every derivation exercised lives here.
- `src/kits/geometry/units.ts` — every unit catalogged lives here.
- Zone Composer skill (`~/.claude/skills/zone-composer/SKILL.md`) — the recipe this plan follows.
- PR #22 (merged) — geometry library work that created this demo gap.
- PR #23 (merged) — data-storage cycle that established iterate-then-DEMO_GAPS pattern.
