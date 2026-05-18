import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';
import {
  cattySg,
  gram,
  jinHk,
  jinPrc,
  kilogram,
  longTon,
  microgram,
  milligram,
  ounceAvoirdupois,
  pound,
  shortTon,
  stone,
  tonne,
} from '../../src/kits/mass/index.js';

describe('kits/mass: per-unit shape', () => {
  const all = [
    kilogram,
    gram,
    milligram,
    microgram,
    tonne,
    ounceAvoirdupois,
    pound,
    stone,
    shortTon,
    longTon,
    jinPrc,
    jinHk,
    cattySg,
  ];

  for (const u of all) {
    it(`${u.id}: id, label, symbol, dimension all populated`, () => {
      expect(u.id.length).toBeGreaterThan(0);
      expect(u.label.length).toBeGreaterThan(0);
      expect(u.symbol.length).toBeGreaterThan(0);
      expect(u.dimension).toBe('mass');
    });
  }

  it('only kilogram is the canonical base', () => {
    expect(kilogram.base).toBe(true);
    for (const u of all.filter((x) => x !== kilogram)) {
      expect(u.base).toBeUndefined();
    }
  });

  it('all ids are kebab-case', () => {
    for (const u of all) {
      expect(u.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });
});

describe('kits/mass: conversion factors', () => {
  it('1 kg → 1 kg (identity at base)', () => {
    expect(forge(kilogram, kilogram)(1)).toBe(1);
  });

  it('1000 g = 1 kg', () => {
    expect(forge(gram, kilogram)(1000)).toBeCloseTo(1, 12);
  });

  it('1e6 mg = 1 kg', () => {
    expect(forge(milligram, kilogram)(1e6)).toBeCloseTo(1, 12);
  });

  it('1e9 µg = 1 kg', () => {
    expect(forge(microgram, kilogram)(1e9)).toBeCloseTo(1, 6);
  });

  it('1 tonne = 1000 kg', () => {
    expect(forge(tonne, kilogram)(1)).toBe(1000);
  });

  it('1 lb = 0.45359237 kg exactly (NIST)', () => {
    expect(forge(pound, kilogram)(1)).toBe(0.45359237);
  });

  it('1 oz = 1 lb / 16', () => {
    expect(forge(ounceAvoirdupois, kilogram)(16)).toBeCloseTo(0.45359237, 12);
  });

  it('1 stone = 14 lb', () => {
    expect(forge(stone, pound)(1)).toBeCloseTo(14, 12);
  });

  it('1 short ton (US) = 2000 lb', () => {
    expect(forge(shortTon, pound)(1)).toBeCloseTo(2000, 9);
  });

  it('1 long ton (UK) = 2240 lb', () => {
    expect(forge(longTon, pound)(1)).toBeCloseTo(2240, 9);
  });

  it('long ton and short ton differ by ~12% (pin the freight-invoice gap)', () => {
    const shortInKg = forge(shortTon, kilogram)(1);
    const longInKg = forge(longTon, kilogram)(1);
    expect(longInKg / shortInKg).toBeCloseTo(1.12, 4);
  });

  it('1 jin PRC = 500 g', () => {
    expect(forge(jinPrc, gram)(1)).toBeCloseTo(500, 12);
  });

  it('1 jin HK = 600 g', () => {
    expect(forge(jinHk, gram)(1)).toBeCloseTo(600, 12);
  });

  it('jin PRC and jin HK differ by 20%', () => {
    const prcInKg = forge(jinPrc, kilogram)(1);
    const hkInKg = forge(jinHk, kilogram)(1);
    expect(hkInKg / prcInKg).toBeCloseTo(1.2, 12);
  });

  it('1 Singapore catty = 1⅓ lb avoirdupois = 0.60479 kg', () => {
    expect(forge(cattySg, kilogram)(1)).toBeCloseTo(0.60479, 4);
    expect(forge(cattySg, pound)(1)).toBeCloseTo(4 / 3, 12);
  });

  it('Singapore catty and jin HK differ by ~0.8%', () => {
    const sgInKg = forge(cattySg, kilogram)(1);
    const hkInKg = forge(jinHk, kilogram)(1);
    expect(sgInKg / hkInKg).toBeCloseTo(1.008, 3);
  });
});

describe('kits/mass: round-trip', () => {
  const all = [
    gram,
    milligram,
    microgram,
    tonne,
    ounceAvoirdupois,
    pound,
    stone,
    shortTon,
    longTon,
    jinPrc,
    jinHk,
  ];

  for (const u of all) {
    it(`${u.id} round-trips to itself via kilogram`, () => {
      const value = 3.14159;
      const out = forge(kilogram, u)(forge(u, kilogram)(value));
      expect(out).toBeCloseTo(value, 10);
    });
  }
});
