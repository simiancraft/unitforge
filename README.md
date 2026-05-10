# unitforge

A units library where the units, dimensions, and conversions are all values you import; and the API is three free functions.

> **Status: pre-alpha (0.0.0).** This release reserves the package name. The public API is not yet stable; do not depend on it. Track progress at https://github.com/simiancraft/unitforge.

## Thesis

A units library that does not assume you are doing physics. Inventory, lab assays, game state, astronomy, finance, and SI-physics all get the same shape.

## Planned API

```ts
import { defineUnit, defineConversion, forge } from 'unitforge';
import { foot, inch } from 'unitforge/kits/imperial';

const toInches = forge(foot, inch);
toInches(5); // 60
```

Three primitives, three additive registries (dimensions, kits, conversions), first-class custom dimensions and packaging units, fully tree-shakeable. The `forge(from, to, ForgeConfig?)` verb returns a converter function; cross-dimensional conversions pass a `defineConversion` value via `ForgeConfig.via`.

## License

MIT, copyright Jesse Harlin (the-simian). See [LICENSE](./LICENSE).
