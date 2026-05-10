# unitforge: Planning Document

A planning artifact captured at project inception. **For pre-1.0**, this document is the live source of truth for design intent; the README is a slower-moving public artifact and any contradiction between them is resolved by updating the README to match. When this document and the code disagree, update this document. Post-1.0, the README's published API contract takes precedence.

## Project metadata

- **Name**: unitforge
- **Package name (npm)**: `unitforge`
- **Location**: `~/Simiancraft_Programming/Simiancraft/unitforge`
- **Sibling reference**: `~/Simiancraft_Programming/Simiancraft/chromonym` is the architectural specimen
- **Author**: simiancraft / the-simian
- **License**: MIT (matching chromonym)
- **Status**: pre-alpha; `0.0.0` published as a name reservation; v1 implementation pending

## Thesis

**A units library where the units, dimensions, and conversions are all values you import; and the API is three free functions.**

Phrased differently for marketing: *a units library that doesn't assume you're doing physics.* Inventory, lab assays, game state, astronomy, finance, and SI-physics all get the same shape.

This thesis is the single load-bearing decision the library is committing to. Everything in the rest of this document is a consequence of it.

## What unitforge does that other libraries don't

The npm landscape was surveyed before commit:

- **convert-units**: closest existing match for countable units (ships `Pieces` measure with dozen/gross/ream); last stable 2018, perpetual 3.0 beta.
- **convert (jonahsnider/convert)**: function-first API, best TS ergonomics; closed-set unit list, no runtime extension.
- **mathjs units**: `createUnit` exists but global mutable state in a 9.4 MB dep.
- **unitmath**: closest on configurable atomic and pluggable numeric; class-based, low adoption.
- **safe-units**: strongest type-level dimensional analysis; cryptic compile errors, slow builds, library-author-shaped extensibility.
- **uom (dividab)**, **js-quantities**: pure SI dimensional, no countable units.

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

### (1) Dimensions: flat list, no dependencies

A dimension is a string constant. Every unit declares its dimension. Conversions only happen within a dimension by default; cross-dimensional conversions require an explicit `defineConversion` value passed at the call site via `ForgeConfig.via`.

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

The naive `| string` union would collapse the entire union to `string` in TypeScript's eyes, killing autocomplete for the built-in dimensions. The `(string & {})` brand keeps the literals visible while still accepting arbitrary strings.

### (2) Kits: domain-organized bundles of units

A kit is a folder under `src/kits/<domain>/` containing one file per unit, plus an `index.ts` barrel. Kits depend on dimensions but not on conversions. A kit may declare new dimensions inline if it introduces a domain not yet in the built-in dimension list (e.g., a `gaming` kit might export `AFFINITY`, `LOYALTY` alongside its units).

Two import patterns supported:

```ts
// Granular: best tree-shaking, named imports
import { meter, foot } from 'unitforge/kits/imperial';

// Whole domain: convenience, barrel import
import * as cooking from 'unitforge/kits/cooking';
```

Each unit is a value produced by `defineUnit` (full spec under "API shape > `defineUnit`" below).

#### Polysemy and kit composition

Many domains reuse the same word for different concepts: `weight` (mass-under-gravity vs statistical significance), `stress` (mechanical vs psychological vs financial), `flux` (electromagnetic vs heat vs flow rate). The library does not invent a global naming scheme to disambiguate; it leans on standard ESM mechanics. This is a **strength**, not a hazard: kit authors curate, end users always know what menu they're building.

Three layers of disambiguation are available, any one sufficient on its own:

```ts
// Call-site rename (consumer code).
import { weight as physicalWeight }     from 'unitforge/conversions/mechanics';
import { weight as statisticalWeight }  from 'unitforge/conversions/statistics';

// Export-side rename (kit-author code; src/kits/everything-w/index.ts).
export { weight as physicalWeight }    from '../mechanics/weight';
export { weight as statisticalWeight } from '../statistics/weight';

// Namespace import (verbose but explicit).
import * as Classical    from 'unitforge/conversions/classical';
import * as Relativistic from 'unitforge/conversions/relativistic';
forge({mass: kg, velocity: mps}, joule, { via: Classical.kineticEnergy });
```

Tree-shaking is preserved at all three layers. Per-unit-per-file modules under `sideEffects: false` mean consumers only pay for the units they actually import, even when a barrel re-exports many. Composition costs no bytes the consumer didn't ask for. Namespace import requires **static** member access (`Classical.kineticEnergy`); dynamic access (`Classical[someVar]`) defeats tree-shaking.

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

// The conversion to inner content (length). 1 spool = 100 inches of tape.
// LENGTH base is the meter; 100 in = 2.54 m, so multiplier per spool is 2.54.
export const lengthFromSpoolOfTape = defineConversion({
  inputs:  { spools: COUNT },
  output:  LENGTH,
  compute: ({ spools }) => spools * 2.54,
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

// 1 case = 24 cans (COUNT base "each"). 1 can = 0.355 L (12 fl oz).
export const caseOfSoda = defineUnit({
  name: 'case-of-soda', dimension: COUNT,
  toBase: (n) => n * 24, fromBase: (each) => each / 24,
});
export const canOfSoda = defineUnit({
  name: 'can-of-soda', dimension: COUNT, ...linear(1),
});
export const volumeFromCanOfSoda = defineConversion({
  inputs: { cans: COUNT }, output: VOLUME,
  compute: ({ cans }) => cans * 0.000355,  // L → m³ (VOLUME base)
});

// COUNT → COUNT: forge handles via toBase/fromBase. No conversion needed.
forge(caseOfSoda, canOfSoda)(1);   // 24 cans
forge(canOfSoda, caseOfSoda)(48);  // 2 cases

// COUNT → VOLUME: cross-dim, needs the conversion.
const sodaVolume = forge({ cans: canOfSoda }, liter, { via: volumeFromCanOfSoda });
sodaVolume({ cans: 24 });          // 8.52 L (one case worth)
```

**Two ways to ask "how many liters in 1 case":** (a) userland chain via two forged converters, or (b) a single-shot case→volume conversion. The library stays single-hop; if a multi-step shortcut is frequently needed, encode it as one conversion.

**Implicit-but-tolerable.** The COUNT dimension does not distinguish "case-of-soda" from "case-of-paperclips" at the type level. The conversion's name is the contract; the type system cannot catch a wrong-but-shape-matching unit. Custom dimensions (`SODA_COUNT`) could enforce this at the type level if it ever matters in a specific kit, but that is a domain-author choice, not a library default.

**Co-locating the pack and its conversion.** A pack and its primary inner conversion typically ship from the same module file; the kit's `index.ts` barrel re-exports both. Consumers import one, the other, or both, depending on what they need.

### (3) Conversions: flat folder of single-purpose files

A conversion is a cross-dimensional bridge. Each lives as one file under `src/conversions/`. Naming convention: `<output>From<input1>And<input2>And<...>`. The filename is the contract.

```
src/conversions/
├── massFromVolumeAndDensity.ts
├── pressureFromForceAndArea.ts
├── weightFromMass.ts
├── weightFromVolumeAndDensity.ts        // multi-step composed conversion
├── ohmsLaw.ts
└── kineticEnergy.ts
```

Conversions are explicit, single-hop, and never traversed by the library. If a developer wants a multi-step path (volume → mass → weight), they either define the multi-step path as a single conversion with a compute function that internally composes the steps, or chain forged converters in userland. The library never searches for paths or composes conversions automatically.

The full `defineConversion` shape appears under "API shape > `defineConversion`" below. Filename, export name, and the dimensional contract together form the per-file contract; there is no separate `name:` field in the conversion value.

## API shape

Three primitives form the public surface:

```ts
import { defineUnit, defineConversion, forge } from 'unitforge';
```

The library does conversion; display is entirely the view's job. There is no `format` primitive, no `definePack` sugar, no instance factory, and no `NumericAdapter` interface. (Each was considered and rejected during design; see "Appendix: design history" for rationale.)

### `defineUnit`

A unit is a value produced by `defineUnit`. Kits export these.

The `Unit` interface carries two functions: `toBase` (this unit's value → base unit's value) and `fromBase` (base unit's value → this unit's value). Both are always functions; neither is auto-derived from the other (mirrors the principle that each direction of a relationship is its own declared thing).

```ts
// Linear, base unit.
export const meter = defineUnit({
  name: 'meter', dimension: LENGTH,
  ...linear(1), base: true,
});

// Linear, non-base.
export const foot = defineUnit({
  name: 'foot', dimension: LENGTH,
  ...linear(0.3048),
});

// Non-linear: offset.
export const celsius = defineUnit({
  name: 'celsius', dimension: TEMPERATURE,
  toBase:   (c) => c + 273.15,
  fromBase: (k) => k - 273.15,
});

// Non-linear: offset + scale.
export const fahrenheit = defineUnit({
  name: 'fahrenheit', dimension: TEMPERATURE,
  toBase:   (f) => (f - 32) * 5/9 + 273.15,
  fromBase: (k) => (k - 273.15) * 9/5 + 32,
});
```

`linear(scale)` is sugar for the common linear case; expands to `{ toBase: (v) => v * scale, fromBase: (b) => b / scale }`. Saves ~50% boilerplate on every linear unit. Ships from the main barrel. Signature: `linear(scale: number) => { toBase: (v: number) => number; fromBase: (b: number) => number }`; `T = number`-only sugar; future precision-typed kits write `toBase`/`fromBase` longhand (see "Numeric precision").

The output of `defineUnit` is interface-shaped data. Anything that satisfies the `Unit` interface is a unit, whether kit-shipped or user-defined a minute ago in app code. End-user custom units are first-class for this reason.

### `defineConversion`

A conversion is a value produced by `defineConversion`. It declares a dimensional contract, optional input validators, and the base-unit math that fulfills it. Conversions live under `src/conversions/` and are imported on demand.

```ts
export const massFromVolumeAndDensity = defineConversion({
  inputs: { volume: VOLUME, density: DENSITY },
  output: MASS,
  validate: {
    volume:  (v) => v >= 0 || 'volume must be >= 0',
    density: (d) => d >  0 || 'density must be > 0',
    _all: ({ volume, density }) => volume * density < 1e9 || 'mass exceeds safe range',
  },
  compute: ({ volume, density }) => volume * density,
});
```

`inputs` is an object mapping property names to **dimensions** (not units). `output` is **either a single dimension OR an object mapping property names to dimensions** (for n-in / m-out conversions like 2D scaling, vector rotation, color-space transforms with multiple channels). `compute` is written in **base units of the declared dimensions**; its return type matches `output`'s shape (scalar `T` for single-dimension output, `{ [K in keyof Output]: T }` for object output). The library decorates `compute` so unit normalization happens at call time (compute author never writes unit conversion logic).

A scalar-output example is shown above. An object-output example (window pixel-to-CSS scaling):

```ts
// Note: `compute` MUST be a pure function of its inputs. To make a DPR-aware
// scaler pure, treat DPR as an input dimension rather than an external read:
const DPR = 'device-pixel-ratio' as const;

export const screenPxToCssPx = defineConversion({
  inputs:  { width: SCREEN_PX, height: SCREEN_PX, dpr: DPR },
  output:  { width: CSS_PX,    height: CSS_PX    },
  compute: ({ width, height, dpr }) => ({
    width:  width  / dpr,
    height: height / dpr,
  }),
});
// Consumers pass the live DPR value at the call site; the compute stays pure
// and the cache keys correctly bucket by DPR.
```

`validate` is optional and carries the conversion's universal input invariants:

- **Per-property validators** (keyed by `inputs` property names) run on each input independently.
- **Whole-object validator** (`_all`) runs on the destructured input object as a whole, for cross-property invariants. Leading underscore signals "library-reserved special key" and avoids collision with any input literally named `all`.
- Validators return `true` (or `undefined`) to pass, or a string to reject with that message. Throwing is the escape hatch for third-party validators.
- Conversion-layer validators see **user-supplied values in user-chosen units** and should stick to unit-invariant checks (sign, integer, finite, NaN). Unit-specific range checks belong at the call site in `ForgeConfig.validate`.
- Validators MUST be pure functions of their inputs; cache hits skip validators entirely (see "Call-time pipeline" below). A validator that depends on external state (clocks, counters, request context) silently behaves wrong on memoized converters.

Each direction of a relationship is its own `defineConversion` value. No auto-derived inverse; if both `massFromVolumeAndDensity` and `volumeFromMassAndDensity` are needed, both are declared.

### `forge`

`forge` produces a converter function. Call shape is always three positional arguments, in the same order, every time:

```ts
forge(from, to, ForgeConfig?)
```

Both `from` and `to` accept either a single `Unit` OR an object whose properties are Units. The shape of each slot determines the shape of the converter's call site:

```ts
// 1. Within-dimension: from is a Unit, to is a Unit; converter is unary.
const footToInch = forge(foot, inch);
footToInch(5); // => 60

// 2. Cross-dimensional, single output: from is an object of Units, to is a Unit.
import { gallon, poundPerGallon, cup } from 'unitforge/kits/imperial';
import { kilogram, gram } from 'unitforge/kits/si';
import { massFromVolumeAndDensity } from 'unitforge/conversions/massFromVolumeAndDensity';

const galPpgToKg = forge(
  { volume: gallon, density: poundPerGallon },
  kilogram,
  { via: massFromVolumeAndDensity }
);
galPpgToKg({ volume: 5, density: 8.3 });

// 3. Cross-dimensional, object output: from and to are both objects of Units.
import { screenW, screenH, cssW, cssH } from 'unitforge/kits/screen';
import { screenPxToCssPx } from 'unitforge/conversions/screenPxToCssPx';

const resize = forge(
  { width: screenW, height: screenH },
  { width: cssW,    height: cssH    },
  { via: screenPxToCssPx }
);
resize({ width: 1920, height: 1080 }); // { width: 960, height: 540 }

// the SAME defineConversion value is reused across N forge sites with different unit pairings
const cupPpgToG = forge(
  { volume: cup, density: poundPerGallon },
  gram,
  { via: massFromVolumeAndDensity }
);
```

A fourth case (`from: Unit, to: object of Units`, e.g., scalar → 2D vector) is type-system-supported but rare; no v1 worked example.

`ForgeConfig` is an open extensibility surface; a plain TypeScript interface that consumers construct as an object literal at the call site. Fields:

| Field | Type | Purpose |
|---|---|---|
| `via` | `Conversion` | Cross-dim conversion value. Required when `from` is object-shaped. |
| `validate` | per-property + `_all` map | Call-site validators. Same shape as `defineConversion.validate`; *additive* (does not override the conversion's invariants). |
| `precision` | `number` | Output rounding AND cache-key normalization. |
| `memoize` | `number` | LRU cap; `0` or absent = off. Bounds `[0, 1_048_576]`. `DEFAULT_MEMO_CAP = 1024` ships as a constant. |

```ts
forge(
  { volume: gallon, density: poundPerGallon },
  kilogram,
  {
    via: massFromVolumeAndDensity,
    validate: { volume: (v) => v <= 1000 || 'this app caps at 1000 gal' },
    memoize: DEFAULT_MEMO_CAP,
    precision: 2,
  }
);
```

Output formatting (plural, locale, abbreviation, i18n) lives entirely in the consumer's view layer. The library does no string work.

### Public type sketch (canonical)

This is the single source of truth for the public type surface. The implementer locks `src/types.ts` against this; reviewers verify against this; no other section overrides it.

```ts
// ─── Dimensions ──────────────────────────────────────────────────────────

// Branded-string union: built-in literals preserve autocomplete, custom strings accepted.
export type Dimension =
  | typeof LENGTH
  | typeof AREA
  | typeof VOLUME
  | typeof MASS
  | typeof WEIGHT
  | typeof TIME
  | typeof VELOCITY
  | typeof ACCELERATION
  | typeof FORCE
  | typeof PRESSURE
  | typeof ENERGY
  | typeof POWER
  | typeof DENSITY
  | typeof TEMPERATURE
  | typeof ENTROPY
  | typeof VOLTAGE
  | typeof CURRENT
  | typeof RESISTANCE
  | typeof AMOUNT
  | typeof LUMINOUS_INTENSITY
  | typeof COUNT
  | typeof INFORMATION
  | typeof ANGLE
  | typeof FREQUENCY
  | (string & {});

// ─── Units ───────────────────────────────────────────────────────────────

export interface Unit<D extends Dimension = Dimension, T = number> {
  readonly name: string;
  readonly dimension: D;
  readonly toBase:   (value: T) => T;
  readonly fromBase: (base:  T) => T;
  readonly base?: boolean;
}

// `forge`'s `from` and `to` slots accept either a single `Unit` or an
// object whose properties are `Unit`s; the three overloads below encode
// the four combinations directly. No `UnitContainer` alias is exported,
// because the overloads do not literally use one and an exported alias
// would be public surface that the actual API never references.

// ─── Validators ──────────────────────────────────────────────────────────

// Per-property validators keyed by `inputs` keys, plus optional cross-property `_all`.
// JSDoc on each function value-position: "Must be a pure function of its input.
// Validators are skipped on cache hits."
export type ValidatorMap<
  Inputs extends Record<string, Dimension>,
  T = number,
> =
  & { [K in keyof Inputs]?: (value: T) => true | string }
  & { _all?: (vals: { [K in keyof Inputs]: T }) => true | string };

// ─── Conversions ─────────────────────────────────────────────────────────

// Output can be a single dimension OR a record of dimensions.
// compute's return shape mirrors output's shape.
export interface Conversion<
  Inputs extends Record<string, Dimension>,
  Output extends Dimension | Record<string, Dimension>,
  T = number,
> {
  readonly inputs: Inputs;
  readonly output: Output;
  readonly validate?: ValidatorMap<Inputs, T>;
  readonly compute: Output extends Dimension
    ? (vals: { [K in keyof Inputs]: T }) => T
    : (vals: { [K in keyof Inputs]: T }) => { [K in keyof Output]: T };
}

// ─── ForgeConfig ─────────────────────────────────────────────────────────

// `via` and `validate` are typed loosely on the standalone interface; the
// `forge` overloads below re-narrow them via intersection with the call's
// inferred `Inputs`/`Output`. A consumer who hovers `ForgeConfig.via` on
// the standalone interface sees the loose type; a consumer who hovers
// inside an actual `forge(...)` call gets the narrowed shape (correct keys,
// correct dimensions, correct T).
export interface ForgeConfig<T = number> {
  /** Cross-dim conversion value. Required when `from` is object-shaped. */
  via?: Conversion<Record<string, Dimension>, Dimension | Record<string, Dimension>, T>;

  /** Call-site validators, additive on top of the conversion's own. */
  validate?: ValidatorMap<Record<string, Dimension>, T>;

  /** Output rounding AND cache-key normalization. Native-number only at v1.
   *  Non-negative integer; `0` means "round to integer"; absent means no rounding. */
  precision?: number;

  /** LRU cap. 0 or absent = off. Bounds [0, 1_048_576]. DEFAULT_MEMO_CAP = 1024. */
  memoize?: number;
}

// ─── forge overloads ─────────────────────────────────────────────────────

// 1. Within-dimension. Both Units. No via.
//    `via?: never` constraint prevents this overload from accidentally matching
//    cross-dim calls where the consumer mistakenly passed a `via:` value.
export function forge<D extends Dimension, T = number>(
  from: Unit<D, T>,
  to:   Unit<D, T>,
  config?: Omit<ForgeConfig<T>, 'via'> & { via?: never },
): (value: T) => T;

// 2. Cross-dim. Object input → single-Unit output. Via required.
//    Intersection re-narrows both `via` and `validate` to the call's `Inputs`.
export function forge<
  Inputs extends Record<string, Dimension>,
  Output extends Dimension,
  T = number,
>(
  from:   { [K in keyof Inputs]: Unit<Inputs[K], T> },
  to:     Unit<Output, T>,
  config: ForgeConfig<T> & {
    via:       Conversion<Inputs, Output, T>;
    validate?: ValidatorMap<Inputs, T>;
  },
): (input: { [K in keyof Inputs]: T }) => T;

// 3. Cross-dim. Object input → object output. Via required.
//    Intersection re-narrows both `via` and `validate` to the call's `Inputs`.
export function forge<
  Inputs extends Record<string, Dimension>,
  Output extends Record<string, Dimension>,
  T = number,
>(
  from:   { [K in keyof Inputs]: Unit<Inputs[K], T> },
  to:     { [K in keyof Output]: Unit<Output[K], T> },
  config: ForgeConfig<T> & {
    via:       Conversion<Inputs, Output, T>;
    validate?: ValidatorMap<Inputs, T>;
  },
): (input: { [K in keyof Inputs]: T }) => { [K in keyof Output]: T };

// ─── ValidationError ─────────────────────────────────────────────────────

export class ValidationError extends Error {
  readonly inputs: Record<string, unknown>;
  readonly failures: Array<{
    key: string | '_all';
    stage: 'call-site' | 'definition';
    value: unknown;
    message: string;
    /** Original thrown error if the validator threw (vs returned a string).
     *  Preserves zod/yup `ZodError` etc. so consumers can downcast via `.cause`. */
    cause?: unknown;
  }>;
  // .message via lazy self-overwriting getter (see Implementation hints).
}

// ─── Sugar ───────────────────────────────────────────────────────────────

// Linear-only sugar; T = number-only.
export function linear(scale: number): {
  toBase:   (v: number) => number;
  fromBase: (b: number) => number;
};

// Default LRU cap when consumer types `{ memoize: DEFAULT_MEMO_CAP }`.
export const DEFAULT_MEMO_CAP: 1024;
```

**Type-uniform `T`.** Every primitive that operates on values is parameterized over `T` with `T = number` default. v1 consumers writing native-number units never see the `T` parameter; future precision-sensitive kits specialize to `T = Decimal` (or `Fraction`, `BigInt`, etc.) without library changes. `T` must be uniform across one `forge` call (mixing Decimal-typed and number-typed units in one call is a type error).

**Pre-coding blocker #1 is satisfied by this sketch.** When `src/types.ts` is written, the playground exercise is to verify `expect-type`-style assertions against these signatures: object-shaped `from` narrows correctly; `inputs` keys constrain `from` keys (extra keys rejected); dimension brands thread through; `T` uniform; mixed-`T` rejected; missing `via` on object-shape `from` is a compile error; key/dimension misalignment between `from` and `via.inputs` is a compile error; object-output `to` shape matches conversion's `output` shape.

### Call-time pipeline

**Memoization is opt-in.** Every cache step below runs ONLY for converters whose `ForgeConfig.memoize` was set at construction time. For converters without memoize, the cache pathway does not exist at runtime; the hot path is just validators (if any) → normalize → compute → denormalize → return.

When the forged converter is invoked with input values:

1. **(Memoize-on only)** Compute cache key from the input.
2. **(Memoize-on only)** Cache check: if the key is present, return the cached value. Done.
3. **All validators run, no short-circuit.** Per-property and `_all` validators from both `ForgeConfig.validate` and `Conversion.validate` run together; every failure is collected.
4. **If any failures, throw a `ValidationError`.** No cache write.
5. **Normalize inputs to base units** via each `from` Unit's `toBase` function.
6. **Run `compute`** (in base units).
7. **Denormalize** the result to the `to` Unit via `toUnit.fromBase`.
8. **(Memoize-on only)** Write to cache.
9. **Return.**

**Cache-first, validators-on-miss-only** is intentional. Validators are required to be pure; a validator that passed once for a given input passes every time, so the cached result is validation-correct for that bucket. Re-running validators on cache hits would be duplicate work.

**Failure semantics for validators and `compute`:**

- **A validator that throws** is caught by the runner and converted into a `failure` entry with `key: '<the validator's key>'`, `stage: 'call-site' | 'definition'`, `value: <the input value the validator saw>`, `message: String(err.message ?? err)`. The aggregation never aborts; the thrown error becomes one failure record alongside any string-returning failures. This lets consumers drop in third-party validators (zod, yup, custom assertions) that signal failure by throwing without poisoning the rest of the run.
- **A validator that returns a non-string non-true value** (e.g., `false`, `0`, `null`) is treated as a pass. Validators MUST signal failure with a string return or a throw; silent falsy is intentionally NOT a failure indicator (it would conflict with predicate-style validators that return booleans).
- **`compute` that throws** propagates raw to the caller. The library does not catch compute errors; if `compute` is buggy or asserts an invariant, the consumer's call site receives the error directly. No cache write on a thrown compute.
- **`compute` that returns `NaN` or `±Infinity`** is returned as-is to the caller and is **not cached** (mirroring the input-side rule that NaN inputs are never cached). Downstream `precision` rounding on `NaN` would propagate `NaN`; on `Infinity` would propagate `Infinity`. Consumers who want to reject these values should validate them in a downstream wrapper.

**Consequence of precision-bucketed cache keys.** When `precision: 1` is set, inputs `5.123` and `5.124` both bucket to `5.1` and share the same cache entry AND validation outcome (validation runs once per bucket on first miss). Consumers who want stricter per-input validation should set a tighter `precision` or omit it.

**Cache-key algorithm.** Sort the input's prop names, apply precision rounding to each value if `precision` is set, stringify each value (`String(v)`), join with `\x00`. For single-Unit `from`, the key is `String(roundedValue)`. The string form means memoize works for any `T` whose `.toString()` is stable and value-distinguishing (native `number`, `bigint`, `string`, `Decimal`, `Fraction`). Cache structure: native JS `Map` (insertion-order LRU; on insert if size > cap, delete `map.keys().next().value`). NaN never cached; ±Infinity cached normally; `-0` coerced to `0` in the key.

Aggregating failures (instead of first-failure-wins) lets consumers see and fix everything wrong in one shot. Throwing (rather than returning a Result type) is the v1 contract; idiomatic JS, simpler converter return type. A Result-typed `forgeOrResult` variant can be added in a 0.x minor if anyone needs it.

### `ValidationError`

The full `ValidationError` shape is in the canonical "Public type sketch" subsection above; this section narrates behavior, not types. Invalid inputs never poison the cache (validation runs on miss, before cache write). The `failures[].cause` field preserves the original thrown error from validators that signal failure by throwing (zod, yup, custom assertions); consumers downcast via `if (failure.cause instanceof ZodError) ...` to access structured payload.

### Cross-dimensional runtime error

Cross-dimensional misuse is enforced primarily at compile time (the TypeScript signature of `forge` requires that when `from` is an object shape, `ForgeConfig` includes a conversion value, and that keys/dimensions of `from` align with the `inputs` of the supplied conversion). For runtime construction (consumers building `forge` arguments dynamically), the library throws a teaching error:

```
[unitforge] forge() received an object-shaped `from` with no `via:` in ForgeConfig.

`from` keys: { volume, density }
`to`: kilogram (dimension: mass)

Cross-dimensional forging requires a defineConversion value passed as `via:` in ForgeConfig.
```

### Implementation hints

These are not part of the public contract; they are notes to future-implementer-and-reviewer so the obvious-but-suboptimal version doesn't ship. None affects API shape.

- **Pre-baked cache-key builder at `forge()` construction time.** The converter knows its input prop names from the conversion's `inputs` declaration. At construction, build a closure like `(input) => round(input.density, p) + '\x00' + round(input.volume, p)` once; reuse per cache lookup. Do NOT call `Object.keys(input).sort()` per call.
- **Pre-computed precision multiplier.** If `precision: 2`, rounding uses `Math.round(value * 100) / 100`. Compute `10 ** precision` once at `forge()` time and bind it in the closure; never call `Math.pow` per call.
- **Lazy `ValidationError.message` via self-overwriting getter.** Build the templated string on first read of `.message`, not in the constructor; cache via `Object.defineProperty` on first access. Standard memoized-getter pattern.
- **Validator-purity contract on the `validate` field's JSDoc.** When `src/types.ts` is written, the JSDoc on `ValidatorMap`'s value-position function type must include the purity requirement so IDE hover surfaces it: *"Must be a pure function of its input. Validators are skipped on cache hits."*

If real-world benchmarks ever show one of these matters more (or less) than expected, revise the implementation.

### Why this shape

1. **Imports are configuration.** Bundlers see every dependency statically; no registry, no factory, no top-level mutation.
2. **Low-arity protocol.** `forge` always takes 3 args in the same order. Polymorphism is in `from`'s shape and `ForgeConfig`'s contents.
3. **Compute authors only write base-unit physics.** They never see units. The decorator handles every gallon-vs-liter mismatch transparently.
4. **One conversion, infinite forged converters.** The same `defineConversion` value is reused across any number of `forge` call sites with different unit pairings.
5. **End-user custom units are first-class.** Userland `defineUnit` calls produce values indistinguishable from kit-shipped units.
6. **Tree-shaking-friendly userland pattern.** Consumers typically collect their forged converters in a project-local module that imports only what they use.

### Beyond unit conversion (side capability)

The same primitives that convert between units can also express **domain-centric scaling**: a `defineConversion` describing how a value in one domain maps to a value in another (linear, logarithmic, piecewise, anything `(input) => output`). `forge` then produces the scaling function. This is a discoverable property of the API shape, not a primary use case; but it is worth knowing because it informs how kits should be designed.

Example: a slider position [0..100] mapping to volume in dB [-60..0]:

```ts
const SLIDER_POSITION = 'slider-position' as const;
const VOLUME_DB       = 'volume-db'       as const;

const sliderPosition = defineUnit({ name: 'slider-position', dimension: SLIDER_POSITION, ...linear(1) });
const volumeDb       = defineUnit({ name: 'volume-db',       dimension: VOLUME_DB,       ...linear(1) });

const sliderToDb = defineConversion({
  inputs: { position: SLIDER_POSITION },
  output: VOLUME_DB,
  compute: ({ position }) => -60 + (position / 100) * 60,
});

const sliderToVolume = forge(
  { position: sliderPosition },
  volumeDb,
  { via: sliderToDb }
);

sliderToVolume({ position: 50 });  // -30
```

Where this earns its keep: scaling functions that genuinely benefit from the unit-and-dimension framing; named domain/range, opt-in validators on the input domain, opt-in memoize for cached lookups, importable as values, kit-author composability. For pure UI scaling without domain semantics, `d3-scale` is purpose-built and richer.

**Kit-design implication.** Kits that ship a domain often have natural scaling functions associated with that domain: audio (slider → dB curves, frequency → MIDI note), game mechanics (armor → damage mitigation, stat → effective stat), finance (credit rating → interest spread), graphics (linear light → sRGB). These can ship as `defineConversion` values within the kit, alongside the unit definitions, without requiring any new library machinery. Kit authors should consider scaling-as-conversion when designing a domain-centric kit; it composes naturally with the rest of the kit's units and conversions.

## File layout

```
unitforge/
├── src/
│   ├── index.ts                    // public API barrel: defineUnit, defineConversion, forge, linear, DEFAULT_MEMO_CAP, ValidationError
│   ├── dimensions.ts               // flat file; all built-in dimension constants
│   ├── forge.ts
│   ├── defineUnit.ts
│   ├── defineConversion.ts
│   ├── types.ts                    // Dimension, Unit<D, T=number>, Conversion<I, O, T=number>, ForgeConfig interfaces
│   ├── internal/
│   │   └── safeCopy.ts             // proto-pollution-rejecting shallow copy used by all factory entry points
│   ├── lib/
│   │   └── decimal.ts              // peer-dep wrapper for decimal.js (validates pattern at v1; no kit uses it yet)
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
├── test/                           // bun test suite
├── bench/                          // performance benchmarks; CI gates on regression
├── scripts/                        // build/release helpers
├── .github/workflows/              // ci.yml, deploy-demo.yml, link-check.yml, scorecard.yml
├── README.md, AGENTS.md, CHANGELOG.md, LICENSE, NOTICE.md, SECURITY.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md, CODEOWNERS
├── biome.json, bunfig.toml, codecov.yml, knip.json, llms.txt, package.json, tsconfig.json, .releaserc.json
```

This layout mirrors chromonym's structure. Substantive divergences: `src/conversions/` carries cross-dim conversions (chromonym carried color-space transforms); `src/dimensions.ts` is unique to unitforge (chromonym color spaces ship as named entities, not flat constants); `src/kits/` plays the role chromonym's `src/palettes/` plays.

### `package.json#exports` shape

Granular per-unit-per-file requires a wildcard `exports` map; a hand-maintained entry-per-file table will rot. Target shape:

```json
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./dimensions": { "types": "./dist/dimensions.d.ts", "import": "./dist/dimensions.js" },
    "./kits/*": { "types": "./dist/kits/*/index.d.ts", "import": "./dist/kits/*/index.js" },
    "./kits/*/*": { "types": "./dist/kits/*/*.d.ts", "import": "./dist/kits/*/*.js" },
    "./conversions/*": { "types": "./dist/conversions/*.d.ts", "import": "./dist/conversions/*.js" },
    "./package.json": "./package.json"
  }
}
```

ESM-only (`"type": "module"`, no `require` condition). Floor `engines.node: ">=20"` and `moduleResolution: "node16" | "nodenext" | "bundler"` for consumers; document loudly in README.

**Wildcard specificity.** Node's exports resolver prefers the more-specific pattern. `unitforge/kits/imperial` matches `./kits/*` (resolves to the kit's barrel `dist/kits/imperial/index.js`); `unitforge/kits/imperial/foot` matches `./kits/*/*` (resolves to the per-unit file `dist/kits/imperial/foot.js`). The two patterns coexist because the resolver picks the longer-matching one; `publint` and `attw` checks should assert both call shapes resolve correctly.

v1 ships with **no peer dependencies**. When a future precision-requiring kit ships, that kit declares its precision library as `peerDependenciesMeta.optional: true` (see "Numeric precision > Peer-dependency wrapper pattern" below). Without `optional: true`, every default `npm install unitforge` user would see a missing-peer warning.

## Discipline rules

These rules are non-negotiable through v1; they are what holds the design together.

1. **Side-effect-free package.** `"sideEffects": false` in `package.json`; no top-level mutation; no auto-registration.
2. **Single-hop conversions only.** The library never searches for a conversion path. Multi-step paths are declared as one `defineConversion` or chained in userland.
3. **Dimensions are stable string identifiers.** Once shipped, `LENGTH = 'length'` cannot change its string value.
4. **Kits can declare new dimensions but cannot redefine existing ones.** A `cooking` kit can extend `VOLUME` with `cup`; it cannot reassign `VOLUME` to mean something else.
5. **Each direction of a conversion is its own `defineConversion` value.** No auto-derived inverses. Celsius/Fahrenheit-style offsets are the canonical case for why naive symmetry breaks.
6. **Exactly one unit per dimension carries `base: true`.** The `base: true` flag is the canonical zero-point/identity unit for that dimension; multiple `base: true` units in one dimension are a definition-time error (`compute` author's "in base units" contract requires a unique base). Atomic-variant kits MUST rename their local base unit to avoid colliding with the canonical kit (see "Configurable atomic per dimension").
7. **Type-agnostic value layer.** v1 ships entirely native `number`. `Unit<D, T = number>` and `Conversion<I, O, T = number>` are parameterized for forward-compat; future precision-sensitive kits specialize `T` (e.g., to `Decimal`) without library changes. No `NumericAdapter` interface. (See "Numeric precision".)
8. **Per-unit precision is a property of the unit definition, not a global config.**
9. **No instance factory.** Public API is free functions. Period.
10. **Granular per-unit files.** Each kit is a folder of one-unit-per-file modules with a barrel `index.ts`.
11. **Naming convention enforced by lint.** A small dev-only checker greps for `defineUnit`/`defineConversion` calls and the export they're assigned to, verifying the export name matches the filename in camelCase. `defineUnit`'s `name:` field must also match. (`defineConversion` carries no `name:` field.) Initial form: ~50 lines of regex; ship as project pre-commit hook + CI step; extract as `unitforge-lint` if it earns its keep.
12. **Trademark and source attribution discipline.** Kits referencing third-party standards (RAL, USP/WHO, BIPM) cite source and version-pin in source comments. NOTICE.md tracks attribution.
13. **Prototype-pollution rejection via `safeCopy`.** A single internal helper `safeCopy(spec)` (in `src/internal/safeCopy.ts`) takes a user-supplied object and returns a sanitized shallow copy: spreads to neutralize literal-syntax `__proto__:` pollution, then iterates own enumerable string keys and throws a clear definition-time error if any key is reserved (`__proto__`, `constructor`, `prototype`). **`safeCopy` is shallow by design**: it screens only own-enumerable string keys at the top level. It does NOT recurse into function values (validator functions, `compute` functions) or nested data structures; the trust boundary is "we trust `defineUnit`/`defineConversion`-produced values that already passed `safeCopy` at their own definition time." All factory entry points (`defineUnit`, `defineConversion`, `forge`) call `safeCopy` on their inputs as the first action; nested user-controlled key maps (`defineConversion.inputs`, `.validate`, `ForgeConfig.validate`, object-shape `from`) each get their own `safeCopy` call. `ValidationError.inputs` is constructed via `safeCopy` plus `Object.create(null)` target on the failure path. The hot-path converter does NOT call `safeCopy` (no vector to guard against; no mutation, no prototype-chain assignment). Cost lands on definition, forge-creation, and validation-failure paths; per-call overhead unchanged.

## v1 kit roster

Five kits, deliberately spanning four problem domains to demonstrate the thesis that unitforge is not a physics library:

1. **`si`**: meter, kilogram, second, kelvin, mole, ampere, candela; derived: square meter, cubic meter, newton, joule, watt, pascal, hertz. The default kit.
2. **`imperial`**: inch, foot, yard, mile, pound, ounce, fluid ounce, gallon, quart, pint, cup. Together with `si` shows mixed-system cross-dim forging.
3. **`cooking`**: tablespoon, teaspoon, cup with US/UK split, stick of butter, dash, pinch, fluid ounce, milliliter. Domain where dimensions are technically physics but units are culturally specific.
4. **`inventory`** (manufacturing): each, dozen, gross, ream, score, pair, half-dozen, case, pallet, container. Demonstrates the `COUNT` dimension and the packaging-unit-as-`defineUnit`-in-COUNT pattern.
5. **`pharmacy`**: milligram, microgram, IU, mL dose, tablet, capsule, blister pack, vial. Domain with regulated units (USP/WHO IU conventions), packaging-as-unit, and life-safety precision requirements.

These four problem domains are picked specifically to stress-test the cross-domain claim. Adding more kits later (astronomy, historical, gaming, finance) extends the proof; the v1 set is the minimum needed to make the cross-domain claim credibly. The chromonym precedent is to file an issue per future kit (parallel to chromonym issues #21–#30).

## Numeric precision

v1 ships entirely native JavaScript `number` (IEEE 754 double). Sufficient for ~99% of use cases including all five v1 kits.

The library is **type-agnostic at the value layer.** It does no arithmetic on values itself; it calls user-supplied `toBase`, `fromBase`, and `compute` functions and shuttles their results around (with one exception below). Precision-sensitive kits can be added later without library changes by writing their unit definitions against an exact-arithmetic library inside `toBase`/`fromBase`/`compute`.

The forward-compatible type shape (locked at v1 in `src/types.ts`) parameterizes `Unit` and `Conversion` over the value type `T`, with `T = number` as the default. The canonical type definitions live in the **"Public type sketch (canonical)" subsection** of "API shape" above; this section does not redeclare them. (Earlier drafts duplicated the type block here; the duplicate has been removed to prevent drift between the two declarations.)

**Consequences:**

- v1 consumers writing native-number units never see the `T` parameter; it defaults from the function signatures.
- `T` must be uniform across one `forge` call (mixing Decimal-typed and number-typed units in one call is a type error).
- A future `kits/finance/usd.ts` specializes `T = Decimal` explicitly:
  ```ts
  import Decimal from '../../lib/decimal';  // wrapper, not direct decimal.js import
  export const usd = defineUnit<typeof CURRENCY, Decimal>({
    name: 'usd', dimension: CURRENCY,
    toBase: (d) => d, fromBase: (d) => d,
  });
  ```
- `forge` threads `T` through. Pass Decimal-typed units in, get a `(d: Decimal) => Decimal` converter back.
- Cache-key normalization (`Math.round(value * multiplier) / multiplier`) is the one place the library does arithmetic on values. Since cache keys are stringified (`String(v)`), `memoize` works for any `T` with stable `.toString()` (native `number`, `bigint`, `string`, `Decimal`, `Fraction`). At v1, `precision: N` rounding is documented as native-number only; non-number consumers either skip `precision` or do their own rounding inside `compute`.

**Likely "needs decimal" kits worth filing as future-issue placeholders** (not v1):

- `kits/finance` (penny precision is regulatory).
- `kits/crypto` (Bitcoin satoshis, Ethereum wei; floats can't even represent these).
- `kits/astronomy` (sub-arcsecond ephemerides over centuries).
- `kits/geodesy` (centimeter-precision position differences in ITRF coordinates).

Geosciences/SEGY is mixed: trace amplitudes/travel-time math fine in float; survey-coordinate bookkeeping needs decimal.

### Peer-dependency wrapper pattern

When a kit needs a precision library (decimal.js, dnum, fraction.js, etc.), it does NOT import the library directly. It imports from a centralized wrapper module under `src/lib/`:

```ts
// src/lib/decimal.ts
/**
 * Re-exports decimal.js for use across kits that need exact decimal arithmetic.
 *
 * REQUIRES PEER DEPENDENCY: decimal.js
 * If you see "Cannot find module 'decimal.js'" when importing this file
 * (transitively, via any unitforge kit that needs decimal precision):
 *   npm install decimal.js
 */
import Decimal from 'decimal.js';
export default Decimal;
```

**Why a wrapper, not direct imports.** Centralizes install instructions; gives a single hook for diagnostic improvements later; keeps the wire-up uniform across kits.

**Why static import (not dynamic `import()` with try/catch).** Static imports keep the wrapper synchronous and tree-shakeable; modules importing from it stay synchronous. Dynamic import would make the module async (top-level await), which propagates async-ness through every kit and creates bundler edge cases.

**Tree-shaking guarantee.** Under `"sideEffects": false` plus static imports throughout, `src/lib/decimal.ts` is reachable in a consumer's bundle ONLY when a kit that imports it is itself reached. A consumer using only `unitforge/kits/imperial` ships zero bytes of decimal.js.

**Validation at v1.** v1 ships `src/lib/decimal.ts` and `test/peer-dep-pattern.test.ts`, even though no v1 kit needs decimal. The test exercises a one-off Decimal-typed `defineUnit` + `forge` call to confirm the wrapper re-exports correctly, the type parameterization works in practice (`T = Decimal`), `forge` returns the right specialized converter, and the pattern is reproducible. decimal.js is a regular `devDependency` for the test (always installed in CI); consumers never see it because `test/` is not in the `files` allowlist.

When the first precision-requiring kit ships (post-v1), repeat the pattern: add a `src/lib/<library>.ts` wrapper, declare the optional peer-dep with `peerDependenciesMeta.optional: true`, write the kit against the wrapper, copy the test pattern.

## Configurable atomic per dimension

Most surveyed libraries hardcode the atomic unit per dimension; unitmath is the only one that ships configurable atomic at runtime. unitforge handles this via **kit choice**, not runtime config:

- Default kit `si` anchors at meter, kilogram, second.
- Alternate atomic kits live at `kits/si-mm-atomic`, `kits/si-g-atomic`, etc., for consumers who want millimeter-base or gram-base storage.

Same pattern as chromonym shipping multiple palette variants without a runtime config flag. Consumers pick which atomic they want by picking which kit they import. No instance state; no runtime configuration; tree-shakes per-import.

Atomic-variant kits **rename their exports** rather than shadowing canonical base units; e.g., `kits/si-mm-atomic` exports `millimeter` (the local base) plus aliases like `meterMm` for clarity, NOT a second `meter`. This preserves the discipline rule that one and only one unit per dimension carries `base: true` (discipline rule #6) and avoids cross-kit ambiguity over which `meter` is the base.

If runtime configuration of atomic later proves necessary, it can be added as an option to `defineUnit` or `ForgeConfig`, but the default path is "import the kit that matches your storage."

## What unitforge inherits from chromonym (boilerplate specimen)

Mirrored directly from chromonym's repository structure with minimal adaptation:

- **Build/runtime**: Bun, TypeScript, ESM, biome for lint+format.
- **Type checker**: tsgo (the native TypeScript checker; chromonym uses it).
- **Test runner**: bun test with codecov reporting.
- **Knip**: unused-export detection.
- **Vite-based demo**: lives in `demo/`, deployed via `deploy-demo.yml`.
- **CI workflows**: `ci.yml` (lint+test+typecheck), `deploy-demo.yml`, `link-check.yml`, `scorecard.yml` (OpenSSF Scorecard).
- **Release**: semantic-release via `.releaserc.json`. CHANGELOG.md auto-generated. **npm provenance** enabled via `--provenance` (or `NPM_CONFIG_PROVENANCE=true` in CI env); `id-token: write` is already configured. Sigstore attestation is the highest-leverage supply-chain signal.
- **Community-health surface**: CODE_OF_CONDUCT.md, CONTRIBUTING.md, SECURITY.md, CODEOWNERS, FUNDING.yml, dependabot.yml, ISSUE_TEMPLATE/, PULL_REQUEST_TEMPLATE.md.
- **AGENTS.md**: agent-instructions file at root.
- **NOTICE.md**: third-party attribution (kits citing external standards).
- **llms.txt**: machine-readable summary for LLM-driven consumers.

Substantive divergence from chromonym lives in `src/`, where the registries are different (dimensions, kits, conversions vs. chromonym's color-spaces, palettes, conversions).

## Test strategy

Numerics libraries live or die on test discipline. Non-negotiable from day one of `src/`.

- **Coverage target: 100% line + branch.** Codecov gate.
- **Unit tests** for each primitive: `defineUnit`, `defineConversion`, `forge` (within-dim and cross-dim), `linear` helper, `ValidationError` construction and `.message` templating, `safeCopy`.
- **Property tests using `fast-check`** (already in devDependencies):
  - **Round-trip identity within precision:** for any unit pair `(a, b)` in the same dimension, `forge(a, b)(forge(b, a)(x)) ≈ x`.
  - **Identity:** `forge(a, a)(x) === x`.
  - **Within-dim transitivity:** `forge(a, c)(x) ≈ forge(b, c)(forge(a, b)(x))`.
  - **Inverse-pair roundtrip:** when both `aFromB` and `bFromA` exist, `bFromA(aFromB(x)) ≈ x`. Catches inverse drift at PR time.
- **Cross-kit conversion matrix:** every pair of units in the same dimension across all v1 kits gets at least one example test (machine-generated; lives in `test/matrix/`).
- **Validator tests:** aggregation correctness, error message format stability, throw-as-failure handling, proto-pollution rejection at definition time.
- **Memo cache tests:** key collision impossibility, eviction policy correctness, NaN/Infinity/-0 handling, precision-as-cache-bucket behavior.
- **Type-level tests** using `expect-type` or `tsd`: confirm `forge` generic inference, key/dimension misalignment compile errors, `Dimension` autocomplete preservation, mixed-`T` rejection.
- **Bench harness in `bench/`** with at least three benchmarks (single-unit fast path, cross-dim 2-input cold path, cross-dim 2-input + memo). Numbers published in README; CI fails on regression > 20%.
- **Packaging gates in `prepublishOnly` and CI:** `publint` validates `package.json` shape; `attw --profile esm-only` validates declaration files and ESM-only conformance. Both are already wired in `package.json` scripts; treat as required CI checks. Discipline rule: do not strip them.
- **Peer-dep pattern test** at `test/peer-dep-pattern.test.ts`: exercises the `src/lib/decimal.ts` wrapper end-to-end with a one-off Decimal-typed `defineUnit` + `forge`.

## Versioning and stability

Semver applies; the question is what counts as a breaking change for a registry library.

| Change | Bump |
|---|---|
| Adding a dimension constant to `dimensions.ts` | minor |
| Adding a kit | minor |
| Adding a unit to an existing kit | minor |
| Adding a conversion to `src/conversions/` | minor |
| Adding a field to `ForgeConfig` (optional) | minor |
| Renaming a kit subpath | major |
| Renaming a unit's exported name | major |
| Changing a unit's `toBase` (other than bug fix) | major |
| Changing the public API surface (`defineUnit`, `defineConversion`, `forge`, `linear` signatures) | major |
| Changing a `defineConversion`'s `compute` (semantics change, not bug fix) | major |
| Bug fix in `compute` that changes returned values | patch (with prominent CHANGELOG entry) |
| Changing the wording of a `ValidationError.failures[].message` string | patch (strings unstable; consumers must not grep them) |
| Changing the wording of a teaching error message | patch (shape stable; wording unstable) |
| Changing the cache-key algorithm, separator, rounding, or `-0` coercion | patch (cache internals are non-public; consumers MUST NOT persist memo state across upgrades) |

Pre-1.0 (`0.x.y`): minor bumps may include breaking changes per Conventional Commits + semantic-release defaults. The discipline above kicks in at 1.0.

Deprecation policy: a unit, kit, or conversion marked deprecated stays exported for at least one minor cycle (deprecated in `1.4.0`, removed no earlier than `2.0.0`). Surfaces via JSDoc `@deprecated` tag, CHANGELOG entry, and a one-line warning in the README's "Deprecations" section.

## Pre-coding blockers

Only one item remains genuinely open before `src/` scaffolding can begin; the rest were resolved during design and are summarized in "Appendix: design history".

1. **Lock `src/types.ts` against the "Public type sketch (canonical)" subsection** of "API shape" above. The sketch is the source of truth for all public types (`Dimension`, `Unit<D, T = number>`, `Conversion<I, O, T = number>`, `ValidatorMap<I, T>`, `ForgeConfig<T>`, the three `forge` overloads, `ValidationError`, `linear`, `DEFAULT_MEMO_CAP`). The `expect-type` checks listed in that subsection define the verification gate: object-shaped `from` narrowing, extra-key rejection, dimension-brand threading, uniform-`T`, mixed-`T` rejection, missing-`via` rejection, key/dimension misalignment rejection, object-output `to`-shape matching. No other gap should remain on the type surface before scaffolding.

## Open questions to resolve before v1

1. **Vocabulary review across the whole API surface.** Settle on a unified vocabulary for the `define*` factories, the `Forge*` types, and field names inside `ForgeConfig`. Goal is internal consistency, not just per-symbol rightness.
2. **Custom dimension scoping.** Two third-party kits both export `MANA = 'mana'`. The library currently trusts strings. Document the prefix-your-custom-dimensions convention; do not enforce.
3. **TypeScript inference confirmation for `forge`.** Subsumed by Pre-coding blocker #1 (the `expect-type` checks); flagged here as a verification step.
4. **Subpath exports for size variants of large kits.** Pharmacy and inventory in particular could ship `core` vs `full` variants. Mirror chromonym Munsell #22's approach.
5. **Memoization sub-decisions** (post-v1 unless real demand emerges): whether `forge` refuses `memoize` on a trivially-cheap unary native-number converter (lean: trust the consumer); whether to ship TTL eviction (lean: LRU only; file an issue for TTL).

## Next steps

Repo, license, community-health files, and CI workflows are already in place. Remaining:

1. Resolve pre-coding blocker #1 (lock `src/types.ts` in a playground with `expect-type` checks).
2. Scaffold `src/` skeleton: `index.ts` barrel, `dimensions.ts`, `types.ts`, stub `forge.ts`, `defineUnit.ts`, `defineConversion.ts`, `errors.ts`, `internal/safeCopy.ts`, `lib/decimal.ts`, and empty `kits/` and `conversions/` folders.
3. Scaffold `demo/` as a vite app with placeholder content.
4. Wire `--provenance` into `.releaserc.json` and CI publish step (currently only documented).
5. **Wire the wildcard `exports` map into `package.json`** alongside the first kit scaffold (currently `package.json` only ships `.` and `./package.json`; the documented map under "package.json#exports shape" must land in the same PR as the first kit so consumers can resolve `unitforge/kits/<name>` paths).
6. Implement v1: `si`, `imperial`, `cooking`, `inventory`, `pharmacy` kits and supporting conversions.
7. **README rewrite is deferred until after v1 ships.** The pre-1.0 README is intentionally minimal (a placeholder API sketch and a "pre-alpha, do not depend on" warning). The marketing-grade README (competitive positioning, kit roster surfaced with real names, hero block with a working cross-dim example, demo GIFs, performance numbers, Scorecard badge) lands once we have real kits to name, real benchmarks to cite, and a working demo to GIF. Writing it earlier means writing claims we can't yet substantiate. The "Beyond unit conversion" framing, the cross-domain pitch, and the kit-by-kit quick-tour all wait for this rewrite.
8. **Repo settings to enable in GitHub UI / via `gh api`** (one-time housekeeping, not files):
   - Branch protection or ruleset on `main` (the release workflow at `ci.yml:78-89` already provisions an App-token bypass path that assumes the ruleset exists).
   - Private vulnerability reporting (`SECURITY.md` already routes there; toggle must be on).
   - Dependabot security updates (separate from `.github/dependabot.yml`'s actions-ecosystem coverage).
   - Secret scanning + push protection.
9. File issues for queued kits (analog of chromonym #21–#30).

## Appendix: design history

Two design conversations produced this document; this appendix preserves the rationale for decisions that were made and reverted, so future contributors don't re-litigate settled ground.

### Conversation 1 (project inception, 2026-04-27)

Explored: the OSS UOM landscape and its gaps (six libraries surveyed); Ultrathin's existing inventory unit-handling and where current code falls short; reduce-to-atomic storage strategy across the surveyed libraries; float precision concerns with small atomic units; configurable atomic feature space (only unitmath ships it); big-decimal handling across libraries (mathjs and unitmath only); the chromonym aesthetic and how it transfers (palettes → kits, color spaces → dimensions); the two architectural families (algebraic dimensions vs independent dimensions with explicit bridges); the three-registry model (dimensions, kits, conversions) and dependency ordering; free-function API vs instance-factory tradeoff (preference for purity-via-arity); naming process (unitforge selected over metronym, vernier, quantica, cubitor, scalesmith).

That conversation produced an initial four-function API: `convert`, `format`, `defineUnit`, `defineConversion`, plus `definePack` sugar.

### Conversation 2 (API refactor, 2026-05-09)

Replaced the four-function shape with the current three-primitive shape:

- The two-step factory insight: provision a converter once with `forge(from, to, ForgeConfig?)`, then call it many times. Analogous to a linear-scaling-function constructor.
- `forge` chosen as the factory verb. `defineUnit` retained because units are interface-shaped data and `forge` should accept anything matching that interface; this keeps end-user custom units first-class.
- Cross-dimensional inputs generalized: `from` can be an object whose properties are independently-chosen Units. The shape of `from` determines the shape of the converter's call site.
- `defineConversion` retained but reframed: `inputs` is keyed by property name → dimension, `compute` is written in base units, library decorates for unit normalization. One conversion, infinite forged converters across mixed unit systems.
- Cross-domain v1 kit set decided: physics (`si` + `imperial`), `cooking`, `inventory`, `pharmacy`. Picked specifically to stress-test the "not just physics" thesis.

### Decisions made and reverted (full rationale preserved here so future review passes don't re-raise them)

- **`definePack` sugar (dropped).** Original plan: a `definePack({ outer, inner })` sugar that bundled a unit + a conversion. Resolved 2026-05-09: dropped. A packaging unit is just a `defineUnit` in the COUNT dimension (a spool of tape IS a unit, not a wrapper around feet); the conversion to inner content is a separate `defineConversion` when needed. The library stays at three factories.

- **`format` primitive (dropped).** Original plan: a `format(value, unit, opts)` primitive with plural/locale/abbreviation logic. Resolved 2026-05-09 (in two passes): first collapsed to an optional `ForgeConfig.format: (value: number) => string` field with a `.format()` method on the converter; then dropped entirely. The library does conversion; display is the view's job. Consumers who want formatted output write a one-line wrapper around the converter.

- **`with:` cross-dim conversion field (reverted to `via:`).** Briefly renamed to `with:` mid-design when the right-hand side became a structured spec (validators + compute + future fields). Reverted 2026-05-09 because `with` is SQL-shaped, is a JS strict-mode reserved word, and overstates the right-hand side's complexity. `via:` reads as "convert via this rule," which matches intent.

- **`NumericAdapter` interface and `src/numeric/` subpath (dropped).** Original plan: a 9-method `NumericAdapter` interface with per-adapter unit kits at `unitforge/numeric/<adapter>` and peer-deps on decimal.js / fraction.js. Resolved 2026-05-09: dropped. The library is type-agnostic at the value layer (it does no arithmetic on values itself; just shuttles user-supplied function results). Replaced with `Unit<D, T = number>` and `Conversion<I, O, T = number>` parameterized over the value type, plus the peer-dep wrapper pattern for kits that need precision.

- **`Conversion` value identity branding (dismissed).** Cross-file invariant reviewer raised: two structurally-identical `defineConversion` values are interchangeable to the type system; passing the wrong one is silent-wrong physics. Resolved 2026-05-09: dismissed as non-issue. Two named functions with the same signature being interchangeable is ordinary JavaScript (`Math.sin` and `Math.cos` have identical signatures and nobody asks for them to be branded). ESM import-as-rename and barrel-export-rename handle naming polysemy.

- **Validator return contract via `Result` type (dismissed).** Considered briefly. Resolved 2026-05-09: validators return `true | string` (string = rejection); throwing is the escape hatch; the runner aggregates failures and throws `ValidationError`. A `forgeOrResult` Result-typed variant can be added in a 0.x minor if anyone needs it; not v1.

- **Validators-default-to-fail-fast (dismissed).** Perf reviewer suggested defaulting to fail-fast with `aggregate: true` opt-in. Resolved 2026-05-09: aggregation stays the default. Cache-first pipeline means validators only run on cold-path misses; on the success path validators all run anyway (none failed, so neither model can short-circuit). The "5-10x slower" claim was overstated.

- **`memoize` as `boolean | { max: N }` discriminated union (dropped).** Resolved 2026-05-09: collapsed to `memoize: number` (single-typed; 0 or absent = off; > 0 = LRU cap). `DEFAULT_MEMO_CAP = 1024` constant ships from the main barrel for ergonomic opt-in. Per the no-heterogeneous-types rule.

- **`toBase: number | { to, from }` discriminated union (dropped).** Initial proposal for non-linear units. Resolved 2026-05-09: `Unit` carries TWO function fields (`toBase` and `fromBase`, both always functions); `linear(scale)` helper covers the common linear case; non-linear units write the two functions explicitly. Type stays uniform; no discrimination.

- **`validate.all` cross-property key (renamed to `_all`).** Initial proposal was `all`. Reviewer caught: collides with any input literally named `all`. Resolved 2026-05-09: renamed to `_all` (leading underscore signals library-reserved special key); consumers may use `all` as an input property name freely; no definition-time check needed.

The thesis line: *units and conversions as values you import; one factory verb (`forge`) that returns the converter; cross-domain by construction, not just physics.*
