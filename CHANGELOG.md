# [3.0.0](https://github.com/simiancraft/unitforge/compare/v2.0.0...v3.0.0) (2026-05-14)


* feat(api)!: rename mile, areaFromLengthAndWidth, volumeFromLengthAndWidthAndHeight ([6b214aa](https://github.com/simiancraft/unitforge/commit/6b214aa207fb918ea81ad18eaa05b6f9d6ac9aba))
* feat(geometry)!: rename legFromHypotenuseAndLeg to legFromHypotenuseAndOtherLeg ([28045e5](https://github.com/simiancraft/unitforge/commit/28045e51481d8204a23a3a6237d23e40dd08af42))
* feat(geometry)!: rename volumeFromCuboid... and codify naming rules ([d7d03bd](https://github.com/simiancraft/unitforge/commit/d7d03bd66dd6eb988405861d3234761e17d11f5e))


### Features

* **api:** add ANGLE dimension ([b6d40b4](https://github.com/simiancraft/unitforge/commit/b6d40b4238b0fcbec15881e035e46a4e6238072a))
* **geometry:** add angleFromArcLengthAndRadius ([524913c](https://github.com/simiancraft/unitforge/commit/524913c39d0bfdd79bcd5b91fad1a634c13cb612))
* **geometry:** add areaFromRegularPolygonApothemAndPerimeter ([18fba30](https://github.com/simiancraft/unitforge/commit/18fba3032becf10168c328b23d00105b98a01e92))
* **geometry:** add cartesianFromPolar and polarFromCartesian ([bae88d5](https://github.com/simiancraft/unitforge/commit/bae88d5d30dfc0a1df2c45304c6b4185006535be))
* **geometry:** add inradius and circumradius of triangle from sides ([69be3c4](https://github.com/simiancraft/unitforge/commit/69be3c4c36b44083bea1338d3ea948a8fd1786f5))
* **geometry:** ship 10 LENGTH units across metric, engineering, marine, astronomy ([ddd9f21](https://github.com/simiancraft/unitforge/commit/ddd9f21345a06a51b3c24ce5ccd0c35baffe78b0))
* **geometry:** ship 11 perimeter / circumference / arc length derivations ([8b7c232](https://github.com/simiancraft/unitforge/commit/8b7c232b00283ba7817786b520e8e61575da149f))
* **geometry:** ship 13 AREA derivations across triangle, quadrilateral, conic, and round shapes ([8a23bf1](https://github.com/simiancraft/unitforge/commit/8a23bf19beebb6e0bf2df55cfed6c6565869e1ed))
* **geometry:** ship 6 VOLUME units across metric scales and US customary ([bf290c1](https://github.com/simiancraft/unitforge/commit/bf290c19268592cbca099de71fcaa4defedf5e06))
* **geometry:** ship ANGLE units (radian/degree/gradian/arcminute/arcsecond/turn) ([5ad9f27](https://github.com/simiancraft/unitforge/commit/5ad9f27409de78a7692bd9ea6c3c7731f74cb561))
* **geometry:** ship are / squareYard / squareMile AREA units ([f288a9e](https://github.com/simiancraft/unitforge/commit/f288a9e271ac6287a3140cc2dfc944d1105ec451))
* **geometry:** ship coordinate geometry; distance and midpoint between points ([e94f544](https://github.com/simiancraft/unitforge/commit/e94f5443a55207d1f9c3d5fdbe1fade0a3f57b65))
* **geometry:** ship diagonal and Pythagorean derivations ([03d8f79](https://github.com/simiancraft/unitforge/commit/03d8f79e8cf91bc0f1fd9be402bf3f63e0d065f8))
* **geometry:** ship Ramanujan II ellipse perimeter approximation ([a9f5b63](https://github.com/simiancraft/unitforge/commit/a9f5b63d6fa037294b2cd9da9d1ec02d509d749f))


### BREAKING CHANGES

* volumeFromCuboidLengthAndWidthAndHeight is now
imported as volumeFromCuboidDimensions. Three-input chain
(`AAndBAndC`) names do not scale; collective nouns do.

Also codifies two sub-patterns in the source header so the next
contributor does not invent a third:
- three-input collective-noun rule (Dimensions / Sides / Vertices over
  AAndBAndC)
- multi-output object form precedent set by midpointBetweenPoints,
  cartesianFromPolar, polarFromCartesian
* the inverse-Pythagorean conversion is now imported as
legFromHypotenuseAndOtherLeg and takes { hypotenuse, otherLeg } at the
call site (was { hypotenuse, leg }). The old name forced readers to
consult the JSDoc to know which leg the input represented vs. the
output; calling the known input "otherLeg" disambiguates at the call
site.

Migration:
  import { legFromHypotenuseAndLeg } -> { legFromHypotenuseAndOtherLeg }
  fn({ hypotenuse, leg })            -> fn({ hypotenuse, otherLeg })
* `mile` → `statuteMile` (id `'statute-mile'`).
The unqualified `mile` was forward-incompatible with `nauticalMile`
(also in this release, 1852 m exactly per IHO 1929). Statute and
nautical miles differ by 15.1%; the unqualified name was the same
hazard as a bare `gallon` would be.
* `areaFromLengthAndWidth` → `areaFromRectangleLengthAndWidth`.
Naming symmetry with the new area derivations
(`areaFromTriangleBaseAndHeight`, `areaFromEllipseSemiAxes`, etc.).
The old name read as if length-and-width were a generic input rather
than a rectangle-specific one.
* `volumeFromLengthAndWidthAndHeight` →
`volumeFromCuboidLengthAndWidthAndHeight`. Same naming-symmetry
argument; cuboid is the shape, length/width/height are its inputs.

Migration is a single rename per binding at consumer call sites.

# [2.0.0](https://github.com/simiancraft/unitforge/compare/v1.1.1...v2.0.0) (2026-05-13)


* feat(api)!: surface defineUnit shape change for v2.0.0 release ([1628843](https://github.com/simiancraft/unitforge/commit/1628843eca184564d9288ae5b9eeda2736bfd5e7))


### Bug Fixes

* **demo:** clear check pipeline (react-compiler + biome useLiteralKeys) ([70f6dca](https://github.com/simiancraft/unitforge/commit/70f6dcaa85def37577ea9f51dacc0a72f912c856))
* **demo:** darken throughput-bar label to neutral-500 ([8e5eaca](https://github.com/simiancraft/unitforge/commit/8e5eaca4f1547962548b198c8eb618cf6e3d6b2d)), closes [#888](https://github.com/simiancraft/unitforge/issues/888) [#888888](https://github.com/simiancraft/unitforge/issues/888888) [#737373](https://github.com/simiancraft/unitforge/issues/737373) [#a3a3a3](https://github.com/simiancraft/unitforge/issues/a3a3a3)
* **demo:** drop display:contents on forge shake-target wrapper ([23ffc2f](https://github.com/simiancraft/unitforge/commit/23ffc2feac2352fcbfb22fdeb9ac5134da27b1b6))
* **demo:** drop ref-during-render in useSvgPointerDrag for compiler ([ae7b181](https://github.com/simiancraft/unitforge/commit/ae7b181a55a4dda2e3bc3cb15b8efd97d9c4fbe3))
* **demo:** drop remaining toExponential sites in bench and kit indexes ([c8846c3](https://github.com/simiancraft/unitforge/commit/c8846c3a9d09c9ff1bf039d1075d80bce998d159))
* **demo:** plain-decimal readouts, no scientific notation, no zero collapse ([6ba4430](https://github.com/simiancraft/unitforge/commit/6ba44303aeb11091d4aef8382c7a678d7dc8a469)), closes [#14](https://github.com/simiancraft/unitforge/issues/14) [#16](https://github.com/simiancraft/unitforge/issues/16)
* **demo:** satisfy biome noSvgWithoutTitle on inline brand glyphs ([9ef0fb4](https://github.com/simiancraft/unitforge/commit/9ef0fb4e14cb00ef15a68ee911ef936da7534d81))
* **demo:** sr-only Select.ItemText so unit rows aren't duplicated ([72d68d9](https://github.com/simiancraft/unitforge/commit/72d68d90c16bbaf27613dd539e9fda745045f9d3))
* **demo:** swap throughput-bar label blend mode for legibility ([3b71b14](https://github.com/simiancraft/unitforge/commit/3b71b14d39c9ed97da87fe92afb40b2ecdfb855e))
* **demo:** use flex on UnitRow for cleaner baseline alignment ([51747cd](https://github.com/simiancraft/unitforge/commit/51747cdbb1872ee3e2623486e817bd2355f81d54))
* **demo:** use Radix Select's supported trigger-rendering path ([71268be](https://github.com/simiancraft/unitforge/commit/71268bec7a3195f7ed64c141db5dfc000e12db53))
* **demo:** wrap Select.ItemText in sr-only span ([1c3b248](https://github.com/simiancraft/unitforge/commit/1c3b248dc21d6c5570804e0b35e71b1ac33bfdf9))


### Features

* **demo:** drive-vs-os adds side-by-side bars + file-count infographic ([3efd967](https://github.com/simiancraft/unitforge/commit/3efd967604ac14a8937a56c4703a7f56b5de785d))
* **demo:** expand footer with author + social links ([6c23d40](https://github.com/simiancraft/unitforge/commit/6c23d40505fccddb19f4122dd426c3ddd32d73ea))
* **demo:** forge the throughput sweep mapping (real-time → view-time) ([c2390ed](https://github.com/simiancraft/unitforge/commit/c2390ed9785cbc1311464197c43ef3a5b7556043))
* **demo:** live-template every CODE sample from current widget state ([e934021](https://github.com/simiancraft/unitforge/commit/e934021d3c29e5e298e4697e94a79b0295ee6d1b))
* **demo:** shrink very long digit strings in hello-bytes matrix ([858f421](https://github.com/simiancraft/unitforge/commit/858f4214e451d89f1eded8c2f26f2043a09487fc))
* **demo:** stack labels above readouts in hello-bytes matrix ([e858a43](https://github.com/simiancraft/unitforge/commit/e858a4343979a46955a46e7f150e4d1778012d4c))
* **demo:** swap UnitPicker to Radix Select with two-tone rows ([99285b2](https://github.com/simiancraft/unitforge/commit/99285b23f04b95582a118340e4ccae6594876526))


### Performance Improvements

* **demo:** coalesce SVG drag updates with rAF in use-svg-pointer-drag ([3a171f1](https://github.com/simiancraft/unitforge/commit/3a171f14824e559dc7265e65cfe023abd9363484)), closes [hi#poll-rate](https://github.com/hi/issues/poll-rate) [#17](https://github.com/simiancraft/unitforge/issues/17)
* **demo:** replace RAM-stick LED stagger useEffect with CSS transition-delay ([3189cb7](https://github.com/simiancraft/unitforge/commit/3189cb755e8bb5bfe924d0feef595b4c50b28487))


### BREAKING CHANGES

* defineUnit spec replaces the single readonly `name`
with three readonly strings: `id` (stable kebab-case identifier,
`'square-meter'`), `label` (human display name, `'Square Meter'`),
and `symbol` (conventional short form, `'m²'`). Consumers calling
`defineUnit({ name: ... })` must migrate by splitting the field;
consumers reading `unit.name` must choose `id`, `label`, or `symbol`
based on use site (persistence, display, or short form). The Unit
interface's `name` property is removed.

## [1.1.1](https://github.com/simiancraft/unitforge/compare/v1.1.0...v1.1.1) (2026-05-12)


### Bug Fixes

* **demo:** a11y progressbar, drop convert helper, tighten KITS tuple ([af94c0b](https://github.com/simiancraft/unitforge/commit/af94c0bb465aad6cb3dba4e16a3a25ff5fe9083b))
* **demo:** a11y; drag handles aria-hidden, live result regions, glyph SR labels ([66afb25](https://github.com/simiancraft/unitforge/commit/66afb254911e922fb70773488bcda076ecfd85c7))
* **demo:** apply data-theme to <html> so background flair shines through ([7314a25](https://github.com/simiancraft/unitforge/commit/7314a254d926922db5e5d9eac01579f5ba87971e))
* **demo:** boost ambient embers; move anvil strike from hover to click ([2c26431](https://github.com/simiancraft/unitforge/commit/2c26431d89a9cc3ef85978048122fd944204d447))
* **demo:** decouple flash variant from flashKey; mousedown pins to variant 2 ([70d04ad](https://github.com/simiancraft/unitforge/commit/70d04aded71df23d97516baa08300d1b685a72c3))
* **demo:** drag correctness; extract useSvgPointerDrag, fix grab offset, add cancel ([5a953c5](https://github.com/simiancraft/unitforge/commit/5a953c5271403ab7997bf5d63172dd33caae29ec))
* **demo:** flash scale via CSS var on body so first click reflects intensity ([fc96613](https://github.com/simiancraft/unitforge/commit/fc9661300e40462a248488ad710031add8fdf4a7))
* **demo:** forge-flash uses explicit w-screen so it spans full viewport ([4f1e5d3](https://github.com/simiancraft/unitforge/commit/4f1e5d33b382a7b729e662268793e499bbf79080))
* **demo:** hygiene pass; shiki/core, contrast, motion, error boundary, clamps ([cf235b9](https://github.com/simiancraft/unitforge/commit/cf235b9e4ccf2ce58fab232d027229ca5e9ea5fb)), closes [#7a6948](https://github.com/simiancraft/unitforge/issues/7a6948) [#4d566b](https://github.com/simiancraft/unitforge/issues/4d566b) [#b73a3b](https://github.com/simiancraft/unitforge/issues/b73a3b) [#3e7fa6](https://github.com/simiancraft/unitforge/issues/3e7fa6) [#6e9c7e](https://github.com/simiancraft/unitforge/issues/6e9c7e) [#a06a2e](https://github.com/simiancraft/unitforge/issues/a06a2e) [#main](https://github.com/simiancraft/unitforge/issues/main)
* **demo:** keyboard parity, progressbar role honesty, drop the last cast ([b8cc4ba](https://github.com/simiancraft/unitforge/commit/b8cc4ba5624ff2ea6e63473e09e8357a12c38067))
* **demo:** keyboard-Space nav, picker dedup, cva for code, lazy init ([02aa410](https://github.com/simiancraft/unitforge/commit/02aa4109ed04e0776b5491cbeff7fabd021331cb))
* **demo:** make geometry SVGs responsive on small viewports ([75dd9ad](https://github.com/simiancraft/unitforge/commit/75dd9ad1031b9bac5b2b84b73c43d95e3a4a1e31))
* **demo:** pin flash scaleX to 1; only scaleY by intensity ([cc95017](https://github.com/simiancraft/unitforge/commit/cc950173536543a00b5ce9cd01b062ecd81587c8))
* **demo:** pointer-capture target, stoke timer cleanup, redundant data-theme ([b3906fb](https://github.com/simiancraft/unitforge/commit/b3906fb2273b24a16e945148d210dccb7cfa5a3f))
* **demo:** polish pass — keyboard nav, a11y, bundle trim, findByKey narrowing ([dcedd0c](https://github.com/simiancraft/unitforge/commit/dcedd0c28d91ebcf0f6c2991348985fffb579430))
* **demo:** portal forge-flash + ember streams to body so transforms can't reclip ([f3d70aa](https://github.com/simiancraft/unitforge/commit/f3d70aa7acef7ed147262c7a0a61746a99e2b4bb))
* **demo:** preserve literal-key unions end-to-end ([ab9b90f](https://github.com/simiancraft/unitforge/commit/ab9b90ff3d8a4e46feec804e2adf6202e69764e7))
* **demo:** re-trigger anvil strike on each press ([8439aac](https://github.com/simiancraft/unitforge/commit/8439aaccd77259f9183d236888ec3ee560af2767))
* **demo:** stringify --uf-flash-scale so the keyframe scaleY picks up intensity ([205550b](https://github.com/simiancraft/unitforge/commit/205550b1f0b9e21be33436a78d9632fc9a8df39a))
* review followups (hash anchors, stale refs, README H1) ([f4768f3](https://github.com/simiancraft/unitforge/commit/f4768f3037b688c43c622cab7932900decccf0ba))
* review followups across lib + demo ([b90b98d](https://github.com/simiancraft/unitforge/commit/b90b98d86771468903db6fa6f638ee84f81b35d5))


### Features

* **demo:** add sticky ForgeBench + reactive backgrounds + animated throughput ([9fb4fcd](https://github.com/simiancraft/unitforge/commit/9fb4fcd39e0000e4c6c029f4d1c57f25782059f5))
* **demo:** decouple code-block syntax theme per kit (lazy-loaded shiki) ([ce69709](https://github.com/simiancraft/unitforge/commit/ce69709eeee70699f378927f213eb7ac2b8c569f))
* **demo:** direct manipulation on rectangle and circle widgets ([0c50133](https://github.com/simiancraft/unitforge/commit/0c5013306cdc8379b612266320827dced872b81e))
* **demo:** EmberStream + round-robin stoke pool ([5b3cd94](https://github.com/simiancraft/unitforge/commit/5b3cd944a9a143a9b2d22e89f5fb3f0e2c8afa2e))
* **demo:** fix theme cascade; add copy buttons, ember bursts, anvil flair ([e6b8b41](https://github.com/simiancraft/unitforge/commit/e6b8b41827c86ff0f1d980a4a31219771ff63bf3))
* **demo:** forge a city; single COUNT dimension, 2:3 wheat+ore recipe ([47a8650](https://github.com/simiancraft/unitforge/commit/47a865071a8017c86964fe4b564f4bfd5221748e))
* **demo:** forge-base glow flash at the bottom of the home viewport ([78db51b](https://github.com/simiancraft/unitforge/commit/78db51bcaee589148d21649f102c9f1fa0aac81f))
* **demo:** home redesign; thesis tagline, slim bench, core api, BYO Catan ([3b356f5](https://github.com/simiancraft/unitforge/commit/3b356f52abc6843800437b7a836f6fa835ee2cfe))
* **demo:** layered ember system with tweakable consts and sin-style sway ([f726cdf](https://github.com/simiancraft/unitforge/commit/f726cdfdafc47c400aaef7789482e3d695147a8a))
* **demo:** per-kit code-block character; CRT chrome on data-storage, ([6d8a240](https://github.com/simiancraft/unitforge/commit/6d8a2406a60232dc5770d4f051c07bafc7eeb287)), closes [#ede4cf](https://github.com/simiancraft/unitforge/issues/ede4cf)
* **demo:** rebuild as themed multi-kit interactive showcase ([df25270](https://github.com/simiancraft/unitforge/commit/df25270a5ba63f4eee3ab8c4a4a5451c45047dd2))
* **demo:** root ThemeProvider with light/dark variants per kit ([8c80ad7](https://github.com/simiancraft/unitforge/commit/8c80ad721f567b686429645c68d287b33072a18d))
* **demo:** theatrical DriveVsOs panels and RamStick boot sequence ([066469c](https://github.com/simiancraft/unitforge/commit/066469c07ee1a8ed72592ce6ded1c604a85386b9))
* **demo:** visceral pass; reactive home, shiki bench, geometry pulse ([5aaa330](https://github.com/simiancraft/unitforge/commit/5aaa330853e33c475afd9cabfe87830d909d8990))

# [1.1.0](https://github.com/simiancraft/unitforge/compare/v1.0.0...v1.1.0) (2026-05-12)


### Features

* **data-storage:** add data-storage kit with decimal, binary, and bit units ([f20aa95](https://github.com/simiancraft/unitforge/commit/f20aa95c546efdf2c6b341c3238a2e4f0dc86296))
* **demo:** add hash-based routing with per-kit pages ([bd01a0e](https://github.com/simiancraft/unitforge/commit/bd01a0e0ab7fec21b191393847a6c25a9fcaacfe))
* **demo:** replace placeholder with two-kit live forge demo ([ba70c36](https://github.com/simiancraft/unitforge/commit/ba70c36cd7ea26de08be660d94542e4ea110bf6e))

# 1.0.0 (2026-05-11)


### Bug Fixes

* badge URL drift; readme subpath table; throwing-getter test exposed deeper bug ([df25cdb](https://github.com/simiancraft/unitforge/commit/df25cdbee835fe068cae02a918ded4849ebb24b1))
* **forge:** name input/output types; NoInfer fixes within-dim soundness ([3d51dbe](https://github.com/simiancraft/unitforge/commit/3d51dbeb8f93dacd2aca68933a335c89c98f57b0))
* **validation:** freeze inputs/failures; per-field message formatting ([f739595](https://github.com/simiancraft/unitforge/commit/f7395956432fad7e3406d39d4f1ec475b7a57210))


### Features

* bump engines.node to >=22; VERSION on opt-in ./version subpath ([1f4f12b](https://github.com/simiancraft/unitforge/commit/1f4f12b3209fbb67d93c5079802ac0e6477b8bfb))
* **demo:** scaffold pre-alpha placeholder demo ([95d616f](https://github.com/simiancraft/unitforge/commit/95d616f72350d38817ceaf151393bd056ebceb97))
* **geometry:** add 5 cross-dim conversions (area + volume derivations) ([2ea8786](https://github.com/simiancraft/unitforge/commit/2ea8786be942b2e4ca1f3569701464f6e7eca3c9))
* **geometry:** add AREA units (mm², cm², km², in², ft², acre, hectare) ([5ccebbe](https://github.com/simiancraft/unitforge/commit/5ccebbe77a4ceb2e6c458a79fd3ccb7b9074e700))
* **geometry:** add LENGTH units (mm, km, in, ft, yd, mi) ([4e3d5e3](https://github.com/simiancraft/unitforge/commit/4e3d5e3b9f0ba134e5568079803e8046704573fd))
* **geometry:** add VOLUME units (m³ base, cm³, in³, ft³, L, mL) ([d88b287](https://github.com/simiancraft/unitforge/commit/d88b287e9daca3e734e958dfccbe2a8c166c8eaa))
* scaffold core API + geometry kit + first integration tests ([b3db00f](https://github.com/simiancraft/unitforge/commit/b3db00f7a6009b1c7b01844db2430c842f62a633)), closes [#13](https://github.com/simiancraft/unitforge/issues/13)


### Performance Improvements

* **geometry:** inline closures so PURE marker actually tree-shakes ([f44a08e](https://github.com/simiancraft/unitforge/commit/f44a08e6a3d29df0bca1d0954404989bab382829))
