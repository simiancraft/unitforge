// Per-kit unit catalog for the temperature surfaces. The temperature
// kit ships four scales; mirrors the cooking/mass unit-catalog shape
// so demo sections can share the readout-matrix idiom.
//
// Affine math note: every conversion in this kit goes through the
// kelvin base. Celsius + Fahrenheit carry offsets (water freezes at
// 0 °C = 273.15 K = 32 °F); Rankine is the only purely-linear
// non-base scale (1 °R = 5/9 K, no offset). The delta-vs-value
// machine surfaces this distinction directly.

import type { Unit } from 'unitforge';
import { celsius, fahrenheit, kelvin, rankine } from 'unitforge/kits/temperature';

/** Every scale shipped by the kit, ordered by everyday familiarity:
 *  Celsius first (the global default), then Fahrenheit, then Kelvin
 *  (scientific), then Rankine (US engineering thermodynamics). The
 *  bench picker iterates this. */
export const TEMPERATURE_ALL_UNITS = [celsius, fahrenheit, kelvin, rankine] as const;

export type TemperatureUnit = Unit<'temperature', number>;

/** Parallel as-const array of kit-shipped temperature ids. The core
 *  `Unit` type declares `id: string`, so deriving the union from
 *  `TEMPERATURE_ALL_UNITS` would widen; the typed bounds Record
 *  below depends on the narrowed union. Pinned to the runtime
 *  catalog by a demo-invariants test. */
export const TEMPERATURE_UNIT_IDS = ['celsius', 'fahrenheit', 'kelvin', 'rankine'] as const;

export type TemperatureUnitId = (typeof TEMPERATURE_UNIT_IDS)[number];

export interface SliderBounds {
  min: number;
  max: number;
  step: number;
  /** Pedagogically meaningful default the slider snaps to when the
   *  user switches into this unit. */
  init: number;
}

/** Per-unit slider bounds. Ranges chosen so the pedagogically
 *  interesting band (water-phase change, room temp through baking
 *  oven, absolute zero) sits inside the slider's reachable interval. */
export const TEMPERATURE_BOUNDS: Record<TemperatureUnitId, SliderBounds> = {
  celsius: { min: -50, max: 300, step: 1, init: 20 },
  fahrenheit: { min: -50, max: 600, step: 1, init: 68 },
  kelvin: { min: 0, max: 600, step: 1, init: 293 },
  rankine: { min: 0, max: 1100, step: 1, init: 527 },
};

/** Returns the slider bounds for a given temperature unit id. */
export function temperatureBoundsFor(id: string): SliderBounds {
  if (id in TEMPERATURE_BOUNDS) {
    return TEMPERATURE_BOUNDS[id as TemperatureUnitId];
  }
  return TEMPERATURE_BOUNDS.celsius;
}

/** Reference temperatures shown by the reference-points machine.
 *  Anchors picked across the pedagogical span (absolute zero
 *  through stellar surface) so the reader sees both the human-
 *  comfort band and the extremes the four scales can express. */
export const TEMPERATURE_REFERENCE_POINTS = [
  {
    id: 'absolute-zero',
    label: 'absolute zero',
    hint: '0 K · the floor; no kinetic energy',
    kelvin: 0,
  },
  {
    id: 'water-freezing',
    label: 'water freezing',
    hint: '273.15 K · standard pressure',
    kelvin: 273.15,
  },
  {
    id: 'room-temperature',
    label: 'room temperature',
    hint: '293.15 K · NIST standard ambient',
    kelvin: 293.15,
  },
  {
    id: 'body-temperature',
    label: 'human body',
    hint: '310.15 K · normothermic core',
    kelvin: 310.15,
  },
  {
    id: 'water-boiling',
    label: 'water boiling',
    hint: '373.15 K · standard pressure',
    kelvin: 373.15,
  },
  {
    id: 'baking-oven',
    label: 'baking oven',
    hint: '450 K · standard 350 °F bake',
    kelvin: 450,
  },
  {
    id: 'sun-surface',
    label: 'Sun (photosphere)',
    hint: '5778 K · effective blackbody T',
    kelvin: 5778,
  },
] as const;
