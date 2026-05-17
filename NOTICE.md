# Notices and Attributions

unitforge ships under the MIT license (see [LICENSE](./LICENSE)). This document tracks third-party sources, standards, and trademarks referenced by the library, its kits, and the demo site at https://simiancraft.github.io/unitforge/.

This is the canonical location for attributions. New kits, demo dependencies, fonts, icon sets, and standards citations all get a line here; we do not litter attribution notices across individual source files.

## Standards cited in the library

- **NIST SP 811:** SI / customary unit conversion factors (US fluid ounce = 29.5735295625 mL exactly; US gallon = 3.785411784 L exactly; etc.). Cited inline in `src/kits/cooking/units.ts` and the geometry kit.
- **UK Weights and Measures Act 1985:** imperial gallon = 4.54609 L exactly; imperial fluid ounce = 1/160 imperial gallon. Cited inline in `src/kits/cooking/units.ts`.
- **USP General Chapter <17> (Prescription Container Labeling):** clinical 5 mL teaspoon convention. Cited in the cooking kit's module docstring as the carve-out for clinical-adjacent use.
- **ISMP List of Error-Prone Abbreviations, Symbols, and Dose Designations:** referenced in the cooking kit's `dash` and `pinch` JSDocs as the reason those units are not safe for medication dosing.

## Trademarks referenced (nominative use)

Trademarks named below appear only as nominative references in the demo to describe widely-recognized consumer products by name. No affiliation, endorsement, or sponsorship is claimed or implied.

- **Coca-Cola, Mountain Dew, Sprite, Red Bull** (`demo/src/components/kits/cooking/sections/comparison-machine/parts/sugar-units.ts`): named in the soda comparator with sugar values sourced from each manufacturer's current US nutrition-facts panel.
- **Krispy Kreme** (glazed donut, 10 g sugar): same.
- **Oreo** (4.7 g per cookie): same.
- **Snickers** (27 g per full-size bar): same.

## Third-party software in the demo

The library itself (`unitforge` on npm) has zero runtime dependencies. The demo site at `demo/` bundles the following open-source packages; their licenses are reproduced in their respective package directories:

- **React** (MIT) — UI library.
- **Babylon.js** (Apache-2.0) — 3D engine used by the geometry kit's shape machines and the data-storage volume machine.
- **Radix UI** (MIT) — `@radix-ui/react-select` for the unit pickers.
- **Lucide** (ISC) — icon set; used for menu glyphs, food stamps, and section icons across every kit's demo page.
- **Shiki** (MIT) — code-block syntax highlighting.
- **Tailwind CSS** (MIT) — utility-class styling.
- **class-variance-authority** (Apache-2.0), **clsx** (MIT), **tailwind-merge** (MIT) — Tailwind class composition.
- **Vite** + **Rolldown** (both MIT) — demo build tooling.

## Standing discipline for new kits and demos

Anything added that touches a third-party standard, brand, font, icon set, or library must:

1. Cite the source (with a stable URL and version) in the kit's source code where it's referenced.
2. Add an entry above in the relevant section of this document.
3. Disclaim affiliation, endorsement, or certification where appropriate.
4. Treat trademarked names as **nominative references** only.

Examples of standards likely to appear in future kits:

- **SI base units:** definitions per the BIPM (Bureau International des Poids et Mesures).
- **Imperial / US customary units:** definitions per NIST.
- **Pharmacological IU:** definitions per USP / WHO.
- **Astronomical units:** definitions per the IAU.
