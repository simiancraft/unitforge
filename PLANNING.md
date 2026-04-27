# unitforge — Planning Document

A planning artifact captured at project inception. This document is the source of truth for design intent until the README, AGENTS.md, and code itself catch up. When this document and the code disagree, update this document; when this document and the README disagree, the README wins.

## Project metadata

- **Name**: unitforge
- **Package name (npm)**: `unitforge`
- **Location**: `~/Simiancraft_Programming/Simiancraft/unitforge`
- **Sibling reference**: `~/Simiancraft_Programming/Simiancraft/chromonym` is the architectural specimen
- **Author**: simiancraft / the-simian
- **License**: MIT (matching chromonym)
- **Status**: pre-init, planning only

## Thesis

**A units library where the units, dimensions, and conversions are all values you import; and the API is three free functions.**

Phrased differently for marketing: *a units library that doesn't assume you're doing physics.* Inventory, lab assays, game state, astronomy, finance, and SI-physics all get the same shape.

This thesis is the single load-bearing decision the library is committing to. Everything in the rest of this document is a consequence of it.

## What makes unitforge not just another UOM library

The npm landscape was surveyed before commit:

- **convert-units** — closest existing match for countable units (ships `Pieces` measure with dozen/gross/ream); last stable 2018, perpetual 3.0 beta.
- **convert (jonahsnider/convert)** — function-first API, best TS ergonomics; closed-set unit list, no runtime extension.
- **mathjs units** — `createUnit` exists but global mutable state in a 9.4 MB dep.
- **unitmath** — closest on configurable atomic and pluggable numeric; class-based, low adoption.
- **safe-units** — strongest type-level dimensional analysis; cryptic compile errors, slow builds, library-author-shaped extensibility.
- **uom (dividab)**, **js-quantities** — pure SI dimensional, no countable units.

Gaps the surveyed libraries do not fill, all of which unitforge addresses:

1. **End-user (not library-author) custom units at runtime.** Define a unit in app settings, persist it, convert with it.
2. **Packaging units bridging count to dimension.** "1 spool of THHN-14 = 500 ft" expressed as a first-class primitive (`definePack`).
3. **Function-first ergonomics that survive runtime extension.** `convert` (jonahsnider) has the feel; nothing else has the feel plus extensibility.
4. **Custom dimensions for non-physical domains.** Game-state (`AFFINITY`, `MANA`, `LOYALTY`), business (`RISK_SCORE`, `LEAD_TEMPERATURE`), simulation (`MORALE`). Existing libs assume SI-physics dimensions and reject everything else.
5. **Configurable atomic per dimension** without instance machinery (consumer picks via which kit they import).
6. **Granular per-unit tree-shaking with whole-domain barrels for convenience** (the chromonym pattern, refined).

The unique-in-the-space combination is: **function-first API + first-class packaging units + custom dimensions + granular tree-shaking + chromonym aesthetic.** No individual feature is novel; the combination is empty space.

## The three registries

Three additive, flat registries in strict dependency order:

```
dimensions   →   kits   →   conversions
   (1)           (2)           (3)
```

### (1) Dimensions — flat list, no dependencies

A dimension is a string constant. Every unit declares its dimension. Conversions only happen within a dimension by default; cross-dimensional conversions require an explicit registered conversion.

Built-in dimensions ship in `src/dimensions.ts` as a flat file of `as const` exports:

```ts
export const LENGTH = 'length' as const;
export const AREA = 'area' as const;
export const VOLUME = 'volume' as const;
export const MASS = 'mass' as const;
export const WEIGHT = 'weight' as const;            // distinct from MASS
export const TIME = 'time' as const;
export const VELOCITY = 'velocity' as const;
export const ACCELERATION = 'acceleration' as const;
export const FORCE = 'force' as const;
export const PRESSURE = 'pressure' as const;
export const ENERGY = 'energy' as const;
export const POWER = 'power' as const;
export const DENSITY = 'density' as const;
export const TEMPERATURE = 'temperature' as const;
export const ENTROPY = 'entropy' as const;
export const VOLTAGE = 'voltage' as const;
export const CURRENT = 'current' as const;
export const RESISTANCE = 'resistance' as const;
export const AMOUNT = 'amount' as const;            // moles
export const LUMINOUS_INTENSITY = 'luminous_intensity' as const;
export const COUNT = 'count' as const;              // for inventory packaging
export const INFORMATION = 'information' as const;  // bits/bytes
export const ANGLE = 'angle' as const;
export const FREQUENCY = 'frequency' as const;
```

Users define their own dimensions inline as plain string constants. The `Dimension` type unions the built-ins with `string` to allow arbitrary custom dimensions:

```ts
export type Dimension = typeof LENGTH | typeof MASS | /* ... */ | string;
```

### (2) Kits — domain-organized bundles of units

A kit is a folder under `src/kits/<domain>/` containing one file per unit, plus an `index.ts` barrel.

```
src/kits/
├── si/
│   ├── index.ts
│   ├── meter.ts
│   ├── kilogram.ts
│   ├── second.ts
│   └── ...
├── imperial/
│   ├── index.ts
│   ├── foot.ts
│   ├── pound.ts
│   └── ...
├── cooking/
│   ├── index.ts
│   ├── tablespoon.ts
│   ├── cup.ts
│   └── ...
├── astronomy/
├── inventory/
└── electrical/
```

Two import patterns supported:

```ts
// Granular: best tree-shaking, named imports
import { meter, foot } from 'unitforge/kits/imperial';

// Whole domain: convenience, barrel import
import * as cooking from 'unitforge/kits/cooking';
```

Each unit is a value produced by `defineUnit`:

```ts
// src/kits/si/meter.ts
import { defineUnit } from 'unitforge';
import { LENGTH } from 'unitforge/dimensions';

export const meter = defineUnit({
  name: 'meter',
  dimension: LENGTH,
  toBase: 1,
  base: true,
});
```

Kits depend on dimensions but not on conversions. A kit may declare new dimensions inline if the kit introduces a domain not yet in the built-in dimension list (e.g., a `gaming` kit might export `AFFINITY`, `LOYALTY` alongside its units).

### (3) Conversions — flat folder of single-purpose files

A conversion is a cross-dimensional bridge. Each lives as one file under `src/conversions/`:

```
src/conversions/
├── massFromVolumeAndDensity.ts
├── pressureFromForceAndArea.ts
├── weightFromMass.ts
├── weightFromVolumeAndDensity.ts        // multi-step composed conversion
├── ohmsLaw.ts
└── kineticEnergy.ts
```

Naming convention: `<output>From<input1>And<input2>And<...>`. The filename is the contract.

Conversions are explicit, single-hop from the library's perspective, and never traversed by the library. If a developer wants a multi-step path (volume → mass → weight), they either:

1. Define the multi-step path as a single conversion with a compute function that internally composes the steps (e.g., `weightFromVolumeAndDensity = volume × density × g`), or
2. Chain `convert` calls in userland.

The library never searches for paths. The library never composes conversions automatically. Every cross-dimensional conversion is something a developer wrote down on purpose.

```ts
// src/conversions/massFromVolumeAndDensity.ts
import { defineConversion } from 'unitforge';
import { VOLUME, DENSITY, MASS } from 'unitforge/dimensions';

export const massFromVolumeAndDensity = defineConversion({
  name: 'mass-from-volume-and-density',
  inputs: [{ dimension: VOLUME }, { dimension: DENSITY }],
  output: { dimension: MASS },
  compute: (volume, density) => volume * density,
  invertible: {
    [VOLUME]:  (mass, density) => mass / density,
    [DENSITY]: (mass, volume)  => mass / volume,
  },
});
```

## API shape

Four free functions form the public surface:

```ts
import {
  convert,             // perform a conversion within or across dimensions
  format,              // render a value with its unit (plural, abbrev, locale)
  defineUnit,          // produce a unit value
  defineConversion,    // produce a conversion value
} from 'unitforge';
```

`definePack` is sugar for the inventory packaging case:

```ts
import { definePack } from 'unitforge';

const spoolThhn14 = definePack({ outer: 'spool-thhn-14', inner: '500 ft' });
// equivalent to a 1-input constant-factor conversion from COUNT to LENGTH
```

### Why free functions, not an instance factory

Most UOM libraries return an instance from a `createUnits({ ... })` factory. unitforge does not. Reasons:

1. **Imports are configuration.** What used to be `createUnits({ kits: [...] })` is just `import { foot, meter } from 'unitforge/kits/imperial'`. Bundlers see the imports statically; nothing is registered at runtime because nothing needs to be.
2. **Pure functions, no hidden state.** `convert(5, foot, meter)` takes everything it needs as arguments. No instance method dispatch, no shared registry.
3. **Tree-shakes harder.** No factory machinery, no registry storage.
4. **Zero test setup.** Import the units and the function, write the test.

The trade is one extra argument at cross-dimensional call sites:

```ts
// within-dimension: clean
convert(5, meter, foot);

// cross-dimensional: pass the conversion explicitly
convert([5, liter, 1.2, gramPerMl], kilogram, massFromVolumeAndDensity);
```

This explicitness is a feature: it makes the conversion's identity visible at the call site, prevents ambiguity when multiple conversions exist between the same dimensions, and forces consumers to import the conversion they want (which is what makes tree-shaking work).

### Cross-dimensional error message

When a cross-dimensional `convert` is called without a registered conversion, the error is the library's most-frequently-seen surface. It must teach.

```
[unitforge] No conversion registered from dimension 'volume' to dimension 'mass'.

Conversions currently registered with input 'volume':
  - none to 'mass'

To enable this conversion, register one:

  defineConversion({
    name: 'mass-from-volume-and-density',
    inputs:  [{ dimension: VOLUME }, { dimension: DENSITY }],
    output:  { dimension: MASS },
    compute: (volume, density) => volume * density,
  });

Or chain manually:
  convert(volume, 'volume-unit', 'intermediate-unit')
  convert(intermediate, 'intermediate-unit', 'mass-unit')

Available units in 'mass': gram, kilogram, ounce, pound (4 total)
```

## File layout

```
unitforge/
├── src/
│   ├── index.ts                    // public API barrel: convert, format, defineUnit, defineConversion, definePack
│   ├── dimensions.ts               // flat file; all built-in dimension constants
│   ├── convert.ts
│   ├── format.ts
│   ├── defineUnit.ts
│   ├── defineConversion.ts
│   ├── definePack.ts
│   ├── types.ts                    // Dimension, Unit, Conversion, Pack interfaces
│   ├── numeric/
│   │   ├── number.ts               // default native-number adapter
│   │   ├── decimal.ts              // peer-dep on decimal.js
│   │   ├── bigint.ts               // zero-dep BigInt-with-fixed-scale adapter
│   │   └── fraction.ts             // peer-dep on fraction.js
│   ├── kits/
│   │   ├── si/
│   │   ├── imperial/
│   │   ├── cooking/
│   │   ├── inventory/
│   │   └── ...
│   └── conversions/
│       ├── massFromVolumeAndDensity.ts
│       ├── pressureFromForceAndArea.ts
│       └── ...
├── demo/                           // vite-based demo page (chromonym pattern)
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
├── test/                           // bun test suite
├── scripts/                        // build/release helpers
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-demo.yml
│   │   ├── link-check.yml
│   │   └── scorecard.yml
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── FUNDING.yml
│   ├── dependabot.yml
│   └── assets/
├── README.md
├── AGENTS.md
├── CHANGELOG.md                    // semantic-release-managed
├── CODE_OF_CONDUCT.md
├── CODEOWNERS
├── CONTRIBUTING.md
├── LICENSE                         // MIT
├── NOTICE.md                       // attribution to upstream sources used in kits
├── SECURITY.md
├── biome.json
├── bunfig.toml
├── codecov.yml
├── knip.json
├── llms.txt
├── package.json
├── tsconfig.json
└── .releaserc.json
```

This layout mirrors chromonym's structure exactly. The substantive differences are:

- `src/conversions/` contains cross-dimensional conversions (chromonym's `src/conversions/` contained color-space transforms).
- `src/dimensions.ts` is a flat file of dimension constants (chromonym had no equivalent because color spaces ship as named entities, not flat constants).
- `src/kits/` plays the role chromonym's `src/palettes/` plays.
- `src/numeric/` is unique to unitforge (chromonym didn't need pluggable numeric types).

## Domain kits to ship at v1

Three to five kits, deliberately diverse to stress-test the kit interface:

1. **`si`** — meter, kilogram, second, kelvin, mole, ampere, candela; derived: square meter, cubic meter, newton, joule, watt, pascal, hertz. The default kit; analog of chromonym's CSS palette.
2. **`imperial`** — inch, foot, yard, mile, pound, ounce, fluid ounce, gallon, quart, pint, cup. Required for any US-market consumer; demonstrates a non-SI dimensional system.
3. **`inventory`** — each, dozen, gross, ream, score, pair, half-dozen. Demonstrates the `COUNT` dimension. The case where `definePack` matters most.
4. **One credibility/specialty kit**: candidates are `astronomy` (parsec, lightyear, AU, solar mass, jansky), `historical` (cubit, league, hand, span, rod, chain, furlong, hogshead), or `cooking` (tablespoon, teaspoon, cup with US/UK split, stick of butter, dash, pinch). Pick one for v1; ship the others in subsequent releases.

The chromonym precedent is to file an issue per future kit (parallel to chromonym issues #21–#30 for queued palettes). Each issue specifies source, license, scope-fit, version-pin discipline.

## Discipline rules

These rules are non-negotiable through v1; they are what holds the design together.

1. **Side-effect-free package.** `"sideEffects": false` in `package.json`; no top-level mutation; no auto-registration. Every export is reachable only through explicit named import.
2. **Single-hop conversions only.** The library never searches for a conversion path. If a consumer needs multi-step, they declare a multi-step conversion as one unit, or chain `convert` calls in userland.
3. **Dimensions are stable string identifiers.** Once shipped, `LENGTH = 'length'` cannot change its string value. Same stability contract as chromonym color-space identifiers.
4. **Kits can declare new dimensions but cannot redefine existing ones.** A `cooking` kit can extend `VOLUME` with `cup`; it cannot reassign `VOLUME` to mean something else.
5. **Conversions declare invertibility explicitly.** No auto-derived inverses (Celsius/Fahrenheit-style offsets break naive symmetry).
6. **Numeric type is pluggable but defaults to native `number`.** Heavy numeric adapters (decimal.js, fraction.js) are peer dependencies; consumers install them only if they need them.
7. **Per-unit precision is a property of the unit definition, not a global config.** Specific units that must be tracked tighter than the instance default declare their precision in `defineUnit`.
8. **No instance factory.** Public API is free functions. Period.
9. **Granular per-unit files.** Each kit is a folder of one-unit-per-file modules with a barrel `index.ts`. Whole-kit `import *` works for convenience; named imports work for tree-shaking.
10. **Naming convention enforced by lint.** A small dev-only checker greps `defineUnit`/`defineConversion` calls and verifies `name` matches filename and the camelCase pattern. Initial form: ~50 lines of regex; ship as project pre-commit hook; extract as `unitforge-lint` if it earns its keep.
11. **Trademark and source attribution discipline.** Kits referencing third-party standards (RAL, USP/WHO for pharmaceutical IU, BIPM for SI definitions) cite source and version-pin in source comments. NOTICE.md tracks attribution. Same discipline visible in chromonym issues #25 (Tailwind v4.0 pin), #26 (Material trademark), #27 (Farrow & Ball "unofficial reference" disclaimer).

## Numeric type strategy

Default: native JavaScript `number` (IEEE 754 double). Sufficient for ~99% of use cases.

Pluggable adapter for precision-sensitive consumers:

```ts
// Adapter interface
interface NumericAdapter<T> {
  add(a: T, b: T): T;
  sub(a: T, b: T): T;
  mul(a: T, b: T): T;
  div(a: T, b: T): T;
  pow(a: T, n: number): T;
  compare(a: T, b: T): number;
  fromString(s: string): T;
  toNumber(t: T): number;
  clone(t: T): T;
}
```

Reference adapters shipped under `unitforge/numeric/<name>`:

- `unitforge/numeric/number` — default; always loaded.
- `unitforge/numeric/decimal` — peer-dep on `decimal.js`. Arbitrary precision.
- `unitforge/numeric/bigint` — zero-dep `BigInt`-with-fixed-scale. Exact integer math at a chosen resolution.
- `unitforge/numeric/fraction` — peer-dep on `fraction.js`. Exact rational arithmetic.

Tree-shaking strategy: each adapter is its own subpath; consumers who don't import an adapter don't pay for it. Heavy adapters (decimal.js, fraction.js) are peer dependencies; `npm install unitforge` does not install them.

This is the chromonym pattern applied to numeric types: the analog of "palette I import or don't" is "numeric adapter I import or don't."

## Configurable atomic per dimension

Most surveyed libraries hardcode the atomic unit per dimension (uom, safe-units anchor at SI base; convert-units anchors at gram, liter, piece). unitmath is the only one that ships configurable atomic at runtime.

unitforge handles this via **kit choice**, not runtime config:

- Default kit `si` anchors at meter, kilogram, second.
- Alternate atomic kits live at `kits/si-mm-atomic`, `kits/si-g-atomic`, etc., for consumers who want millimeter-base or gram-base storage.

This is the same pattern as chromonym shipping multiple color-space variants without a runtime config flag. Consumers pick which atomic they want by picking which kit they import. No instance state required; no runtime configuration to forget; tree-shakes per-import.

If runtime configuration of atomic later proves necessary, it can be added as an option to `defineUnit` or `convert`, but the default path is "import the kit that matches your storage."

## What unitforge inherits from chromonym (boilerplate specimen)

The following are mirrored directly from chromonym's repository structure with minimal adaptation:

- **Build/runtime**: Bun, TypeScript, ESM, biome for lint+format.
- **Type checker**: tsgo (the native TypeScript checker; chromonym uses it).
- **Test runner**: bun test with codecov reporting.
- **Knip**: unused-export detection.
- **Vite-based demo**: lives in `demo/`, deployed via `deploy-demo.yml` GitHub Action.
- **CI workflows**: `ci.yml` (lint+test+typecheck), `deploy-demo.yml` (vite build + GitHub Pages or Vercel), `link-check.yml` (markdown link rot), `scorecard.yml` (OpenSSF Scorecard).
- **Release**: semantic-release via `.releaserc.json`. CHANGELOG.md auto-generated.
- **Community-health surface**: CODE_OF_CONDUCT.md, CONTRIBUTING.md, SECURITY.md, CODEOWNERS, FUNDING.yml, dependabot.yml, ISSUE_TEMPLATE/, PULL_REQUEST_TEMPLATE.md.
- **AGENTS.md**: agent-instructions file at root, references chromonym pattern.
- **NOTICE.md**: third-party attribution (kits citing external standards).
- **llms.txt**: machine-readable summary for LLM-driven consumers.

The substantive divergence from chromonym lives in `src/`, where the registries are different (dimensions, kits, conversions vs. chromonym's color-spaces, palettes, conversions).

## Open questions to resolve before v1

1. **Which credibility kit ships at v1?** Astronomy, historical, or cooking. Each makes a different marketing statement.
2. **`definePack` invertibility on non-linear packs.** A spool of wire is linear (1 spool ↔ 500 ft). What about packs where the conversion is conditional ("1 carton = 12 if SKU-A, 24 if SKU-B")? Treat as out-of-scope for v1; document as a userland concern.
3. **Format options API surface.** Pluralization, abbreviation, locale, precision rounding. How much ships at v1 vs. lives in a separate `unitforge/format-extras` subpath later?
4. **Custom dimension scoping.** Two third-party kits both export `MANA = 'mana'`. The library currently trusts strings. Document the prefix-your-custom-dimensions convention; do not enforce.
5. **TypeScript inference for `convert` return type when crossing dimensions.** Single-hop is straightforward; ensure the type system narrows correctly when a conversion is passed.
6. **Subpath exports for size variants of large kits.** Astronomy could ship `kits/astronomy/core` (a dozen units) vs `kits/astronomy/full` (everything). Mirror chromonym Munsell #22's approach.

## Next steps

1. User makes the GitHub repository at `simiancraft/unitforge`.
2. User performs `git init` locally; we connect to remote.
3. Mirror chromonym's compliance and tooling files: package.json (scoped to unitforge), tsconfig.json, biome.json, bunfig.toml, knip.json, codecov.yml, .releaserc.json, .gitattributes, .gitignore, LICENSE (MIT), CODE_OF_CONDUCT.md, CONTRIBUTING.md, SECURITY.md, CODEOWNERS, AGENTS.md, NOTICE.md, llms.txt, .github/ tree, dependabot.yml.
4. Scaffold `src/` skeleton: `index.ts` barrel, `dimensions.ts`, `types.ts`, empty `kits/` and `conversions/` folders, stub `convert.ts`, `defineUnit.ts`, `defineConversion.ts`, `definePack.ts`, `format.ts`.
5. Scaffold `demo/` as a vite app with placeholder content.
6. Implement v1: SI kit, imperial kit, inventory kit, one credibility kit, supporting conversions.
7. Write README hero block; the test of design coherence is whether the hero block fits in under 30 lines and reads cleanly.
8. File issues for queued kits (analog of chromonym #21–#30).

## Appendix: design conversation summary

This document distills a conversation that explored:

- The OSS UOM landscape and its gaps (six libraries surveyed).
- Ultrathin's existing inventory unit-handling and where current code falls short.
- Reduce-to-atomic storage strategy across the surveyed libraries.
- Float precision concerns with small atomic units; the integer-vs-float axis.
- Configurable atomic feature space (only unitmath ships it).
- Big-decimal handling across libraries (mathjs and unitmath only).
- The chromonym aesthetic and how it transfers (palettes → kits, color spaces → dimensions).
- The two architectural families (algebraic dimensions vs independent dimensions with explicit bridges).
- The three-registry model (dimensions, kits, conversions) and dependency ordering.
- Free-function API vs instance-factory tradeoff; the user's preference for purity-via-arity.
- Naming process (unitforge selected over metronym, vernier, quantica, cubitor, scalesmith).

The thesis line is: *units, dimensions, and conversions as values you import; three free functions; not just a physics library.*
