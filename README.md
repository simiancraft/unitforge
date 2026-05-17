<p align="center">
  <img src="./.github/assets/unitforge-logo.png" alt="unitforge" width="160" />
</p>

<p align="center">
  <a href="https://simiancraft.github.io/unitforge/">
    <img src="https://img.shields.io/badge/▶%20Live%20demo-f97316?style=for-the-badge" alt="Live demo" />
  </a>
</p>

<p align="center">
  <a href="https://simiancraft.github.io/unitforge/">
    <img src="./.github/assets/unitforge-tour-960.gif" alt="unitforge demo tour: home, geometry shape machine, throughput-machine, coordinate-machine, data-storage volume-machine" width="800" />
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

**One Coke ≈ 9.75 sugar cubes.** A units library that does cross-dimensional conversion and catches dimension mismatches at compile time. Three primitives (`defineUnit`, `defineConversion`, `forge`) work against any unit and any dimension you import.

## Kits

Three kits ship today; build your own for anything else (game state, finance, lab assays, factions). Each link below runs the kit live against the built package.

- [**`geometry`**](https://simiancraft.github.io/unitforge/#/geometry): length, area, volume; metric and imperial; rectangle, circle, sphere, and cylinder derivations.
- [**`data-storage`**](https://simiancraft.github.io/unitforge/#/data-storage): bytes (decimal and IEC binary), bits; covers GB-vs-GiB and Gbit-vs-MB.
- [**`cooking`**](https://simiancraft.github.io/unitforge/#/cooking): teaspoons, teacups, the usual suspects, but also international units, sugar comparisons, live recipe scaling, and more.

## Quick start

```ts
import { forge } from 'unitforge';
import { meter, foot } from 'unitforge/kits/geometry';

forge(meter, foot)(5); // ≈ 16.4042
```

```ts
import { forge } from 'unitforge';
import { gigabyte, gibibyte } from 'unitforge/kits/data-storage';

forge(gigabyte, gibibyte)(500); // ≈ 465.66; the 500 GB drive Windows reports as 465 GB
```

```ts
import { defineUnit, forge } from 'unitforge';

// Userland custom dimension; nothing comes from a kit.
const cokeCan   = defineUnit({ id: 'coke-can',   dimension: 'sugar', toBase: (n) => n * 39, fromBase: (g) => g / 39 });
const sugarCube = defineUnit({ id: 'sugar-cube', dimension: 'sugar', toBase: (n) => n * 4,  fromBase: (g) => g / 4  });

forge(cokeCan, sugarCube)(1); // ≈ 9.75; one 12 oz Coke equals 9.75 sugar cubes
```

## Scope

Library only. ESM only. Node 22+. No CJS build; no peer dependencies. Three functions, deliberately; not three hundred kits.

## vs. `convert-units`

`convert-units` is the incumbent ([~185k weekly downloads](https://www.npmjs.com/package/convert-units)); same problem space, different philosophy. **unitforge catches dimension mismatches at compile time and ships cross-dimensional recipes; `convert-units` does neither, today or in `3.x`.**

| | `convert-units` 2.3.4 | `convert-units` 3.0.0-beta | **unitforge** |
| --- | --- | --- | --- |
| Module format | CJS | ESM + CJS + UMD | **ESM only** |
| Bundled TypeScript types | ❌ (via `@types/convert-units`) | ✅ | **✅** |
| Custom measures / dimensions | ✅ `customMeasure` | ✅ `customMeasure` | **✅ `defineUnit`** |
| Cross-dimensional conversions (one Coke ≈ N donuts of sugar) | ❌ | ❌ | **✅ `defineConversion`** |
| Dimension mismatch caught at | runtime | runtime | **compile time** (`NoInfer` on the `to` side) |
| Tree-shaking model | barrel; pass measures to `configureMeasurements` | same | **per-export subpath** (`unitforge/kits/<name>`) |

<sub>Table compares the installed `convert-units@2.3.4` (CJS-only, 2018) and the in-development `3.0.0-beta`.</sub>

## Tree-shaking

Atomic by design: your import graph is the runtime graph. Every unit and conversion is an independent named export annotated `/*#__PURE__*/`; each spec inlines its math, with no global registry and no lookup table to drag in.

Production bundles pay only for what you actually import. Measured with `esbuild --bundle --minify --tree-shaking=true`:

| Import | min | gzip |
| --- | --- | --- |
| `import { meter } from 'unitforge/kits/geometry'` | 347 B | **278 B** |
| `import { forge } + meter, centimeter` (within-dim) | 3.9 kB | **1.7 kB** |
| `import { forge } + cross-dim conversion` (forge + 3 kit values) | 4.2 kB | **1.9 kB** |
| `import * as g from 'unitforge/kits/geometry'` + everything from main barrel | 7.4 kB | **2.7 kB** |
| `import { VERSION } from 'unitforge/version'` (opt-in, inlines `package.json`) | 2.2 kB | **1.0 kB** |

**Tarball:** **≈ 52 kB packed** / 230 kB unpacked / 64 files (`npm pack`).

## Install

```sh
bun add unitforge
pnpm add unitforge
yarn add unitforge
npm install unitforge
```

Requires Node 22+, ESM-only (`"type": "module"`), TypeScript `moduleResolution: "node16" | "nodenext" | "bundler"`.

## Build your own

Three primitives. Here's each one. The integrated version is the [ArPeeGee shop](https://simiancraft.github.io/unitforge/) (RPG shop with coins, goods, and a coins-to-shields forge) at the bottom of this page.

### 1. `defineUnit`

Declare a unit value in any dimension you want.

```ts
import { defineUnit } from 'unitforge';

const handspan = defineUnit({
  id: 'handspan',
  label: 'Handspan',
  symbol: 'hsp',
  dimension: 'length',
  toBase: (v) => v * 0.235,
  fromBase: (b) => b / 0.235,
});
```

### 2. `defineConversion`

Cross-dimensional recipes; inputs in, output out.

```ts
import { defineConversion } from 'unitforge';

const areaFromRectangle = defineConversion({
  inputs: { length: 'length', width: 'length' },
  output: 'area',
  compute: ({ length, width }) => length * width,
});
```

### 3. `forge`

The converter is born. Forge it once; call it forever.

```ts
import { forge } from 'unitforge';
import { foot, squareFoot } from 'unitforge/kits/geometry';

// Within-dimension: handspan from above to foot.
const inFeet = forge(handspan, foot);
inFeet(12);  // 9.252

// Cross-dimensional: two handspans piped through areaFromRectangle.
const inSqFt = forge(
  { length: handspan, width: handspan },
  squareFoot,
  { via: areaFromRectangle },
);
inSqFt({ length: 12, width: 8 });  // 57.066
```

**See all three composed:** the [ArPeeGee shop demo](https://simiancraft.github.io/unitforge/) runs two coin units in one dimension, a goods dimension, and one cross-dim forge from coins to shields. Same code, live.

## API

Three primitives. One consumer (`forge`); two factories (`defineUnit`, `defineConversion`). Full type signatures live in `dist/index.d.ts`.

### `forge(from, to, config?)`

Returns a converter function. Within-dimension forges take a scalar and return a scalar; cross-dimensional forges take an object input and require `via:` in the config. `NoInfer<D>` on the `to` side makes wrong-dimension calls a compile error.

**Config options** (same name = same effect across overloads):

| Option | Type | Effect |
| --- | --- | --- |
| `via` | `Conversion<I, O, T>` | **Required** for cross-dim. Carries the input shape, validator map, and `compute`. |
| `validate` | `ValidatorMap<I, T>` | Call-site validators, additive on top of the conversion's own. |
| `precision` | `number` | Rounds output and cache key to this many decimal places. |
| `memoize` | `number` | FIFO bounded cache. `0` or absent = off. Default cap `1024`; max `1_048_576`. |

### `defineUnit(spec)`

A unit value: `id`, `label`, `symbol`, `dimension`, `toBase`/`fromBase`, optional `base: true`. See [Build your own](#build-your-own).

### `defineConversion(spec)`

A conversion value: input shape (field name to dimension), output (single dimension or record), optional validators, a `compute` function in base units. Inputs normalize before `compute`; outputs denormalize after. Pipeline details and validator contract: see [`llms.txt`](./llms.txt).

## Types

Re-exported from the root barrel: `Unit`, `Conversion`, `Dimension`, `ForgeInput`, `ForgeOutput`, `UnitMap`, `ValidatorMap`, `ValidationFailure`. Full type surface in [`llms.txt`](./llms.txt).

## Development

```sh
bun install && bun run check
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full per-task command table.

## Testing

Three layers, all gated on every CI build:

- **Unit tests** (`bun test`): 470+ tests; **100.00% line coverage**. Tracked via Codecov.
- **Property-based fuzz** via [fast-check](https://github.com/dubzzz/fast-check) in `test/fuzz/`. Also satisfies the [OpenSSF Scorecard](https://github.com/ossf/scorecard) Fuzzing check.
- **Mutation testing** via [Stryker](https://stryker-mutator.io/) (`bun run mutation`): **96.36%** score; CI break threshold 75%.

Per-file mutation breakdown and survivor-classification policy: see [`llms.txt`](./llms.txt).

## Community

- Bugs and feature requests: [GitHub issues](https://github.com/simiancraft/unitforge/issues)
- Security: [private vulnerability reporting](https://github.com/simiancraft/unitforge/security/advisories/new); see [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## Extending

Adding a kit: see [EXTENDING.md](./EXTENDING.md).

## For LLMs and agents

Feeding this repo into Claude / Cursor / Copilot? Read [`llms.txt`](./llms.txt) first. Same scope as this README in a denser, more parseable shape.

## License

MIT © [the-simian](https://github.com/the-simian). See [LICENSE](./LICENSE) and [NOTICE.md](./NOTICE.md).

<p align="center"><sub>Crafted with care by <a href="https://simiancraft.com">Simiancraft</a>.</sub></p>
