<p align="center">
  <img src="./.github/assets/unitforge-logo.png" alt="unitforge" width="160" />
</p>

<p align="center">
  <a href="https://simiancraft.github.io/unitforge/">
    <img src="https://img.shields.io/badge/▶%20Live%20demo-f97316?style=for-the-badge" alt="Live demo" />
  </a>
</p>

[![npm version](https://img.shields.io/npm/v/unitforge?color=cb3837&logo=npm)](https://www.npmjs.com/package/unitforge)
[![Types: included](https://img.shields.io/npm/types/unitforge?color=3178c6&logo=typescript)](https://www.npmjs.com/package/unitforge)
[![CI](https://github.com/simiancraft/unitforge/actions/workflows/ci.yml/badge.svg)](https://github.com/simiancraft/unitforge/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/simiancraft/unitforge?logo=codecov)](https://codecov.io/github/simiancraft/unitforge)
[![Bundle size](https://img.shields.io/badge/bundle-278%20B%20--%202.7%20kB%20gz-informational)](#tree-shaking)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/simiancraft/unitforge/badge)](https://securityscorecards.dev/viewer/?uri=github.com/simiancraft/unitforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

# unitforge

**Forge anything measurable. Not just physics.** Three primitives (`defineUnit`, `defineConversion`, `forge`) work against any unit and any dimension you import.

## Kits

Ships with kits across multiple domains; define your own for anything else (game state, finance, lab assays, inventory, factions). See this in action with the [Settlers of Crouton demo](https://simiancraft.github.io/unitforge/#crouton): a custom dimension, three units, and a recipe that turns wheat + ore into cities. Each link below runs the kit live against the built package:

- [**`geometry`**](https://simiancraft.github.io/unitforge/#/geometry): length, area, volume; metric and imperial; rectangle, circle, sphere, and cylinder derivations.
- [**`data-storage`**](https://simiancraft.github.io/unitforge/#/data-storage): bytes (decimal and IEC binary), bits; covers GB-vs-GiB and Gbit-vs-MB.

## Quick start

```ts
import { forge } from 'unitforge';
import { meter, foot } from 'unitforge/kits/geometry';

forge(meter, foot)(5); // 16.4042
```

```ts
import { forge } from 'unitforge';
import { gigabyte, gibibyte } from 'unitforge/kits/data-storage';

forge(gigabyte, gibibyte)(500); // 465.66; the 500 GB drive Windows reports as 465 GB
```

## What this isn't

Three functions, deliberately. Not three hundred kits.

- **Not a million-function API.** The whole library is `defineUnit`, `defineConversion`, `forge`. If you can read those three signatures you can read all of unitforge.
- **Not a units database.** Kits ship a curated set; you add what you need. Same shape userland does, no plugin protocol, no registry.
- **Not a physics engine.** No vectors, integrators, or dimensional algebra solver. unitforge converts values; it does not simulate.
- **Not a currency-rate fetcher.** `usd → eur` is a value you define against a rate you provide, not a live feed.
- **Not a CLI.** Library only.

### vs. `convert-units`

`convert-units` is the incumbent ([~185k weekly downloads](https://www.npmjs.com/package/convert-units)); same problem space, different philosophy. This table compares against the version `npm install convert-units` actually installs today (`2.3.4`, published 2018-01-12, CJS-only). Where the in-development `3.0.0-beta` changes a row, it's flagged.

| | `convert-units` 2.3.4 | `convert-units` 3.0.0-beta | **unitforge** |
| --- | --- | --- | --- |
| Module format | CJS | ESM + CJS + UMD | **ESM only** |
| Bundled TypeScript types | ❌ (via `@types/convert-units`) | ✅ | **✅** |
| Custom measures / dimensions | ✅ `customMeasure` | ✅ `customMeasure` | **✅ `defineUnit`** |
| Cross-dimensional conversions (wheat + ore → cities) | ❌ | ❌ | **✅ `defineConversion`** |
| Dimension mismatch caught at | runtime | runtime | **compile time** (`NoInfer` on the `to` side) |
| Tree-shaking model | barrel; pass measures to `configureMeasurements` | same | **per-export subpath** (`unitforge/kits/<name>`) |

The differentiators that matter for the "not just physics" thesis are **cross-dimensional recipes** (the entire Crouton story is one of these) and **compile-time dimension safety**. Module format and bundled types are parity moves the 3.x beta is making; once 3.x ships as `latest`, those rows stop being differentiators.

## Tree-shaking

Atomic by design: your import graph is the runtime graph. Every unit and every conversion is an independent named export, annotated `/*#__PURE__*/`; each spec inlines its math, with no global registry and no lookup table to drag in. Fluent APIs like `convert(5).from('m').to('ft')` can't tree-shake to zero; the chain dispatches against a registry, and the registry stays in the bundle.

Production bundles pay only for what you actually import. Measured with `esbuild --bundle --minify --tree-shaking=true`:

| Import | min | gzip |
| --- | --- | --- |
| `import { meter } from 'unitforge/kits/geometry'` | 347 B | **278 B** |
| `import { forge } + meter, centimeter` (within-dim) | 3.9 kB | **1.7 kB** |
| `import { forge } + cross-dim conversion` (forge + 3 kit values) | 4.2 kB | **1.9 kB** |
| `import * as g from 'unitforge/kits/geometry'` + everything from main barrel | 7.4 kB | **2.7 kB** |
| `import { VERSION } from 'unitforge/version'` (opt-in, inlines `package.json`) | 2.2 kB | **1.0 kB** |

**Tarball:** `npm pack` produces ≈ 52 kB packed / 230 kB unpacked (64 files; `dist/` plus `LICENSE`, `NOTICE.md`, `README.md`, `package.json`).

## Install

```sh
bun add unitforge
pnpm add unitforge
yarn add unitforge
npm install unitforge
```

Requires Node 22+, ESM-only (`"type": "module"`), TypeScript `moduleResolution: "node16" | "nodenext" | "bundler"`. No CJS build; no peer dependencies.

## Build your own

Three functions; three steps. The library's own kits use the same shape userland does.

1. `defineUnit` declares each unit value in a dimension you invent.
2. `defineConversion` declares the recipe (within a dimension or across dimensions).
3. `forge` returns the typed converter.

```ts
import { defineUnit, defineConversion, forge } from 'unitforge';

const COUNT = 'count' as const;
const wheat = defineUnit({ id: 'wheat', label: 'Wheat', symbol: '🌾', dimension: COUNT, toBase: (v) => v, fromBase: (b) => b, base: true });
const ore   = defineUnit({ id: 'ore',   label: 'Ore',   symbol: '🪨', dimension: COUNT, toBase: (v) => v, fromBase: (b) => b });
const city  = defineUnit({ id: 'city',  label: 'City',  symbol: '🏰', dimension: COUNT, toBase: (v) => v, fromBase: (b) => b });

const buildCities = defineConversion({
  inputs: { wheat: COUNT, ore: COUNT },
  output: COUNT,
  compute: ({ wheat, ore }) => Math.floor(Math.min(wheat / 2, ore / 3)),
});

const cities = forge({ wheat, ore }, city, { via: buildCities });
cities({ wheat: 6, ore: 9 }); // 3
```

**Drag the sliders and watch cities accumulate:** [Settlers of Crouton demo](https://simiancraft.github.io/unitforge/#crouton). Same code, live.

For multiplicative units (handspans, pints, miles), the exported `linear(scale)` helper builds the `{ toBase, fromBase }` pair so you can compose alongside imports from a kit:

```ts
import { defineUnit, forge, linear } from 'unitforge';
import { LENGTH } from 'unitforge/dimensions';
import { foot } from 'unitforge/kits/geometry';

const handspan = defineUnit({ id: 'handspan', label: 'Handspan', symbol: 'hsp', dimension: LENGTH, ...linear(0.235) });
forge(handspan, foot)(4); // 3.084
```

> Inside kit-shipped unit definitions, inline the `toBase`/`fromBase` closures rather than spreading `linear(scale)`; the spread defeats per-export tree-shaking. The helper is for ad-hoc userland use where bundle size does not matter.

## API

Three primitives. One consumer (`forge`); two factories (`defineUnit`, `defineConversion`). Full type signatures live in `dist/index.d.ts`; the [`llms.txt`](./llms.txt) walks an agent through every overload.

### `forge(from, to, config?)`

Returns a converter function. Within-dimension forges take a scalar and return a scalar; cross-dimensional forges take an object input and require `via:` in the config. `NoInfer<D>` on the `to` side makes wrong-dimension calls (`forge(meter, squareMeter)`) a compile error.

Cross-dim pipeline: defensive copy of input, cache check (if `memoize` is on), run every validator and aggregate failures, throw `ValidationError` if any failed, normalize inputs to base units, run `compute`, denormalize outputs, write to cache, return.

**Config options** (same name = same effect across overloads):

| Option | Type | Effect |
| --- | --- | --- |
| `via` | `Conversion<I, O, T>` | **Required** for cross-dim. Carries the input shape, validator map, and `compute`. |
| `validate` | `ValidatorMap<I, T>` | Call-site validators, additive on top of the conversion's own. |
| `precision` | `number` (non-negative integer) | Rounds output AND cache key to this many decimal places. |
| `memoize` | `number` (0 to `MEMO_CAP_MAX = 1_048_576`) | FIFO bounded cache. `0` or absent = off. `DEFAULT_MEMO_CAP = 1024`. |

### `defineUnit(spec)`

A unit value: `name`, `dimension`, `toBase`/`fromBase` functions, optional `base: true` for the canonical base of a dimension. See [Build your own](#build-your-own) for the call shape.

### `defineConversion(spec)`

A conversion value: input shape (field name to dimension), output (single dimension or a record of dimensions), optional validators, a `compute` function written in base units. The library normalizes inputs from whatever unit the call site uses before invoking `compute`, then denormalizes the result.

Validators may return `true`/`undefined` to pass, a string to reject with that message, or throw (the original error is preserved on `failure.cause`). All validators run on every call; failures aggregate into a single `ValidationError`.

## Types

Re-exported from the root barrel: `Unit`, `Conversion`, `Dimension`, `ForgeInput`, `ForgeOutput`, `UnitMap`, `ValidatorMap`, `ValidationFailure`. `Dimension` uses the `(string & {})` brand so user-defined dimensions (`'gold' as const`) are accepted without collapsing the union, while built-ins still surface in autocomplete. See [`llms.txt`](./llms.txt) for the full type surface.

## Development

```sh
bun install && bun run check
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full per-task command table (test, typecheck, lint, build, packaging, knip).

## Community

- Bugs and feature requests: [GitHub issues](https://github.com/simiancraft/unitforge/issues)
- Security: [private vulnerability reporting](https://github.com/simiancraft/unitforge/security/advisories/new); see [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## Extending

Adding a kit, adding a section to an existing kit, or adding a dimension: see [EXTENDING.md](./EXTENDING.md). It documents the lib-side ritual, the demo-side three-file registration, and the tree-shake foot-gun on `defineUnit` spec literals.

## For agents

Read [`llms.txt`](./llms.txt) first. It is the canonical orientation document for this package, written for LLM ingestion: architecture, API surface, subpath exports, tree-shake implementation, and key files. The README is for humans evaluating the library; `llms.txt` is the same scope in a denser, more parseable shape.

## License

MIT © [the-simian](https://github.com/the-simian). See [LICENSE](./LICENSE) and [NOTICE.md](./NOTICE.md).

<p align="center"><sub>Crafted with care by <a href="https://simiancraft.com">Simiancraft</a>.</sub></p>
