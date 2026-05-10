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

> **Status: pre-1.0 (0.0.0).** This release reserves the package name. The public API is not yet stable; do not depend on it. Track progress at https://github.com/simiancraft/unitforge.
>
> **This README is intentionally minimal pre-1.0.** The marketing-grade README (cross-domain pitch, kit roster, hero with cross-dim example, demo GIFs, performance numbers) lands once v1 ships and there are real kits, benchmarks, and demos to point at. PLANNING.md captures the full v1 design intent; some sections describe future kits that haven't shipped yet, so consult `src/` for the implementation source of truth.

## Thesis

A units library that does not assume you are doing physics. Inventory, lab assays, game state, astronomy, finance, and SI-physics all get the same shape.

## Install (placeholder)

```sh
# v1 not yet shipped; this command resolves the 0.0.0 name reservation only.
npm install unitforge
# or:  bun add unitforge
# or:  pnpm add unitforge
```

## API (current; geometry kit only)

```ts
import { forge } from 'unitforge';
import { meter, centimeter } from 'unitforge/kits/geometry';

const toCm = forge(meter, centimeter);
toCm(1.5); // 150
```

Three primitives (`defineUnit`, `defineConversion`, `forge`); three additive registries (dimensions, kits, conversions); first-class custom dimensions and packaging units; tree-shakeable per-export under `sideEffects: false`. The `forge(from, to, ForgeConfig?)` verb returns a converter function; cross-dimensional conversions pass a `defineConversion` value via `ForgeConfig.via`. See PLANNING.md for the v1 design intent (including the four other kits planned for v1).

## Community

- Bugs and feature requests: [GitHub issues](https://github.com/simiancraft/unitforge/issues)
- Security: please use [private vulnerability reporting](https://github.com/simiancraft/unitforge/security/advisories/new); see [SECURITY.md](./SECURITY.md)
- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## License

MIT, copyright Jesse Harlin (the-simian). See [LICENSE](./LICENSE).

Made by [Simiancraft](https://github.com/simiancraft).
