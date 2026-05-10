<p align="center">
  <img src="./.github/assets/unitforge-logo.png" alt="unitforge" width="160" />
</p>

<p align="center">
  <a href="https://simiancraft.github.io/unitforge/">
    <img src="https://img.shields.io/badge/▶%20Live%20demo-pre--alpha%20placeholder-f97316?style=for-the-badge" alt="Live demo" />
  </a>
</p>

# unitforge

[![CI](https://github.com/simiancraft/unitforge/actions/workflows/ci.yml/badge.svg)](https://github.com/simiancraft/unitforge/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/simiancraft/unitforge/badge)](https://securityscorecards.dev/viewer/?uri=github.com/simiancraft/unitforge)

<p align="center">
  <code>defineUnit</code> &nbsp;•&nbsp; <code>defineConversion</code> &nbsp;•&nbsp; <code>forge</code>
</p>

A units library where the units, dimensions, and conversions are all values you import; and the API is three free functions.

> **Status: pre-alpha (0.0.0).** This release reserves the package name. The public API is not yet stable; do not depend on it. Track progress at https://github.com/simiancraft/unitforge.
>
> **This README is intentionally minimal pre-1.0.** The marketing-grade README (cross-domain pitch, kit roster, hero with cross-dim example, demo GIFs, performance numbers, Scorecard badge) lands once v1 ships and there are real kits, benchmarks, and demos to point at. See [PLANNING.md](./PLANNING.md) for the full design intent and the canonical type sketch the implementation will be written against.

## Thesis

A units library that does not assume you are doing physics. Inventory, lab assays, game state, astronomy, finance, and SI-physics all get the same shape.

## Install (placeholder)

```sh
# v1 not yet shipped; this command resolves the 0.0.0 name reservation only.
npm install unitforge
# or:  bun add unitforge
# or:  pnpm add unitforge
```

## Planned API

```ts
import { forge } from 'unitforge';
import { foot, inch } from 'unitforge/kits/imperial';

const toInches = forge(foot, inch);
toInches(5); // 60
```

Three primitives (`defineUnit`, `defineConversion`, `forge`); three additive registries (dimensions, kits, conversions); first-class custom dimensions and packaging units; fully tree-shakeable. The `forge(from, to, ForgeConfig?)` verb returns a converter function; cross-dimensional conversions pass a `defineConversion` value via `ForgeConfig.via`. See [PLANNING.md](./PLANNING.md) for the full design and the canonical type sketch.

## License

MIT, copyright Jesse Harlin (the-simian). See [LICENSE](./LICENSE).

Made by [Simiancraft](https://github.com/simiancraft).
