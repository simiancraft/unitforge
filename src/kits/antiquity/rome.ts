// Roman units of measure. The system was decimal-then-twelves: the
// pes (foot) divided into 16 digits or 12 unciae (inches), the
// passus (pace) was 5 pes, the mille passus (Roman mile) was 1000
// passus. Mass was sexagesimal-ish via the libra (12 unciae) and
// the denarius/aureus/solidus coinage standards. Liquid and grain
// volume hung off the sextarius and modius.
//
// Era scope: Augustan / Early Imperial values are the canonical
// reference (1st c. BCE - 1st c. CE). The libra mass drifted across
// the Republic and Empire; 327.45 g is the most widely cited
// modern reconstruction for the Augustan-era libra. The solidus
// dates from Constantine's 309 CE reform and is later than the
// other coinage units shipped here.

import { defineUnit } from '../../define.js';
import { LENGTH, MASS, VOLUME } from '../../dimensions.js';

// Module-private anchors:
//   pes Romanus = 0.2957 m (Wilson 2008; matches Attic pous closely).
//   pes Drusianus = 0.3325 m (provincial Drusian foot, German limes).
//   libra = 0.32745 kg (Augustan; reconstructed from surviving
//     bronze and lead libra weights).
//   sextarius = 0.546 L (liquid measure, standard reconstruction).
const PES_ROMANUS_M = 0.2957;
const PES_DRUSIANUS_M = 0.3325;
const LIBRA_KG = 0.32745;
const UNCIA_MASS_KG = LIBRA_KG / 12;
const SEXTARIUS_M3 = 0.546e-3;

/** Roman pes (foot); ~0.2957 m. The fundamental Roman length unit;
 *  12 unciae (Roman inches) or 16 digiti (digits) per pes. Close
 *  to the Attic pous (~0.296 m); the two were near-interchangeable
 *  in Roman-era Greek metrology. Wilson 2008 anchor. */
export const pesRomanus = /*#__PURE__*/ defineUnit({
  id: 'pes-romanus',
  label: 'Roman Pes',
  symbol: 'pes',
  dimension: LENGTH,
  toBase: (v) => v * PES_ROMANUS_M,
  fromBase: (b) => b / PES_ROMANUS_M,
});

/** Pes Drusianus; ~0.3325 m. The "Drusian foot," a provincial
 *  Roman foot standard used in surveying north of the Alps
 *  (Germania, named for Nero Claudius Drusus). 12.5% larger than
 *  the standard pes Romanus; appears in Limes-Germanicus
 *  fortification surveys. */
export const pesDrusianus = /*#__PURE__*/ defineUnit({
  id: 'pes-drusianus',
  label: 'Roman Pes (Drusian)',
  symbol: 'pes (Drus.)',
  dimension: LENGTH,
  toBase: (v) => v * PES_DRUSIANUS_M,
  fromBase: (b) => b / PES_DRUSIANUS_M,
});

/** Roman digitus; 1/16 pes ≈ 0.0185 m. The finest standard Roman
 *  length subdivision; used in craft and joinery. */
export const digitusRomanus = /*#__PURE__*/ defineUnit({
  id: 'digitus-romanus',
  label: 'Roman Digitus',
  symbol: 'digitus',
  dimension: LENGTH,
  toBase: (v) => v * (PES_ROMANUS_M / 16),
  fromBase: (b) => b / (PES_ROMANUS_M / 16),
});

/** Roman uncia (length); 1/12 pes ≈ 0.0246 m. The Roman "inch";
 *  NOT the same as the mass uncia (1/12 libra ≈ 27.29 g, shipped
 *  separately). The shared "uncia" name is a Roman convention for
 *  twelfth-parts in any dimension. */
export const unciaLengthRomanus = /*#__PURE__*/ defineUnit({
  id: 'uncia-length-romanus',
  label: 'Roman Uncia (length)',
  symbol: 'uncia (len.)',
  dimension: LENGTH,
  toBase: (v) => v * (PES_ROMANUS_M / 12),
  fromBase: (b) => b / (PES_ROMANUS_M / 12),
});

/** Roman palmus; 4 digiti = 1/4 pes ≈ 0.0739 m. The Roman palm,
 *  cognate with the Egyptian palm and Greek palaiste. */
export const palmusRomanus = /*#__PURE__*/ defineUnit({
  id: 'palmus-romanus',
  label: 'Roman Palmus',
  symbol: 'palmus',
  dimension: LENGTH,
  toBase: (v) => v * (PES_ROMANUS_M / 4),
  fromBase: (b) => b / (PES_ROMANUS_M / 4),
});

/** Roman cubitus; 1.5 pes ≈ 0.444 m. The Roman cubit, the
 *  forearm-to-fingertip personal-scale length used in joinery and
 *  craft work. */
export const cubitusRomanus = /*#__PURE__*/ defineUnit({
  id: 'cubitus-romanus',
  label: 'Roman Cubitus',
  symbol: 'cubitus',
  dimension: LENGTH,
  toBase: (v) => v * (PES_ROMANUS_M * 1.5),
  fromBase: (b) => b / (PES_ROMANUS_M * 1.5),
});

/** Roman passus; 5 pes ≈ 1.4786 m. The Roman "double step" /
 *  military pace; the unit a Roman legionary cadenced to and the
 *  base for mille passus (the Roman mile). */
export const passusRomanus = /*#__PURE__*/ defineUnit({
  id: 'passus-romanus',
  label: 'Roman Passus',
  symbol: 'passus',
  dimension: LENGTH,
  toBase: (v) => v * (PES_ROMANUS_M * 5),
  fromBase: (b) => b / (PES_ROMANUS_M * 5),
});

/** Roman mille passus; 1000 passus = 5000 pes ≈ 1478.6 m. The
 *  Roman mile; 7.6% shorter than the international (statute) mile.
 *  Marker stones (milestones) along Roman roads are spaced at
 *  mille passus intervals. */
export const millePassusRomanus = /*#__PURE__*/ defineUnit({
  id: 'mille-passus-romanus',
  label: 'Roman Mile (Mille Passus)',
  symbol: 'mille passus',
  dimension: LENGTH,
  toBase: (v) => v * (PES_ROMANUS_M * 5000),
  fromBase: (b) => b / (PES_ROMANUS_M * 5000),
});

/** Roman actus; 120 pes ≈ 35.5 m. The standard Roman survey rod
 *  length; basis for the actus quadratus (120 pes × 120 pes ≈
 *  1259 m²), the smallest standard Roman farm-field area. */
export const actusRomanus = /*#__PURE__*/ defineUnit({
  id: 'actus-romanus',
  label: 'Roman Actus',
  symbol: 'actus',
  dimension: LENGTH,
  toBase: (v) => v * (PES_ROMANUS_M * 120),
  fromBase: (b) => b / (PES_ROMANUS_M * 120),
});

/** Roman libra (pound); ~327.45 g (Augustan reconstruction from
 *  surviving bronze and lead libra weights). 12 unciae per libra.
 *  The libra mass drifted across Roman history; this is the
 *  Augustan / Early Imperial standard reference. */
export const libraRomana = /*#__PURE__*/ defineUnit({
  id: 'libra-romana',
  label: 'Roman Libra (Augustan)',
  symbol: 'libra',
  dimension: MASS,
  toBase: (v) => v * LIBRA_KG,
  fromBase: (b) => b / LIBRA_KG,
});

/** Roman uncia (mass); 1/12 libra ≈ 27.29 g. The Roman "ounce";
 *  the etymological source of the modern avoirdupois and troy
 *  ounces (though the value drifted substantially during the
 *  medieval period). NOT the same as the Roman uncia (length),
 *  shipped separately. */
export const unciaMassRomana = /*#__PURE__*/ defineUnit({
  id: 'uncia-mass-romana',
  label: 'Roman Uncia (mass)',
  symbol: 'uncia (mass)',
  dimension: MASS,
  toBase: (v) => v * UNCIA_MASS_KG,
  fromBase: (b) => b / UNCIA_MASS_KG,
});

/** Roman denarius (Augustan, silver); 3.9 g typical silver content.
 *  The standard Roman silver coin from the Republic through the
 *  Crisis of the Third Century; the value declined over time
 *  (Republican denarius ~4.5 g; Severan ~3.4 g; debased post-3rd c.).
 *  3.9 g is the Augustan / Julio-Claudian reference. */
export const denariusAugustan = /*#__PURE__*/ defineUnit({
  id: 'denarius-augustan',
  label: 'Roman Denarius (Augustan, silver)',
  symbol: 'denarius',
  dimension: MASS,
  toBase: (v) => v * 3.9e-3,
  fromBase: (b) => b / 3.9e-3,
});

/** Roman aureus (Augustan, gold); 7.97 g = 1/40 libra. The standard
 *  Augustan gold coin; 25 denarii per aureus by official decree
 *  though the silver-to-gold ratio fluctuated with commodity
 *  supply. */
export const aureusAugustan = /*#__PURE__*/ defineUnit({
  id: 'aureus-augustan',
  label: 'Roman Aureus (Augustan, gold)',
  symbol: 'aureus',
  dimension: MASS,
  toBase: (v) => v * (LIBRA_KG / 40),
  fromBase: (b) => b / (LIBRA_KG / 40),
});

/** Roman solidus (Constantinian, gold); 4.55 g = 1/72 libra.
 *  Replaced the aureus under Constantine I's monetary reform
 *  (309 CE); remained the stable Byzantine gold standard for ~700
 *  years (the "bezant" of medieval European trade). The semantic
 *  ancestor of the British shilling abbreviation "s." */
export const solidusConstantinian = /*#__PURE__*/ defineUnit({
  id: 'solidus-constantinian',
  label: 'Roman Solidus (Constantinian, gold)',
  symbol: 'solidus',
  dimension: MASS,
  toBase: (v) => v * (LIBRA_KG / 72),
  fromBase: (b) => b / (LIBRA_KG / 72),
});

/** Roman sextarius; ~0.546 L. The standard Roman liquid measure
 *  for personal-scale rationing (wine, oil); 1/6 congius. */
export const sextariusRomanus = /*#__PURE__*/ defineUnit({
  id: 'sextarius-romanus',
  label: 'Roman Sextarius',
  symbol: 'sextarius',
  dimension: VOLUME,
  toBase: (v) => v * SEXTARIUS_M3,
  fromBase: (b) => b / SEXTARIUS_M3,
});

/** Roman congius; 6 sextarii ≈ 3.28 L. Mid-range liquid measure;
 *  the unit a household used for a daily wine ration in
 *  legionary or large-estate accounting. */
export const congiusRomanus = /*#__PURE__*/ defineUnit({
  id: 'congius-romanus',
  label: 'Roman Congius',
  symbol: 'congius',
  dimension: VOLUME,
  toBase: (v) => v * (SEXTARIUS_M3 * 6),
  fromBase: (b) => b / (SEXTARIUS_M3 * 6),
});

/** Roman amphora quadrantal; 48 sextarii = 8 congii ≈ 26.026 L.
 *  The Roman cubic foot of liquid measure (pes Romanus cubed
 *  yields ~25.85 L; the amphora is the conventional rounding).
 *  Wine and oil were traded in amphorae across the Mediterranean
 *  Roman economy. */
export const amphoraRomana = /*#__PURE__*/ defineUnit({
  id: 'amphora-romana',
  label: 'Roman Amphora (Quadrantal)',
  symbol: 'amphora',
  dimension: VOLUME,
  toBase: (v) => v * (SEXTARIUS_M3 * 48),
  fromBase: (b) => b / (SEXTARIUS_M3 * 48),
});

/** Roman modius; 16 sextarii ≈ 8.74 L. The standard Roman grain
 *  measure; the legionary monthly grain ration was ~4 modii, the
 *  free urban grain dole (annona) was distributed by modius. */
export const modiusRomanus = /*#__PURE__*/ defineUnit({
  id: 'modius-romanus',
  label: 'Roman Modius',
  symbol: 'modius',
  dimension: VOLUME,
  toBase: (v) => v * (SEXTARIUS_M3 * 16),
  fromBase: (b) => b / (SEXTARIUS_M3 * 16),
});
