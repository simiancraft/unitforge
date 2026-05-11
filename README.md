<p align="center">
  <img src="./.github/assets/unitforge-logo.png" alt="unitforge" width="160" />
</p>

<p align="center">
  <a href="https://simiancraft.github.io/unitforge/">
    <img src="https://img.shields.io/badge/▶%20Live%20demo-f97316?style=for-the-badge" alt="Live demo" />
  </a>
</p>

# unitforge

[![npm version](https://img.shields.io/npm/v/unitforge?color=cb3837&logo=npm)](https://www.npmjs.com/package/unitforge)
[![Types: included](https://img.shields.io/npm/types/unitforge?color=3178c6&logo=typescript)](https://www.npmjs.com/package/unitforge)
[![CI](https://github.com/simiancraft/unitforge/actions/workflows/ci.yml/badge.svg)](https://github.com/simiancraft/unitforge/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/simiancraft/unitforge?logo=codecov)](https://codecov.io/github/simiancraft/unitforge)
[![Bundle size](https://img.shields.io/badge/bundle-0.3--2.7%20kB%20gz-informational)](#tree-shaking)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/simiancraft/unitforge/badge)](https://securityscorecards.dev/viewer/?uri=github.com/simiancraft/unitforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

<p align="center">
  <code>defineUnit</code> &nbsp;•&nbsp; <code>defineConversion</code> &nbsp;•&nbsp; <code>forge</code>
</p>

**A units library that does not assume you are doing physics.** Three primitives (`defineUnit`, `defineConversion`, `forge`) work against any unit and any dimension you import.

## Kits

Ships with kits across multiple domains; define your own for anything else (game state, finance, lab assays, inventory, factions). Each link below runs the kit live against the built package:

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

## Install

```sh
bun add unitforge
pnpm add unitforge
yarn add unitforge
npm install unitforge
```

Requires Node 22+, ESM-only (`"type": "module"`), TypeScript `moduleResolution: "node16" | "nodenext" | "bundler"`. No CJS build; no peer dependencies.

## Build your own

Custom dimensions and units are first-class; the library's own kits use the same shape userland does.

**Custom unit (any dimension you invent):**

```ts
import { defineUnit, forge } from 'unitforge';

const GOLD = 'gold' as const;

const piece = defineUnit({
  name: 'piece',
  dimension: GOLD,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

const stack = defineUnit({
  name: 'stack',
  dimension: GOLD,
  toBase: (v) => v * 100,
  fromBase: (b) => b / 100,
});

forge(stack, piece)(3); // 300
```

**Custom cross-dim conversion:**

```ts
import { defineConversion, defineUnit, forge } from 'unitforge';

const PALLET = 'pallet' as const;
const SHIPMENT = 'shipment' as const;

const pallet = defineUnit({
  name: 'pallet',
  dimension: PALLET,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});
const shipment = defineUnit({
  name: 'shipment',
  dimension: SHIPMENT,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

const truckloadsFromPallets = defineConversion({
  inputs: { pallets: PALLET },
  output: SHIPMENT,
  validate: { pallets: (v) => v >= 0 || 'pallets must be >= 0' },
  compute: ({ pallets }) => Math.ceil(pallets / 26), // 53' truck fits ~26 pallets
});

forge(
  { pallets: pallet },
  shipment,
  { via: truckloadsFromPallets },
)({ pallets: 100 }); // 4
```

### Building scaling factories

For units whose conversion to base is multiplication by a constant, the exported `linear(scale)` helper returns the `{ toBase, fromBase }` pair so you can compose a custom unit alongside imports from a kit:

```ts
import { defineUnit, forge, linear } from 'unitforge';
import { LENGTH } from 'unitforge/dimensions';
import { foot, meter } from 'unitforge/kits/geometry';

const handspan = defineUnit({
  name: 'handspan',
  dimension: LENGTH,
  ...linear(0.235), // 23.5 cm
});

forge(handspan, foot)(4); // 3.084
forge(handspan, meter)(4); // 0.94
```

> Inside kit-shipped unit definitions, inline the `toBase`/`fromBase` closures rather than spreading `linear(scale)`; the spread defeats per-export tree-shaking. The helper is for ad-hoc userland use where bundle size does not matter.

## API

Three primitives. One consumer; two factories.

### `forge(from, to, config?)`

Returns a converter function. Within-dimension forges take a scalar and return a scalar; cross-dimensional forges take an object input and require `via:` in the config.

```ts
// Within-dimension. NoInfer<D> on `to` makes `forge(meter, squareMeter)` a compile error.
function forge<D extends Dimension, T = number>(
  from: ForgeInput<D, T>,
  to: ForgeInput<NoInfer<D>, T>,
  config?: { precision?: number; memoize?: number },
): (value: T) => T;

// Cross-dimensional, scalar output.
function forge<I extends Record<string, Dimension>, O extends Dimension, T = number>(
  from: ForgeInput<I, T>,
  to: ForgeOutput<O, T>,
  config: {
    via: Conversion<I, O, T>;
    validate?: ValidatorMap<I, T>;
    precision?: number;
    memoize?: number;
  },
): (input: { [K in keyof I]: T }) => T;

// Cross-dimensional, object output.
function forge<I extends Record<string, Dimension>, O extends Record<string, Dimension>, T = number>(
  from: ForgeInput<I, T>,
  to: ForgeOutput<O, T>,
  config: {
    via: Conversion<I, O, T>;
    validate?: ValidatorMap<I, T>;
    precision?: number;
    memoize?: number;
  },
): (input: { [K in keyof I]: T }) => { [K in keyof O]: T };
```

Cross-dim pipeline: defensive copy of input, cache check (if `memoize` is on), run every validator and aggregate failures, throw `ValidationError` if any failed, normalize inputs to base units, run `compute`, denormalize outputs, write to cache, return.

**Config options** (same name = same effect across overloads):

| Option | Type | Effect |
| --- | --- | --- |
| `via` | `Conversion<I, O, T>` | **Required** for cross-dim. Carries the input shape, validator map, and `compute`. |
| `validate` | `ValidatorMap<I, T>` | Call-site validators, additive on top of the conversion's own. |
| `precision` | `number` (non-negative integer) | Rounds output AND cache key to this many decimal places. |
| `memoize` | `number` (0 to `MEMO_CAP_MAX = 1_048_576`) | FIFO bounded cache. `0` or absent = off. `DEFAULT_MEMO_CAP = 1024`. |

### `defineUnit(spec)`

A unit value: `name`, `dimension`, `toBase`/`fromBase` functions, optional `base: true` for the canonical base of a dimension.

```ts
function defineUnit<D extends Dimension, T = number>(spec: Unit<D, T>): Unit<D, T>;
```

See the [Build your own](#build-your-own) section above for the typical call shape.

### `defineConversion(spec)`

A conversion value: input shape (field name to dimension), output (single dimension or a record of dimensions), optional validators, a `compute` function written in base units. The library normalizes inputs from whatever unit the call site uses before invoking `compute`, then denormalizes the result.

```ts
function defineConversion<
  Inputs extends Record<string, Dimension>,
  Output extends Dimension | Record<string, Dimension>,
  T = number,
>(spec: Conversion<Inputs, Output, T>): Conversion<Inputs, Output, T>;
```

Validators may return `true`/`undefined` to pass, a string to reject with that message, or throw (the original error is preserved on `failure.cause`). All validators run on every call; failures aggregate into a single `ValidationError`.

## Tree-shaking

The library is per-export tree-shakable; your production bundle pays only for what you actually import. Measured with `esbuild --bundle --minify --tree-shaking=true`:

| Import | min | gzip |
| --- | --- | --- |
| `import { meter } from 'unitforge/kits/geometry'` | 347 B | **267 B** |
| `import { forge } + meter, centimeter` (within-dim) | 3.9 kB | **1.7 kB** |
| `import { forge } + cross-dim conversion` (forge + 3 kit values) | 4.2 kB | **1.9 kB** |
| `import * as g from 'unitforge/kits/geometry'` + everything from main barrel | 7.4 kB | **2.7 kB** |
| `import { VERSION } from 'unitforge/version'` (opt-in, inlines `package.json`) | 2.2 kB | **1.0 kB** |

**Tarball:** `npm pack` produces ≈ 48 kB packed / 207 kB unpacked (56 files, all under `dist/`).

## Types

Re-exported from the root barrel (`import type { ... } from 'unitforge'`):

| Category | Types |
| --- | --- |
| Core values | `Unit<D, T>`, `Conversion<I, O, T>` |
| Dimensions | `Dimension` (also from `unitforge/dimensions`) |
| Forge surface | `ForgeInput<I, T>`, `ForgeOutput<O, T>`, `UnitMap<M, T>`, `ForgeConfig<T>` |
| Validation | `ValidatorMap<I, T>`, `ValidationFailure` |

`Dimension` uses the `(string & {})` brand so user-defined dimensions (`'gold' as const`) are accepted without collapsing the union, while built-ins still surface in autocomplete.

## Development

```sh
bun install
bun run lint        # biome
bun run typecheck   # tsgo (TypeScript native preview); checks src/ AND test/
bun test            # bun's built-in runner
bun run build
bun run check:package  # publint + attw --profile esm-only
```

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Community

- Bugs and feature requests: [GitHub issues](https://github.com/simiancraft/unitforge/issues)
- Security: [private vulnerability reporting](https://github.com/simiancraft/unitforge/security/advisories/new); see [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## License

MIT © [the-simian](https://github.com/the-simian). See [LICENSE](./LICENSE) and [NOTICE.md](./NOTICE.md).

<p align="center"><sub>Crafted with care by <a href="https://simiancraft.com">Simiancraft</a>.</sub></p>
