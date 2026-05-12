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
