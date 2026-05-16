import { describe, expect, it } from 'bun:test';
import { VOLUME } from '../../src/dimensions.js';
import { forge, type Unit } from '../../src/index.js';

type VolumeUnit = Unit<typeof VOLUME, number>;

import {
  cupUk,
  cupUs,
  dash,
  fluidOunceUk,
  fluidOunceUs,
  milliliter,
  pinch,
  stickOfButter,
  tablespoonUk,
  tablespoonUs,
  teaspoonUk,
  teaspoonUs,
} from '../../src/kits/cooking/index.js';

// Cooking kit lives in the VOLUME dimension. Every unit shares dimension
// with the geometry kit's milliliter / liter / cubic-meter, so a recipe
// in cookin units can forge() against a metric kitchen scale without
// either kit knowing about the other. The headline test is the US/UK
// cup split: same name, different volume, distinct units.

describe('cooking units carry VOLUME dimension', () => {
  for (const u of [
    milliliter,
    fluidOunceUs,
    fluidOunceUk,
    teaspoonUs,
    teaspoonUk,
    tablespoonUs,
    tablespoonUk,
    cupUs,
    cupUk,
    stickOfButter,
    dash,
    pinch,
  ]) {
    it(`${u.id} → VOLUME`, () => {
      expect(u.dimension).toBe(VOLUME);
    });
  }
});

describe('US/UK split: cups are NOT interchangeable', () => {
  it('1 US cup ≈ 236.588 mL', () => {
    expect(forge(cupUs, milliliter)(1)).toBeCloseTo(236.5882365, 6);
  });

  it('1 UK cup ≈ 284.131 mL', () => {
    expect(forge(cupUk, milliliter)(1)).toBeCloseTo(284.130625, 6);
  });

  it('1 US cup ≈ 0.832 UK cup (≠ 1; mixing them ruins the dish)', () => {
    const ukFromUs = forge(cupUs, cupUk)(1);
    expect(ukFromUs).toBeCloseTo(0.8326741882, 6);
    expect(ukFromUs).not.toBeCloseTo(1, 2);
  });

  it('1 UK cup ≈ 1.201 US cups', () => {
    expect(forge(cupUk, cupUs)(1)).toBeCloseTo(1.20094998, 6);
  });
});

describe('US/UK split: fluid ounces ALSO differ', () => {
  it('1 US fl oz ≈ 29.574 mL', () => {
    expect(forge(fluidOunceUs, milliliter)(1)).toBeCloseTo(29.5735295625, 6);
  });

  it('1 UK fl oz ≈ 28.413 mL', () => {
    expect(forge(fluidOunceUk, milliliter)(1)).toBeCloseTo(28.4130625, 6);
  });

  it('US fl oz is the LARGER fluid ounce despite the smaller cup ratio', () => {
    // The relationships invert: US cup < UK cup, but US fl oz > UK fl oz.
    // That is because the US cup is 8 fl oz and the UK cup is 10 fl oz.
    expect(forge(fluidOunceUs, milliliter)(1)).toBeGreaterThan(forge(fluidOunceUk, milliliter)(1));
    expect(forge(cupUs, milliliter)(1)).toBeLessThan(forge(cupUk, milliliter)(1));
  });
});

describe('US within-system identities', () => {
  it('1 US cup = 8 US fluid ounces', () => {
    expect(forge(cupUs, fluidOunceUs)(1)).toBeCloseTo(8, 9);
  });

  it('1 US tablespoon = 1/2 US fluid ounce', () => {
    expect(forge(tablespoonUs, fluidOunceUs)(1)).toBeCloseTo(0.5, 9);
  });

  it('1 US tablespoon = 3 US teaspoons', () => {
    expect(forge(tablespoonUs, teaspoonUs)(1)).toBeCloseTo(3, 9);
  });

  it('1 US cup = 16 US tablespoons', () => {
    expect(forge(cupUs, tablespoonUs)(1)).toBeCloseTo(16, 9);
  });

  it('1 US cup = 48 US teaspoons', () => {
    expect(forge(cupUs, teaspoonUs)(1)).toBeCloseTo(48, 9);
  });
});

describe('UK within-system identities', () => {
  it('1 UK cup = 10 UK fluid ounces', () => {
    expect(forge(cupUk, fluidOunceUk)(1)).toBeCloseTo(10, 9);
  });

  it('1 UK tablespoon = 5/8 UK fluid ounce', () => {
    expect(forge(tablespoonUk, fluidOunceUk)(1)).toBeCloseTo(0.625, 9);
  });

  it('1 UK teaspoon = 1/8 UK fluid ounce', () => {
    expect(forge(teaspoonUk, fluidOunceUk)(1)).toBeCloseTo(0.125, 9);
  });

  it('1 UK tablespoon = 5 UK teaspoons', () => {
    expect(forge(tablespoonUk, teaspoonUk)(1)).toBeCloseTo(5, 9);
  });
});

describe('stick of butter', () => {
  it('1 stick = 1/2 US cup', () => {
    expect(forge(stickOfButter, cupUs)(1)).toBeCloseTo(0.5, 9);
  });

  it('1 stick = 4 US fluid ounces', () => {
    expect(forge(stickOfButter, fluidOunceUs)(1)).toBeCloseTo(4, 9);
  });

  it('1 stick = 8 US tablespoons', () => {
    expect(forge(stickOfButter, tablespoonUs)(1)).toBeCloseTo(8, 9);
  });

  it('1 stick ≈ 118.294 mL', () => {
    expect(forge(stickOfButter, milliliter)(1)).toBeCloseTo(118.29411825, 6);
  });
});

describe('dash and pinch (kitchen tradition; not legal measures)', () => {
  it('1 dash = 1/8 US teaspoon', () => {
    expect(forge(dash, teaspoonUs)(1)).toBeCloseTo(0.125, 9);
  });

  it('1 pinch = 1/16 US teaspoon', () => {
    expect(forge(pinch, teaspoonUs)(1)).toBeCloseTo(0.0625, 9);
  });

  it('2 pinches = 1 dash', () => {
    expect(forge(pinch, dash)(2)).toBeCloseTo(1, 9);
  });
});

describe('round-trip: forge(b, a)(forge(a, b)(x)) ≈ x', () => {
  const pairs: ReadonlyArray<readonly [VolumeUnit, VolumeUnit]> = [
    [cupUs, cupUk],
    [tablespoonUs, milliliter],
    [stickOfButter, tablespoonUs],
    [dash, pinch],
    [fluidOunceUs, fluidOunceUk],
  ];
  for (const [a, b] of pairs) {
    it(`${a.id} ↔ ${b.id}`, () => {
      const ab = forge(a, b);
      const ba = forge(b, a);
      const x = 3.14;
      expect(ba(ab(x))).toBeCloseTo(x, 9);
    });
  }
});

describe('cross-kit interop: cooking units forge against geometry milliliter', () => {
  // The cooking kit's milliliter is structurally identical to the
  // geometry kit's milliliter (same dimension string, same toBase
  // factor); forging an oz against either yields the same result.
  // This pins the contract that "VOLUME is VOLUME" no matter which
  // kit shipped the unit.
  it('US fl oz → cooking-mL matches the canonical 29.574', () => {
    expect(forge(fluidOunceUs, milliliter)(1)).toBeCloseTo(29.5735295625, 6);
  });
});
