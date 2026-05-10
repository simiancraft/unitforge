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
2. **Packaging units bridging count to dimension.** A spool of tape is a UNIT (in the COUNT dimension), not a wrapper around inches or feet. `defineUnit({ name: 'spool-thhn-14', dimension: COUNT, ... })` defines the unit; a separate `defineConversion` expresses "1 spool = 500 ft" only when conversion to length is needed. No special primitive; the library's first-class support for `COUNT` plus arbitrary cross-dim conversions makes packaging a natural use case rather than a special-cased one.
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

A dimension is a string constant. Every unit declares its dimension. Conversions only happen within a dimension by default; cross-dimensional conversions require an explicit `defineConversion` value passed at the call site via `ForgeConfig.with`.

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

Users define their own dimensions inline as plain string constants. The `Dimension` type unions the built-ins with a branded `string` to allow arbitrary custom dimensions WITHOUT collapsing autocomplete on the built-ins:

```ts
export type Dimension =
  | typeof LENGTH
  | typeof MASS
  | /* ... */
  | typeof FREQUENCY
  | (string & {}); // branded string preserves literal autocomplete
```

The naive `| string` union collapses the entire union to `string` in TypeScript's eyes, killing autocomplete for the built-in dimensions. The `(string & {})` brand is a known TS idiom that keeps the literals visible in the autocomplete dropdown while still accepting arbitrary strings at the call site.

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
├── inventory/
└── pharmacy/
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
import { defineUnit, linear } from 'unitforge';
import { LENGTH } from 'unitforge/dimensions';

export const meter = defineUnit({
  name: 'meter',
  dimension: LENGTH,
  ...linear(1),
  base: true,
});
```

`linear(scale)` is a sugar helper that expands to `{ toBase: (v) => v * scale, fromBase: (b) => b / scale }`. The full shape is shown under "API shape > `defineUnit`" below.

Kits depend on dimensions but not on conversions. A kit may declare new dimensions inline if the kit introduces a domain not yet in the built-in dimension list (e.g., a `gaming` kit might export `AFFINITY`, `LOYALTY` alongside its units).

#### Polysemy and kit composition

Many domains reuse the same word for different concepts: `weight` (mass-under-gravity vs statistical significance), `stress` (mechanical vs psychological vs financial), `flux` (electromagnetic vs heat vs flow rate). The library does not invent a global naming scheme to disambiguate; it leans on standard ESM mechanics. This is a **strength**, not a hazard: kit authors curate, end users always know what menu they're building.

Two layers of disambiguation are available, either sufficient on its own:

**Call-site rename (consumer code).** When two modules export the same name, consumers use ordinary import-as-rename:

```ts
import { weight as physicalWeight }     from 'unitforge/conversions/mechanics';
import { weight as statisticalWeight }  from 'unitforge/conversions/statistics';

forge({ mass: kg }, newton, { via: physicalWeight });
// statisticalWeight available distinctly at the same site
```

**Export-side rename (kit-author code).** When composing a "remix kit" that pulls from multiple sources, the kit's `index.ts` barrel re-exports with the rename baked in:

```ts
// src/kits/everything-w/index.ts
export { weight as physicalWeight }    from '../mechanics/weight';
export { weight as statisticalWeight } from '../statistics/weight';
export { wattage }                      from '../electrical/wattage';
```

End users importing from `everything-w` see disambiguated names without doing any work themselves.

**Namespace import (third pattern).** Verbose at the call site but legible if the consumer prefers explicit qualification:

```ts
import * as Classical    from 'unitforge/conversions/classical';
import * as Relativistic from 'unitforge/conversions/relativistic';

forge({mass: kg, velocity: mps}, joule, { via: Classical.kineticEnergy });
forge({mass: kg, velocity: mps}, joule, { via: Relativistic.kineticEnergy });
```

Tree-shaking still works under modern bundlers as long as member access is **static** (`Classical.kineticEnergy`); dynamic access (`Classical[someVar]`) defeats it.

**Tree-shaking is preserved at both layers.** Per-unit-per-file modules under `sideEffects: false` mean consumers only pay for the units they actually import, even when a barrel re-exports many. Composition costs no bytes the consumer didn't ask for.

#### Packaging units (worked example)

A packaging unit (spool of tape, case of soda, blister pack of pills, pallet of cases) IS a unit in the COUNT dimension; it is not a wrapper around the inner content's dimension. A spool of tape is dimensionally "1 spool"; converting it to inches of tape is a separate `defineConversion` step, used when needed.

**Simple pack: spool of tape.**

```ts
import { defineUnit, defineConversion, forge, linear } from 'unitforge';
import { COUNT, LENGTH } from 'unitforge/dimensions';
import { inch } from 'unitforge/kits/imperial';

// The pack is a unit in COUNT.
export const spoolOfTape = defineUnit({
  name: 'spool-of-tape',
  dimension: COUNT,
  ...linear(1),
});

// The conversion to inner content (length).
// 1 spool = 100 inches of tape.
export const lengthFromSpoolOfTape = defineConversion({
  inputs:  { spools: COUNT },
  output:  LENGTH,
  compute: ({ spools }) => spools * 2.54,  // 100 in = 2.54 m (LENGTH base)
});

// Use:
forge({ spools: spoolOfTape }, inch, { via: lengthFromSpoolOfTape })({ spools: 5 });
// => 500 inches
```

**Nested packs: case → cans → liters.** Pack hierarchies compose because COUNT→COUNT conversions ride on `toBase`/`fromBase` (no `defineConversion` needed within COUNT), and only the cross-dim leg (COUNT→VOLUME) requires a conversion.

```ts
import { defineUnit, defineConversion, forge, linear } from 'unitforge';
import { COUNT, VOLUME } from 'unitforge/dimensions';
import { liter } from 'unitforge/kits/si';

// 1 case = 24 cans (COUNT base "each").
export const caseOfSoda = defineUnit({
  name: 'case-of-soda',
  dimension: COUNT,
  toBase:   (n) => n * 24,
  fromBase: (each) => each / 24,
});

export const canOfSoda = defineUnit({
  name: 'can-of-soda',
  dimension: COUNT,
  ...linear(1),
});

// 1 can = 0.355 L of soda (12 fl oz).
export const volumeFromCanOfSoda = defineConversion({
  inputs:  { cans: COUNT },
  output:  VOLUME,
  compute: ({ cans }) => cans * 0.000355,  // L → m³ (VOLUME base)
});

// COUNT → COUNT: forge handles via toBase/fromBase. No conversion needed.
forge(caseOfSoda, canOfSoda)(1);   // 24 cans
forge(canOfSoda, caseOfSoda)(48);  // 2 cases

// COUNT → VOLUME: cross-dim, needs the conversion.
const sodaVolume = forge({ cans: canOfSoda }, liter, { via: volumeFromCanOfSoda });
sodaVolume({ cans: 1 });           // 0.355 L
sodaVolume({ cans: 24 });          // 8.52 L (one case worth)
```

**Two ways to ask "how many liters in 1 case":**

```ts
// (a) Userland chain via two forged converters (canonical for ad-hoc composition).
const cansPerCase = forge(caseOfSoda, canOfSoda)(1);      // 24
sodaVolume({ cans: cansPerCase });                          // 8.52 L

// (b) A single-shot case→volume conversion when this shortcut is needed often.
export const volumeFromCaseOfSoda = defineConversion({
  inputs:  { cases: COUNT },
  output:  VOLUME,
  compute: ({ cases }) => cases * 24 * 0.000355,
});
forge({ cases: caseOfSoda }, liter, { via: volumeFromCaseOfSoda })({ cases: 1 });
// => 8.52 L
```

The library stays single-hop on purpose; if `case → volume` is a frequent shortcut, encode it as one conversion. The library does not search or compose conversion paths.

**Implicit-but-tolerable.** The COUNT dimension does not distinguish "case-of-soda" from "case-of-beer" or "case-of-paperclips" at the type level. `volumeFromCanOfSoda` accepts any `COUNT` input; pass `dozen` and the math is mathematically correct (12 cans = 4.26 L); pass `caseOfPaperclips` and it returns nonsense. The conversion's name is the contract; the type system cannot catch a wrong-but-shape-matching unit. Standard developer discipline: pass the unit you mean. Custom dimensions like `SODA_COUNT` could enforce this at the type level if it ever matters in a specific kit, but that is a domain-author choice, not a library default.

**Co-locating the pack and its conversion.** A pack and its primary inner conversion typically ship from the same module file:

```ts
// src/kits/inventory/spoolThhn14.ts
export const spoolThhn14 = defineUnit({ ... });
export const lengthFromSpoolThhn14 = defineConversion({ ... });
```

Consumers import one, the other, or both, depending on what they need. The kit's `index.ts` barrel re-exports both.

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
2. Chain forged converters in userland (call the output of one `forge` as input to another).

The library never searches for paths. The library never composes conversions automatically. Every cross-dimensional conversion is something a developer wrote down on purpose.

The full `defineConversion` shape and a worked example appear under "API shape" above. Filename, export name, and the dimensional contract together form the per-file contract; there is no separate `name:` field in the conversion value.

## API shape

Three primitives form the public surface:

```ts
import { defineUnit, defineConversion, forge } from 'unitforge';
```

`forge` is the call-site verb. `defineUnit` and `defineConversion` are the value-producing factories. The library does conversion; display is the view's job. (The original PLANNING.md included a standalone `format` primitive with singular/plural/locale/abbreviation logic; resolved 2026-05-09 to drop it. The library exposes an optional `format: (value: number) => string` field in `ForgeConfig` for consumer-supplied output formatting; see `forge` below. Also dropped: a `definePack` sugar; packaging is just a `defineUnit` in the COUNT dimension paired with a `defineConversion` to the inner dimension; no special sugar needed.)

### `defineUnit`

A unit is a value produced by `defineUnit`. Kits export these.

The `Unit` interface carries two functions: `toBase` (this unit's value → base unit's value) and `fromBase` (base unit's value → this unit's value). Both are always functions; neither is auto-derived from the other. This matches the principle that each direction of a relationship is its own declared thing (the same principle that says cross-dim conversions declare each direction as a separate `defineConversion`).

```ts
// src/kits/si/meter.ts (the base unit; trivial)
import { defineUnit, linear } from 'unitforge';
import { LENGTH } from 'unitforge/dimensions';

export const meter = defineUnit({
  name: 'meter',
  dimension: LENGTH,
  ...linear(1),
  base: true,
});

// src/kits/imperial/foot.ts (linear, non-base)
export const foot = defineUnit({
  name: 'foot',
  dimension: LENGTH,
  ...linear(0.3048),
});

// src/kits/si/celsius.ts (non-linear: offset)
export const celsius = defineUnit({
  name: 'celsius',
  dimension: TEMPERATURE,
  toBase:   (c) => c + 273.15,
  fromBase: (k) => k - 273.15,
});

// src/kits/imperial/fahrenheit.ts (non-linear: offset + scale)
export const fahrenheit = defineUnit({
  name: 'fahrenheit',
  dimension: TEMPERATURE,
  toBase:   (f) => (f - 32) * 5/9 + 273.15,
  fromBase: (k) => (k - 273.15) * 9/5 + 32,
});
```

`linear(scale)` is the sugar helper for the common linear case; expands to `{ toBase: (v) => v * scale, fromBase: (b) => b / scale }`. Saves ~50% boilerplate on every linear unit (which is most of them). Ships from the main barrel alongside `defineUnit`. Non-linear units write the two functions explicitly; the type stays uniform.

The output of `defineUnit` is interface-shaped data. Anything that satisfies the `Unit` interface is a unit, whether it was kit-shipped or user-defined a minute ago in app code. End-user custom units are first-class for this reason.

### `defineConversion`

A conversion is a value produced by `defineConversion`. It declares a dimensional contract, optional input validators, and the base-unit math that fulfills it. Conversions live under `src/conversions/` and are imported on demand.

```ts
// src/conversions/massFromVolumeAndDensity.ts
import { defineConversion } from 'unitforge';
import { VOLUME, DENSITY, MASS } from 'unitforge/dimensions';

export const massFromVolumeAndDensity = defineConversion({
  inputs: { volume: VOLUME, density: DENSITY },
  output: MASS,
  validate: {
    volume:  (v) => v >= 0 || 'volume must be >= 0',
    density: (d) => d >  0 || 'density must be > 0',
    all: ({ volume, density }) => volume * density < 1e9 || 'mass exceeds safe range',
  },
  compute: ({ volume, density }) => volume * density,
});
```

`inputs` is an object mapping property names to **dimensions** (not units). `output` is a single dimension. `compute` is written in **base units of the declared dimensions**; the library decorates it so that when `forge` later runs the conversion, incoming values are normalized from their declared units to base units, the compute runs, and the result is denormalized into the requested output unit. The compute author never writes unit conversion logic.

`validate` is an optional object that carries the conversion's universal input invariants:
- **Per-property validators** (keyed by `inputs` property name) run on each input independently. These are the fast 90% case; e.g., "density must be positive."
- **Whole-object validator** (`all`) runs on the destructured input object as a whole, for cross-property invariants; e.g., "length must be >= width."
- Each validator returns `true` (or `undefined`) to pass, or a string to reject with that error message. Throwing is the escape hatch, so users can drop in third-party validation libraries without rewriting.
- Conversion-layer validators see the **user-supplied value in its user-chosen unit** and should stick to unit-invariant checks (sign, integer, finite, NaN, etc.). Unit-specific range checks belong at the call site in `ForgeConfig.validate`. This keeps the "compute authors never see units" principle alive at the validator layer.

Each direction of a relationship is its own `defineConversion` value. No auto-derived inverse; if both `massFromVolumeAndDensity` and `volumeFromMassAndDensity` are needed, both are declared. The names depict direction; per-file surface area stays small.

### `forge`

`forge` produces a converter function. Call shape is always three positional arguments, in the same order, every time:

```ts
forge(from, to, ForgeConfig?)
```

The shape of `from` determines the shape of the converter's call site:

```ts
// within-dimension: from is a single Unit; converter is unary
const footToInch = forge(foot, inch);
footToInch(5); // => number

// cross-dimensional: from is an object whose properties are Units; converter takes a matching object
import { massFromVolumeAndDensity } from 'unitforge/conversions/massFromVolumeAndDensity';
import { gallon, poundPerGallon, kilogram, gram, cup } from 'unitforge/kits/...';

const galPpgToKg = forge(
  { volume: gallon, density: poundPerGallon },
  kilogram,
  { via: massFromVolumeAndDensity }
);
galPpgToKg({ volume: 5, density: 8.3 });

// the SAME defineConversion value is reused across N forge sites with different unit pairings
const cupPpgToG = forge(
  { volume: cup, density: poundPerGallon },
  gram,
  { via: massFromVolumeAndDensity }
);
```

`ForgeConfig` is an open extensibility surface, a plain TypeScript interface that consumers construct as an object literal at the call site (no `defineForgeConfig` ceremony). It carries any forge-behavior modifier: significant digits, clamping, high-precision mode, numeric adapter choice, memoization (cache repeated inputs for hot-path performance), call-site validators (additive on top of the conversion's own validators), an optional `format: (value: number) => string` for consumer-supplied output formatting (the library does no plural/locale/abbreviation logic itself; that is the view's job), and the cross-dim conversion value itself, passed via the `via:` field.

```ts
forge(
  { volume: gallon, density: poundPerGallon },
  kilogram,
  {
    with: massFromVolumeAndDensity,
    validate: { volume: (v) => v <= 1000 || 'this app caps at 1000 gal' },
    memoize: true,
    precision: 2,
  }
);
```

`ForgeConfig.validate` accepts the same per-property + `all` shape as `defineConversion.validate`; call-site validators are *additive*, not overriding. The conversion's own invariants always run.

When `ForgeConfig.format` is supplied, the forged converter exposes a `.format(input)` method that runs the conversion AND applies the formatter, returning a string. The converter itself still returns `number`; the format method is opt-in convenience and is absent if `format` was not supplied:

```ts
const toInches = forge(foot, inch);
toInches(5);                                                     // 60 (number)

const toInchesPretty = forge(foot, inch, {
  format: (v) => `${v.toFixed(0)} in`,
});
toInchesPretty(5);                                                // 60 (still a number; type unchanged)
toInchesPretty.format(5);                                         // "60 in" (convert + format)
```

The library ships no plural-handling, locale, abbreviation, or ICU machinery; consumers who need those reach for `Intl.NumberFormat`, `Intl.PluralRules`, or a dedicated i18n library in their view layer. Format is a one-line escape hatch, not a feature.

`ForgeConfig.via:` carries the cross-dimensional conversion. (The field was briefly renamed `with:` during design; reverted to `via:` 2026-05-09 because `with` is SQL-shaped, is a reserved word in JS strict mode, and reads as "construct with this thing" in a way that overstates how complex the right-hand side is. The right-hand side is a `defineConversion` value, and `via` reads as "convert via this rule," which is the intent.)

### Call-time pipeline

When the forged converter is invoked with input values, the library runs them through:

1. **Compute cache key** from the input (sort prop names, apply precision rounding if set, join with `\x00`).
2. **Cache check** (if `memoize` is enabled and the key is present): return the cached value. Done.
3. **All validators run, no short-circuit.** Per-property and `all` validators from both `ForgeConfig.validate` and `Conversion.validate` run together; every failure is collected.
4. **If any failures, throw a `ValidationError`** carrying the full input object and an array of `{ key, stage, value, message }` records. The error's `.message` auto-templates the inputs and failures into a readable block. No cache write.
5. **Normalize inputs to base units** via each `from` Unit's `toBase` function.
6. **Run `compute`** (in base units).
7. **Denormalize** the result to the `to` Unit via `toUnit.fromBase`.
8. **Write to cache** (if `memoize` is enabled).
9. **Return.**

**Cache-first, validators-on-miss-only** is intentional. Validators are required to be pure functions of their inputs (no external state, no side effects). A validator that passed once for a given input passes every time; the cached result is therefore validation-correct for that bucket. Re-running validators on cache hits would be duplicate work.

**Consequence of precision-bucketed cache keys.** When `precision: 1` is set, inputs `5.123` and `5.124` both bucket to `5.1` and share the same cache entry. They also share validation outcomes: validation runs once per bucket (on first miss), and the result applies to every input that buckets there. Consumers who want stricter validation per input should set a tighter `precision` or omit it entirely (no bucketing).

Invalid inputs never poison the cache (validation runs on miss, before cache write). Aggregating failures (instead of first-failure-wins) lets consumers see and fix everything wrong in one shot rather than chasing errors one at a time.

```ts
import { ValidationError } from 'unitforge';

class ValidationError extends Error {
  readonly inputs: Record<string, unknown>;       // the input object that was rejected
  readonly failures: Array<{
    key: string | 'all';                          // which validator
    stage: 'forge-config' | 'conversion';         // which layer it came from
    value: unknown;                               // the value that validator saw
    message: string;                              // the validator's error string
  }>;
}
```

Throwing (rather than returning a Result type) is the v1 contract; idiomatic JS, simpler converter return type. A Result-typed `forgeOrResult` variant can be added in a 0.x minor if anyone needs it.

### Implementation hints

These are not part of the public contract; they are notes to future-implementer-and-reviewer so the obvious-but-suboptimal version doesn't ship. None affects API shape; all can be retrofitted without breaking changes if benchmarks later demand them.

- **Pre-baked cache-key builder at `forge()` construction time.** The converter knows its input prop names from the conversion's `inputs` declaration. At construction, build a closure like `(input) => round(input.density, p) + '\x00' + round(input.volume, p)` once; reuse per cache lookup. Do NOT call `Object.keys(input).sort()` per call.
- **Pre-computed precision multiplier.** If `precision: 2`, rounding uses `Math.round(value * 100) / 100`. Compute `10 ** precision` once at `forge()` time and bind it in the closure; never call `Math.pow` per call.
- **Lazy `ValidationError.message` via self-overwriting getter.** Build the templated `[unitforge] validation failed for inputs ... ` string on first read of `.message`, not in the constructor; cache via `Object.defineProperty` on first access. Saves work when consumers handle errors programmatically (`instanceof ValidationError` + `.failures`) and never read `.message`. ~5 extra lines; standard memoized-getter pattern.

If real-world benchmarks ever show one of these matters more (or less) than expected, revise the implementation; the doc only commits to the call-time pipeline above, not to how it's structured internally.

### Why this shape

1. **Imports are configuration.** Units are imported from kits; conversions are imported from `src/conversions/`; `forge` itself is a free function. Bundlers see every dependency statically; no registry, no factory, no top-level mutation.
2. **Low-arity protocol.** `forge` always takes 3 args in the same order. The polymorphism is in `from`'s shape and `ForgeConfig`'s contents, not in the function signature.
3. **Compute authors only write base-unit physics.** They never see units. The decorator handles every gallon-vs-liter mismatch transparently.
4. **One conversion, infinite forged converters.** The same `defineConversion` value is reused across any number of `forge` call sites with different unit pairings; the conversion stays unit-agnostic, the converter is unit-specific.
5. **End-user custom units are first-class.** An app can call `defineUnit` in userland and pass the result to `forge`; forge cannot tell it apart from a kit-shipped unit.
6. **Tree-shaking-friendly userland pattern.** Consumers typically collect their forged converters in a project-local module (`src/forge.ts` or similar) that imports only the units and conversions it actually uses from `unitforge`; nothing else in the library is reached, and the project ships a minimal slice.

### Cross-dimensional error surface

Cross-dimensional misuse is enforced primarily at compile time. The TypeScript signature of `forge` requires that when `from` is an object shape, `ForgeConfig` includes a conversion value, and that the property keys and dimensions of `from` align with the `inputs` of the supplied conversion. Mismatches surface as type errors, not runtime crashes.

For runtime construction (consumers building `forge` arguments dynamically), the library still throws a teaching error:

```
[unitforge] forge() received an object-shaped `from` with no `via:` in ForgeConfig.

`from` keys: { volume, density }
`to`: kilogram (dimension: mass)

Cross-dimensional forging requires a defineConversion value passed as `via:` in ForgeConfig. Example:

  import { massFromVolumeAndDensity } from 'unitforge/conversions/...';

  forge(
    { volume: gallon, density: poundPerGallon },
    kilogram,
    { via: massFromVolumeAndDensity }
  );
```

## File layout

```
unitforge/
├── src/
│   ├── index.ts                    // public API barrel: defineUnit, defineConversion, forge, linear, DEFAULT_MEMO_CAP, ValidationError
│   ├── dimensions.ts               // flat file; all built-in dimension constants
│   ├── forge.ts
│   ├── defineUnit.ts
│   ├── defineConversion.ts
│   ├── types.ts                    // Dimension, Unit, Conversion, ForgeConfig interfaces
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
│   │   ├── pharmacy/
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

### `package.json#exports` shape

The granular per-unit-per-file design requires a wildcard `exports` map; a hand-maintained entry-per-file table will rot. Target shape:

```json
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./dimensions": { "types": "./dist/dimensions.d.ts", "import": "./dist/dimensions.js" },
    "./kits/*": { "types": "./dist/kits/*/index.d.ts", "import": "./dist/kits/*/index.js" },
    "./kits/*/*": { "types": "./dist/kits/*/*.d.ts", "import": "./dist/kits/*/*.js" },
    "./conversions/*": { "types": "./dist/conversions/*.d.ts", "import": "./dist/conversions/*.js" },
    "./numeric/*": { "types": "./dist/numeric/*.d.ts", "import": "./dist/numeric/*.js" },
    "./validators": { "types": "./dist/validators/index.d.ts", "import": "./dist/validators/index.js" },
    "./errors": { "types": "./dist/errors.d.ts", "import": "./dist/errors.js" },
    "./package.json": "./package.json"
  }
}
```

ESM-only (`"type": "module"`, no `require` condition). Floor `engines.node: ">=20"` and `moduleResolution: "node16" | "nodenext" | "bundler"` for consumers; document this loudly in README.

When `unitforge/numeric/decimal` and `unitforge/numeric/fraction` ship, add to `package.json`:

```json
{
  "peerDependenciesMeta": {
    "decimal.js": { "optional": true },
    "fraction.js": { "optional": true }
  }
}
```

Without `optional: true`, every default `npm install unitforge` user sees a missing-peer warning and assumes the package is broken.

## Domain kits to ship at v1

Five kits, deliberately spanning four problem domains to demonstrate the thesis that unitforge is not a physics library:

1. **`si`** — meter, kilogram, second, kelvin, mole, ampere, candela; derived: square meter, cubic meter, newton, joule, watt, pascal, hertz. The default kit; demonstrates physics in SI base.
2. **`imperial`** — inch, foot, yard, mile, pound, ounce, fluid ounce, gallon, quart, pint, cup. Demonstrates physics in US/UK customary; required for any US-market consumer; together with `si` shows mixed-system cross-dim forging.
3. **`cooking`** — tablespoon, teaspoon, cup with US/UK split, stick of butter, dash, pinch, fluid ounce, milliliter. Demonstrates a domain where dimensions are technically physics (volume, mass) but units are culturally specific and conversions are imprecise by tradition.
4. **`inventory`** (manufacturing) — each, dozen, gross, ream, score, pair, half-dozen, case, pallet, container. Demonstrates the `COUNT` dimension and the packaging-unit-as-`defineUnit`-in-COUNT pattern (a case of soda IS a unit; the conversion to "24 cans" is a separate `defineConversion`).
5. **`pharmacy`** (pharmacy inventory) — milligram, microgram, IU, mL dose, tablet, capsule, blister pack, vial. Demonstrates a domain with regulated units (USP/WHO conventions for IU), packaging-as-unit, and life-safety precision requirements.

These four problem domains (physics, cooking, manufacturing inventory, pharmacy inventory) are picked specifically to stress-test the cross-domain claim in the thesis. Adding more kits later (astronomy, historical, gaming, finance) extends the proof; the v1 set is the minimum needed to make the cross-domain claim credibly.

The chromonym precedent is to file an issue per future kit (parallel to chromonym issues #21–#30 for queued palettes). Each issue specifies source, license, scope-fit, version-pin discipline.

## Discipline rules

These rules are non-negotiable through v1; they are what holds the design together.

1. **Side-effect-free package.** `"sideEffects": false` in `package.json`; no top-level mutation; no auto-registration. Every export is reachable only through explicit named import.
2. **Single-hop conversions only.** The library never searches for a conversion path. If a consumer needs multi-step, they declare a multi-step conversion as one `defineConversion`, or chain forged converters in userland.
3. **Dimensions are stable string identifiers.** Once shipped, `LENGTH = 'length'` cannot change its string value. Same stability contract as chromonym color-space identifiers.
4. **Kits can declare new dimensions but cannot redefine existing ones.** A `cooking` kit can extend `VOLUME` with `cup`; it cannot reassign `VOLUME` to mean something else.
5. **Each direction of a conversion is its own `defineConversion` value.** No auto-derived inverses. If both `massFromVolumeAndDensity` and `volumeFromMassAndDensity` are needed, both are declared. The names depict direction; per-file surface area stays small. Celsius/Fahrenheit-style offsets are the canonical case for why naive symmetry breaks.
6. **Numeric type is pluggable but defaults to native `number`.** Heavy numeric adapters (decimal.js, fraction.js) are peer dependencies; consumers install them only if they need them.
7. **Per-unit precision is a property of the unit definition, not a global config.** Specific units that must be tracked tighter than the instance default declare their precision in `defineUnit`.
8. **No instance factory.** Public API is free functions. Period.
9. **Granular per-unit files.** Each kit is a folder of one-unit-per-file modules with a barrel `index.ts`. Whole-kit `import *` works for convenience; named imports work for tree-shaking.
10. **Naming convention enforced by lint.** A small dev-only checker greps for `defineUnit`/`defineConversion` calls and the export they're assigned to, verifying that the export name matches the filename in camelCase. `defineUnit` carries a `name:` field whose value must also match. (`defineConversion` no longer carries a `name:` field; the export-name + filename pair is the contract.) Initial form: ~50 lines of regex; ship as project pre-commit hook; extract as `unitforge-lint` if it earns its keep.
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

If runtime configuration of atomic later proves necessary, it can be added as an option to `defineUnit` or `ForgeConfig`, but the default path is "import the kit that matches your storage."

## What unitforge inherits from chromonym (boilerplate specimen)

The following are mirrored directly from chromonym's repository structure with minimal adaptation:

- **Build/runtime**: Bun, TypeScript, ESM, biome for lint+format.
- **Type checker**: tsgo (the native TypeScript checker; chromonym uses it).
- **Test runner**: bun test with codecov reporting.
- **Knip**: unused-export detection.
- **Vite-based demo**: lives in `demo/`, deployed via `deploy-demo.yml` GitHub Action.
- **CI workflows**: `ci.yml` (lint+test+typecheck), `deploy-demo.yml` (vite build + GitHub Pages or Vercel), `link-check.yml` (markdown link rot), `scorecard.yml` (OpenSSF Scorecard).
- **Release**: semantic-release via `.releaserc.json`. CHANGELOG.md auto-generated. **npm provenance** enabled via `--provenance` (or `NPM_CONFIG_PROVENANCE=true` in CI env); `id-token: write` is already configured. Sigstore attestation is the highest-leverage supply-chain signal.
- **Community-health surface**: CODE_OF_CONDUCT.md, CONTRIBUTING.md, SECURITY.md, CODEOWNERS, FUNDING.yml, dependabot.yml, ISSUE_TEMPLATE/, PULL_REQUEST_TEMPLATE.md.
- **AGENTS.md**: agent-instructions file at root, references chromonym pattern.
- **NOTICE.md**: third-party attribution (kits citing external standards).
- **llms.txt**: machine-readable summary for LLM-driven consumers.

The substantive divergence from chromonym lives in `src/`, where the registries are different (dimensions, kits, conversions vs. chromonym's color-spaces, palettes, conversions).

## Pre-coding blockers

The following items must be resolved on paper before `src/` scaffolding begins. They shape the type machinery and the public surface; deferring them produces rework, not iteration.

1. **Lock `src/types.ts` first.** All public types (`Dimension`, `Unit<D>`, `Conversion<I, O>`, `ValidatorMap<I>`, `ForgeConfig`, `ValidationError`) must be sketched in a TypeScript playground with `expect-type` style checks before any implementation file ships. Generic inference for `forge` is the load-bearing concern: confirm that an object-shaped `from` literal narrows correctly, that `inputs` keys constrain `from` keys (extra keys rejected), and that dimension brands thread through. The TypeScript-DX review provided concrete signatures; adopt them as the starting point.

2. **~~`definePack` re-resolution.~~ Resolved 2026-05-09: dropped.** A packaging unit is just a `defineUnit` in the COUNT dimension (a spool of tape IS a unit, not a wrapper around feet), paired optionally with a `defineConversion` to the inner dimension when conversion is needed. No special primitive; the library stays at three factories.

3. **~~`toBase` shape for non-linear units.~~ Resolved 2026-05-09.** `Unit` carries TWO function fields, `toBase: (value: number) => number` and `fromBase: (base: number) => number`. Both are always functions; never auto-derived from each other; mirrors the "each direction of a cross-dim conversion is its own declared `defineConversion`" principle. Linear units are not special-cased in the type; their `toBase`/`fromBase` are trivial multiply/divide functions. A `linear(scale)` helper ships alongside `defineUnit` at v1 to reduce boilerplate on the common case (returns the `{ toBase, fromBase }` pair from a scale factor).

4. **`Conversion` value identity.** Two structurally-identical `defineConversion` values are interchangeable to the type system; passing the wrong one type-checks but produces silent-wrong physics. Decide whether to brand `Conversion` with a stamped id (filename, UUID, or symbol) so `via:` carries identity not just shape, and whether `forge` runtime-asserts the identity matches at wiring time.

5. **Memoization defaults and bounds.** Eviction policy, default LRU cap, max allowable cap, NaN/±Infinity/-0 handling, and the `{memoize: true} | {memoize: {max: N}}` polymorphism. Either ship a fully-spec'd memoization in v1 or reserve the field name and ship the implementation in 0.x.

6. **README ↔ PLANNING.md source-of-truth rule.** Doc currently states "when this document and the README disagree, the README wins." For pre-1.0, this is backwards (README is the slowest-to-update artifact). Either invert the rule for pre-1.0 or commit to README updates landing in the same PR as PLANNING updates. Pick one and write it down.

## Open questions to resolve before v1

1. **~~`ForgeConfig` field name for the cross-dim conversion.~~ Resolved 2026-05-09: `with:`.** `via:` was the working name while the value was a single function reference. Once the value became a structured spec (validators + compute + future fields), `with:` reads more naturally ("forge this converter *with* this conversion spec"). Reserved word in JS strict mode but legal as an object key.
2. **Vocabulary review across the whole API surface.** Settle on a unified vocabulary for the `define*` factories, the `Forge*` types, and the field names inside `ForgeConfig`. Goal is internal consistency, not just per-symbol rightness. Working instinct: keep `defineConversion`; everything else open.
3. **~~`definePack` re-resolution.~~ Resolved 2026-05-09: dropped.** See pre-coding blocker #2.
4. **~~`format` API surface.~~ Resolved 2026-05-09: collapsed to an optional `ForgeConfig.format: (value: number) => string` field.** No standalone `format` primitive; no plural/locale/abbreviation logic in the library. When supplied, the forged converter exposes a `.format(input)` convenience method that runs convert + format. Display is the view's job; the library does conversion.
5. **Custom dimension scoping.** Two third-party kits both export `MANA = 'mana'`. The library currently trusts strings. Document the prefix-your-custom-dimensions convention; do not enforce.
6. **TypeScript inference and generics for `forge`.** Confirm that the type system narrows the converter's argument and return types correctly for both single-Unit `from` and object-of-Units `from`, and that key/dimension misalignment between `from` and the supplied conversion's `inputs` surfaces as a compile error rather than a runtime crash.
7. **Subpath exports for size variants of large kits.** Pharmacy and inventory in particular could ship `core` vs `full` variants. Mirror chromonym Munsell #22's approach.
8. **~~Validation helpers (`unitforge/validators` subpath).~~ Deferred 2026-05-09; revisit after first pass.** Plain functions in `validate` are sufficient for v1. The helper combinators (`min`, `max`, `range`, `nonNeg`, `positive`, `nonZero`, `integer`, `finite`, `all`, `any`, `not`, `withMessage`) are primarily author/extender convenience; the right shape will be obvious after writing the kits and seeing repeated patterns. Refactor in post-first-pass.

9. **~~Memoization as a `ForgeConfig` option.~~ Resolved 2026-05-09 (modulo eviction-policy add-ons; see below).** `memoize` is a single-typed field: `memoize?: number`. Present and `> 0` enables memoization with that value as the LRU cap; `0` or absent disables. This avoids a discriminated `boolean | { max: number }` shape per the no-heterogeneous-types rule. A `DEFAULT_MEMO_CAP` constant (1024) ships from the main barrel for ergonomic opt-in.

   Design decisions:
   - **Per-converter cache.** Each `forge()` call returns a converter with its own internal `Map`; caches do not cross converters. Because prop names are fixed within one converter, the cache key only needs values; prop names are implicit in the stable iteration order.
   - **Cache-key algorithm:** sort the input's prop names, apply precision rounding to each value if `precision` is set, join the values with a non-numeric delimiter (lean `\x00` to avoid collisions with `-` for negative numbers). For single-Unit `from`, the key is just the (rounded) value. No `JSON.stringify`, no hashing.
   - **Precision in `ForgeConfig` does double duty:** output rounding AND cache-key normalization. With `{ precision: 1 }`, inputs `5.123` and `5.124` both bucket to `5.1` and hit the same cache entry. This is the property that makes memoization pay for itself.
   - **Cache structure:** native JS `Map` (insertion-order LRU; on insert if size > cap, delete `map.keys().next().value`). ~15 lines, no dependencies.
   - **Default cap when consumer types `{ memoize: DEFAULT_MEMO_CAP }`:** 1024.
   - **Bounds:** `Number.isInteger(memoize) && memoize >= 0 && memoize <= 1_048_576`; out-of-range throws at `forge` time.
   - **NaN/±Infinity/-0:** never-cache NaN inputs, cache ±Infinity normally, coerce `-0` to `0` in the key.

   Still open: whether `forge` refuses to enable `memoize` on a trivially-cheap unary native-number converter (warn-and-ignore, or trust the consumer); whether to ship TTL eviction at v1 (lean: LRU only at v1, file an issue for TTL).

## Test strategy

Numerics libraries live or die on test discipline. The discipline below is non-negotiable from day one of `src/`.

- **Coverage target: 100% line + branch.** Matches chromonym discipline. Codecov gate.
- **Unit tests** for each primitive: `defineUnit`, `defineConversion`, `forge` (within-dim and cross-dim cases), `format` (when its surface lands), `ValidationError` construction and `.message` templating.
- **Property tests using `fast-check`** (already in devDependencies) for the load-bearing invariants:
  - **Round-trip identity within precision:** for any unit pair `(a, b)` in the same dimension, `forge(a, b)(forge(b, a)(x)) ≈ x`.
  - **Identity:** `forge(a, a)(x) === x` for every unit `a`.
  - **Within-dim transitivity:** `forge(a, c)(x) ≈ forge(b, c)(forge(a, b)(x))` for any three units in the same dimension.
  - **Inverse-pair roundtrip:** when both `aFromB` and `bFromA` exist (e.g., `massFromVolumeAndDensity` and `volumeFromMassAndDensity`), `bFromA(aFromB(x)) ≈ x` for all valid inputs. Catches inverse drift at PR time.
- **Cross-kit conversion matrix:** every pair of units in the same dimension across all v1 kits gets at least one example test (machine-generated; lives in `test/matrix/`).
- **Validator tests:** aggregation correctness (multiple failures collected), error message format stability, throw-as-failure handling, proto-pollution rejection (`__proto__`, `constructor`, `prototype` keys rejected at definition time).
- **Memo cache tests:** key collision impossibility, eviction policy correctness, NaN/Infinity/-0 handling, precision-as-cache-bucket behavior.
- **Type-level tests** using `expect-type` or `tsd`: confirm `forge` generic inference produces the correct converter signature for both unary and object shapes; confirm key/dimension misalignment surfaces a compile error; confirm `Dimension` autocomplete preserves built-in literals.
- **Bench harness in `bench/`** with at least three benchmarks (single-unit fast path, cross-dim 2-input cold path, cross-dim 2-input + memo). Numbers published in README; CI fails on regression > 20%.

## Versioning and stability

Semver applies; the question is what counts as a breaking change for a registry library.

| Change | Bump |
|---|---|
| Adding a dimension constant to `dimensions.ts` | minor |
| Adding a kit | minor |
| Adding a unit to an existing kit | minor |
| Adding a conversion to `src/conversions/` | minor |
| Adding a field to `ForgeConfig` (optional) | minor |
| Renaming a kit subpath (e.g., `kits/inventory` → `kits/manufacturing`) | major |
| Renaming a unit's exported name | major |
| Changing a unit's `toBase` (other than bug fix) | major |
| Changing the public API surface (`defineUnit`, `defineConversion`, `forge`, `format` signatures) | major |
| Changing a `defineConversion`'s `compute` (semantics change, not bug fix) | major |
| Bug fix in `compute` that changes returned values | patch (with prominent CHANGELOG entry) |
| Changing the wording of a `ValidationError.failures[].message` string | patch (strings are unstable; consumers must not grep them) |
| Changing the wording of a teaching error message (e.g., "no `via:` in ForgeConfig") | patch (shape stable; wording unstable) |

Pre-1.0 (`0.x.y`): minor bumps may include breaking changes per Conventional Commits + semantic-release defaults. The discipline above kicks in at 1.0.

Deprecation policy: a unit, kit, or conversion marked deprecated stays exported for at least one minor cycle (e.g., deprecated in `1.4.0`, removed no earlier than `2.0.0`). Deprecation surfaces via JSDoc `@deprecated` tag (IDE-visible), CHANGELOG entry, and a one-line warning in the README's "Deprecations" section.

## Next steps

Repo, license, community-health files, and CI workflows are already in place (status as of 2026-05-09). Remaining:

1. Resolve the open questions above to a degree sufficient to commit to type signatures (especially #2 vocabulary review, #3 `definePack` re-resolution, #6 generics for `forge`, #8 validators subpath, #9 memoization v1-vs-post-v1).
2. Scaffold `src/` skeleton against the new API: `index.ts` barrel, `dimensions.ts`, `types.ts`, stub `forge.ts`, `defineUnit.ts`, `defineConversion.ts`, `format.ts`, `errors.ts` (for `ValidationError`), and empty `kits/` and `conversions/` folders.
3. Scaffold `demo/` as a vite app with placeholder content.
4. Implement v1: `si`, `imperial`, `cooking`, `inventory`, `pharmacy` kits and supporting conversions.
5. Write README hero block; the test of design coherence is whether the hero block fits in under 30 lines and reads cleanly.
6. File issues for queued kits (analog of chromonym #21–#30).

## Appendix: design conversation summary

This document distills two design conversations.

**Conversation 1 (project inception, 2026-04-27)** explored:

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

That conversation produced an initial four-function API (`convert`, `format`, `defineUnit`, `defineConversion`, plus `definePack` sugar).

**Conversation 2 (API refactor, 2026-05-09)** revisited the API and replaced the four-function shape with the current three-primitive shape:

- The two-step factory insight: provision a converter once with `forge(from, to, ForgeConfig?)`, then call it many times. Analogous to a linear-scaling-function constructor.
- `forge` chosen as the factory verb. `defineUnit` retained because units are interface-shaped data and `forge` should accept anything matching that interface; this keeps end-user custom units first-class.
- Cross-dimensional inputs generalized: `from` can be an object whose properties are independently-chosen Units (length in meters, width in inches, etc.). The shape of `from` determines the shape of the converter's call site.
- `defineConversion` retained but reframed: `inputs` is now keyed by property name → dimension, `compute` is written in base units, and the library decorates it to handle unit→base normalization. One conversion, infinite forged converters across mixed unit systems.
- Cross-domain v1 kit set decided: physics (`si` + `imperial`), `cooking`, `inventory` (manufacturing), `pharmacy`. Picked specifically to stress-test the "not just physics" thesis.

The thesis line: *units and conversions as values you import; one factory verb (`forge`) that returns the converter; cross-domain by construction, not just physics.*
