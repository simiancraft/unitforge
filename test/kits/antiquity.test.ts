// Units of Antiquity kit tests. Per-civilization `describe` blocks;
// each block asserts identity-triple shape + dimension + a reference
// `toBase` value + round-trip via the canonical base unit (meter /
// kilogram / cubic meter).

import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';
import {
  debenEgypt,
  digitEgypt,
  gurMesopotamia,
  heqatEgypt,
  hinEgypt,
  kushMesopotamia,
  minaBabylonian,
  nindanMesopotamia,
  palmEgypt,
  qedetEgypt,
  royalCubitEgypt,
  shekelBabylonian,
  shortCubitEgypt,
  shusiMesopotamia,
  silaMesopotamia,
  talentBabylonian,
  ushMesopotamia,
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

describe('kits/antiquity: Mesopotamia — reference values', () => {
  it('1 shusi ≈ 16.62 mm (Powell 1987 anchor)', () => {
    expect(forge(shusiMesopotamia, meter)(1)).toBeCloseTo(0.01662, 9);
  });

  it('1 kuš = 30 shusi exactly', () => {
    const kushInM = forge(kushMesopotamia, meter)(1);
    const thirtyShusiInM = forge(shusiMesopotamia, meter)(30);
    expect(thirtyShusiInM).toBeCloseTo(kushInM, 12);
  });

  it('1 nindan = 12 kuš exactly', () => {
    const nindanInM = forge(nindanMesopotamia, meter)(1);
    const twelveKushInM = forge(kushMesopotamia, meter)(12);
    expect(twelveKushInM).toBeCloseTo(nindanInM, 12);
  });

  it('1 uš = 60 nindan exactly', () => {
    const ushInM = forge(ushMesopotamia, meter)(1);
    const sixtyNindanInM = forge(nindanMesopotamia, meter)(60);
    expect(sixtyNindanInM).toBeCloseTo(ushInM, 9);
  });

  it('1 Babylonian common mina = 500 g (Powell 1987)', () => {
    expect(forge(minaBabylonian, kilogram)(1)).toBeCloseTo(0.5, 12);
  });

  it('1 shekel Babylonian = 1/60 mina ≈ 8.33 g', () => {
    expect(forge(shekelBabylonian, kilogram)(60)).toBeCloseTo(0.5, 12);
  });

  it('1 talent Babylonian = 60 mina = 30 kg', () => {
    expect(forge(talentBabylonian, kilogram)(1)).toBeCloseTo(30, 9);
  });

  it('1 sila ≈ 0.842 L (Ur III)', () => {
    expect(forge(silaMesopotamia, liter)(1)).toBeCloseTo(0.842, 6);
  });

  it('1 gur = 300 sila (Ur III)', () => {
    const gurInL = forge(gurMesopotamia, liter)(1);
    const threeHundredSilaInL = forge(silaMesopotamia, liter)(300);
    expect(threeHundredSilaInL).toBeCloseTo(gurInL, 9);
  });
});

describe('kits/antiquity: Mesopotamia vs Greece talent disambiguation', () => {
  it('Babylonian talent (30 kg) is larger than Attic talent will be', () => {
    // Attic talent ships in greece.ts at ~25.86 kg; documents the
    // canonical disambiguation a reader of Herodotus must navigate.
    expect(forge(talentBabylonian, kilogram)(1)).toBeCloseTo(30, 1);
  });
});
