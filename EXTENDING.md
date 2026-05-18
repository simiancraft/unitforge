# Extending unitforge

How to add a kit, add a section to an existing kit, or add a dimension. Read this before authoring; the ritual has a few invisible-load-bearing steps and one tree-shake foot-gun.

Two surfaces evolve together but independently:

- **Lib** (`src/`): the published package. Units, conversions, dimensions. Tree-shake-correct.
- **Demo** (`demo/`): the interactive documentation site. Kit screens, sections, themes. Composition-pattern-correct.

A new kit usually means changes in both; a new section is demo-only.

## Kit categories

Three categories of kit exist; they have different authoring rules. Decide which a new kit belongs to before opening the directory.

### Foundational kits

Canonical units in a well-known dimension; one dimension per foundational kit. The base layer; domain kits re-export from these. Today: `length` (LENGTH), `volume` (VOLUME), `mass` (MASS), `temperature` (TEMPERATURE), `data-storage` (DATA). Future scope: `area` and `angle` (currently in geometry; promote when a second domain kit needs them), `time`, `electricity`, `hydro/flow`, `light`, `force-and-energy`, `velocity`, `currency`.

Authoring rules:
- **Canon-correct.** Every `toBase` factor matches an authoritative source (NIST, IEC 80000, ISO, BIPM, IEEE). Wrong values in a foundational kit propagate through every downstream consumer.
- **Comprehensive within the dimension.** A foundational LENGTH kit ships every unit a working practitioner reasonably expects; a foundational MASS kit similarly. Coverage gaps in foundationals force domain kits to invent shadow units.
- **JSDoc cites the standard.** e.g., `/** = 0.3048 m exactly per international yard and pound agreement of 1959. */`.
- **Reviewer pairing**: a domain expert (geometer, pharmacist, data-hoarder, mrp-planner, astrometrist, antiquary, color-scientist) plus the architect for surface coherence.

### Composition kits

A curated barrel for a working domain. Re-exports a tightly-scoped subset of atomic units from one or more foundational kits, plus a small number of domain-specific units and conversions. The point is to give a working professional a coherent, scoped surface, not to be canonically complete in any single dimension.

Shipped today: `geometry` (LENGTH + VOLUME re-exports + AREA + ANGLE atoms defined in-place + 40+ shape derivations), `cooking` (VOLUME + MASS + TEMPERATURE re-exports + cooking-tradition packaging units + heat descriptors). Future scope tracked as issue #37: `home-construction` (the proof-test for the pattern; LENGTH + MASS + VOLUME + TEMPERATURE + future ELECTRICITY + HYDRO + LIGHT). Other proposed surfaces: `sewing` (yard + fat-quarter + seam-allowance), `real-estate` (square foot + lot acreage + price-per-sqft), `pharmacy` (mass with `microgram` redeclared as `mcg` for clinical-dosing surface).

Authoring rules:
- **Re-export atomic units, do not redefine them.** A composition kit's barrel imports `foot` from `kits/geometry` and re-exports it. The `Unit` instance is the same JS object across both kits; `forge(home.foot, geom.foot)` is identity. Redefining `foot` in two places creates two distinct `Unit` instances that fail at runtime when consumers cross them.
- **Add 3-10 domain-specific units and conversions.** More than that and you are probably splitting a foundational kit. Fewer than that and the kit is not earning its keep as a curation layer; just import the foundational directly.
- **Pedagogy: demos teach the domain, not the dimension.** A `home-improvement` demo shows "how many drywall sheets does this wall need?", not "what is a square foot?".
- **Reviewer pairing**: a working-profession expert (a contractor, a pharmacist for pharmacy, etc.) plus the architect for surface coherence. The foundational kits the composition borrows from were already canon-checked, so the canon lens is light.

### In-universe kits

Invented dimensions for fictional or in-universe domains. Mostly self-contained; their dimensions do not overlap with foundational kits.

Examples: the ArPeeGee shop demo (`demo/src/components/kits/forge/sections/arpy-gee-shop.tsx`) with `arpygee/coin` and `arpygee/goods` dimensions. Future possibilities: `battletech` (TONNAGE, DAMAGE, HEAT, MP, BV, C-BILLS), `dnd-currency` (copper / silver / gold / platinum, 1:10 scaling), `sci-fi-power-levels` (Kardashev scale), `magic-mana`.

Authoring rules:
- **Invent dimensions freely.** `defineUnit` and `defineConversion` treat user-defined dimensions as first-class; this is the proof-of-abstraction category.
- **Prefix dimension names with the universe** to avoid collision (`battletech/heat`, not just `heat`).
- **Cite the source material**: rulebook edition, record sheets, canon publication. For BattleTech specifically: edition (3025 / TR&O / TW / TM / ilClan) and tech base (Inner Sphere / Clan) matter; the grognard reviewer is relentless about this.
- **Reviewer pairing**: the appropriate genre lens (battletech-grognard for BattleTech, antiquary for historical metrology, etc.). The architect is optional here because the kit is not composing from anything.

### Cross-kit imports

Cross-kit imports between foundational and composition kits are blessed and tree-shake-correct. Every export is `/*#__PURE__*/` and named, so a composition kit's barrel pays the byte cost only of the exports it actually re-exports. A consumer who imports `foot` from `kits/home-improvement` gets the same `Unit` instance, the same bytes, and the same conversion behavior as importing it from `kits/geometry` directly.

This is the load-bearing architectural claim that makes the composition category viable: domain composition is a curation problem, not an engineering one.

## Adding a unit kit (lib side)

Goal: a new subpath import like `unitforge/kits/<kit>` that ships some units and (optionally) cross-dimensional conversions.

1. **Decide on dimensions.** If your kit needs a new one (e.g. `TIME`, `CURRENCY`, `ELECTRICITY`):
   - Add it to `src/dimensions.ts` as `export const X = 'x' as const;` with a JSDoc canonical-base-unit note.
   - Append it to the `DIMENSIONS` tuple at the bottom of that file. The type union picks it up.
   - Dimensions are part of the public API; do not rename after release.
   - If you only need existing dimensions (LENGTH, AREA, VOLUME, DATA, ANGLE, MASS, TEMPERATURE), skip this step.

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

   Identity triple:
   - `id`: stable kebab-case string (`'square-meter'`, `'kibibyte'`). Safe for persistence, dictionary keys, deep links. Never rename after release.
   - `label`: human display name in title case (`'Square Meter'`, `'Kibibyte'`).
   - `symbol`: conventional short form (`'m²'`, `'KiB'`, `'GB'`, emoji are fine for invented dimensions).

   `base: true` semantics: marks the dimension's canonical unit, the one whose `toBase` / `fromBase` are identity (`(v) => v`). Every other unit in the dimension converts to/from this one. **Exactly one** unit per dimension may set `base: true`; the library has no compile-time check for this, so a duplicate base produces silent runtime ambiguity. The test suite is the safety net.

   JS-binding naming convention: kebab `id` → camelCase JS export (`'square-meter'` → `squareMeter`). The demo's code-snippet renderer (`toJsName`) relies on this conversion; staying in pattern keeps live `forge(...)` snippets readable.

   **`linear(scale)` helper, when to use:** the `linear()` export builds `{ toBase: v => v * scale, fromBase: b => b / scale }` for the common multiplicative case. **Kit units MUST NOT use it** (the spread breaks tree-shake; rule above). It is for userland one-offs at call sites that already pulled `linear` for another reason, where the tree-shake regression doesn't apply:

   ```ts
   // userland: fine.
   import { defineUnit, linear } from 'unitforge';
   import { LENGTH } from 'unitforge/dimensions';
   const handspan = defineUnit({ id: 'handspan', label: 'Handspan', symbol: 'hsp', dimension: LENGTH, ...linear(0.235) });
   ```

4. **Author conversions** (if your kit has any). `/*#__PURE__*/`-mark them too. `compute` runs in base units; the library handles input/output unit normalization.

   ```ts
   export const areaFromLengthAndWidth = /*#__PURE__*/ defineConversion({
     inputs: { length: LENGTH, width: LENGTH },
     output: AREA,
     validate: {
       length: (v) => v >= 0 || 'length must be >= 0',
       width: (v) => v >= 0 || 'width must be >= 0',
     },
     compute: ({ length, width }) => length * width,
   });
   ```

   The `validate` map is optional, per-input, and aggregating: each validator returns `true` (pass) or a `string` error message (fail). A call with multiple bad inputs yields one `ValidationError` carrying one `ValidationFailure` per rejected input. Validators run on the values *as the consumer supplied them*, not the base-normalized form, so `length must be >= 0` reads naturally regardless of input unit.

   Cross-kit conversions: a conversion that crosses two kits' dimensions (rare) lives in the more derived kit, alongside that kit's units. There is no shared `conversions/` directory; co-location keeps subpath tree-shake correct.

5. **Barrel.** `src/kits/<kit>/index.ts` is just:
   ```ts
   export * from './conversions.js';
   export * from './units.js';
   ```

   The filename `index.ts` is load-bearing: `package.json`'s `./kits/*` wildcard resolves to `dist/kits/<kit>/index.{js,d.ts}`. A kit barrel named `main.ts` or anything else silently 404s the subpath import.

6. **package.json: do nothing.** The `./kits/*` wildcard export already handles the new subpath. Verify with `bun run check:package` (publint + arethetypeswrong). Note that `check:package` verifies export-map and types resolution; it does NOT measure tree-shake outcomes. A regression that reintroduces `...linear(scale)` in a kit unit passes `check:package`. The bundle-size badge in README is the human gate for that.

   Two side constraints kit authors must not break:
   - `"sideEffects": false` is a package-wide contract. A new kit cannot import CSS at module scope, run code at import time, or otherwise produce observable side effects on import; doing so breaks tree-shaking package-wide, not just for the offending kit.
   - The `"files"` allowlist in `package.json` is `["dist", "README.md", "LICENSE", "NOTICE.md"]`. A kit's tests, fixtures, or auxiliary files under `src/kits/<kit>/` are excluded from the publish tarball automatically; deliberately, since only the built `dist/` ships. Put runtime resources inside the kit's source, not alongside it.

7. **Tests.** Add `test/kits/<kit>.test.ts` (single file per kit; existing kits use this shape). The four invariants every unit must hold:

   1. Identity triple matches the documented `id` / `label` / `symbol`.
   2. `dimension` is the right `Dimension` constant.
   3. `toBase(known value)` returns the right base-unit number (use a reference value with a known conversion).
   4. `fromBase` round-trips: `unit.fromBase(unit.toBase(x))` === `x` for representative `x`.

   `base: true` is asserted **only** on the canonical base unit, never on derived units; a duplicate `base: true` is the silent foot-gun the test suite exists to catch.

   For conversions:
   - `compute(...)` returns the right output for representative inputs.
   - `validate` rejects each documented bad-input case with the right message.
   - `forge({...}, output, { via: conversion })({...})` returns the same value the bare `compute` would, across more than one input unit (proves normalization works).

   No separate tree-shake test is required; the `check:package` step (publint + arethetypeswrong) and the kit-shape tests are the gate.

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

2. **Screen component** (`index.tsx`). Owns `BenchState`. `KitMeta` shape exported from this file is what `registry.ts` consumes.

   ```ts
   interface KitMeta {
     id: KitId;               // route segment; the kit's hash path is `#/<id>`
     label: string;           // lowercase, short ('geometry', 'data-storage')
     blurb: string;           // one-sentence pitch shown on the home grid card
     defaultThemeId: ThemeId; // '<kit>-dark' or '<kit>-light'
     icon: LucideIcon;        // navigation card glyph
     previewBg?: ComponentType<{ hovered: boolean }>; // inline backdrop preview; omit if the kit shouldn't appear on the home grid (forge is the only such case today)
   }
   ```

   The Screen composes the page chrome via `KitLayout` (imported from `../layout.js`). `KitLayout` is pure positional zone-container; it owns no state and decides nothing beyond render order. Its prop shape:

   ```ts
   interface KitLayoutProps {
     backdropZone: ReactNode;        // fixed, painted behind content
     headerZone: ReactNode;          // kit title + blurb at top of page
     benchZone?: ReactNode;          // optional sticky bench instrument
     sectionsZone: ReactNode;        // vertical stack of <Section>s
     footerZone?: ReactNode;         // optional kit-specific footnotes; NOT the global page footer
   }
   ```

   Worked Screen example (lifted from `geometry/index.tsx`):

   ```tsx
   const GEOMETRY_BENCH_MIN = 0.1;
   const GEOMETRY_BENCH_MAX = 100;
   const GEOMETRY_BENCH_STEP = 0.1;

   export function GeometryScreen() {
     const [bench, setBench] = useState<BenchState>({
       fromId: 'meter',  // must match a `units.LENGTH_UNITS[*].id`
       toId: 'foot',
       value: 5,
     });
     return (
       <KitLayout
         backdropZone={<GeometryBackdrop />}
         headerZone={<header>...</header>}
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
         sectionsZone={<><HelloUnit /><RectangleMachine /><CircleMachine /></>}
       />
     );
   }

   export const meta: KitMeta = {
     id: 'geometry',
     label: 'geometry',
     blurb: '...',
     defaultThemeId: 'geometry-light',
     icon: Box,
     previewBg: ({ hovered }) => <GeometryBackdrop inline scale={hovered ? 1.5 : 1} />,
   };
   ```

   `BenchState` is `{ fromId: string; toId: string; value: number }`. The seed `fromId` / `toId` MUST be `id`s present in the unit catalog you pass as `options`; the bench has no fallback if the seed doesn't match (it'll throw via `findById`). `codeFor` receives `(state, result)` and returns the live code-block string shown under the bench's slider.

3. **Register in `registry.ts`.** Import `<Kit>Screen` and `meta`; append to the `KITS` tuple. Order matters: position [0] is the home/default route.

4. **Register theme in `theme/recipes.ts`.** Extend `KitId` to include `'<kit>'`; add `'<kit>-dark'` and `'<kit>-light'` entries in `THEMES`. Both variants are mandatory; the completeness check enforces it.

5. **Theme CSS.** In `<kit>.css`, add `[data-theme='<kit>-dark']` and `[data-theme='<kit>-light']` blocks defining the `--uf-*` variable cascade. Import the CSS at the top of the kit's `index.tsx`.

   Cascade variables every theme must set (defaults inherit from `demo/src/index.css` if you omit one, but each kit should set its own for visual coherence):

   | Variable | Purpose |
   | --- | --- |
   | `--uf-bg` | Page / canvas background |
   | `--uf-fg` | Default text color |
   | `--uf-muted` | Secondary text, subdued labels |
   | `--uf-accent` | Hover, focus ring, link, key data emphasis |
   | `--uf-border` | Card and control borders |
   | `--uf-card` | Card / panel surface background |
   | `--uf-code-bg` | Code block background |
   | `--uf-trace` / `--uf-trace-faint` | Backdrop trace lines (decorative; kit-specific) |
   | `--uf-grid` / `--uf-grid-faint` | Backdrop grid color (kit-specific; geometry uses this for its engineering paper) |

   The non-kit-specific vars (`--uf-sans`, `--uf-mono`, `--uf-display`, `--uf-brand`) come from `demo/src/index.css` and do not need to be redeclared per kit unless you want to override them.

6. **Backdrop preview** (optional). If the kit appears on the home grid, define a `previewBg` in `meta` returning a tiny version of the backdrop for the navigation card.

After these six steps the kit is reachable, themed, and previewed. Smoke-test by running `bun run demo` and navigating to `#/<kit>`.

## Adding a section to an existing kit

Goal: one more interactive panel in an existing kit screen.

1. **Create the section file.** `demo/src/components/kits/<kit>/sections/<section>.tsx`. Compose `<SectionLayout>` (imported from `../../section-layout.js` from a section file's relative position):
   ```tsx
   import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
   import { CodeBlock } from '~/components/ui/code-block.js';

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

   The section-authoring vocabulary lives in `demo/src/components/ui/`. Prefer these primitives over hand-rolled markup; they carry the demo's theming and accessibility contracts:

   | Primitive | Use for |
   | --- | --- |
   | `UnitPicker` | Any unit selection in an `interactionZone`. Takes `{ value, onChange, units: ReadonlyArray<{ id, label, symbol }>, label }`; lib `Unit<D, T>` satisfies the prop shape. |
   | `Slider` | Numeric input bound to a single value. `{ value, onChange, min, max, step?, label, orientation?, suffix? }`. Orientation defaults to horizontal; use `'vertical'` only when the axis is the thing the slider visually controls. |
   | `Result` | The live "answer" the widget produces. `{ label, value, variant?: 'standard' \| 'hero' }`. Use `hero` for the headline number, `standard` for secondary readouts. Hand-rolled magnitude rendering inside the `interactionZone` is the smell `Result` exists to displace. |
   | `CodeBlock` | The live code snippet in a `codeZone`. The `code` prop should be a pure function of widget state so the panel re-renders deterministically. |

2. **Named Organ extraction.** If the widget body grows past ~50 lines or contains a self-contained visual artifact, extract it as a sibling component in the same file. The four criteria:
   - Named visual artifact (a "thing" you'd point at).
   - Bounded prop surface.
   - Cadence mismatch with the surrounding chrome (re-renders more or less often).
   - Sink, not source (takes derived values; owns no upstream state).

   Organs are sink-only. If a sub-organ feels like it needs a chassis-decided flag (`selected`, `loading`, `disabled`, `active`), the chassis swaps which organ renders rather than passing the flag. Flag-prop relay into sub-organs is the slop pattern the rule exists to prevent.

   See `data-storage/sections/drive-vs-os.tsx` for canonical examples (`DriveLabel`, `PropertiesPanel`, `FilesInfographic`).

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

## Release signals

`.releaserc.json` includes the rule `{ scope: "demo", release: false }`: every `(demo)`-scoped commit is filtered from release analysis. The intent is to keep demo iteration from forcing patch bumps on the published lib. The cost is that any lib change accidentally carrying a `(demo)` scope is invisible to semantic-release and silently fails to publish.

Rules that prevent silent release misses:

- Any commit touching `src/define.ts`, `src/types.ts`, `src/dimensions.ts`, `src/forge.ts`, `src/lib/**`, or `src/kits/**` MUST NOT use the `(demo)` scope. Use `(api)`, `(lib)`, `(core)`, or no scope at all.
- A breaking lib-API change needs the major signal at the commit level: `feat(api)!:` (or any `!` suffix) on the subject line, or a `BREAKING CHANGE:` footer in the body. Without one, semantic-release picks at most a minor or patch bump even if the diff actually breaks consumers.
- If you deliberately bundle a lib change into a commit whose dominant intent is demo-shaped, the bundling-marker commit (the one explaining the bundle) is where the `BREAKING CHANGE:` footer goes. Prose-only documentation commits do not trigger releases. **A note that says "this commit bundles a lib change" without the footer is the failure mode that took v2.0.0 a separate release PR to recover.**
- PR titles don't drive semantic-release directly; it analyzes individual commits on main. For the repo's default merge mode (merge commits, not squash), the branch's individual commit subjects are what semantic-release sees. The PR title and body are for reviewers; the commit subject is for the release pipeline.

Quick reference for commit subjects:

| Change | Subject |
| --- | --- |
| Demo-only refactor / fix / style | `refactor(demo): ...`, `fix(demo): ...`, `style(demo): ...` |
| Lib new feature, non-breaking | `feat: ...` or `feat(api): ...` |
| Lib bug fix | `fix: ...` or `fix(api): ...` |
| Lib breaking API change | `feat(api)!: ...` plus `BREAKING CHANGE:` footer in the body |
| Bundled lib + demo change | Unbundle if you can. If you can't, use the lib's scope and add `BREAKING CHANGE:` if applicable; do NOT scope the bundled commit `(demo)`. |
| Docs touching `README.md`, `EXTENDING.md`, `AGENTS.md`, `llms.txt` | `docs: ...` (always filtered from release as a non-feature, non-fix change) |

When in doubt: look at what files changed. If `src/` is touched and the scope is `(demo)`, that's a bug; rewrite the subject before pushing.

## Gotchas (the load-bearing things that aren't obvious)

- **Tree-shake regression**: any `CallExpression` inside a `defineUnit` spec literal defeats per-export tree-shaking. Use inline closures, not `...linear(...)`, for kit units.
- **Duplicate `base: true`**: two units in the same dimension with `base: true` is silent runtime ambiguity. The library has no compile-time guard. The test suite is the only thing that catches this; assert `base: true` on the canonical unit and nowhere else.
- **Reserved prototype-pollution keys**: `defineUnit` and `defineConversion` route inputs through `safeCopy`, which throws if the spec contains the keys `__proto__`, `constructor`, or `prototype`. Don't pick these as `id`s, even for invented dimensions. The `RESERVED_PROTO_KEYS` constant in `src/lib/safeCopy.ts` is the canonical list; it is internal, not re-exported on the public barrel.
- **Kit registration is 3 files**: `kits/<kit>/`, `registry.ts`, `theme/recipes.ts`. The TypeScript `KitId` union catches some omissions but not all.
- **`Select.ItemText` drops `className`**: if you ever extend `UnitPicker`, the way to hide the item text without losing Radix type-ahead is to wrap `<Select.ItemText>` in an `sr-only` span, not pass the className to it.
- **`Unit<D, T>` structural typing**: the demo's `UnitPicker` only requires `{ id, label, symbol }`. Adding a property to `Unit` in the lib won't break anything in the demo; removing `id`, `label`, or `symbol` will. Treat those three as a stability contract.
- **react-compiler bailouts** on Radix internals are expected and harmless; the bailout reporter will flag them but they live inside Radix, not the kit's component bodies.
- **Per-kit `units.ts` in the demo is not the lib's `units.ts`**: the demo file is a re-export of the lib's named exports as ordered arrays for picker iteration. Keep them in sync manually; a deleted lib unit must be removed from the demo array.

## Reference reading

- [README.md](./README.md): public-facing library overview.
- [AGENTS.md](./AGENTS.md): orientation for agents and contributors.
- [CONTRIBUTING.md](./CONTRIBUTING.md): local setup, commands, commit conventions.
- [llms.txt](./llms.txt): condensed agent reference.
- Existing kits (foundational: `src/kits/length/`, `src/kits/volume/`, `src/kits/mass/`, `src/kits/temperature/`, `src/kits/data-storage/`; composition: `src/kits/geometry/`, `src/kits/cooking/`; demo surface: `demo/src/components/kits/geometry/`) are the canonical examples; read them when in doubt.
