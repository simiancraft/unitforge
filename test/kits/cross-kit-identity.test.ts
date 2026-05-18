// JS-identity invariant: when a domain kit re-exports a unit from a
// foundational kit, both import paths must resolve to the same JS
// object. Otherwise `forge(domain.x, foundational.x)` becomes a
// converter-through-base instead of identity, and `Set<Unit>` /
// `Map<Unit, ...>` de-dup logic at consumer call sites breaks.
//
// This is THE test that proves the foundational-kit refactor works.
//
// The check is structural, not enumerative: iterate every named export
// of each domain kit; if the same name appears in a foundational kit,
// assert JS identity. This means new re-exports are covered the day
// they are added, with no hand-list maintenance.

import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';

import * as astronomy from '../../src/kits/astronomy/index.js';
import * as cooking from '../../src/kits/cooking/index.js';
import * as geometry from '../../src/kits/geometry/index.js';
import * as length from '../../src/kits/length/index.js';
import * as mass from '../../src/kits/mass/index.js';
import * as temperature from '../../src/kits/temperature/index.js';
import * as volume from '../../src/kits/volume/index.js';

type UnitModule = Record<string, unknown>;

// Asserts: for every key in `domain` that also exists in `source`, the
// JS object at that key is identical. The "also exists" guard skips
// kit-owned units that are not re-exports (e.g. cooking.stickOfButter).
function expectIdentityForSharedKeys(
  domainName: string,
  domain: UnitModule,
  sourceName: string,
  source: UnitModule,
): void {
  const sharedKeys = Object.keys(source).filter((k) => k in domain);
  // Sanity: if no keys overlap, the test is silently no-op; fail loudly.
  expect(sharedKeys.length).toBeGreaterThan(0);
  for (const k of sharedKeys) {
    if (domain[k] !== source[k]) {
      throw new Error(
        `JS-identity violation: ${domainName}.${k} !== ${sourceName}.${k}. ` +
          `The domain kit must re-export this atom from the foundational kit, ` +
          `not redeclare it via defineUnit.`,
      );
    }
  }
}

describe('cross-kit JS identity (structural)', () => {
  it('cooking re-exports from volume preserve JS identity', () => {
    expectIdentityForSharedKeys('cooking', cooking, 'volume', volume);
  });

  it('cooking re-exports from mass preserve JS identity', () => {
    expectIdentityForSharedKeys('cooking', cooking, 'mass', mass);
  });

  it('cooking re-exports from temperature preserve JS identity', () => {
    expectIdentityForSharedKeys('cooking', cooking, 'temperature', temperature);
  });

  it('geometry re-exports from length preserve JS identity', () => {
    expectIdentityForSharedKeys('geometry', geometry, 'length', length);
  });

  it('geometry re-exports from volume preserve JS identity', () => {
    expectIdentityForSharedKeys('geometry', geometry, 'volume', volume);
  });

  it('astronomy re-exports from length preserve JS identity', () => {
    expectIdentityForSharedKeys('astronomy', astronomy, 'length', length);
  });

  it('cooking.milliliter === geometry.milliliter (transitive cross-domain)', () => {
    expect(cooking.milliliter).toBe(geometry.milliliter);
  });
});

describe('forge across identity-preserved units is the identity converter', () => {
  it('forge(cooking.milliliter, volume.milliliter)(42) === 42', () => {
    expect(forge(cooking.milliliter, volume.milliliter)(42)).toBe(42);
  });

  it('forge(geometry.meter, length.meter)(3.14) === 3.14', () => {
    expect(forge(geometry.meter, length.meter)(3.14)).toBe(3.14);
  });

  it('forge(cooking.cupUs, geometry.milliliter)(2.5) routes via the same VOLUME atoms', () => {
    // cupUs is in volume + cooking but not geometry. The cross-domain
    // forge still works because every cup atom resolves to the same
    // volume.cupUs Unit object; the converter is the canonical
    // cup-US-to-mL factor, not a hop through two distinct Units.
    const fromCooking = forge(cooking.cupUs, geometry.milliliter)(2.5);
    const fromVolume = forge(volume.cupUs, volume.milliliter)(2.5);
    expect(fromCooking).toBeCloseTo(fromVolume, 12);
  });
});

describe('dimension constant identity across re-exports', () => {
  it('cooking heat descriptors share the kits/temperature TEMPERATURE constant', () => {
    // If kits/cooking ever drifted to a separately-defined TEMPERATURE
    // symbol, dimensional-compatibility checks downstream would break
    // silently. The heat descriptors are kit-owned, but they MUST
    // declare the same dimension as kits/temperature.
    expect(cooking.mediumHeat.dimension).toBe(temperature.kelvin.dimension);
    expect(cooking.highHeat.dimension).toBe(temperature.fahrenheit.dimension);
  });
});

describe('cooking-tradition temperature units (Stage 6)', () => {
  it('forge(cooking.mediumHeat, temperature.fahrenheit)(1) ≈ 350', () => {
    expect(forge(cooking.mediumHeat, temperature.fahrenheit)(1)).toBeCloseTo(350, 9);
  });

  it('forge(cooking.highHeat, temperature.fahrenheit)(1) ≈ 500', () => {
    expect(forge(cooking.highHeat, temperature.fahrenheit)(1)).toBeCloseTo(500, 9);
  });

  it('forge(cooking.lowHeat, temperature.celsius)(1) ≈ 107.222', () => {
    expect(forge(cooking.lowHeat, temperature.celsius)(1)).toBeCloseTo(107.222, 3);
  });

  it('round-trip: forge(fahrenheit, mediumHeat)(350) ≈ 1', () => {
    expect(forge(temperature.fahrenheit, cooking.mediumHeat)(350)).toBeCloseTo(1, 12);
  });
});
