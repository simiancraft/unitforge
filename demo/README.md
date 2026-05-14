# unitforge / demo

> **forge anything measurable. not just physics.** The interactive showcase that ships alongside the library.

The demo is two things at once:

1. A marketing surface that earns clicks (per-kit visual worlds, live `forge()` calls everywhere, a forge-base glow that pulses on hover).
2. An integration test for the published package; every snippet on screen is the same call shape your own code would make against the built `dist/`.

## Run

```sh
bun run build         # at repo root: builds unitforge/dist
cd demo
bun install           # only if dist/ symlink looks stale
bun run dev           # localhost:5173
bun run build         # static output in ./dist
```

`unitforge` is a `file:..` dependency, so the demo always tests the package as a downstream consumer would receive it.

## Thesis: anything measurable, in its own visual world

Each kit (`geometry`, `data-storage`, future kits) is a **domain**. The demo treats every kit as a self-contained module:

- Its own palette, fonts, and CSS (`kits/<kit>/<kit>.css`).
- Its own background flair component (grid paper, PCB traces, future starfield, etc.).
- Its own widgets (`kits/<kit>/components/`).
- Its own syntax-highlighting theme + optional code-block frame chrome, declared once at the top of `kits/<kit>/index.tsx` via `<KitThemeProvider>`.
- Its own page entry point (`kits/<kit>/index.tsx`).

The result: opening geometry feels like a different product than opening data-storage. Adding a new kit means dropping a new directory; no edits to `App.tsx`, no edits to shared `components/`, no edits to other kits.

## Layout

```
demo/src/
├── App.tsx                              router shell; hash-based routing
├── main.tsx                             React entry
├── index.css                            shared infra ONLY; :root tokens,
│                                        body, focus-visible, scrollbars,
│                                        .uf-card, .uf-eyebrow, .uf-flare-card
├── forge.css                            root forge theme; anvil-strike,
│                                        forge-flash, hammer-cursor
├── pages/                               root page + home-specific subviews
│   ├── Home.tsx
│   ├── HomeBench.tsx                    slim 2-row converter
│   ├── CoreApiIntro.tsx                 three-verb teaser
│   └── ArpyGeeShop.tsx                  BYO custom-dimensions demo
├── components/                          truly shared, kit-agnostic
│   ├── ForgeBench.tsx                   sticky instrument used by every kit
│   ├── DemoSection.tsx                  title + intro + widget + code block
│   ├── CodeBlock.tsx                    lazy shiki + KitTheme-aware frame
│   ├── EmberStream.tsx                  forge particle system (reusable)
│   ├── KitTheme.tsx                     React context: shiki theme + frame class
│   ├── Slider.tsx, UnitPicker.tsx, Result.tsx, ErrorBoundary.tsx
├── hooks/
│   └── useSvgPointerDrag.ts             drag plumbing for shape machines
├── lib/
│   ├── highlighter.ts                   shiki/core singleton, theme registry
│   ├── kits.ts                          kit catalog read by Home + the router
│   ├── math.ts                          clamp, round1
│   └── units.ts                         unit-option catalogs per dimension
└── kits/
    ├── geometry/
    │   ├── index.tsx                    the page; wraps in KitThemeProvider
    │   ├── geometry.css                 palette + grid tokens
    │   └── components/
    │       ├── GridPaperBg.tsx          engineering-paper background
    │       ├── HelloUnit.tsx, RectangleMachine.tsx, CircleMachine.tsx
    └── data-storage/
        ├── index.tsx
        ├── data-storage.css             palette + scanlines + CRT frame
        └── components/
            ├── CircuitBg.tsx            PCB-trace background
            ├── HelloBytes.tsx, DriveVsOs.tsx, ThroughputViz.tsx, RamStick.tsx
```

## Discipline rules

1. **Kits never depend on each other.** A geometry component does not import a data-storage component. Cross-kit references go through the shared `components/` or `lib/` boundary.
2. **`components/` is for components used by more than one kit, OR shared infrastructure with no kit affinity.** Home-only components live in `pages/`. Kit-only components live in `kits/<kit>/components/`.
3. **CSS for a kit lives in the kit's directory.** No `[data-theme='<kit>']` selectors land in `index.css`; they live in `kits/<kit>/<kit>.css` and are imported from the kit's `index.tsx`.
4. **Per-kit visual variation that components need at render time goes through `KitTheme` context.** Currently `shikiTheme` and `codeFrameClass`. Add knobs to the same context as needs arise (font family, code-block chrome variants, etc.). CSS variables cover anything that's pure styling.

## The kit-as-module pattern

Each `kits/<kit>/index.tsx` follows the same shape:

```tsx
import { KitThemeProvider } from '../../components/KitTheme.js';
import { ForgeBench } from '../../components/ForgeBench.js';
import { DemoSection } from '../../components/DemoSection.js';
// kit-local imports
import { MyKitBg } from './components/MyKitBg.js';
import { MyWidget } from './components/MyWidget.js';
import './my-kit.css';

export function MyKitPage() {
  return (
    <KitThemeProvider values={{ shikiTheme: '…', codeFrameClass: '…' }}>
      <MyKitBg />
      <header>…</header>
      <ForgeBench …/>
      <DemoSection widget={<MyWidget />} code={…} … />
    </KitThemeProvider>
  );
}
```

Then add it to `lib/kits.ts` (route + label + theme key) and import the page in `App.tsx`. That's it.

## Composition

The demo is composition-via-children throughout. **No flag-prop relays** to gate UI on state (`disabled`, `loading`, `canX`, etc.); each leaf widget owns its own state and emits its own DOM. `DemoSection` is a thin presentational chassis that takes `widget` and `code` slots and pairs them with a copy-button-equipped `CodeBlock`. `ForgeBench` is a controlled instrument (state lifted to the kit page so the page's themed background can react). Hooks are extracted when geometry repeats (`useSvgPointerDrag` for the shape machines); pages don't memoize manually because the React Compiler is wired and the discipline is to let it.

## Visual flair

The forge / home page borrows the chromonym pattern of "set reacts to state":

- An always-on **ambient ember stream** (`EmberStream count=32 boost=1`).
- Two **stoke EmberStreams** on a round-robin: hovering a kit card re-mounts the more-stale slot with a fresh `key`, restarting its rise animation. The other layer fades out via opacity transition. Rapid back-and-forth hovers stack flurries instead of resetting one.
- A **forge-base glow flash** pinned to the bottom 33vh (one of three height variants on round-robin) that scales out of the viewport on each stoke, then opacity-decays. Reads as a struck billet flaring.
- An **anvil-strike** CSS keyframe applied to `<main>` on mousedown of a kit card; tiny vertical translate, ~280ms, percussion that carries into the route transition.
- A **lucide Hammer SVG inlined as a cursor data-URI** scoped to the kit tiles.

Kit pages have their own analogues: geometry's grid retickets on bench-unit change and pulses on bench moves; data-storage's PCB copper traces stroke-dash-animate during stoke pulses; data-storage's code blocks get CRT scanlines + vignette + phosphor glow via the `uf-code-crt` frame class.

All motion-flair is gated behind `prefers-reduced-motion: no-preference`.

## Tunables you'll likely touch

- `pages/Home.tsx`; `AMBIENT_*`, `STOKE_*`, `FORGE_GLOW_VARIANTS`, `STOKE_HOLD_MS`.
- `components/EmberStream.tsx`; top-of-file consts: `SIZE_MIN`, `RISE_DURATION_MIN`, `DRIFT_MAX`, `SWAY_AMP_MAX`, etc.
- `kits/<kit>/<kit>.css`; palette tokens, `.uf-code-crt` (and future per-kit code-frame classes).
- `lib/highlighter.ts`; `THEME_LOADERS` to register more shiki themes.

## Deployed

GitHub Pages via `.github/workflows/deploy-demo.yml`. The workflow builds unitforge, installs the demo, runs `vite build` with `GITHUB_PAGES=true` so the `base` is `/unitforge/`.

## What this demo is NOT

It's not in the published npm tarball (`unitforge`'s `files` allowlist covers `dist/`, `README.md`, `LICENSE`, `NOTICE.md`). Bundle weight inside `demo/` is a UX concern for the deployed Pages site, not a constraint on what consumers ship.
