// Greek units of measure. Three foot standards coexisted in the
// ancient Greek world: the Attic pous (~0.296 m), the Doric pous
// (~0.327 m), and the Olympic pous (~0.3205 m, derived from the
// 192.27 m running track at Olympia). The Attic system anchored
// most Greek metrology by the 5th c. BCE and the Attic drachma /
// mina / talent became the dominant mass standard via Athenian
// commercial reach.
//
// References: Wilson, *Oxford Handbook of Engineering and Technology
// in the Classical World* (2008); Powell on Greek mass weights;
// archaeological measurements of the Olympia stadion track.

import { defineUnit } from '../../define.js';
import { LENGTH, MASS, VOLUME } from '../../dimensions.js';

// Module-private anchors:
//   Attic foot = 0.296 m (Wilson 2008 standard reference).
//   Olympic foot = stadion Olympic / 600 = 192.27 / 600 = 0.32045 m.
//   Doric foot = 0.327 m.
//   Attic drachma = 4.31 g (silver content, post-Solonic).
//   Attic metretes = 39.4 L (liquid); medimnos = 52.5 L (grain).
const POUS_ATTIC_M = 0.296;
const STADION_OLYMPIC_M = 192.27;
const POUS_OLYMPIC_M = STADION_OLYMPIC_M / 600;
const POUS_DORIC_M = 0.327;
const DRACHMA_ATTIC_KG = 4.31e-3;
const MINA_ATTIC_KG = DRACHMA_ATTIC_KG * 100;
const METRETES_M3 = 39.4e-3;
const MEDIMNOS_M3 = 52.5e-3;

/** Attic pous (πούς, "foot"); ~0.296 m. The standard Athenian foot
 *  from the 5th c. BCE onward; anchors the Attic stadion, plethron,
 *  and orgyia. Wilson 2008 anchor; distinguishable from the longer
 *  Doric pous (~0.327 m) and the Olympic foot (~0.3205 m). */
export const pousAttic = /*#__PURE__*/ defineUnit({
  id: 'pous-attic',
  label: 'Greek Pous (Attic)',
  symbol: 'πούς (Att.)',
  dimension: LENGTH,
  toBase: (v) => v * POUS_ATTIC_M,
  fromBase: (b) => b / POUS_ATTIC_M,
});

/** Doric pous (πούς); ~0.327 m. The Dorian-speaking world's foot
 *  standard (Sparta, Corinth, Sicilian colonies, Magna Graecia
 *  Doric temples). 10% larger than the Attic pous; the discrepancy
 *  appears in archaeological measurements of Doric vs. Ionic temple
 *  proportions. */
export const pousDoric = /*#__PURE__*/ defineUnit({
  id: 'pous-doric',
  label: 'Greek Pous (Doric)',
  symbol: 'πούς (Dor.)',
  dimension: LENGTH,
  toBase: (v) => v * POUS_DORIC_M,
  fromBase: (b) => b / POUS_DORIC_M,
});

/** Olympic pous; stadion Olympic / 600 ≈ 0.3205 m. The foot derived
 *  from the actual measured 192.27 m running track at Olympia. The
 *  value reverse-derives from the canonical Olympic stadion length;
 *  used in athletic and Panhellenic-sanctuary contexts. */
export const pousOlympic = /*#__PURE__*/ defineUnit({
  id: 'pous-olympic',
  label: 'Greek Pous (Olympic)',
  symbol: 'πούς (Olym.)',
  dimension: LENGTH,
  toBase: (v) => v * POUS_OLYMPIC_M,
  fromBase: (b) => b / POUS_OLYMPIC_M,
});

/** Attic stadion (στάδιον); 600 Attic pous = 177.6 m. The unit
 *  Herodotus, Thucydides, and Polybius typically use for
 *  geographical distance in Athenian-context narratives. Distinct
 *  from the 192.27 m Olympic stadion and from various local
 *  stadia in other Greek poleis. */
export const stadionAttic = /*#__PURE__*/ defineUnit({
  id: 'stadion-attic',
  label: 'Greek Stadion (Attic)',
  symbol: 'στάδιον (Att.)',
  dimension: LENGTH,
  toBase: (v) => v * (POUS_ATTIC_M * 600),
  fromBase: (b) => b / (POUS_ATTIC_M * 600),
});

/** Olympic stadion; 192.27 m exactly, the measured length of the
 *  running track at Olympia between the starting and finishing
 *  thresholds. The canonical reference stadion for Panhellenic
 *  athletic distances and for some classical-historian
 *  reconstructions. */
export const stadionOlympic = /*#__PURE__*/ defineUnit({
  id: 'stadion-olympic',
  label: 'Greek Stadion (Olympic)',
  symbol: 'στάδιον (Olym.)',
  dimension: LENGTH,
  toBase: (v) => v * STADION_OLYMPIC_M,
  fromBase: (b) => b / STADION_OLYMPIC_M,
});

/** Greek orgyia (ὀργυιά, "fathom" / "spread arms"); 6 pous Attic
 *  ≈ 1.776 m. Used in maritime depth measurement and personal-scale
 *  dimensions; cognate with the Roman passus (5 pes) but the Greek
 *  count is 6 feet, not 5. */
export const orgyiaAttic = /*#__PURE__*/ defineUnit({
  id: 'orgyia-attic',
  label: 'Greek Orgyia (Attic)',
  symbol: 'ὀργυιά',
  dimension: LENGTH,
  toBase: (v) => v * (POUS_ATTIC_M * 6),
  fromBase: (b) => b / (POUS_ATTIC_M * 6),
});

/** Attic drachma (δραχμή); 4.31 g silver content, post-Solonic
 *  Athenian coinage standard (Solon's reforms, c. 594 BCE). The
 *  surviving coin weights (the "Athenian owls") cluster at this
 *  value; deviations index silver-supply economic stress. Distinct
 *  from the Aeginetan drachma (~6.1 g) and the later Ptolemaic
 *  drachma (~3.6 g). */
export const drachmaAttic = /*#__PURE__*/ defineUnit({
  id: 'drachma-attic',
  label: 'Attic Drachma',
  symbol: 'δραχμή (Att.)',
  dimension: MASS,
  toBase: (v) => v * DRACHMA_ATTIC_KG,
  fromBase: (b) => b / DRACHMA_ATTIC_KG,
});

/** Attic tetradrachm (τετράδραχμον); 4 drachma = 17.24 g silver.
 *  The "Athenian owl" denomination; the most widely-circulated
 *  silver coin in the 5th-c. Greek Mediterranean. */
export const tetradrachmAttic = /*#__PURE__*/ defineUnit({
  id: 'tetradrachm-attic',
  label: 'Attic Tetradrachm',
  symbol: 'τετράδραχμον',
  dimension: MASS,
  toBase: (v) => v * (DRACHMA_ATTIC_KG * 4),
  fromBase: (b) => b / (DRACHMA_ATTIC_KG * 4),
});

/** Attic mina (μνᾶ); 100 drachma = 431 g. The standard mass unit
 *  for larger transactions in Classical Athenian commerce; appears
 *  in talent-and-mina ransom and tribute records. */
export const minaAttic = /*#__PURE__*/ defineUnit({
  id: 'mina-attic',
  label: 'Attic Mina',
  symbol: 'μνᾶ (Att.)',
  dimension: MASS,
  toBase: (v) => v * MINA_ATTIC_KG,
  fromBase: (b) => b / MINA_ATTIC_KG,
});

/** Attic talent (τάλαντον); 60 mina = 25.86 kg. The largest standard
 *  Greek mass unit; Herodotus's tribute lists and the Athenian
 *  *phoros* (imperial tribute) records are denominated in talents.
 *  Distinct from the Babylonian talent (~30 kg) and the Aeginetan
 *  talent (~37 kg). */
export const talentAttic = /*#__PURE__*/ defineUnit({
  id: 'talent-attic',
  label: 'Attic Talent',
  symbol: 'τάλαντον (Att.)',
  dimension: MASS,
  toBase: (v) => v * (MINA_ATTIC_KG * 60),
  fromBase: (b) => b / (MINA_ATTIC_KG * 60),
});

/** Attic metretes (μετρητής); ~39.4 L. The standard Athenian liquid
 *  measure (wine, olive oil); 12 choes per metretes, 1/12 metretes
 *  per chous. Used in Solon's wine and olive-oil export regulations. */
export const metretesAttic = /*#__PURE__*/ defineUnit({
  id: 'metretes-attic',
  label: 'Attic Metretes',
  symbol: 'μετρητής',
  dimension: VOLUME,
  toBase: (v) => v * METRETES_M3,
  fromBase: (b) => b / METRETES_M3,
});

/** Attic chous (χοῦς); 1/12 metretes ≈ 3.28 L. Personal-scale liquid
 *  measure; the unit a household used for daily wine or olive-oil
 *  rationing. */
export const chousAttic = /*#__PURE__*/ defineUnit({
  id: 'chous-attic',
  label: 'Attic Chous',
  symbol: 'χοῦς',
  dimension: VOLUME,
  toBase: (v) => v * (METRETES_M3 / 12),
  fromBase: (b) => b / (METRETES_M3 / 12),
});

/** Attic medimnos (μέδιμνος); ~52.5 L. The standard Athenian grain
 *  volume measure; 48 choenikes per medimnos. The four Solonic
 *  property classes (pentakosiomedimnoi, hippeis, zeugitai, thetes)
 *  are named for annual medimnos-yields of grain. */
export const medimnosAttic = /*#__PURE__*/ defineUnit({
  id: 'medimnos-attic',
  label: 'Attic Medimnos',
  symbol: 'μέδιμνος',
  dimension: VOLUME,
  toBase: (v) => v * MEDIMNOS_M3,
  fromBase: (b) => b / MEDIMNOS_M3,
});

/** Attic choenix (χοῖνιξ); 1/48 medimnos ≈ 1.09 L. Daily grain
 *  ration unit; the standard daily-bread allowance for an adult
 *  in classical Athens. */
export const choenixAttic = /*#__PURE__*/ defineUnit({
  id: 'choenix-attic',
  label: 'Attic Choenix',
  symbol: 'χοῖνιξ',
  dimension: VOLUME,
  toBase: (v) => v * (MEDIMNOS_M3 / 48),
  fromBase: (b) => b / (MEDIMNOS_M3 / 48),
});
