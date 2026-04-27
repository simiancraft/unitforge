# unitforge

A units library where the units, dimensions, and conversions are all values you import; and the API is three free functions.

> **Status: pre-alpha (0.0.0).** This release reserves the package name. The public API is not yet stable; do not depend on it. Track progress at https://github.com/simiancraft/unitforge.

## Thesis

A units library that does not assume you are doing physics. Inventory, lab assays, game state, astronomy, finance, and SI-physics all get the same shape.

## Planned API

```ts
import { convert, defineUnit, defineConversion } from 'unitforge';
```

Three free functions, three additive registries (dimensions, kits, conversions), first-class custom dimensions and packaging units, fully tree-shakeable.

## License

MIT, copyright Jesse Harlin (the-simian). See [LICENSE](./LICENSE).
