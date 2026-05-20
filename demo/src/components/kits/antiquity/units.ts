// Per-kit catalog for the antiquity surfaces. The antiquity kit ships
// ~90 atoms across eight civilizations, all in LENGTH / MASS / VOLUME.
// The demo curates representative subsets rather than enumerating the
// whole kit; the kit docs are the exhaustive reference, the demo is
// the "why this is interesting" tour.
//
// Two organizing axes, both used by the sections below:
//   - BY CIVILIZATION (the hello translator): browse a culture's units,
//     read each in modern terms. Each civilization owns a mixed-
//     dimension subset.
//   - BY DIMENSION ACROSS CIVILIZATIONS (the comparators): the same
//     conceptual measure (a "foot", a coin) laid side by side across
//     cultures so the reader sees how much it varied.
//
// Dimension note: every antiquity MASS atom shares `dimension: MASS`
// with kits/mass, so forging an ancient unit to a modern anchor is a
// real within-dimension forge. The translator picks the anchor set by
// reading `unit.dimension` at runtime; `anchorsFor` is the switch.

import type { Dimension, Unit } from 'unitforge';
import { LENGTH, MASS, VOLUME } from 'unitforge/dimensions';
import {
  bathHebrew,
  cattyHan,
  chiHan,
  commonCubitHebrew,
  debenEgypt,
  denariusAugustan,
  drachmaAttic,
  ephahHebrew,
  // modern anchors (re-exported by the kit barrel; JS identity preserved)
  foot,
  gallonWineEnglish,
  heqatEgypt,
  hogsheadWineEnglish,
  kenJapan,
  kilogram,
  kushMesopotamia,
  libraRomana,
  liter,
  medimnosAttic,
  meter,
  millePassusRomanus,
  modiusRomanus,
  nindanMesopotamia,
  palmEgypt,
  pesRomanus,
  pound,
  pousAttic,
  riJapanEdo,
  royalCubitEgypt,
  royalCubitHebrew,
  shakuKaneJaku,
  shekelBabylonian,
  shekelTyrian,
  shengHan,
  shoHideyoshi,
  silaMesopotamia,
  solidusConstantinian,
  stadionOlympic,
  statuteMile,
  stoneWool,
  talentAttic,
  talentHebrew,
  tetradrachmAttic,
  tunWineEnglish,
} from 'unitforge/kits/antiquity';

/** A unit shipped by the antiquity kit, dimension unconstrained. The
 *  curated subsets below mix LENGTH / MASS / VOLUME, so the demo's
 *  shared type widens to `Dimension`; sections that need same-
 *  dimension narrowing (the comparators) re-pin to a literal.
 *
 *  Caveat for the next reader: once a unit is typed `Unit<Dimension>`,
 *  `forge`'s within-dimension overload infers `D = Dimension` and
 *  accepts any `to` unit, so `forge(massUnit, lengthAnchor)` type-
 *  checks. The dimension match in the translator is enforced at
 *  runtime by `anchorsFor` (it only ever returns same-dimension
 *  anchors) plus forge's runtime guard, NOT by the type system. */
export type AntiquityUnit = Unit<Dimension, number>;

export interface Civilization {
  /** Stable id for the picker + URL fragment. */
  id: string;
  /** Display name. */
  label: string;
  /** Era qualifier shown under the name; the kit values are era-specific. */
  era: string;
  /** One-line editorial hook. */
  blurb: string;
  /** Representative units spanning the culture's dimensions. */
  units: readonly AntiquityUnit[];
}

/** The eight civilizations the kit ships, each with a curated subset.
 *  Ordered roughly chronologically by the era the kit values anchor
 *  to (Old Kingdom Egypt → pre-1835 English trade). */
export const CIVILIZATIONS: readonly Civilization[] = [
  {
    id: 'egypt',
    label: 'Egypt',
    era: 'Old–New Kingdom',
    blurb: 'The royal cubit built the pyramids; the deben weighed the gold.',
    units: [royalCubitEgypt, palmEgypt, debenEgypt, heqatEgypt],
  },
  {
    id: 'mesopotamia',
    label: 'Mesopotamia',
    era: 'Sumer / Babylon',
    blurb: 'Sexagesimal to the core: 60 shekels to the mina, 60 mina to the talent.',
    units: [kushMesopotamia, nindanMesopotamia, shekelBabylonian, silaMesopotamia],
  },
  {
    id: 'greece',
    label: 'Greece',
    era: 'Classical Attic',
    blurb: "Herodotus measured in stadia; Athens' tribute came in talents.",
    units: [pousAttic, stadionOlympic, drachmaAttic, talentAttic, medimnosAttic],
  },
  {
    id: 'rome',
    label: 'Rome',
    era: 'Augustan / Early Imperial',
    blurb: 'A legionary cadenced to the passus; the mille passus marked the roads.',
    units: [pesRomanus, millePassusRomanus, libraRomana, denariusAugustan, modiusRomanus],
  },
  {
    id: 'hebrew',
    label: 'Hebrew / Levant',
    era: 'Biblical',
    blurb: 'The Tyrian shekel was the coin of the Temple tax and the betrayal.',
    units: [royalCubitHebrew, shekelTyrian, talentHebrew, bathHebrew, ephahHebrew],
  },
  {
    id: 'china',
    label: 'China',
    era: 'Han dynasty',
    blurb: 'The chi (foot) drifted across two millennia of dynasties; this is the Han value.',
    units: [chiHan, cattyHan, shengHan],
  },
  {
    id: 'japan',
    label: 'Japan',
    era: 'Edo period',
    blurb: 'The shaku and the ri governed Tokugawa carpentry and the post roads.',
    units: [shakuKaneJaku, kenJapan, riJapanEdo, shoHideyoshi],
  },
  {
    id: 'english-historical',
    label: 'England',
    era: 'pre-1835',
    blurb: 'Wine, ale, and beer each had their own gallon before the Imperial reform.',
    units: [stoneWool, gallonWineEnglish, hogsheadWineEnglish, tunWineEnglish],
  },
];

// Length translator anchors are meter + foot only; statute-mile reads
// as ~0 for personal-scale units (a cubit is 0.0003 mi) and adds noise.
// The bench keeps statute-mile as a from/to option for the distance-
// scale units that warrant it (stadion, mille passus).
const LENGTH_ANCHORS: readonly AntiquityUnit[] = [meter, foot];
const MASS_ANCHORS: readonly AntiquityUnit[] = [kilogram, pound];
const VOLUME_ANCHORS: readonly AntiquityUnit[] = [liter];

/** Modern anchor units to forge an antiquity unit into, chosen by the
 *  antiquity unit's dimension. The translator maps over these. Returns
 *  same-dimension anchors so `forge(unit, anchor)` is always a valid
 *  within-dimension call; an unknown dimension yields an empty list
 *  (the section renders "no modern anchor" rather than crashing). */
export function anchorsFor(dimension: Dimension): readonly AntiquityUnit[] {
  switch (dimension) {
    case LENGTH:
      return LENGTH_ANCHORS;
    case MASS:
      return MASS_ANCHORS;
    case VOLUME:
      return VOLUME_ANCHORS;
    default:
      return [];
  }
}

/** Length units offered by the page bench, across civilizations plus
 *  modern anchors. The bench is generic over a single dimension; length
 *  is the iconic antiquity story (every culture's "foot"), so the bench
 *  is length-only. Ordered by ascending metric size. meter and foot
 *  recur in LENGTH_ANCHORS above, but the two lists do different jobs:
 *  this is the bench's from/to option set, those are the translator's
 *  modern-equivalent targets. */
export const ANTIQUITY_LENGTH_BENCH: readonly Unit<'length', number>[] = [
  palmEgypt,
  pousAttic,
  pesRomanus,
  chiHan,
  shakuKaneJaku,
  kushMesopotamia,
  royalCubitEgypt,
  royalCubitHebrew,
  commonCubitHebrew,
  kenJapan,
  nindanMesopotamia,
  stadionOlympic,
  millePassusRomanus,
  riJapanEdo,
  foot,
  meter,
  statuteMile,
];

/** Parallel as-const array of bench length ids. The core `Unit` type
 *  declares `id: string`, so deriving the union from the bench array
 *  would widen; the typed bounds Record depends on the narrowed union.
 *  Pinned to the runtime bench array by a demo-invariants test. */
export const ANTIQUITY_LENGTH_BENCH_IDS = [
  'palm-egypt',
  'pous-attic',
  'pes-romanus',
  'chi-han',
  'shaku-kane-jaku',
  'kush-mesopotamia',
  'royal-cubit-egypt',
  'royal-cubit-hebrew',
  'common-cubit-hebrew',
  'ken-japan',
  'nindan-mesopotamia',
  'stadion-olympic',
  'mille-passus-romanus',
  'ri-japan-edo',
  'foot',
  'meter',
  'statute-mile',
] as const;

export type AntiquityLengthId = (typeof ANTIQUITY_LENGTH_BENCH_IDS)[number];

export interface SliderBounds {
  min: number;
  max: number;
  step: number;
  /** Pedagogically meaningful default the slider snaps to. */
  init: number;
}

/** Per-unit bench bounds. The interesting band differs by unit scale:
 *  personal-scale lengths (cubit, foot, shaku) read well at 1–100; the
 *  long-distance units (stadion, mille passus, ri) at 1–50. */
export const ANTIQUITY_LENGTH_BOUNDS: Record<AntiquityLengthId, SliderBounds> = {
  'palm-egypt': { min: 1, max: 100, step: 1, init: 10 },
  'pous-attic': { min: 1, max: 500, step: 1, init: 100 },
  'pes-romanus': { min: 1, max: 5000, step: 1, init: 100 },
  'chi-han': { min: 1, max: 500, step: 1, init: 10 },
  'shaku-kane-jaku': { min: 1, max: 500, step: 1, init: 10 },
  'kush-mesopotamia': { min: 1, max: 200, step: 1, init: 10 },
  'royal-cubit-egypt': { min: 1, max: 500, step: 1, init: 100 },
  'royal-cubit-hebrew': { min: 1, max: 200, step: 1, init: 10 },
  'common-cubit-hebrew': { min: 1, max: 200, step: 1, init: 10 },
  'ken-japan': { min: 1, max: 200, step: 1, init: 10 },
  'nindan-mesopotamia': { min: 1, max: 100, step: 1, init: 10 },
  'stadion-olympic': { min: 1, max: 50, step: 1, init: 1 },
  'mille-passus-romanus': { min: 1, max: 50, step: 1, init: 1 },
  'ri-japan-edo': { min: 1, max: 20, step: 1, init: 1 },
  foot: { min: 1, max: 5000, step: 1, init: 100 },
  meter: { min: 1, max: 2000, step: 1, init: 100 },
  'statute-mile': { min: 0.1, max: 50, step: 0.1, init: 1 },
};

/** Returns bench bounds for a given length unit id; unknown ids fall
 *  back to meter so a kit rename does not crash the page. */
export function antiquityLengthBoundsFor(id: string): SliderBounds {
  if (id in ANTIQUITY_LENGTH_BOUNDS) {
    return ANTIQUITY_LENGTH_BOUNDS[id as AntiquityLengthId];
  }
  return ANTIQUITY_LENGTH_BOUNDS.meter;
}

export interface RulerEntry {
  unit: Unit<'length', number>;
  /** Civilization label for the row. */
  civ: string;
}

/** Foot-class length units across civilizations: the everyday "foot"
 *  each culture standardized. The rulers-of-empire comparator lays
 *  these side by side as metric-scaled bars. Roman pes and Attic pous
 *  land within 1 mm of each other; the Han chi and Edo shaku are
 *  visibly longer. */
export const RULERS_FOOT_CLASS: readonly RulerEntry[] = [
  { unit: pousAttic, civ: 'Greece (Attic)' },
  { unit: pesRomanus, civ: 'Rome' },
  { unit: chiHan, civ: 'China (Han)' },
  { unit: shakuKaneJaku, civ: 'Japan (Edo)' },
];

/** Cubit-class length units: the forearm-length unit, the older and
 *  larger personal-scale measure. The Egyptian royal cubit is the
 *  monumental standard; the Mesopotamian kuš and Hebrew cubits cluster
 *  near half a meter. */
export const RULERS_CUBIT_CLASS: readonly RulerEntry[] = [
  { unit: royalCubitEgypt, civ: 'Egypt (royal)' },
  { unit: kushMesopotamia, civ: 'Mesopotamia (kuš)' },
  { unit: royalCubitHebrew, civ: 'Hebrew (royal)' },
  { unit: commonCubitHebrew, civ: 'Hebrew (common)' },
];

export interface CoinEntry {
  unit: Unit<'mass', number>;
  /** Civilization / minting authority. */
  civ: string;
  /** The historical hook that makes this coin memorable. */
  hook: string;
  /** Metal, for the legend chip. */
  metal: 'silver' | 'gold';
}

/** Numismatic mass units across civilizations, ascending by gram. Coin
 *  weights are the kit's most tangible everyday referent: a denarius
 *  was a day's wage, the Tyrian shekel is conventionally identified with
 *  the thirty pieces of silver, the solidus held its weight for ~700
 *  years as the Byzantine standard. */
export const COIN_SCALE: readonly CoinEntry[] = [
  {
    unit: denariusAugustan,
    civ: 'Rome (Augustan)',
    hook: "a day's wage for a laborer",
    metal: 'silver',
  },
  {
    unit: drachmaAttic,
    civ: 'Greece (Attic)',
    hook: 'a skilled worker’s daily pay in Periclean Athens',
    metal: 'silver',
  },
  {
    unit: solidusConstantinian,
    civ: 'Rome (Constantinian)',
    hook: 'the Byzantine gold standard for ~700 years',
    metal: 'gold',
  },
  {
    unit: shekelTyrian,
    civ: 'Tyre / Temple',
    hook: 'the coin of the Temple tax; conventionally identified with the thirty pieces of silver',
    metal: 'silver',
  },
  {
    unit: tetradrachmAttic,
    civ: 'Greece (Attic)',
    hook: 'the "Athenian owl"; the dominant trade coin of the 5th-c. BCE Aegean',
    metal: 'silver',
  },
];
