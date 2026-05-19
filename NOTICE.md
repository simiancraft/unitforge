# Notices and Attributions

unitforge ships under the MIT license (see [LICENSE](./LICENSE)). This document tracks third-party sources, standards, and trademarks referenced by the library, its kits, and the demo site at https://simiancraft.github.io/unitforge/.

This is the canonical location for attributions. New kits, demo dependencies, fonts, icon sets, and standards citations all get a line here; we do not litter attribution notices across individual source files.

## Standards cited in the library

- **NIST SP 811:** SI / customary unit conversion factors (US fluid ounce = 29.5735295625 mL exactly; US gallon = 3.785411784 L exactly; etc.). Cited inline in `src/kits/cooking/units.ts` and the geometry kit.
- **UK Weights and Measures Act 1985:** imperial gallon = 4.54609 L exactly; imperial fluid ounce = 1/160 imperial gallon. Cited inline in `src/kits/cooking/units.ts`.
- **BIPM SI Brochure (9th ed.), Tables 4 and 8:** radian as the SI-coherent unit of plane angle; non-SI units accepted for use with the SI (degree, arcminute, arcsecond). Cited inline in `src/kits/geometry/units.ts` for the ANGLE units.
- **ISO 80000-3:2019 §3-5:** plane angle (gradian, turn). Cited inline in `src/kits/geometry/units.ts`.
- **USP General Chapter <17> (Prescription Container Labeling):** clinical 5 mL teaspoon convention. Cited in the cooking kit's module docstring as the carve-out for clinical-adjacent use.
- **ISMP List of Error-Prone Abbreviations, Symbols, and Dose Designations:** referenced in the cooking kit's `dash` and `pinch` JSDocs as the reason those units are not safe for medication dosing.
- **BIPM SI Brochure 9th ed. §2.3.1 (Celsius scale definition; CGPM 1967/68 Resolution 3):** °C → K offset of 273.15 K. Cited in `src/kits/temperature/units.ts`.
- **ITS-90 (International Temperature Scale of 1990):** referenced in `src/kits/temperature/units.ts` as the practical realisation scale used by calibration laboratories.
- **IAU 2012 Resolution B2, 2015 Resolution B2, IHO 1929 (Monaco), IUPAC Gold Book:** astronomical and crystallographic length unit definitions. Cited inline in `src/kits/length/units.ts`.
- **EU Regulation 1308/2013 Annex VII Part III:** EU butter packaging convention (250 g block). Cited in `src/kits/cooking/units.ts`.
- **21 CFR 131.111:** US butter stick (1/4 of a 1-lb wrapper) convention. Cited in `src/kits/cooking/units.ts`.
- **GB/T 17710-1999, JIS S 2052, 84 FR 55562 (Oct 17, 2019):** referenced in earlier source revisions; current revisions either soften or replace these citations after verification (the modern PRC market jin is anchored by PRC metrology convention; the Japanese 200 mL cooking cup is anchored by cookbook convention; the US survey foot deprecation cites 84 FR 55562 directly).

## Scholarly sources cited in `kits/antiquity`

The Units of Antiquity kit (`src/kits/antiquity/`) cites the standard scholarly references for each civilization's metrology. None of these works ship as part of the package; they are the JSDoc anchors that document where each unit's value comes from.

- **Petrie, W. M. Flinders.** *The Pyramids and Temples of Gizeh* (1883) and *Ancient Weights and Measures* (1926). Cited in `egypt.ts` for the royal cubit and New Kingdom deben.
- **Lepre, J. P.** *The Egyptian Pyramids: A Comprehensive, Illustrated Reference* (1990). Cited in `egypt.ts` for the royal cubit.
- **Pommerening, Tanja.** *Die altägyptischen Hohlmaße* (2005). Cited in `egypt.ts` for the heqat (~4.785 L).
- **Powell, Marvin A.** "Masse und Gewichte." *Reallexikon der Assyriologie und Vorderasiatischen Archäologie*, Vol. 7 (de Gruyter, 1987-90). Cited in `mesopotamia.ts` for shusi (16.62 mm), Old Babylonian mina (500 g), and sila (~0.842 L Ur III).
- **Wilson, Andrew (ed.).** *The Oxford Handbook of Engineering and Technology in the Classical World* (Oxford University Press, 2008). Cited in `greece.ts` and `rome.ts` for pous Attic / pous Doric / pes Romanus standards.
- **Duncan-Jones, Richard.** *Money and Government in the Roman Empire* (Cambridge University Press, 1994). Cross-reference for the Augustan libra (327.45 g).
- **Crawford, Michael H.** *Roman Republican Coinage* (Cambridge, 1974) and *Roman Imperial Coinage* (RIC), various editors. Cited in `rome.ts` for denarius / aureus / solidus mass standards.
- **Connor, R. D.** *The Weights and Measures of England* (HMSO, 1987). Cited in `english-historical.ts` for pre-1835 trade stones and pre-Imperial gallons.
- **Zupko, Ronald Edward.** *British Weights and Measures: A History from Antiquity to the Seventeenth Century* (University of Wisconsin Press, 1977). Cited in `english-historical.ts` for trade-specific stone variants (Suffolk cheese stone, etc.).
- **Qiu Guangming (邱光明).** *中国历代度量衡考* ("Studies of Historical Chinese Weights and Measures," Science Press, 1992). Cited in `china.ts` for dynastic chi values (Han through Qing).
- **Wu Chengluo (吴承洛).** *中国度量衡史* ("History of Chinese Weights and Measures," 1937). Cited in `china.ts` for the Han sheng (~199.7 mL).
- **Iwata, Shigemi.** *Shakkanhō no Rekishi* (尺貫法の歴史, "History of the Shakkanhō"). Cited in `japan.ts` for the Hideyoshi-era kyō-masu and Edo-period ri.
- **Vargo, M.** "Japanese Weights and Measures." *Transactions of the Asiatic Society of Japan*, 1903. Cited in `japan.ts`.
- **Hezekiah's Tunnel / Siloam Inscription** (c. 700 BCE) and Iron Age weight stones from Lachish, Arad, and Tel Beer Sheva. Cited in `hebrew.ts` for the common cubit (~0.444 m) and common shekel (~11.4 g).

## Trademarks referenced (nominative use)

Trademarks named below appear only as nominative references in the demo to describe widely-recognized consumer products by name. No affiliation, endorsement, or sponsorship is claimed or implied.

- **Coca-Cola, Mountain Dew, Sprite, Red Bull** (`demo/src/components/kits/cooking/sections/comparison-machine/parts/sugar-units.ts`): named in the soda comparator with sugar values sourced from each manufacturer's current US nutrition-facts panel.
- **Krispy Kreme** (glazed donut, 10 g sugar): same.
- **Oreo** (4.7 g per cookie): same.
- **Snickers** (27 g per full-size bar): same.

## Third-party software in the demo

The library itself (`unitforge` on npm) has zero runtime dependencies. The demo site at `demo/` bundles the following open-source packages; their licenses are reproduced in their respective package directories:

- **React** (MIT): UI library.
- **Babylon.js** (Apache-2.0): 3D engine used by the geometry kit's shape machines and the data-storage volume machine.
- **Radix UI** (MIT): `@radix-ui/react-select` for the unit pickers.
- **Lucide** (ISC): icon set; used for menu glyphs, food stamps, and section icons across every kit's demo page.
- **Shiki** (MIT): code-block syntax highlighting.
- **Tailwind CSS** (MIT): utility-class styling.
- **class-variance-authority** (Apache-2.0), **clsx** (MIT), **tailwind-merge** (MIT): Tailwind class composition.
- **Vite** + **Rolldown** (both MIT): demo build tooling.

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
