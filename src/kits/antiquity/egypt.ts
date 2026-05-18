// Ancient Egyptian units of measure. The civilization's metrology
// was the most internally consistent of the ancient world: the royal
// cubit (mh nswt) anchored all length; the deben (dbn) anchored
// mass; the heqat (HqAt) anchored grain volume. Each unit derives
// from its civilization's anchor exactly so a hieroglyphic-text
// reader can chain back to the meter, kilogram, or liter without
// hunting for a per-unit constant.
//
// Era scope: New Kingdom values (c. 1550-1069 BCE) are the standard
// reference; Old and Middle Kingdom variants exist (e.g., the Old
// Kingdom deben at ~13.6 g, distinct from the New Kingdom unified
// deben at ~91 g) and are noted in JSDoc where the variance is
// scholarly consensus.
//
// Authoring rules per kits/cooking/units.ts §1-3 apply verbatim
// (`/*#__PURE__*/` on every defineUnit; inline closures; no
// `CallExpression` in the spec literal).

import { defineUnit } from '../../define.js';
import { LENGTH, MASS, VOLUME } from '../../dimensions.js';

// Module-private anchors. The royal cubit at 0.5236 m is the mean
// of surviving stone rulers and architectural measurements (Petrie's
// 1880-83 pyramid surveys; Lepre, *Egyptian Pyramids*, 1990).
const ROYAL_CUBIT_M = 0.5236;
const PALM_M = ROYAL_CUBIT_M / 7;
const DIGIT_M = PALM_M / 4;
const DEBEN_NEW_KINGDOM_KG = 0.091;
const HEQAT_M3 = 4.785e-3;

/** Egyptian royal cubit (mh nswt, "meh nesut"); 0.5236 m ≈ 20.62 in.
 *  7 palms / 28 digits. The architectural cubit of Egyptian state
 *  projects: pyramid bases at Giza, temple stones at Karnak, the
 *  Nilometer at Elephantine. Value is the mean of surviving cubit
 *  rods (Petrie 1880-83 surveys; Lepre 1990). Distinct from the
 *  6-palm short cubit `shortCubitEgypt` (~0.449 m). */
export const royalCubitEgypt = /*#__PURE__*/ defineUnit({
  id: 'royal-cubit-egypt',
  label: 'Egyptian Royal Cubit',
  symbol: 'mh nswt',
  dimension: LENGTH,
  toBase: (v) => v * ROYAL_CUBIT_M,
  fromBase: (b) => b / ROYAL_CUBIT_M,
});

/** Egyptian short cubit; 6 palms = 6/7 royal cubit ≈ 0.4488 m. The
 *  common-use cubit for textiles, smaller objects, and Nilometric
 *  flood markers; distinct from the architectural royal cubit. */
export const shortCubitEgypt = /*#__PURE__*/ defineUnit({
  id: 'short-cubit-egypt',
  label: 'Egyptian Short Cubit',
  symbol: 'meh-niwt',
  dimension: LENGTH,
  toBase: (v) => v * (PALM_M * 6),
  fromBase: (b) => b / (PALM_M * 6),
});

/** Egyptian palm (shesep, šsp); 1/7 royal cubit ≈ 0.0748 m. 4 digits;
 *  used for incremental architectural and craft measurement. */
export const palmEgypt = /*#__PURE__*/ defineUnit({
  id: 'palm-egypt',
  label: 'Egyptian Palm',
  symbol: 'shesep',
  dimension: LENGTH,
  toBase: (v) => v * PALM_M,
  fromBase: (b) => b / PALM_M,
});

/** Egyptian digit (zebo, ḏbʿ); 1/4 palm = 1/28 royal cubit ≈ 0.0187 m.
 *  The finest standard subdivision in Egyptian metrology; surviving
 *  cubit rods are graduated in digits. */
export const digitEgypt = /*#__PURE__*/ defineUnit({
  id: 'digit-egypt',
  label: 'Egyptian Digit',
  symbol: 'zebo',
  dimension: LENGTH,
  toBase: (v) => v * DIGIT_M,
  fromBase: (b) => b / DIGIT_M,
});

/** Egyptian deben (dbn), New Kingdom standard; ~91 g. The unified
 *  mass standard from the 18th Dynasty onward (Hatshepsut / Thutmose
 *  III reforms); used for metal valuation in copper, silver, and
 *  gold across the New Kingdom economy (~1550-1069 BCE). Old Kingdom
 *  deben values were lower (~13.6 g per Petrie's *Ancient Weights and
 *  Measures*, 1926); the New Kingdom value is the standard reference
 *  unless an older era is specified. */
export const debenEgypt = /*#__PURE__*/ defineUnit({
  id: 'deben-egypt',
  label: 'Egyptian Deben (New Kingdom)',
  symbol: 'dbn',
  dimension: MASS,
  toBase: (v) => v * DEBEN_NEW_KINGDOM_KG,
  fromBase: (b) => b / DEBEN_NEW_KINGDOM_KG,
});

/** Egyptian qedet (qdt, "kite"); 1/10 New Kingdom deben ≈ 9.1 g. The
 *  fractional mass unit for smaller transactions, particularly silver
 *  valuation in the late New Kingdom economy. */
export const qedetEgypt = /*#__PURE__*/ defineUnit({
  id: 'qedet-egypt',
  label: 'Egyptian Qedet',
  symbol: 'qdt',
  dimension: MASS,
  toBase: (v) => v * (DEBEN_NEW_KINGDOM_KG / 10),
  fromBase: (b) => b / (DEBEN_NEW_KINGDOM_KG / 10),
});

/** Egyptian heqat (HqAt); ~4.785 L. The standard grain-volume measure
 *  of pharaonic Egypt; 10 hin = 1 heqat, 4 heqat = 1 oipe (jpt),
 *  16 heqat = 1 khar. Used in ration accounts (e.g., the Wilbour
 *  Papyrus) and granary records. Value from Petrie's archaeological
 *  surveys; Pommerening (2005) and subsequent scholarship retain
 *  ~4.78-4.80 L as the canonical range. */
export const heqatEgypt = /*#__PURE__*/ defineUnit({
  id: 'heqat-egypt',
  label: 'Egyptian Heqat',
  symbol: 'HqAt',
  dimension: VOLUME,
  toBase: (v) => v * HEQAT_M3,
  fromBase: (b) => b / HEQAT_M3,
});

/** Egyptian hin (hnw); 1/10 heqat ≈ 0.4785 L. The smaller grain and
 *  liquid measure; appears in beer-and-bread ration tables and
 *  medical-text prescriptions. */
export const hinEgypt = /*#__PURE__*/ defineUnit({
  id: 'hin-egypt',
  label: 'Egyptian Hin',
  symbol: 'hnw',
  dimension: VOLUME,
  toBase: (v) => v * (HEQAT_M3 / 10),
  fromBase: (b) => b / (HEQAT_M3 / 10),
});
