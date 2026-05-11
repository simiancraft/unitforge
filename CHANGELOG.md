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
