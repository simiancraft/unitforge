// Units of Antiquity kit tests. Per-civilization `describe` blocks;
// each block asserts identity-triple shape + dimension + a reference
// `toBase` value + round-trip via the canonical base unit (meter /
// kilogram / cubic meter).

import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';
import {
  debenEgypt,
  digitEgypt,
  heqatEgypt,
  hinEgypt,
  palmEgypt,
  qedetEgypt,
  royalCubitEgypt,
  shortCubitEgypt,
} from '../../src/kits/antiquity/index.js';
import { meter, statuteMile } from '../../src/kits/length/index.js';
import { kilogram } from '../../src/kits/mass/index.js';
import { liter, milliliter } from '../../src/kits/volume/index.js';

describe('kits/antiquity: Egypt — shape', () => {
  const lengthUnits = [royalCubitEgypt, shortCubitEgypt, palmEgypt, digitEgypt];
  const massUnits = [debenEgypt, qedetEgypt];
  const volumeUnits = [heqatEgypt, hinEgypt];

  for (const u of [...lengthUnits, ...massUnits, ...volumeUnits]) {
    it(`${u.id}: id, label, symbol populated`, () => {
      expect(u.id.length).toBeGreaterThan(0);
      expect(u.label.length).toBeGreaterThan(0);
      expect(u.symbol.length).toBeGreaterThan(0);
    });
  }

  it('LENGTH atoms declare LENGTH dimension', () => {
    for (const u of lengthUnits) expect(u.dimension).toBe('length');
  });

  it('MASS atoms declare MASS dimension', () => {
    for (const u of massUnits) expect(u.dimension).toBe('mass');
  });

  it('VOLUME atoms declare VOLUME dimension', () => {
    for (const u of volumeUnits) expect(u.dimension).toBe('volume');
  });

  it('no Egyptian atom claims base: true', () => {
    for (const u of [...lengthUnits, ...massUnits, ...volumeUnits]) {
      expect(u.base).toBeUndefined();
    }
  });
});

describe('kits/antiquity: Egypt — reference values', () => {
  it('1 royal cubit ≈ 0.5236 m (mean of surviving rulers)', () => {
    expect(forge(royalCubitEgypt, meter)(1)).toBeCloseTo(0.5236, 9);
  });

  it('1 royal cubit = 7 palms exactly', () => {
    const cubitInM = forge(royalCubitEgypt, meter)(1);
    const sevenPalmsInM = forge(palmEgypt, meter)(7);
    expect(sevenPalmsInM).toBeCloseTo(cubitInM, 12);
  });

  it('1 palm = 4 digits exactly', () => {
    const palmInM = forge(palmEgypt, meter)(1);
    const fourDigitsInM = forge(digitEgypt, meter)(4);
    expect(fourDigitsInM).toBeCloseTo(palmInM, 12);
  });

  it('1 short cubit = 6 palms (6/7 of royal cubit)', () => {
    const shortInM = forge(shortCubitEgypt, meter)(1);
    const sixPalmsInM = forge(palmEgypt, meter)(6);
    expect(shortInM).toBeCloseTo(sixPalmsInM, 12);
  });

  it('1 deben (New Kingdom) ≈ 91 g', () => {
    expect(forge(debenEgypt, kilogram)(1)).toBeCloseTo(0.091, 9);
  });

  it('1 qedet = 1/10 deben exactly', () => {
    const debenInKg = forge(debenEgypt, kilogram)(1);
    const tenQedetInKg = forge(qedetEgypt, kilogram)(10);
    expect(tenQedetInKg).toBeCloseTo(debenInKg, 12);
  });

  it('1 heqat ≈ 4.785 L', () => {
    expect(forge(heqatEgypt, liter)(1)).toBeCloseTo(4.785, 6);
  });

  it('1 hin = 1/10 heqat exactly', () => {
    const heqatInM3 = forge(heqatEgypt, milliliter)(1);
    const tenHinInM3 = forge(hinEgypt, milliliter)(10);
    expect(tenHinInM3).toBeCloseTo(heqatInM3, 9);
  });
});

describe('kits/antiquity: Egypt — benchmarking against modern', () => {
  it('Great Pyramid base side (440 cubits) ≈ 230.4 m, about 0.143 statute mile', () => {
    const sideInM = forge(royalCubitEgypt, meter)(440);
    expect(sideInM).toBeCloseTo(230.4, 1);
    const sideInMiles = forge(royalCubitEgypt, statuteMile)(440);
    expect(sideInMiles).toBeCloseTo(0.143, 2);
  });
});

describe('kits/antiquity: Egypt — round-trip', () => {
  const all = [
    royalCubitEgypt,
    shortCubitEgypt,
    palmEgypt,
    digitEgypt,
    debenEgypt,
    qedetEgypt,
    heqatEgypt,
    hinEgypt,
  ];

  for (const u of all) {
    it(`${u.id} round-trips via its canonical base`, () => {
      const value = 7.2; // arbitrary non-trivial
      const out = u.fromBase(u.toBase(value));
      expect(out).toBeCloseTo(value, 10);
    });
  }
});
