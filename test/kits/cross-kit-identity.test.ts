// JS-identity invariant: when a domain kit re-exports a unit from a
// foundational kit, both import paths must resolve to the same JS
// object. Otherwise `forge(domain.x, foundational.x)` becomes a
// converter-through-base instead of identity, and `Set<Unit>` /
// `Map<Unit, ...>` de-dup logic at consumer call sites breaks.
//
// This is THE test that proves the foundational-kit refactor works.

import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';

import * as cooking from '../../src/kits/cooking/index.js';
import * as geometry from '../../src/kits/geometry/index.js';
import * as length from '../../src/kits/length/index.js';
import * as mass from '../../src/kits/mass/index.js';
import * as temperature from '../../src/kits/temperature/index.js';
import * as volume from '../../src/kits/volume/index.js';

describe('cross-kit JS identity (volume atoms)', () => {
  it('cooking.milliliter === volume.milliliter', () => {
    expect(cooking.milliliter).toBe(volume.milliliter);
  });

  it('cooking.cupUs === volume.cupUs', () => {
    expect(cooking.cupUs).toBe(volume.cupUs);
  });

  it('cooking.cupJapaneseRice === volume.cupJapaneseRice', () => {
    expect(cooking.cupJapaneseRice).toBe(volume.cupJapaneseRice);
  });

  it('geometry.liter === volume.liter', () => {
    expect(geometry.liter).toBe(volume.liter);
  });

  it('geometry.cubicMeter === volume.cubicMeter', () => {
    expect(geometry.cubicMeter).toBe(volume.cubicMeter);
  });

  it('cooking.milliliter === geometry.milliliter (cross-domain identity)', () => {
    expect(cooking.milliliter).toBe(geometry.milliliter);
  });
});

describe('cross-kit JS identity (length atoms)', () => {
  it('geometry.meter === length.meter', () => {
    expect(geometry.meter).toBe(length.meter);
  });

  it('geometry.foot === length.foot', () => {
    expect(geometry.foot).toBe(length.foot);
  });

  it('geometry.parsec === length.parsec', () => {
    expect(geometry.parsec).toBe(length.parsec);
  });
});

describe('cross-kit JS identity (mass + temperature re-exports in cooking)', () => {
  it('cooking.gram === mass.gram', () => {
    expect(cooking.gram).toBe(mass.gram);
  });

  it('cooking.kilogram === mass.kilogram', () => {
    expect(cooking.kilogram).toBe(mass.kilogram);
  });

  it('cooking.fahrenheit === temperature.fahrenheit', () => {
    expect(cooking.fahrenheit).toBe(temperature.fahrenheit);
  });

  it('cooking.celsius === temperature.celsius', () => {
    expect(cooking.celsius).toBe(temperature.celsius);
  });
});

describe('forge across identity-preserved units is the identity converter', () => {
  it('forge(cooking.milliliter, volume.milliliter)(42) === 42', () => {
    expect(forge(cooking.milliliter, volume.milliliter)(42)).toBe(42);
  });

  it('forge(geometry.meter, length.meter)(3.14) === 3.14', () => {
    expect(forge(geometry.meter, length.meter)(3.14)).toBe(3.14);
  });

  it('forge(cooking.cupUs, volume.cupUs)(2.5) === 2.5', () => {
    expect(forge(cooking.cupUs, volume.cupUs)(2.5)).toBe(2.5);
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
