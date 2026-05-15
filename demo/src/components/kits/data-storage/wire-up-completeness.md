# Wire up data-storage kit completeness in the demo

**Status:** In progress
**Scope:** subsystem
**Date:** 2026-05-14
**Last reviewed:** 2026-05-14
**Context:** The data-storage library was iteratively expanded with the data-hoarder reviewer and merged via PR #23; the demo's catalogs and sections haven't caught up. The geometry kit just demonstrated the full Zone Composer machine pattern on PR #25; this plan applies the same pattern to data-storage and adds a creative Babylon-based VolumeMachine.

## Goal

The data-storage demo has four sections: `HelloBytes` (intro), `DriveVsOs` and `RamStick` (decimal-vs-binary at drive vs memory scale), `ThroughputViz` (bits-vs-bytes rates). The two scale-gap sections tell the same story at different scales. The library exports 9 units the demo doesn't catalog: exabyte/zettabyte/yottabyte, exbibyte/zebibyte/yobibyte, terabit/petabit, and octet.

This branch reorganizes via three Zone Composer machines: a **ScaleMachine** wrapping the two existing decimal-vs-binary tiers plus new ones (floppy, server-array, exbibyte-precision); a **ThroughputMachine** wrapping `ThroughputViz` alongside a new 800 GbE frontier link; and a new **VolumeMachine** that uses Babylon.js to visualize the decimal-vs-binary cube-volume gap as the user scrubs through scale tiers. Catalogs expand to full library coverage. HelloBytes gains an `octet` column.

Done = every DEMO_GAPS box struck, every library unit reachable, plan + DEMO_GAPS deleted.

## Domain context

- **Machine = a `SectionLayout` with an optional `menuZone`** that hosts a registry of interchangeable entries; the geometry kit's 2D Shape Machine and 3D Shape Machine are the templates. The chassis composes every entry's `use<Entry>()` hook each render; menu state lives in inline `useState`; the WidgetLayout is keyed by active key so the subtree remounts on swap (the React-reuse fix from geometry's commit `604c399`).
- **Tiers / Links / Pairs.** Each machine's children get a domain-specific folder name based on what they actually represent in the data-storage domain. The ScaleMachine's children are *tiers* of scale (drive, memory, server-array); the ThroughputMachine's children are *links* of network capacity (any-rate, frontier). The VolumeMachine has no children folder because it's a single flat surface that scrubs across tier-pairs internally.
- **VolumeMachine's Babylon use:** two cubes side-by-side in a Babylon scene. Edge length proportional to the cube-root of byte count, normalized so the decimal cube is always size 4. The binary cube is `4 × ∛(binary/decimal)` — visibly larger, by 2.4% at kB:KiB and 20.9% at YB:YiB. As the user drags a tier slider, mesh.scaling.set(...) updates the binary cube imperatively (per the babylon-react skill). Auto-rotation behavior on the camera (per geometry's pattern) makes the cubes read as 3D from mount without requiring a drag. A floating in-scene text label shows the byte gap.
- **The bench (kit-level)** carries the 1D forge story and stays at the `benchZone` slot of `KitLayout`. Unchanged.
- **`octet` alias:** add as a new `DATA_ALIAS_UNITS` family so HelloBytes shows it as a fourth readout column (matching the DEMO_GAPS suggestion). Doesn't deserve its own machine — it's a vocabulary alias of byte, not a scale variant.

## Current surface area

### Files this plan touches

| Path | Lines today | Role | Disposition |
| --- | --- | --- | --- |
| `demo/src/components/kits/data-storage/units.ts` | 39 | Catalog arrays | Rewritten: full library coverage + new `DATA_ALIAS_UNITS` |
| `demo/src/components/kits/data-storage/sections/hello-bytes.tsx` | 230 | Existing intro | Edited: readout matrix gains a 4th column for aliases (octet) |
| `demo/src/components/kits/data-storage/sections/drive-vs-os.tsx` | 388 | Existing section | Refactored → `scale-machine/tiers/drive.tsx` (useDrive hook returning 3 ReactNodes); file deleted |
| `demo/src/components/kits/data-storage/sections/ram-stick.tsx` | 238 | Existing section | Refactored → `scale-machine/tiers/memory.tsx`; file deleted |
| `demo/src/components/kits/data-storage/sections/throughput-viz.tsx` | 251 | Existing section | Refactored → `throughput-machine/links/any-rate.tsx`; file deleted |
| `demo/src/components/kits/data-storage/sections/scale-machine/` | — | NEW Zone-Composer feature | Created: chassis + parts + tiers + utils |
| `demo/src/components/kits/data-storage/sections/throughput-machine/` | — | NEW | Created: chassis + parts + links + utils |
| `demo/src/components/kits/data-storage/sections/volume-machine/` | — | NEW | Created: standalone Babylon-based scale-pair scrubber |
| `demo/src/components/kits/data-storage/index.tsx` | 85 | Kit chassis | Rewritten: 4 imports (HelloBytes + 3 machines); blurb update |
| `demo/src/components/kits/data-storage/DEMO_GAPS.md` | 94 | Inventory | Struck through and deleted in final commit |
| `demo/src/components/kits/data-storage/wire-up-completeness.md` | (this file) | This plan | Deleted in final commit |

### Catalog deltas

| Catalog | Today | After | Delta |
| --- | --- | --- | --- |
| `DATA_DECIMAL_UNITS` | 6 | 9 | +3 (exabyte, zettabyte, yottabyte) |
| `DATA_BINARY_UNITS` | 5 | 8 | +3 (exbibyte, zebibyte, yobibyte) |
| `DATA_BIT_UNITS` | 4 | 6 | +2 (terabit, petabit) |
| `DATA_ALIAS_UNITS` | — | 1 | +1 NEW catalog (octet) |

### Machine inventory (after)

| Section | Children | What |
| --- | --- | --- |
| `HelloBytes` | — | Intro; cross-family readout matrix gains an `octet` column |
| `scale-machine/` | 5 tiers | drive, memory, floppy, server-array, exbibyte-precision |
| `throughput-machine/` | 2 links | any-rate (general-purpose, from `ThroughputViz`), frontier-800-GbE |
| `volume-machine/` | none (flat) | Babylon scene with two cubes scrubbing through 8 decimal:binary pairs (kilo..yotta) via a single tier slider |

## File structure: before

```
demo/src/components/kits/data-storage/
├── DEMO_GAPS.md
├── data-storage.css
├── index.tsx
├── parts/
│   └── data-storage-backdrop.tsx
├── sections/
│   ├── drive-vs-os.tsx
│   ├── hello-bytes.tsx
│   ├── ram-stick.tsx
│   └── throughput-viz.tsx
├── units.ts
└── wire-up-completeness.md  // this plan
```

## File structure: after

**Legend:** `🆕` created · `✏️` rewritten in place · `🔀` moved (`new ← old`) · `🗑️` deleted

```
demo/src/components/kits/data-storage/
├── DEMO_GAPS.md  🗑️
├── data-storage.css
├── index.tsx  ✏️                                       // 3 machine imports + HelloBytes; blurb updated
├── parts/
│   └── data-storage-backdrop.tsx
├── sections/
│   ├── hello-bytes.tsx  ✏️                              // readout matrix gains DATA_ALIAS_UNITS column
│   ├── scale-machine/  🆕
│   │   ├── index.tsx  🆕                                // chassis: composes 5 tier hooks; menu state; SectionLayout
│   │   ├── parts/
│   │   │   ├── menu-pill.tsx  🆕                        // mirrors geometry's pattern
│   │   │   └── control-panel.tsx  🆕
│   │   ├── tiers/                                       // domain folder
│   │   │   ├── drive.tsx  🔀 ← sections/drive-vs-os.tsx // refactored to useDrive hook
│   │   │   ├── memory.tsx 🔀 ← sections/ram-stick.tsx   // refactored to useMemory hook
│   │   │   ├── floppy.tsx          🆕                   // 1.44 MB hybrid trivia
│   │   │   ├── server-array.tsx    🆕                   // TiB/PiB scale; uses pebibyte
│   │   │   └── exbibyte-precision.tsx 🆕                // Float64 cliff at EiB
│   │   └── utils/
│   ├── throughput-machine/  🆕
│   │   ├── index.tsx  🆕
│   │   ├── parts/
│   │   │   ├── menu-pill.tsx  🆕
│   │   │   └── control-panel.tsx  🆕
│   │   ├── links/                                       // domain folder
│   │   │   ├── any-rate.tsx  🔀 ← sections/throughput-viz.tsx  // refactored to useAnyRate hook
│   │   │   └── frontier-800gbe.tsx 🆕                   // 800 GbE → 100 GB/s peak; uses terabit
│   │   └── utils/
│   └── volume-machine/  🆕
│       ├── index.tsx  🆕                                // standalone; tier slider + Babylon cubes
│       └── parts/
│           └── babylon-cubes.tsx  🆕                    // Babylon canvas; two cubes; imperative scaling
├── units.ts  ✏️                                         // 3 catalogs expanded + DATA_ALIAS_UNITS added
└── wire-up-completeness.md  🗑️
```

## Shape-file shape (mirrors geometry kit)

Each tier / link file follows the pattern established in `demo/src/components/kits/geometry/sections/2d-shape-machine/shapes/rectangle.tsx`:

```tsx
// scale-machine/tiers/drive.tsx (sketch)
export function useDrive() {
  const [marketedGB, setMarketedGB] = useState(1000);
  // ... compute bytes, inGiB, lossFraction
  return {
    menuZone: <DriveIcon />,
    interactivityZone: (
      <ControlPanel
        pickersZone={...}
        visualZone={<DriveLabel /> /* + PropertiesPanel etc. */}
        controlsZone={<Slider .../>}
        resultsZone={<Result .../>}
      />
    ),
    codeZone: <CodeBlock code={buildDriveCode(...)} />,
  };
}
```

The chassis composes hooks at the top, dispatches menu state via `useState`, and renders SectionLayout with `menuZone` mapped over the entries' menu icons.

## Commits

### Commit 1: Expand catalogs to full library coverage; add `DATA_ALIAS_UNITS`

**Goal:** Every unit shipped by `unitforge/kits/data-storage` lives in some catalog.

**Files rewritten:**
- `demo/src/components/kits/data-storage/units.ts`: import + add `exabyte`/`zettabyte`/`yottabyte` to `DATA_DECIMAL_UNITS`; `exbibyte`/`zebibyte`/`yobibyte` to `DATA_BINARY_UNITS`; `terabit`/`petabit` to `DATA_BIT_UNITS`; new `DATA_ALIAS_UNITS = [octet]`; add to `DATA_ALL_UNITS`.

**Gate:** `bun run check` (full) passes. HelloBytes still renders with the larger arrays.

### Commit 2: Scaffold scale-machine; fold drive + memory as tier entries

**Goal:** First Zone Composer machine in this kit; fold the two existing decimal-vs-binary sections.

**Files created:**
- `scale-machine/index.tsx`: chassis (composes `useDrive` + `useMemory`; menu state; SectionLayout with menuZone keyed by activeKey).
- `scale-machine/parts/menu-pill.tsx`: copy of geometry's MenuPill (with `label` prop for tooltip + aria).
- `scale-machine/parts/control-panel.tsx`: copy of geometry's ControlPanel.
- `scale-machine/tiers/drive.tsx`: `useDrive` hook; preserves all of DriveVsOs's organs (DriveLabel, PropertiesPanel, CapacityBars, FilesInfographic) inside the interactivityZone.
- `scale-machine/tiers/memory.tsx`: `useMemory` hook; preserves RamStick's DIMM SVG + chip-boot sequence.
- `scale-machine/utils/code-builders.ts`: extracted `buildDriveCode` and `buildMemoryCode`.

**Files moved/renamed:**
- `scale-machine/tiers/drive.tsx ← sections/drive-vs-os.tsx`
- `scale-machine/tiers/memory.tsx ← sections/ram-stick.tsx`

**Files rewritten:**
- `data-storage/index.tsx`: drop `DriveVsOs` and `RamStick` imports + JSX; add `ScaleMachine`.

**DEMO_GAPS strikethrough:** none (the tiers are reorganizing existing content; no new derivations exercised).

**Gate:** Full check passes. Both tier menu pills render; clicking switches between DriveLabel widget and DIMM widget; state persists across menu swaps.

### Commit 3: Add `floppy` tier (1.44 MB hybrid trivia)

**Files created:**
- `scale-machine/tiers/floppy.tsx`: `useFloppy` hook. Visual: a 3.5″ floppy SVG (label panel + shutter + write-protect notch). Result rows: "marketed 1.44 MB," "actually 1440 × 1024 = 1,474,560 bytes," "neither pure decimal nor pure binary." Codezone shows the math.

**Files rewritten:**
- `scale-machine/index.tsx`: register `useFloppy`.

**DEMO_GAPS strikethrough:** Floppy hybrid footnote.

**Gate:** Full check passes.

### Commit 4: Add `server-array` tier (TiB / PiB scale)

**Files created:**
- `scale-machine/tiers/server-array.tsx`: `useServerArray` hook. Slider for raw byte count in the petabyte range; readouts show PB-marketed vs PiB-reported with the larger gap. Visual: a stylized rack of drives with capacity readout.

**Files rewritten:**
- `scale-machine/index.tsx`: register `useServerArray`.

**Gate:** Full check passes.

### Commit 5: Add `exbibyte-precision` tier (Float64 cliff)

**Files created:**
- `scale-machine/tiers/exbibyte-precision.tsx`: `useExbibytePrecision` hook. Demonstrates `forge(exbibyte, byte)(1) + 1 === forge(exbibyte, byte)(1)`. Result rows: the EiB byte count, the +1 vanishing result, plain-English explanation that this is Float64 ULP not a library defect. Codezone shows the test assertion.

**Files rewritten:**
- `scale-machine/index.tsx`: register `useExbibytePrecision`.

**DEMO_GAPS strikethrough:** Float64 precision cliff at EiB; yottabyte vs yobibyte (the ratio is mentioned in the copy here even if not separately sectioned).

**Gate:** Full check passes. The `+1` vanishing assertion renders true at runtime.

### Commit 6: Scaffold throughput-machine; fold ThroughputViz as `any-rate` link

**Files created:**
- `throughput-machine/index.tsx`: chassis (composes `useAnyRate`; menu state; SectionLayout).
- `throughput-machine/parts/menu-pill.tsx` and `control-panel.tsx`: per-machine local copies.
- `throughput-machine/links/any-rate.tsx`: `useAnyRate` hook; preserves the full ThroughputViz widget (sliders for Gbit/s + GB target; animated sweep bar; defineUnit/defineConversion dogfooding for sweep-time).
- `throughput-machine/utils/code-builders.ts`: extracted `buildAnyRateCode`.

**Files moved/renamed:**
- `throughput-machine/links/any-rate.tsx ← sections/throughput-viz.tsx`.

**Files rewritten:**
- `data-storage/index.tsx`: drop `ThroughputViz` import + JSX; add `ThroughputMachine`.

**Gate:** Full check passes. Animated sweep bar still resets on slider change.

### Commit 7: Add `frontier-800gbe` link

**Files created:**
- `throughput-machine/links/frontier-800gbe.tsx`: `useFrontier800GbE` hook. Preset slider near 800 Gbit/s; readout shows `forge(gigabit, gigabyte)(800) === 100` (1 second to drain 100 GB SSD); secondary readout uses `terabit` / `petabit` to position 800 GbE in the bit-ladder context. Codezone imports `terabit`.

**Files rewritten:**
- `throughput-machine/index.tsx`: register `useFrontier800GbE`.

**DEMO_GAPS strikethrough:** 800 GbE → 100 GB/s peak; aggregate backbone in Pbit/s (mentioned in copy).

**Gate:** Full check passes.

### Commit 8: Scaffold volume-machine with Babylon cube-pair visualization

**Goal:** Creative Babylon integration. Single section (no menu), tier slider scrubs through 8 decimal:binary pairs (kilo → yotta); Babylon scene shows two cubes whose edge lengths are normalized cube-roots of byte counts; the binary cube is always visibly larger, by a ratio that grows with tier.

**Files created:**
- `volume-machine/index.tsx`: chassis with tier slider state; readouts show pair values + gap percentage; renders `<BabylonCubes pair={activePair} />`.
- `volume-machine/parts/babylon-cubes.tsx`: Babylon canvas wrapping engine + scene + camera + light + auto-rotation (per the babylon-react skill); init builds two cubes at unit size + opaque clearColor sampled from `--uf-bg`; `useEffect` on the active pair updates `mesh.scaling.set(...)` imperatively without recreating geometry.

**Files rewritten:**
- `data-storage/index.tsx`: add `VolumeMachine` import + render in `sectionsZone`.

**DEMO_GAPS strikethrough:** yottabyte vs yobibyte (now visualized).

**Gate:** Full check passes. Babylon canvas renders both cubes; scrubbing the tier slider visibly increases the binary cube's size relative to the decimal cube; camera auto-rotates after 1.5s of idle.

### Commit 9: Add `octet` column to HelloBytes readout matrix

**Files rewritten:**
- `sections/hello-bytes.tsx`: extend `READOUT_COLUMNS` to include `{ family: 'aliases', units: DATA_ALIAS_UNITS }`; readout grid becomes 4 columns on md+.

**DEMO_GAPS strikethrough:** octet ↔ byte round-trip.

**Gate:** Full check passes. HelloBytes shows octet alongside byte at the same numeric value.

### Commit 10: Kit chassis polish; section ordering and blurb

**Files rewritten:**
- `data-storage/index.tsx`: `sectionsZone` renders `HelloBytes → ScaleMachine → ThroughputMachine → VolumeMachine`. Update header blurb and `meta.blurb` to describe the new machines (decimal-vs-binary tiers; bits-vs-bytes for rates; 3D cube-pair gap visualization).

**Gate:** Full check passes.

### Commit 11: Delete this plan and the demo-gaps inventory

**Files deleted:**
- `demo/src/components/kits/data-storage/DEMO_GAPS.md`
- `demo/src/components/kits/data-storage/wire-up-completeness.md`

**Gate:** `bun run check` passes. `grep -r 'DEMO_GAPS\|wire-up-completeness' demo/ src/` returns no matches.

## Verification checklist

- [ ] Catalog deltas land: `DATA_DECIMAL_UNITS` 9, `DATA_BINARY_UNITS` 8, `DATA_BIT_UNITS` 6, `DATA_ALIAS_UNITS` 1.
- [ ] `scale-machine/` contains chassis + parts (menu-pill, control-panel) + tiers (5 hooks) + utils.
- [ ] `throughput-machine/` contains chassis + parts + links (2 hooks) + utils.
- [ ] `volume-machine/` contains chassis + parts (babylon-cubes).
- [ ] Old `sections/drive-vs-os.tsx`, `sections/ram-stick.tsx`, `sections/throughput-viz.tsx` no longer exist.
- [ ] `data-storage/index.tsx` renders 4 things in `sectionsZone`: HelloBytes + 3 machines.
- [ ] HelloBytes readout matrix shows 4 columns (decimal, binary, bits, aliases).
- [ ] Every box in `DEMO_GAPS.md` struck through before its final deletion.
- [ ] No new TypeScript errors, no new biome errors, no new knip warnings.
- [ ] `cd demo && bun run dev` renders every machine; menu swaps work; Babylon canvas renders cubes that visibly differ in size; auto-rotate kicks in after idle.
- [ ] `bun run check` passes from repo root.
- [ ] Plan file deleted; DEMO_GAPS.md deleted.

## Anti-patterns / scope boundaries

- **No shared kit-level "machine" abstraction.** Each machine's chassis owns its menu state inline; a future kit copies the chassis, not an abstraction.
- **No promotion of `babylon-canvas.tsx` to a shared UI primitive.** Per the prior decision, copy the geometry pattern into data-storage; promote when a third consumer arrives. Local copy is fine.
- **No library changes.** All library expansion is already done; this branch wires the existing library surface into the demo.
- **No RATE / TIME dimension work.** Still out of library scope per the data-storage DEMO_GAPS's notes.
- **No FloppyMachine of its own.** Floppy is a tier within ScaleMachine, not a standalone surface. It's trivia at one scale.

## References

- `demo/src/components/kits/data-storage/DEMO_GAPS.md` — inventory this plan executes against.
- `demo/src/components/kits/geometry/sections/2d-shape-machine/` — Zone Composer machine pattern (chassis + parts + shapes domain folder + utils).
- `demo/src/components/kits/geometry/sections/3d-shape-machine/parts/babylon-canvas.tsx` — Babylon canvas pattern this branch copies into volume-machine/parts/.
- `~/.claude/skills/babylon-react/SKILL.md` — recipe for Babylon + React integration (mount once, imperative updates, key by active variant, opaque clearColor).
- `~/.claude/skills/zone-composer/SKILL.md` — the recipe this plan follows.
- PR #23 (merged) — data-storage library expansion that created this demo gap.
- PR #25 (merged) — geometry demo restructure that established the Zone Composer machine pattern in this codebase.
