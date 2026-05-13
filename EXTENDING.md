# Extending unitforge

How to add a kit, add a section to an existing kit, or add a dimension. Read this before authoring; the ritual has a few invisible-load-bearing steps and one tree-shake foot-gun.

Two surfaces evolve together but independently:

- **Lib** (`src/`): the published package. Units, conversions, dimensions. Tree-shake-correct.
- **Demo** (`demo/`): the interactive documentation site. Kit screens, sections, themes. Composition-pattern-correct.

A new kit usually means changes in both; a new section is demo-only.

## Adding a unit kit (lib side)

Goal: a new subpath import like `unitforge/kits/<kit>` that ships some units and (optionally) cross-dimensional conversions.

1. **Decide on dimensions.** If your kit needs a new one (e.g. `MASS`, `TIME`, `CURRENCY`):
   - Add it to `src/dimensions.ts` as `export const X = 'x' as const;` with a JSDoc canonical-base-unit note.
   - Append it to the `DIMENSIONS` tuple at the bottom of that file. The type union picks it up.
   - Dimensions are part of the public API; do not rename after release.
   - If you only need existing dimensions (LENGTH, AREA, VOLUME, DATA), skip this step.

2. **Create the kit directory.** `src/kits/<kit>/` with three files:
   - `units.ts`: every unit as a named export.
   - `conversions.ts`: cross-dimensional conversions, if any.
   - `index.ts`: barrel re-exporting both.

3. **Author units.** Each `defineUnit` MUST be `/*#__PURE__*/`-marked AND have inline `toBase` / `fromBase` arrow closures. **Do not use `...linear(scale)` for kit-shipped units.** The spread introduces a `CallExpression` inside the spec literal which defeats per-export tree-shaking even when the `defineUnit(...)` call itself is PURE-marked.

   ```ts
   import { defineUnit } from '../../define.js';
   import { LENGTH } from '../../dimensions.js';

   export const meter = /*#__PURE__*/ defineUnit({
     id: 'meter',
     label: 'Meter',
     symbol: 'm',
     dimension: LENGTH,
     toBase: (v) => v, // inline; not `...linear(1)`
     fromBase: (b) => b,
     base: true,
   });
   ```

   `id` is a stable kebab-case string; `label` is the display name; `symbol` is the conventional short form (`'m²'`, `'GiB'`). Exactly one unit per dimension may set `base: true`.

4. **Author conversions** (if your kit has any). `/*#__PURE__*/`-mark them too. `compute` runs in base units; the library handles input/output unit normalization.

   ```ts
   export const areaFromLengthAndWidth = /*#__PURE__*/ defineConversion({
     inputs: { length: LENGTH, width: LENGTH },
     output: AREA,
     compute: ({ length, width }) => length * width,
   });
   ```

5. **Barrel.** `src/kits/<kit>/index.ts` is just:
   ```ts
   export * from './conversions.js';
   export * from './units.js';
   ```

6. **package.json: do nothing.** The `./kits/*` wildcard export already handles the new subpath. Verify with `bun run check:package` (publint + arethetypeswrong).

7. **Tests.** Add `test/kits/<kit>/units.test.ts` and `test/kits/<kit>/conversions.test.ts`. Existing kits are the template. Include a tree-shake sanity test if your kit has more than ~5 units.

8. **Update llms.txt** to list the new kit under `## Kits`.

## Adding a kit (demo side)

Goal: a navigable screen at `#/<kit>` that exercises the lib kit interactively.

The demo registers a kit in **three places**. Forget one and the kit silently doesn't appear, themes wrong, or breaks routing.

1. **Kit directory.** `demo/src/components/kits/<kit>/`:
   - `index.tsx`: the Screen component + `meta` export.
   - `units.ts`: re-export the lib's units as ordered arrays for `UnitPicker` and `Bench` (e.g. `LENGTH_UNITS`, `AREA_UNITS`).
   - `<kit>.css`: data-theme CSS variable blocks for the kit's dark and light variants.
   - `parts/<kit>-backdrop.tsx`: ambient background component.
   - `sections/<section>.tsx` per section.

2. **Screen component** (`index.tsx`). Owns `BenchState`. Composes `<KitLayout>` zones:
   ```tsx
   <KitLayout
     backdropZone={<Backdrop />}
     benchZone={<Bench state={bench} onChange={setBench} options={LENGTH_UNITS} ... />}
     sectionsZone={<><Section1 /><Section2 /></>}
   />
   ```
   Exports `meta: KitMeta` describing the kit (id, label, blurb, default theme, icon, optional `previewBg`).

3. **Register in `registry.ts`.** Import `<Kit>Screen` and `meta`; append to the `KITS` tuple. Order matters: position [0] is the home/default route.

4. **Register theme in `theme/recipes.ts`.** Extend `KitId` to include `'<kit>'`; add `'<kit>-dark'` and `'<kit>-light'` entries in `THEMES`. Both variants are mandatory; the completeness check enforces it.

5. **Theme CSS.** In `<kit>.css`, add `[data-theme='<kit>-dark']` and `[data-theme='<kit>-light']` blocks defining the `--uf-*` variable cascade. Import the CSS at the top of the kit's `index.tsx`.

6. **Backdrop preview** (optional). If the kit appears on the home grid, define a `previewBg` in `meta` returning a tiny version of the backdrop for the navigation card.

After these six steps the kit is reachable, themed, and previewed. Smoke-test by running `bun run demo` and navigating to `#/<kit>`.

## Adding a section to an existing kit

Goal: one more interactive panel in an existing kit screen.

1. **Create the section file.** `demo/src/components/kits/<kit>/sections/<section>.tsx`. Compose `<SectionLayout>`:
   ```tsx
   <SectionLayout
     headerZone={<SectionHeader eyebrow="demo 04" title="..." iconZone={<X />} />}
     introZone={<>One paragraph framing what the demo proves.</>}
     widgetZone={
       <WidgetLayout
         interactionZone={<SectionWidget {...} />}
         codeZone={<CodeBlock code={liveCode} />}
       />
     }
   />
   ```

2. **Named Organ extraction.** If the widget body grows past ~50 lines or contains a self-contained visual artifact, extract it as a sibling component in the same file. The four criteria:
   - Named visual artifact (a "thing" you'd point at).
   - Bounded prop surface.
   - Cadence mismatch with the surrounding chrome (re-renders more or less often).
   - Sink, not source (takes derived values; owns no upstream state).
   See `drive-vs-os.tsx` for canonical examples (`DriveLabel`, `PropertiesPanel`, `FileInfographic`).

3. **Live-template the code block.** The `codeZone`'s string should derive from the same state the widget uses, so the code reader sees the live values. Use `formatMagnitude` from `~/lib/format.js` for numbers and `toJsName` for kebab-id → camelCase identifiers in import statements.

4. **Wire into the kit Screen.** Import the section component in the kit's `index.tsx` and add it to the `sectionsZone` fragment.

That's it. No registry edit; the kit screen owns its section list.

## Voice and code rules (apply everywhere)

These are non-negotiable house style; reviewers will flag violations:

- **No em dashes.** Use semicolons, comma pairs, parentheses, or colons. The em dash is reserved for "extreme ejaculations of emotion" in dialogue; technical prose never needs it.
- **Oxford comma mandatory** in lists of three or more.
- **File-leading `//` comments** describe the file's purpose. Treat the first comment block as the doc for a future reader who has no other context.
- **JSDoc** for exported APIs; not for internal helpers.
- **Trunk-to-leaf file ordering**: entry/exported components at the top, helper subcomponents below. The reader sees what the file is *for* before how it works.
- **Conventional Commits.** `feat:` minor, `fix:` patch, `feat!:` or `BREAKING CHANGE:` footer for major. Imperative tense, no past-tense subject lines.
- **No marketing language in commit bodies or PR descriptions.** Facts only. Benefits go in release notes, not the diff.

## Gotchas (the load-bearing things that aren't obvious)

- **Tree-shake regression**: any `CallExpression` inside a `defineUnit` spec literal defeats per-export tree-shaking. Use inline closures, not `...linear(...)`, for kit units.
- **Kit registration is 3 files**: `kits/<kit>/`, `registry.ts`, `theme/recipes.ts`. The TypeScript `KitId` union catches some omissions but not all.
- **`Select.ItemText` drops `className`**: if you ever extend `UnitPicker`, the way to hide the item text without losing Radix type-ahead is to wrap `<Select.ItemText>` in an `sr-only` span, not pass the className to it.
- **`Unit<D, T>` structural typing**: the demo's `UnitPicker` only requires `{ id, label, symbol }`. Adding a property to `Unit` in the lib won't break anything in the demo; removing `id`, `label`, or `symbol` will. Treat those three as a stability contract.
- **react-compiler bailouts** on Radix internals are expected and harmless; the bailout reporter will flag them but they live inside Radix, not in our component bodies.
- **Per-kit `units.ts` in the demo is not the lib's `units.ts`**: the demo file is a re-export of the lib's named exports as ordered arrays for picker iteration. Keep them in sync manually; a deleted lib unit must be removed from the demo array.

## Reference reading

- [README.md](./README.md): public-facing library overview.
- [AGENTS.md](./AGENTS.md): orientation for agents and contributors.
- [CONTRIBUTING.md](./CONTRIBUTING.md): local setup, commands, commit conventions.
- [llms.txt](./llms.txt): condensed agent reference.
- Existing kits (`src/kits/geometry/`, `src/kits/data-storage/`, `demo/src/components/kits/geometry/`) are the canonical examples; read them when in doubt.
