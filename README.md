<p align="center">
  <img src="./.github/assets/unitforge-logo.png" alt="unitforge" width="160" />
</p>

<p align="center">
  <a href="https://simiancraft.github.io/unitforge/">
    <img src="https://img.shields.io/badge/▶%20Live%20demo-pre--1.0%20placeholder-f97316?style=for-the-badge" alt="Live demo" />
  </a>
</p>

# unitforge

[![npm version](https://img.shields.io/npm/v/unitforge?color=cb3837&logo=npm)](https://www.npmjs.com/package/unitforge)
[![Types: included](https://img.shields.io/npm/types/unitforge?color=3178c6&logo=typescript)](https://www.npmjs.com/package/unitforge)
[![CI](https://github.com/simiancraft/unitforge/actions/workflows/ci.yml/badge.svg)](https://github.com/simiancraft/unitforge/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/simiancraft/unitforge?logo=codecov)](https://codecov.io/github/simiancraft/unitforge)
[![Bundle size](https://img.shields.io/badge/bundle-0.3--2.7%20kB%20gz-informational)](#tree-shaking-and-bundle-size)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/simiancraft/unitforge/badge)](https://securityscorecards.dev/viewer/?uri=github.com/simiancraft/unitforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

<p align="center">
  <code>defineUnit</code> &nbsp;•&nbsp; <code>defineConversion</code> &nbsp;•&nbsp; <code>forge</code>
</p>

**A units library that does not assume you are doing physics.** Three primitives (`defineUnit`, `defineConversion`, `forge`) work against any unit and any dimension you import. Ships a `geometry` kit: 8 LENGTH, 8 AREA, 6 VOLUME units, plus 7 cross-dimensional derivations (rectangle, square, circle area; box, cube, sphere, cylinder volume). Bring your own dimensions and units (game state, finance, lab assays, packaging, factions) with full TypeScript inference and zero registration. Tree-shakes per-export; you only pay for what you import.

<sub>Every public export ships with JSDoc; autocomplete and hover do the teaching.</sub>

```ts
import { defineUnit, defineConversion, forge, ValidationError } from 'unitforge';
import { LENGTH } from 'unitforge/dimensions';
import { meter, centimeter, squareMeter, areaFromLengthAndWidth } from 'unitforge/kits/geometry';

// Within-dimension: from-unit, to-unit, done.
forge(meter, centimeter)(1.5);                                 // 150

// Cross-dimensional: pass a defineConversion via the config.
const area = forge({ length: meter, width: meter }, squareMeter, { via: areaFromLengthAndWidth });
area({ length: 5, width: 3 });                                 // 15  (m²)

// Mixed input units work; library normalizes to base before compute.
const areaMixed = forge({ length: centimeter, width: meter }, squareMeter, { via: areaFromLengthAndWidth });
areaMixed({ length: 200, width: 3 });                          // 6   (200 cm = 2 m, 2 × 3 = 6 m²)

// Validators reject negatives; failures aggregate into one ValidationError.
try { area({ length: -5, width: -3 }); }
catch (err) {
  if (err instanceof ValidationError) err.failures;            // 2 failures: { key:'length', ... }, { key:'width', ... }
}

// Bring your own dimension. Inventory, finance, game state; same shape.
const PALLET = 'pallet' as const;
const SHIPMENT = 'shipment' as const;
const pallet = defineUnit({
  name: 'pallet', dimension: PALLET, toBase: (v) => v, fromBase: (b) => b, base: true,
});
const shipment = defineUnit({
  name: 'shipment', dimension: SHIPMENT, toBase: (v) => v, fromBase: (b) => b, base: true,
});
const truckloadsFromPallets = defineConversion({
  inputs: { pallets: PALLET },
  output: SHIPMENT,
  validate: { pallets: (v) => v >= 0 || 'pallets must be >= 0' },
  compute: ({ pallets }) => Math.ceil(pallets / 26),           // a 53' truck fits ≈ 26 pallets
});
const truckloadsNeeded = forge({ pallets: pallet }, shipment, { via: truckloadsFromPallets });
truckloadsNeeded({ pallets: 100 });                            // 4
```

The same machinery handles `length × width = area`, `pallets ÷ pallets-per-truck = trucks`, `voltage ÷ resistance = current`, or `dose ÷ patient-weight = mg/kg`. The library doesn't ship a unit table for your domain; it ships the primitives so you can declare your domain and use it the same day.

## Install

```sh
bun add unitforge
pnpm add unitforge
yarn add unitforge
npm install unitforge
```

Requires Node 22+, ESM-only (`"type": "module"`), TypeScript `moduleResolution: "node16" | "nodenext" | "bundler"`. No CJS build; no peer dependencies.

## API

Three primitives. Two factories produce values; one consumer turns those values into a converter function.

### `defineUnit(spec)`: make a unit value

A unit is a value with a `name`, a `dimension`, and `toBase` / `fromBase` functions. The base unit of each dimension carries `base: true`. Spec is type-checked; `safeCopy` rejects prototype-pollution keys at definition time.

```ts
function defineUnit<D extends Dimension, T = number>(spec: Unit<D, T>): Unit<D, T>;

import { defineUnit } from 'unitforge';
import { LENGTH } from 'unitforge/dimensions';

const meter = defineUnit({
  name: 'meter', dimension: LENGTH, toBase: (v) => v, fromBase: (b) => b, base: true,
});

const inch = defineUnit({
  name: 'inch', dimension: LENGTH,
  toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254,
});
```

Authoring convention for kit-shipped units: inline `toBase`/`fromBase` closures (don't `...spread` a helper into the spec; CallExpressions inside the spec literal defeat per-export tree-shaking even with `/*#__PURE__*/`). The exported `linear(scale)` helper is for ad-hoc userland use where bundle size doesn't matter (see below).

### `linear(scale)`: sugar for the linear-unit case

Returns a `{ toBase, fromBase }` pair for a unit whose conversion to base is multiplication by a constant scale. Convenient for one-off userland definitions.

```ts
import { defineUnit, linear } from 'unitforge';
import { LENGTH } from 'unitforge/dimensions';

// Userland one-off; ad-hoc, not tree-shake-critical.
const handspan = defineUnit({
  name: 'handspan',
  dimension: LENGTH,
  ...linear(0.235), // 23.5 cm
});
```

Do NOT use `...linear(scale)` inside kit unit definitions; the spread of a function call defeats per-export tree-shaking even when the `defineUnit(...)` outer call is `/*#__PURE__*/`-marked. Inline the closures instead.

### `defineConversion(spec)`: make a cross-dim conversion value

A `Conversion` declares its input shape (a map of field name → dimension), its output (a single dimension or a record of dimensions), optional validators, and a `compute` function that runs in base units.

```ts
function defineConversion<
  Inputs extends Record<string, Dimension>,
  Output extends Dimension | Record<string, Dimension>,
  T = number,
>(spec: Conversion<Inputs, Output, T>): Conversion<Inputs, Output, T>;

import { defineConversion } from 'unitforge';
import { LENGTH, AREA } from 'unitforge/dimensions';

const areaFromCircleRadius = defineConversion({
  inputs: { radius: LENGTH },
  output: AREA,
  validate: { radius: (v) => v >= 0 || 'radius must be >= 0' },
  compute: ({ radius }) => Math.PI * radius * radius,
});
```

`compute` is **always** written in base units. The library normalizes inputs from whatever unit the call site uses (cm, ft, mi, …) before calling `compute`, then denormalizes the result back into the target unit. You write `length * width`; the consumer writes `forge({ length: centimeter, width: foot }, squareMeter, …)` and it works.

Validators may return `true`/`undefined` to pass, a string to reject with that message, or throw (the original error preserved on the failure record's `cause`). All validators run; failures aggregate into a single `ValidationError`.

### `forge(from, to, config?)`: make a converter function

Three overloads collectively cover the three real shapes the library supports. Each overload's `config` shape is inlined narrowly so the type system catches mismatches at the call site.

```ts
// Within-dimension: scalar in, scalar out, no `via`. NoInfer<D> on `to`
// guarantees `forge(meter, squareMeter)` is a compile error.
function forge<D extends Dimension, T = number>(
  from: ForgeInput<D, T>,
  to: ForgeInput<NoInfer<D>, T>,
  config?: { precision?: number; memoize?: number },
): (value: T) => T;

// Cross-dimensional, scalar output: object in, scalar out, `via` required.
function forge<I extends Record<string, Dimension>, O extends Dimension, T = number>(
  from: ForgeInput<I, T>,
  to: ForgeOutput<O, T>,
  config: { via: Conversion<I, O, T>; validate?: ValidatorMap<I, T>; precision?: number; memoize?: number },
): (input: { [K in keyof I]: T }) => T;

// Cross-dimensional, object output: object in, object out, `via` required.
function forge<I extends Record<string, Dimension>, O extends Record<string, Dimension>, T = number>(
  from: ForgeInput<I, T>,
  to: ForgeOutput<O, T>,
  config: { via: Conversion<I, O, T>; validate?: ValidatorMap<I, T>; precision?: number; memoize?: number },
): (input: { [K in keyof I]: T }) => { [K in keyof O]: T };
```

The pipeline on the cross-dim path: defensive copy of input → cache check (memoize-on only) → run all validators (aggregate failures) → throw `ValidationError` if any → normalize inputs to base units → run `compute` → denormalize to target unit(s) → write to cache → return. Within-dim path skips validators and shape-walking; it's a closed-over two-call lambda with optional rounding.

## What ships in 0.x

| Kit | Dimensions | Units | Conversions |
| --- | --- | --- | --- |
| `geometry` | LENGTH, AREA, VOLUME | 22 (8 LENGTH + 8 AREA + 6 VOLUME) | 7 |

**`geometry` units:**

- **LENGTH:** `meter` (base), `millimeter`, `centimeter`, `kilometer`, `inch`, `foot`, `yard`, `mile`. Imperial values use the exact post-1959 international-yard ratios.
- **AREA:** `squareMeter` (base), `squareMillimeter`, `squareCentimeter`, `squareKilometer`, `squareInch`, `squareFoot`, `acre`, `hectare`.
- **VOLUME:** `cubicMeter` (base), `cubicCentimeter`, `cubicInch`, `cubicFoot`, `liter`, `milliliter`.

**`geometry` conversions:**

- **AREA:** `areaFromLengthAndWidth` (rectangle), `areaFromSquareSide`, `areaFromCircleRadius` (π · r²).
- **VOLUME:** `volumeFromLengthAndWidthAndHeight` (box), `volumeFromCubeSide`, `volumeFromSphereRadius` ((4/3) π r³), `volumeFromCylinderRadiusAndHeight` (π r² h).

More kits planned for v1: `si`, `imperial`, `cooking`, `inventory`, `pharmacy`. See PLANNING.md.

## Configuration

The four options the `forge` overloads accept. Same option name means the same thing on every overload it appears on.

| Option | Type | Effect |
| --- | --- | --- |
| `via` | `Conversion<I, O, T>` | **Required** for cross-dim. Carries the input shape, validator map, and `compute`. |
| `validate` | `ValidatorMap<I, T>` | Call-site validators, additive on top of the conversion's own. |
| `precision` | `number` (non-negative integer) | Rounds output AND cache key to this many decimal places. |
| `memoize` | `number` (0 to `MEMO_CAP_MAX`, which is `1_048_576`) | FIFO bounded-cache cap. `0` or absent = off. `DEFAULT_MEMO_CAP = 1024`. |

**On `ForgeConfig<T>`:** the type is exported from the root barrel for userland wrappers (e.g., a helper function that takes a config and forwards it to `forge`). The `forge` overloads themselves do NOT take `ForgeConfig<T>` directly; each overload inlines its own narrow config shape so `via` can be tied to the call's inferred `Inputs`/`Output`. If your wrapper passes a `ForgeConfig`-typed value into a CROSS-DIM `forge` call, the loose `via?` won't satisfy the narrow `via:` constraint; either narrow `via` in your wrapper's own generic signature, or write the inline config object literal at the `forge` call site.

```ts
import { forge, DEFAULT_MEMO_CAP } from 'unitforge';
import { meter, centimeter } from 'unitforge/kits/geometry';

// precision: rounds output and cache key
forge(meter, centimeter, { precision: 1 })(1.5678);            // 156.8

// memoize: FIFO bounded cache; reads do NOT promote (not LRU)
const cached = forge(meter, centimeter, { memoize: DEFAULT_MEMO_CAP });
cached(1.5);                                                   // computed
cached(1.5);                                                   // cache hit (no toBase/fromBase calls)
```

## Subpath imports

| Subpath | Exports |
| --- | --- |
| `unitforge` | API barrel: `defineUnit`, `defineConversion`, `forge`, `linear`, `ValidationError`, `DEFAULT_MEMO_CAP`, `MEMO_CAP_MAX`, plus types |
| `unitforge/dimensions` | `LENGTH`, `AREA`, `VOLUME`, `DIMENSIONS` tuple, `Dimension` type |
| `unitforge/kits/<kit>` | every unit and conversion shipped by `<kit>` (currently only `geometry`) |
| `unitforge/validation` | `ValidationError`, `ValidationFailure` type |
| `unitforge/version` | `VERSION: string` (read from `package.json` at runtime; on its own subpath because the JSON import would inline `package.json` into every consumer bundle) |

## Tree-shaking and bundle size

- `"sideEffects": false` in `package.json`.
- Every kit unit and conversion is `/*#__PURE__*/`-marked, so importing only `meter` drops `centimeter`, `squareMeter`, and every other unused export.
- All exports are named; no default export.
- Per-kit subpath (`unitforge/kits/<name>`) so importing from `geometry` never pulls a sibling kit.

**Tarball:** `npm pack` produces ≈ 48 kB packed / 207 kB unpacked (56 files, all under `dist/`); that's the install-size figure. Your **production bundle** pays only for what you actually import, measured with `esbuild --bundle --minify --tree-shaking=true`:

| Import | min | gzip |
| --- | --- | --- |
| `import { meter } from 'unitforge/kits/geometry'` | 347 B | **267 B** |
| `import { forge } + meter, centimeter` (within-dim) | 3.9 kB | **1.7 kB** |
| `import { forge } + cross-dim conversion` (forge + 3 kit values) | 4.2 kB | **1.9 kB** |
| `import * as g from 'unitforge/kits/geometry'` + everything from main barrel | 7.4 kB | **2.7 kB** |
| `import { VERSION } from 'unitforge/version'` (opt-in, inlines `package.json`) | 2.2 kB | **1.0 kB** |

The gzip column is what actually lands in your production build.

## Types

Re-exported from the root barrel (`import type { ... } from 'unitforge'`):

| Category | Types |
| --- | --- |
| Core values | `Unit<D, T>`, `Conversion<I, O, T>` |
| Dimensions | `Dimension` (also from `unitforge/dimensions`) |
| Forge surface | `ForgeInput<I, T>`, `ForgeOutput<O, T>`, `UnitMap<M, T>`, `ForgeConfig<T>` |
| Validation | `ValidatorMap<I, T>`, `ValidationFailure` |

`Dimension` uses the `(string & {})` brand so user-defined dimensions (`'pallet' as const`) are accepted without collapsing the union, while built-ins (`LENGTH`, `AREA`, `VOLUME`) still surface in autocomplete. The `BUILTIN_DIMENSIONS` tuple in `dimensions.ts` is the single source of truth; adding a built-in dimension is a one-line edit.

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
