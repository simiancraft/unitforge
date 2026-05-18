// MASS units. Foundational kit; domain kits (cooking, future pharmacy,
// home-construction, etc.) re-export from here rather than redeclaring.
// Authoring rules per kits/cooking/units.ts §1-3 apply verbatim
// (`/*#__PURE__*/` on every `defineUnit`; no `CallExpression` in spec
// literal; inline `toBase` / `fromBase` closures; never spread
// `...linear(scale)`).

// Stage 2 will populate this file with: gram (base), kilogram, milligram,
// microgram, ounce avoirdupois, pound, stone, tonne (metric), short ton
// (US), long ton (UK), and the jin disambiguation (jinPrc 500 g vs jinHk
// 600 g per GB/T 17710-1999 and HK historical catty). Citations:
// NIST SP 811 for avoirdupois-to-SI exact factors; GB/T 17710-1999 for
// the modern PRC jin.

export {};
