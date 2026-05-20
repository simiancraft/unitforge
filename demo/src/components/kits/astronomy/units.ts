// Per-kit catalog for the astronomy surfaces. The astronomy kit ships
// nine LENGTH atoms spanning solar-system to cosmological scale; the
// demo adds the kilometer (from kits/length) as a familiar anchor so a
// reader can tie a parsec back to something earthbound.
//
// Single dimension (all LENGTH), so the page bench works directly. The
// sections lean on three story angles: the distance ladder (au → ly →
// pc ratios), light travel time (the solar system measured in minutes
// and hours of light), and the Hubble calculator (H0 → the Hubble
// time, the first-order age of the universe).

import type { Unit } from 'unitforge';
import {
  astronomicalUnit,
  gigaparsec,
  kiloparsec,
  lightHour,
  lightMinute,
  lightSecond,
  lightYear,
  megaparsec,
  parsec,
} from 'unitforge/kits/astronomy';
import { kilometer } from 'unitforge/kits/length';

/** Every unit offered by the page bench, ascending by metric size:
 *  kilometer (the earthbound anchor) through gigaparsec. */
export const ASTRONOMY_ALL_UNITS: readonly Unit<'length', number>[] = [
  kilometer,
  lightSecond,
  lightMinute,
  astronomicalUnit,
  lightHour,
  lightYear,
  parsec,
  kiloparsec,
  megaparsec,
  gigaparsec,
];

export type AstronomyUnit = Unit<'length', number>;

/** Parallel as-const array of bench unit ids. The core `Unit` type
 *  declares `id: string`, so deriving the union from the array would
 *  widen; the typed bounds Record depends on the narrowed union.
 *  Pinned to ASTRONOMY_ALL_UNITS by a demo-invariants test. */
export const ASTRONOMY_UNIT_IDS = [
  'kilometer',
  'light-second',
  'light-minute',
  'astronomical-unit',
  'light-hour',
  'light-year',
  'parsec',
  'kiloparsec',
  'megaparsec',
  'gigaparsec',
] as const;

export type AstronomyUnitId = (typeof ASTRONOMY_UNIT_IDS)[number];

export interface SliderBounds {
  min: number;
  max: number;
  step: number;
  /** Pedagogically meaningful default the slider snaps to. */
  init: number;
}

/** Per-unit bench bounds. Each unit's interesting band sits at a
 *  different magnitude, so ranges are tuned per unit rather than shared. */
export const ASTRONOMY_BOUNDS: Record<AstronomyUnitId, SliderBounds> = {
  kilometer: { min: 1, max: 1_000_000, step: 1000, init: 384400 },
  'light-second': { min: 1, max: 1000, step: 1, init: 100 },
  'light-minute': { min: 1, max: 600, step: 1, init: 8 },
  'astronomical-unit': { min: 0.1, max: 100, step: 0.1, init: 1 },
  'light-hour': { min: 0.1, max: 48, step: 0.1, init: 1 },
  'light-year': { min: 0.1, max: 100, step: 0.1, init: 4.2 },
  parsec: { min: 0.1, max: 100, step: 0.1, init: 1 },
  kiloparsec: { min: 0.1, max: 100, step: 0.1, init: 8.2 },
  megaparsec: { min: 0.1, max: 1000, step: 0.1, init: 1 },
  gigaparsec: { min: 0.1, max: 30, step: 0.1, init: 1 },
};

/** Returns bench bounds for a given unit id; unknown ids fall back to
 *  the astronomical unit so a kit rename does not crash the page. */
export function astronomyBoundsFor(id: string): SliderBounds {
  // `in` guards the runtime but does not narrow the indexed read under
  // noUncheckedIndexedAccess; reach the fallback through `??` so the
  // result is non-undefined by real narrowing, not an `as` cast.
  const found = ASTRONOMY_BOUNDS[id as AstronomyUnitId];
  return found ?? ASTRONOMY_BOUNDS['astronomical-unit'];
}

/** Rungs of the distance ladder shown by the hello section. One
 *  representative unit per scale band, smallest to largest, so a single
 *  distance can be read across every astronomical scale at once. */
export const LADDER_RUNGS: readonly AstronomyUnit[] = [
  astronomicalUnit,
  lightHour,
  lightYear,
  parsec,
  kiloparsec,
  megaparsec,
];
