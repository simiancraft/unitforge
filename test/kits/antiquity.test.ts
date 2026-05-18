// Units of Antiquity kit tests. Per-civilization `describe` blocks;
// each block asserts identity-triple shape + dimension + a reference
// `toBase` value + round-trip via the canonical base unit (meter /
// kilogram / cubic meter).

import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';
import {
  actusRomanus,
  amphoraRomana,
  aureusAugustan,
  bathHebrew,
  cattyHan,
  cattyQingKuping,
  chiHan,
  chiMing,
  chiQingHaiguan,
  chiQingYingzao,
  chiSong,
  chiTangLarge,
  chiTangSmall,
  choenixAttic,
  chousAttic,
  commonCubitHebrew,
  congiusRomanus,
  cubitusRomanus,
  debenEgypt,
  denariusAugustan,
  digitEgypt,
  digitusRomanus,
  douHan,
  drachmaAttic,
  ephahHebrew,
  goHideyoshi,
  gurMesopotamia,
  handbreadthHebrew,
  heqatEgypt,
  hinEgypt,
  hinHebrew,
  joJapan,
  kenJapan,
  korHebrew,
  kushMesopotamia,
  libraRomana,
  medimnosAttic,
  metretesAttic,
  millePassusRomanus,
  minaAttic,
  minaBabylonian,
  modiusRomanus,
  nindanMesopotamia,
  omerHebrew,
  orgyiaAttic,
  palmEgypt,
  palmusRomanus,
  passusRomanus,
  pesDrusianus,
  pesRomanus,
  pousAttic,
  pousDoric,
  pousOlympic,
  qedetEgypt,
  riJapanEdo,
  royalCubitEgypt,
  royalCubitHebrew,
  seahHebrew,
  sextariusRomanus,
  shakuKaneJaku,
  shakuKujiraJaku,
  shekelBabylonian,
  shekelHebrewCommon,
  shekelTyrian,
  shengHan,
  shoHideyoshi,
  shortCubitEgypt,
  shusiMesopotamia,
  silaMesopotamia,
  solidusConstantinian,
  spanHebrew,
  stadionAttic,
  stadionOlympic,
  sunJapan,
  talentAttic,
  talentBabylonian,
  talentHebrew,
  tetradrachmAttic,
  unciaLengthRomanus,
  unciaMassRomana,
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
  it('Babylonian talent (30 kg) is larger than Attic talent (25.86 kg)', () => {
    expect(forge(talentBabylonian, kilogram)(1)).toBeCloseTo(30, 1);
    expect(forge(talentAttic, kilogram)(1)).toBeCloseTo(25.86, 1);
    expect(forge(talentBabylonian, kilogram)(1)).toBeGreaterThan(forge(talentAttic, kilogram)(1));
  });
});

describe('kits/antiquity: Greece — reference values', () => {
  it('1 Olympic stadion = 192.27 m exactly (measured Olympia track)', () => {
    expect(forge(stadionOlympic, meter)(1)).toBe(192.27);
  });

  it('1 Attic pous ≈ 0.296 m (Wilson 2008)', () => {
    expect(forge(pousAttic, meter)(1)).toBeCloseTo(0.296, 9);
  });

  it('1 Doric pous ≈ 0.327 m (10% larger than Attic)', () => {
    expect(forge(pousDoric, meter)(1)).toBeCloseTo(0.327, 9);
    const ratio = forge(pousDoric, meter)(1) / forge(pousAttic, meter)(1);
    expect(ratio).toBeCloseTo(1.105, 2);
  });

  it('1 Olympic pous = stadion Olympic / 600', () => {
    const olympicPous = forge(pousOlympic, meter)(1);
    expect(olympicPous * 600).toBeCloseTo(192.27, 9);
  });

  it('1 Attic stadion = 600 Attic pous = 177.6 m', () => {
    expect(forge(stadionAttic, meter)(1)).toBeCloseTo(177.6, 6);
  });

  it('1 orgyia Attic = 6 Attic pous', () => {
    const orgyiaInM = forge(orgyiaAttic, meter)(1);
    const sixPousInM = forge(pousAttic, meter)(6);
    expect(orgyiaInM).toBeCloseTo(sixPousInM, 12);
  });

  it('1 Attic drachma = 4.31 g (silver, post-Solonic)', () => {
    expect(forge(drachmaAttic, kilogram)(1)).toBeCloseTo(4.31e-3, 12);
  });

  it('1 tetradrachm = 4 drachma exactly (Athenian owl)', () => {
    const tetraInKg = forge(tetradrachmAttic, kilogram)(1);
    const fourDrachmaInKg = forge(drachmaAttic, kilogram)(4);
    expect(tetraInKg).toBeCloseTo(fourDrachmaInKg, 12);
  });

  it('1 Attic mina = 100 drachma = 431 g', () => {
    expect(forge(minaAttic, kilogram)(1)).toBeCloseTo(0.431, 9);
  });

  it('1 Attic talent = 60 mina = 25.86 kg', () => {
    expect(forge(talentAttic, kilogram)(1)).toBeCloseTo(25.86, 6);
  });

  it('1 metretes ≈ 39.4 L; 12 chous = 1 metretes', () => {
    expect(forge(metretesAttic, liter)(1)).toBeCloseTo(39.4, 6);
    const metretesL = forge(metretesAttic, liter)(1);
    const twelveChousL = forge(chousAttic, liter)(12);
    expect(twelveChousL).toBeCloseTo(metretesL, 9);
  });

  it('1 medimnos ≈ 52.5 L; 48 choenikes = 1 medimnos', () => {
    expect(forge(medimnosAttic, liter)(1)).toBeCloseTo(52.5, 6);
    const medimnosL = forge(medimnosAttic, liter)(1);
    const fortyEightChoenixL = forge(choenixAttic, liter)(48);
    expect(fortyEightChoenixL).toBeCloseTo(medimnosL, 9);
  });
});

describe('kits/antiquity: Rome — reference values', () => {
  it('1 pes Romanus ≈ 0.2957 m', () => {
    expect(forge(pesRomanus, meter)(1)).toBeCloseTo(0.2957, 9);
  });

  it('1 pes Drusianus ≈ 0.3325 m (provincial Drusian foot)', () => {
    expect(forge(pesDrusianus, meter)(1)).toBeCloseTo(0.3325, 9);
  });

  it('1 passus = 5 pes; 1 mille passus = 1000 passus', () => {
    const passusM = forge(passusRomanus, meter)(1);
    const fivePesM = forge(pesRomanus, meter)(5);
    expect(passusM).toBeCloseTo(fivePesM, 12);
    const mileM = forge(millePassusRomanus, meter)(1);
    expect(mileM).toBeCloseTo(passusM * 1000, 9);
  });

  it('Roman mile ≈ 1478.6 m (7.6% shorter than statute mile)', () => {
    expect(forge(millePassusRomanus, meter)(1)).toBeCloseTo(1478.5, 1);
    const ratio = forge(millePassusRomanus, meter)(1) / forge(statuteMile, meter)(1);
    expect(ratio).toBeCloseTo(0.919, 2);
  });

  it('1 digitus = 1/16 pes; 1 uncia (length) = 1/12 pes; 1 palmus = 1/4 pes', () => {
    const pesM = forge(pesRomanus, meter)(1);
    expect(forge(digitusRomanus, meter)(16)).toBeCloseTo(pesM, 12);
    expect(forge(unciaLengthRomanus, meter)(12)).toBeCloseTo(pesM, 12);
    expect(forge(palmusRomanus, meter)(4)).toBeCloseTo(pesM, 12);
  });

  it('1 cubitus = 1.5 pes', () => {
    const cubitusM = forge(cubitusRomanus, meter)(1);
    const onePointFivePesM = forge(pesRomanus, meter)(1.5);
    expect(cubitusM).toBeCloseTo(onePointFivePesM, 12);
  });

  it('1 actus = 120 pes', () => {
    expect(forge(actusRomanus, meter)(1)).toBeCloseTo(120 * 0.2957, 9);
  });

  it('1 libra Augustan ≈ 327.45 g', () => {
    expect(forge(libraRomana, kilogram)(1)).toBeCloseTo(0.32745, 9);
  });

  it('1 uncia (mass) = 1/12 libra ≈ 27.29 g', () => {
    expect(forge(unciaMassRomana, kilogram)(12)).toBeCloseTo(0.32745, 9);
  });

  it('1 aureus Augustan = 1/40 libra ≈ 7.97 g', () => {
    expect(forge(aureusAugustan, kilogram)(40)).toBeCloseTo(0.32745, 9);
  });

  it('1 solidus Constantinian = 1/72 libra ≈ 4.55 g', () => {
    expect(forge(solidusConstantinian, kilogram)(72)).toBeCloseTo(0.32745, 9);
  });

  it('1 denarius Augustan ≈ 3.9 g (silver)', () => {
    expect(forge(denariusAugustan, kilogram)(1)).toBeCloseTo(3.9e-3, 12);
  });

  it('1 sextarius ≈ 0.546 L; 1 congius = 6 sextarii; 1 amphora = 48 sextarii', () => {
    expect(forge(sextariusRomanus, liter)(1)).toBeCloseTo(0.546, 6);
    expect(forge(congiusRomanus, liter)(1)).toBeCloseTo(0.546 * 6, 6);
    expect(forge(amphoraRomana, liter)(1)).toBeCloseTo(0.546 * 48, 3);
  });

  it('1 modius = 16 sextarii ≈ 8.74 L', () => {
    expect(forge(modiusRomanus, liter)(1)).toBeCloseTo(0.546 * 16, 3);
  });
});

describe('kits/antiquity: Rome — round-trip', () => {
  const all = [
    pesRomanus,
    pesDrusianus,
    digitusRomanus,
    unciaLengthRomanus,
    palmusRomanus,
    cubitusRomanus,
    passusRomanus,
    millePassusRomanus,
    actusRomanus,
    libraRomana,
    unciaMassRomana,
    denariusAugustan,
    aureusAugustan,
    solidusConstantinian,
    sextariusRomanus,
    congiusRomanus,
    amphoraRomana,
    modiusRomanus,
  ];

  for (const u of all) {
    it(`${u.id} round-trips via its canonical base`, () => {
      const value = 2.71828;
      const out = u.fromBase(u.toBase(value));
      expect(out).toBeCloseTo(value, 10);
    });
  }
});

describe('kits/antiquity: Hebrew — reference values', () => {
  it('1 common cubit ≈ 0.444 m (Hezekiah Tunnel reconstruction)', () => {
    expect(forge(commonCubitHebrew, meter)(1)).toBeCloseTo(0.444, 9);
  });

  it('1 royal cubit ≈ 0.518 m (Ezek. 40:5 great cubit)', () => {
    expect(forge(royalCubitHebrew, meter)(1)).toBeCloseTo(0.518, 9);
  });

  it('1 handbreadth = 1/6 common cubit; 1 span = 1/2 common cubit', () => {
    const cubitM = forge(commonCubitHebrew, meter)(1);
    expect(forge(handbreadthHebrew, meter)(6)).toBeCloseTo(cubitM, 12);
    expect(forge(spanHebrew, meter)(2)).toBeCloseTo(cubitM, 12);
  });

  it('1 common shekel ≈ 11.4 g', () => {
    expect(forge(shekelHebrewCommon, kilogram)(1)).toBeCloseTo(11.4e-3, 12);
  });

  it('1 Tyrian shekel ≈ 14.4 g silver (NT temple-tax coin)', () => {
    expect(forge(shekelTyrian, kilogram)(1)).toBeCloseTo(14.4e-3, 12);
  });

  it('1 talent (kikkar) = 3000 common shekels ≈ 34.2 kg (Ex. 38:25-26)', () => {
    expect(forge(talentHebrew, kilogram)(1)).toBeCloseTo(0.0114 * 3000, 9);
    const talentInKg = forge(talentHebrew, kilogram)(1);
    const threeThousandShekelsInKg = forge(shekelHebrewCommon, kilogram)(3000);
    expect(talentInKg).toBeCloseTo(threeThousandShekelsInKg, 9);
  });

  it('Hebrew talent (34.2 kg) > Babylonian talent (30 kg) > Attic talent (25.86 kg)', () => {
    const hebrew = forge(talentHebrew, kilogram)(1);
    const babylonian = forge(talentBabylonian, kilogram)(1);
    const attic = forge(talentAttic, kilogram)(1);
    expect(hebrew).toBeGreaterThan(babylonian);
    expect(babylonian).toBeGreaterThan(attic);
  });

  it('bath = ephah (Ezek. 45:11)', () => {
    expect(forge(bathHebrew, liter)(1)).toBeCloseTo(forge(ephahHebrew, liter)(1), 12);
  });

  it('1 bath ≈ 22 L; 1 hin = 1/6 bath; 1 omer = 1/10 ephah; 1 seah = 1/3 ephah; 1 kor = 10 ephah', () => {
    expect(forge(bathHebrew, liter)(1)).toBeCloseTo(22, 6);
    expect(forge(hinHebrew, liter)(6)).toBeCloseTo(22, 6);
    expect(forge(omerHebrew, liter)(10)).toBeCloseTo(22, 6);
    expect(forge(seahHebrew, liter)(3)).toBeCloseTo(22, 6);
    expect(forge(korHebrew, liter)(1)).toBeCloseTo(220, 4);
  });
});

describe('kits/antiquity: Japan-historical — reference values', () => {
  it('1 kane-jaku = 10/33 m exactly (Meiji 1875)', () => {
    expect(forge(shakuKaneJaku, meter)(33)).toBeCloseTo(10, 12);
  });

  it('1 kujira-jaku = 25/66 m = 5/4 kane-jaku exactly', () => {
    expect(forge(shakuKujiraJaku, meter)(66)).toBeCloseTo(25, 12);
    const ratio = forge(shakuKujiraJaku, meter)(1) / forge(shakuKaneJaku, meter)(1);
    expect(ratio).toBeCloseTo(1.25, 12);
  });

  it('1 sun = 1/10 shaku; 1 ken = 6 shaku; 1 jō = 10 shaku', () => {
    const shakuM = forge(shakuKaneJaku, meter)(1);
    expect(forge(sunJapan, meter)(10)).toBeCloseTo(shakuM, 12);
    expect(forge(kenJapan, meter)(1)).toBeCloseTo(shakuM * 6, 12);
    expect(forge(joJapan, meter)(1)).toBeCloseTo(shakuM * 10, 12);
  });

  it('1 ri Edo ≈ 3927.3 m (36 chō × 60 ken × 6 shaku)', () => {
    expect(forge(riJapanEdo, meter)(1)).toBeCloseTo(3927.27, 1);
  });

  it('1 ri Edo ≈ 2.44 statute miles', () => {
    expect(forge(riJapanEdo, statuteMile)(1)).toBeCloseTo(2.44, 2);
  });

  it('1 shō Hideyoshi ≈ 1.74 L; ~3.5% smaller than modern Meiji shō', () => {
    expect(forge(shoHideyoshi, liter)(1)).toBeCloseTo(1.74, 6);
    const hideyoshiL = forge(shoHideyoshi, liter)(1);
    const meijiShoL = 1.8039;
    const gap = (meijiShoL - hideyoshiL) / meijiShoL;
    expect(gap).toBeCloseTo(0.0354, 3);
  });

  it('1 gō Hideyoshi = 1/10 shō Hideyoshi', () => {
    const shoL = forge(shoHideyoshi, liter)(1);
    const tenGoL = forge(goHideyoshi, liter)(10);
    expect(tenGoL).toBeCloseTo(shoL, 12);
  });
});

describe('kits/antiquity: Japan-historical — round-trip', () => {
  const all = [
    shakuKaneJaku,
    shakuKujiraJaku,
    sunJapan,
    kenJapan,
    joJapan,
    riJapanEdo,
    shoHideyoshi,
    goHideyoshi,
  ];

  for (const u of all) {
    it(`${u.id} round-trips via its canonical base`, () => {
      const value = 5.5;
      const out = u.fromBase(u.toBase(value));
      expect(out).toBeCloseTo(value, 10);
    });
  }
});

describe('kits/antiquity: China-historical — reference values', () => {
  it('Han chi = 0.231 m (Qin Shi Huang 221 BCE standardization)', () => {
    expect(forge(chiHan, meter)(1)).toBe(0.231);
  });

  it('Tang small chi 0.247 m vs Tang large chi 0.296 m (5:6 ratio)', () => {
    expect(forge(chiTangSmall, meter)(1)).toBe(0.247);
    expect(forge(chiTangLarge, meter)(1)).toBe(0.296);
    const ratio = forge(chiTangLarge, meter)(1) / forge(chiTangSmall, meter)(1);
    expect(ratio).toBeCloseTo(1.198, 2); // ≈ 6/5
  });

  it('chi monotonically drifts upward through dynasties (Han < Song < Ming < Qing yingzao)', () => {
    expect(forge(chiHan, meter)(1)).toBeLessThan(forge(chiSong, meter)(1));
    expect(forge(chiSong, meter)(1)).toBeLessThan(forge(chiMing, meter)(1));
    expect(forge(chiMing, meter)(1)).toBeLessThan(forge(chiQingYingzao, meter)(1));
  });

  it('Qing customs chi (0.358 m) is ~12% larger than Qing yingzao chi', () => {
    expect(forge(chiQingHaiguan, meter)(1)).toBe(0.358);
    const ratio = forge(chiQingHaiguan, meter)(1) / forge(chiQingYingzao, meter)(1);
    expect(ratio).toBeCloseTo(1.119, 2);
  });

  it('Han catty ≈ 0.25 kg; Qing kuping catty ≈ 0.59682 kg', () => {
    expect(forge(cattyHan, kilogram)(1)).toBe(0.25);
    expect(forge(cattyQingKuping, kilogram)(1)).toBe(0.59682);
  });

  it('Han sheng = 0.2 L; Han dou = 10 sheng', () => {
    expect(forge(shengHan, liter)(1)).toBeCloseTo(0.2, 9);
    expect(forge(douHan, liter)(1)).toBeCloseTo(2, 9);
  });
});

describe('kits/antiquity: China-historical — round-trip', () => {
  const all = [
    chiHan,
    chiTangSmall,
    chiTangLarge,
    chiSong,
    chiMing,
    chiQingYingzao,
    chiQingHaiguan,
    cattyHan,
    cattyQingKuping,
    shengHan,
    douHan,
  ];

  for (const u of all) {
    it(`${u.id} round-trips via its canonical base`, () => {
      const value = 4.2;
      const out = u.fromBase(u.toBase(value));
      expect(out).toBeCloseTo(value, 10);
    });
  }
});

describe('kits/antiquity: Hebrew — round-trip', () => {
  const all = [
    commonCubitHebrew,
    royalCubitHebrew,
    handbreadthHebrew,
    spanHebrew,
    shekelHebrewCommon,
    shekelTyrian,
    talentHebrew,
    bathHebrew,
    ephahHebrew,
    hinHebrew,
    omerHebrew,
    seahHebrew,
    korHebrew,
  ];

  for (const u of all) {
    it(`${u.id} round-trips via its canonical base`, () => {
      const value = 1.618;
      const out = u.fromBase(u.toBase(value));
      expect(out).toBeCloseTo(value, 10);
    });
  }
});

describe('kits/antiquity: Greece — round-trip', () => {
  const all = [
    pousAttic,
    pousDoric,
    pousOlympic,
    stadionAttic,
    stadionOlympic,
    orgyiaAttic,
    drachmaAttic,
    tetradrachmAttic,
    minaAttic,
    talentAttic,
    metretesAttic,
    chousAttic,
    medimnosAttic,
    choenixAttic,
  ];

  for (const u of all) {
    it(`${u.id} round-trips via its canonical base`, () => {
      const value = 3.7;
      const out = u.fromBase(u.toBase(value));
      expect(out).toBeCloseTo(value, 10);
    });
  }
});
