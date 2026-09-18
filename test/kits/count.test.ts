import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';
import { dozen, each, greatGross, gross, pair, ream } from '../../src/kits/count/index.js';

const all = [each, pair, dozen, gross, greatGross, ream];

describe('kits/count: public identity', () => {
  // ids, labels, and symbols are public API; a drift here is a breaking
  // change for anyone keying a UI or a lookup table on them.
  it('pins the id / label / symbol triple of every unit', () => {
    expect(all.map((u) => [u.id, u.label, u.symbol])).toEqual([
      ['each', 'Each', 'ea'],
      ['pair', 'Pair', 'pr'],
      ['dozen', 'Dozen', 'dz'],
      ['gross', 'Gross', 'gr'],
      ['great-gross', 'Great Gross', 'ggr'],
      ['ream', 'Ream', 'rm'],
    ]);
  });
});

describe('kits/count: per-unit shape', () => {
  for (const u of all) {
    it(`${u.id}: id, label, symbol, dimension all populated`, () => {
      expect(u.id.length).toBeGreaterThan(0);
      expect(u.label.length).toBeGreaterThan(0);
      expect(u.symbol.length).toBeGreaterThan(0);
      expect(u.dimension).toBe('count');
    });
  }

  it('only each is the canonical base', () => {
    expect(each.base).toBe(true);
    for (const u of all.filter((x) => x !== each)) {
      expect(u.base).toBeUndefined();
    }
  });

  it('all ids are kebab-case', () => {
    for (const u of all) {
      expect(u.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });
});

describe('kits/count: conversion factors', () => {
  it('1 each -> 1 each (identity at base)', () => {
    expect(forge(each, each)(1)).toBe(1);
  });

  it('1 pair -> 2 each', () => {
    expect(forge(pair, each)(1)).toBe(2);
  });

  it('1 dozen -> 12 each', () => {
    expect(forge(dozen, each)(1)).toBe(12);
  });

  it('1 gross -> 144 each', () => {
    expect(forge(gross, each)(1)).toBe(144);
  });

  it('1 gross -> 12 dozen', () => {
    expect(forge(gross, dozen)(1)).toBe(12);
  });

  it('1 great gross -> 1728 each', () => {
    expect(forge(greatGross, each)(1)).toBe(1728);
  });

  it('1 great gross -> 12 gross, not 12 dozen', () => {
    expect(forge(greatGross, gross)(1)).toBe(12);
    expect(forge(greatGross, dozen)(1)).toBe(144);
  });

  it('1 ream -> 500 each', () => {
    expect(forge(ream, each)(1)).toBe(500);
  });

  it('the historical 480-sheet short ream is not what `ream` means', () => {
    expect(forge(ream, each)(1)).not.toBe(480);
  });
});

describe('kits/count: discreteness is not enforced at the unit boundary', () => {
  // These assertions pin a deliberate design decision, not an accident.
  // A unit that floored would break `forge`'s bidirectional composition
  // and the round-trip invariant the fuzz suite holds every unit to.
  it('fractional counts pass through units unrounded', () => {
    expect(forge(each, dozen)(7)).toBeCloseTo(7 / 12, 12);
    expect(forge(dozen, each)(0.5)).toBe(6);
  });

  it('every unit round-trips through base', () => {
    for (const u of all) {
      for (const v of [0, 1, 2.5, 7, 1000.25]) {
        expect(u.fromBase(u.toBase(v))).toBeCloseTo(v, 9);
      }
    }
  });

  it('precision: 0 rounds and does not floor, so it cannot make pieces whole', () => {
    // 32 each is 2.666… dozen. Flooring would give 2; `precision` rounds
    // it up to 3. This is why kits/inventory floors inside `compute`.
    expect(forge(each, dozen, { precision: 0 })(32)).toBe(3);
  });
});
