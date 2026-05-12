# unitforge: Agent Instructions

A units-of-measure library for arbitrary domains. Three free functions; three additive registries (dimensions, kits, conversions); first-class custom dimensions and packaging units. Not a physics library.

## Status

Published to npm. Public API is stable. [README.md](./README.md) is canonical for the public surface; [llms.txt](./llms.txt) condenses it for agent consumers.

## Conventions

- Bun, TypeScript ESM, biome for lint+format, semantic-release driven by Conventional Commits.
- Tree-shakeable, side-effect-free package. `"sideEffects": false`.
- Free-function API; no instance factory.
- Single-hop conversions only. No path searching.
- Granular per-unit files in `src/kits/<domain>/`, flat `src/dimensions.ts`, flat `src/conversions/`.

## Commits

Conventional Commits, imperative tense, succinct. `feat:` → minor release; `fix:` → patch; `feat!:` or `BREAKING CHANGE:` footer → major. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Reference

Sibling project [chromonym](https://github.com/simiancraft/chromonym) is the architectural specimen for boilerplate, CI, release, and documentation patterns.
