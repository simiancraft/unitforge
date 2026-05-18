import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';
import { celsius, fahrenheit, kelvin, rankine } from '../../src/kits/temperature/index.js';

describe('kits/temperature: per-unit shape', () => {
  const all = [kelvin, celsius, fahrenheit, rankine];

  for (const u of all) {
    it(`${u.id}: id, label, symbol, dimension all populated`, () => {
      expect(u.id.length).toBeGreaterThan(0);
      expect(u.label.length).toBeGreaterThan(0);
      expect(u.symbol.length).toBeGreaterThan(0);
      expect(u.dimension).toBe('temperature');
    });
  }

  it('only kelvin is the canonical base', () => {
    expect(kelvin.base).toBe(true);
    expect(celsius.base).toBeUndefined();
    expect(fahrenheit.base).toBeUndefined();
    expect(rankine.base).toBeUndefined();
  });
});

describe('kits/temperature: absolute zero', () => {
  it('0 K = 0 °R', () => {
    expect(forge(kelvin, rankine)(0)).toBe(0);
  });

  it('0 K = -273.15 °C', () => {
    expect(forge(kelvin, celsius)(0)).toBeCloseTo(-273.15, 12);
  });

  it('0 K = -459.67 °F', () => {
    expect(forge(kelvin, fahrenheit)(0)).toBeCloseTo(-459.67, 9);
  });
});

describe('kits/temperature: water freezing (273.15 K)', () => {
  it('273.15 K = 0 °C', () => {
    expect(forge(kelvin, celsius)(273.15)).toBeCloseTo(0, 12);
  });

  it('273.15 K = 32 °F', () => {
    expect(forge(kelvin, fahrenheit)(273.15)).toBeCloseTo(32, 9);
  });

  it('273.15 K = 491.67 °R', () => {
    expect(forge(kelvin, rankine)(273.15)).toBeCloseTo(491.67, 9);
  });

  it('0 °C = 32 °F (direct)', () => {
    expect(forge(celsius, fahrenheit)(0)).toBeCloseTo(32, 9);
  });
});

describe('kits/temperature: water boiling (373.15 K)', () => {
  it('373.15 K = 100 °C', () => {
    expect(forge(kelvin, celsius)(373.15)).toBeCloseTo(100, 12);
  });

  it('373.15 K = 212 °F', () => {
    expect(forge(kelvin, fahrenheit)(373.15)).toBeCloseTo(212, 9);
  });

  it('373.15 K = 671.67 °R', () => {
    expect(forge(kelvin, rankine)(373.15)).toBeCloseTo(671.67, 9);
  });

  it('100 °C = 212 °F (direct)', () => {
    expect(forge(celsius, fahrenheit)(100)).toBeCloseTo(212, 9);
  });
});

describe('kits/temperature: -40 sanity (the cross-point)', () => {
  it('-40 °F = -40 °C exactly (the scales cross)', () => {
    expect(forge(fahrenheit, celsius)(-40)).toBeCloseTo(-40, 12);
  });

  it('-40 °C = -40 °F exactly', () => {
    expect(forge(celsius, fahrenheit)(-40)).toBeCloseTo(-40, 12);
  });
});

describe('kits/temperature: round-trip across all scales', () => {
  const all = [celsius, fahrenheit, rankine];

  for (const u of all) {
    it(`${u.id} round-trips to itself via kelvin (affine math sanity)`, () => {
      const value = 42; // arbitrary non-zero
      const out = forge(kelvin, u)(forge(u, kelvin)(value));
      expect(out).toBeCloseTo(value, 10);
    });

    it(`${u.id} round-trips at a negative value (absolute-zero-adjacent)`, () => {
      const value = -200;
      const out = forge(kelvin, u)(forge(u, kelvin)(value));
      expect(out).toBeCloseTo(value, 10);
    });
  }
});

describe('kits/temperature: cooking-relevant oven temperatures', () => {
  it('350 °F (standard baking) ≈ 176.67 °C', () => {
    expect(forge(fahrenheit, celsius)(350)).toBeCloseTo(176.6667, 4);
  });

  it('165 °F (US safe chicken internal) ≈ 73.89 °C', () => {
    expect(forge(fahrenheit, celsius)(165)).toBeCloseTo(73.8889, 4);
  });

  it('500 °F (high-heat oven) ≈ 260 °C', () => {
    expect(forge(fahrenheit, celsius)(500)).toBeCloseTo(260, 4);
  });
});
