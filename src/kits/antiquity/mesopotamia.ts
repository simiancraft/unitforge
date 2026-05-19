// Mesopotamian units of measure. Sumerian and Akkadian / Babylonian
// metrology was sexagesimal throughout: 60 shusi to the cubit's
// 30 fingers, 60 shekels to the mina, 60 mina to the talent, with
// the rod (nindan) as the architectural anchor. The system runs
// from Ur III (c. 2100 BCE) through Achaemenid Babylonia (c. 539
// BCE) with regional variation.
//
// Era scope: Old Babylonian / Ur III values are the canonical
// reference (Powell, "Masse und Gewichte" in Reallexikon der
// Assyriologie, Vol. 7, 1987-90; the standard scholarly reference).
// Neo-Babylonian and earlier Sumerian variants exist with small
// drift in the shekel and shusi anchors; noted where the variance
// is well-established.

import { defineUnit } from '../../define.js';
import { LENGTH, MASS, VOLUME } from '../../dimensions.js';

// Module-private anchors per Powell 1987:
//   1 shusi = 16.62 mm; 1 kuš = 30 shusi; 1 nindan = 12 kuš.
//   1 shekel (common) = 1/60 mina; mina = 500 g (Old Babylonian
//   common standard); talent = 60 mina = 30 kg.
//   1 sila (Ur III) ≈ 0.842 L; gur = 300 sila.
const SHUSI_M = 0.01662;
const KUSH_M = SHUSI_M * 30;
const NINDAN_M = KUSH_M * 12;
const MINA_BABYLONIAN_KG = 0.5;
const SILA_M3 = 0.842e-3;

/** Mesopotamian shusi (Sumerian še-su; Akkadian ubānu, "finger");
 *  ~16.62 mm. The smallest standard length subdivision of Sumerian
 *  and Babylonian metrology; 1/30 of the kuš. Powell 1987 anchor. */
export const shusiMesopotamia = /*#__PURE__*/ defineUnit({
  id: 'shusi-mesopotamia',
  label: 'Mesopotamian Shusi (finger)',
  symbol: 'še-su',
  dimension: LENGTH,
  toBase: (v) => v * SHUSI_M,
  fromBase: (b) => b / SHUSI_M,
});

/** Mesopotamian kuš (Sumerian; Akkadian ammatu, "cubit"); 30 shusi
 *  ≈ 0.499 m. The common Babylonian cubit; distinct from the longer
 *  "royal" cubit (~0.55 m) attested in some royal-inscription
 *  contexts. */
export const kushMesopotamia = /*#__PURE__*/ defineUnit({
  id: 'kush-mesopotamia',
  label: 'Mesopotamian Kuš (cubit)',
  symbol: 'kuš',
  dimension: LENGTH,
  toBase: (v) => v * KUSH_M,
  fromBase: (b) => b / KUSH_M,
});

/** Mesopotamian nindan (Sumerian; Akkadian gar, "rod" / "pole");
 *  12 kuš ≈ 5.98 m. The fundamental architectural and surveying unit;
 *  field-measurement texts (e.g., Old Babylonian land deeds) record
 *  lengths in nindan and widths in kuš. */
export const nindanMesopotamia = /*#__PURE__*/ defineUnit({
  id: 'nindan-mesopotamia',
  label: 'Mesopotamian Nindan (rod)',
  symbol: 'gar',
  dimension: LENGTH,
  toBase: (v) => v * NINDAN_M,
  fromBase: (b) => b / NINDAN_M,
});

/** Mesopotamian uš; 60 nindan ≈ 359 m. Long-distance survey unit;
 *  used in the cadastral records of larger Old Babylonian estates. */
export const ushMesopotamia = /*#__PURE__*/ defineUnit({
  id: 'ush-mesopotamia',
  label: 'Mesopotamian Uš',
  symbol: 'uš',
  dimension: LENGTH,
  toBase: (v) => v * (NINDAN_M * 60),
  fromBase: (b) => b / (NINDAN_M * 60),
});

/** Mesopotamian shekel (Sumerian gin; Akkadian šiqlu); 1/60 Babylonian
 *  common mina ≈ 8.33 g. The small mass and silver-valuation unit of
 *  Old Babylonian and later Mesopotamian economies. A "heavy" or
 *  "royal" shekel of ~16.67 g (twice the common) is attested in some
 *  royal-economy contexts; this ships the common value. */
export const shekelBabylonian = /*#__PURE__*/ defineUnit({
  id: 'shekel-babylonian',
  label: 'Babylonian Shekel (common)',
  symbol: 'gin / šiqlu',
  dimension: MASS,
  toBase: (v) => v * (MINA_BABYLONIAN_KG / 60),
  fromBase: (b) => b / (MINA_BABYLONIAN_KG / 60),
});

/** Mesopotamian mina (Sumerian mana; Akkadian manû); 60 shekels =
 *  500 g (Old Babylonian common standard, Powell 1987). The base
 *  mass unit of large transactions in the Mesopotamian metal economy. */
export const minaBabylonian = /*#__PURE__*/ defineUnit({
  id: 'mina-babylonian',
  label: 'Babylonian Mina (common)',
  symbol: 'mana / manû',
  dimension: MASS,
  toBase: (v) => v * MINA_BABYLONIAN_KG,
  fromBase: (b) => b / MINA_BABYLONIAN_KG,
});

/** Mesopotamian talent (Sumerian gun; Akkadian biltu); 60 mina = 30 kg.
 *  The largest standard mass unit of Mesopotamian metrology; tribute
 *  inscriptions and royal-economy texts record metal quantities in
 *  talents. Distinct from the Attic talent (`talentAttic`, ~25.86 kg)
 *  shipped under Greece. */
export const talentBabylonian = /*#__PURE__*/ defineUnit({
  id: 'talent-babylonian',
  label: 'Babylonian Talent',
  symbol: 'gun / biltu',
  dimension: MASS,
  toBase: (v) => v * (MINA_BABYLONIAN_KG * 60),
  fromBase: (b) => b / (MINA_BABYLONIAN_KG * 60),
});

/** Mesopotamian sila (sìla); Ur III standard ~0.842 L. The standard
 *  liquid and grain volume unit of Sumerian and Old Babylonian
 *  accounting; ration tables typically record beer and barley in
 *  silas. Powell 1987 derives the value from Ur III storage-jar
 *  capacities and cuneiform ration records. */
export const silaMesopotamia = /*#__PURE__*/ defineUnit({
  id: 'sila-mesopotamia',
  label: 'Mesopotamian Sila',
  symbol: 'sìla',
  dimension: VOLUME,
  toBase: (v) => v * SILA_M3,
  fromBase: (b) => b / SILA_M3,
});

/** Mesopotamian gur (Sumerian; Akkadian kurru); Ur III standard
 *  = 300 sila ≈ 252.6 L. The large grain-storage measure of Sumerian
 *  and Old Babylonian granary records; Neo-Babylonian gur is larger
 *  (~180 L → ~360 L depending on regional standard), and the Ur III
 *  value is the canonical reference. */
export const gurMesopotamia = /*#__PURE__*/ defineUnit({
  id: 'gur-mesopotamia',
  label: 'Mesopotamian Gur (Ur III)',
  symbol: 'gur / kurru',
  dimension: VOLUME,
  toBase: (v) => v * (SILA_M3 * 300),
  fromBase: (b) => b / (SILA_M3 * 300),
});
