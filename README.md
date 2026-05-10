<p align="center">
  <img src="./.github/assets/unitforge-logo.png" alt="unitforge" width="160" />
</p>

<p align="center">
  <a href="https://simiancraft.github.io/unitforge/">
    <img src="https://img.shields.io/badge/▶%20Live%20demo-pre--1.0%20placeholder-f97316?style=for-the-badge" alt="Live demo" />
  </a>
</p>

# unitforge

[![CI](https://github.com/simiancraft/unitforge/actions/workflows/ci.yml/badge.svg)](https://github.com/simiancraft/unitforge/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/simiancraft/unitforge?logo=codecov)](https://codecov.io/github/simiancraft/unitforge)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/simiancraft/unitforge/badge)](https://securityscorecards.dev/viewer/?uri=github.com/simiancraft/unitforge)
[![Types: included](https://img.shields.io/npm/types/unitforge?color=3178c6&logo=typescript)](https://www.npmjs.com/package/unitforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

<p align="center">
  <code>defineUnit</code> &nbsp;•&nbsp; <code>defineConversion</code> &nbsp;•&nbsp; <code>forge</code>
</p>

A units library for arbitrary domains; not just physics. Inventory, lab assays, game state, finance, astronomy, and SI-physics all share the same shape: three primitives, three additive registries, tree-shakeable per-export.

> **Status: pre-1.0.** API not stable; do not depend on it for production. PLANNING.md captures the full v1 design intent (some sections describe kits not yet shipped). Track progress in [GitHub issues](https://github.com/simiancraft/unitforge/issues).

## Install

```sh
npm install unitforge
# or:  bun add unitforge
# or:  pnpm add unitforge
```

Requires Node 22+, ESM-only, TypeScript `moduleResolution: "node16" | "nodenext" | "bundler"`.

## What it does

Three primitives: `defineUnit` produces a unit; `defineConversion` produces a cross-dimensional conversion; `forge` consumes both and returns a converter function.

### Within-dimension conversion

```ts
import { forge } from 'unitforge';
import { meter, centimeter } from 'unitforge/kits/geometry';

const toCm = forge(meter, centimeter);
toCm(1.5); // 150
```

### Cross-dimensional derivation

`forge` accepts an object-shaped `from`, a single-unit `to`, and a `defineConversion` value via `ForgeConfig.via`. The conversion's `compute` runs in base units; mixed input units (cm + m, etc.) are normalized for you.

```ts
import { forge } from 'unitforge';
import {
  meter,
  centimeter,
  squareMeter,
  areaFromLengthAndWidth,
} from 'unitforge/kits/geometry';

const area = forge(
  { length: meter, width: meter },
  squareMeter,
  { via: areaFromLengthAndWidth },
);

area({ length: 5, width: 3 }); // 15  (m²)

// Mixed input units work; library normalizes to base before compute.
const areaMixed = forge(
  { length: centimeter, width: meter },
  squareMeter,
  { via: areaFromLengthAndWidth },
);
areaMixed({ length: 200, width: 3 }); // 6  (200 cm = 2 m, 2 × 3 = 6 m²)
```

### Validation

Conversions can declare per-input validators. Failures are aggregated into a single `ValidationError`; `inputs` and `failures` are frozen at construction so a downstream catcher can't mutate them.

```ts
import { forge, ValidationError } from 'unitforge';
import { meter, squareMeter, areaFromLengthAndWidth } from 'unitforge/kits/geometry';

const area = forge(
  { length: meter, width: meter },
  squareMeter,
  { via: areaFromLengthAndWidth },
);

try {
  area({ length: -5, width: -3 });
} catch (err) {
  if (err instanceof ValidationError) {
    err.failures;
    // [{ key: 'length', stage: 'definition', value: -5, message: 'length must be >= 0' },
    //  { key: 'width',  stage: 'definition', value: -3, message: 'width must be >= 0' }]
  }
}
```

## What ships in 0.x

The `geometry` kit ships **8 LENGTH units** (meter, centimeter, millimeter, kilometer, inch, foot, yard, mile), **8 AREA units** (square variants of the LENGTH units, plus acre and hectare), **6 VOLUME units** (cubic metric and imperial, plus liter and milliliter), and **7 cross-dimensional conversions** (rectangle, square, circle area; box, cube, sphere, cylinder volume). Every unit and conversion is named, typed, and tree-shakeable per-export. Full listings in [`src/kits/geometry/`](./src/kits/geometry/).

More kits planned: `si`, `imperial`, `cooking`, `inventory`, `pharmacy`. See PLANNING.md.

## Configuration

`ForgeConfig` accepts `precision`, `memoize`, and (for cross-dim) `validate` and `via`.

```ts
// precision: integer decimal places; rounds output AND cache key
const toCmRounded = forge(meter, centimeter, { precision: 1 });
toCmRounded(1.5678); // 156.8

// memoize: FIFO bounded cache; pass an integer cap (DEFAULT_MEMO_CAP = 1024)
import { DEFAULT_MEMO_CAP } from 'unitforge';
const toCmCached = forge(meter, centimeter, { memoize: DEFAULT_MEMO_CAP });
toCmCached(1.5); // computed
toCmCached(1.5); // cache hit
```

## Subpath imports

| Subpath | Exports |
| --- | --- |
| `unitforge` | API barrel: `defineUnit`, `defineConversion`, `forge`, `linear`, `ValidationError`, `DEFAULT_MEMO_CAP`, `MEMO_CAP_MAX`, plus types |
| `unitforge/dimensions` | `LENGTH`, `AREA`, `VOLUME`, `DIMENSIONS` tuple, `Dimension` type |
| `unitforge/kits/<kit>` | every unit and conversion shipped by `<kit>` (currently only `geometry`) |
| `unitforge/validation` | `ValidationError`, `ValidationFailure` type |
| `unitforge/version` | `VERSION: string` (read from `package.json` at runtime; on its own subpath because the JSON import would otherwise inline `package.json` into every consumer bundle) |

## Community

- Bugs and feature requests: [GitHub issues](https://github.com/simiancraft/unitforge/issues)
- Security: please use [private vulnerability reporting](https://github.com/simiancraft/unitforge/security/advisories/new); see [SECURITY.md](./SECURITY.md)
- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## License

MIT, copyright Jesse Harlin (the-simian). See [LICENSE](./LICENSE).

Made by [Simiancraft](https://github.com/simiancraft).
