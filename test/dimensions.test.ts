import { describe, expect, it } from 'bun:test';
import { AREA, DIMENSIONS, LENGTH, VOLUME } from '../src/dimensions.js';

describe('dimensions', () => {
  it('LENGTH is the literal "length"', () => {
    expect(LENGTH).toBe('length');
  });

  it('AREA is the literal "area"', () => {
    expect(AREA).toBe('area');
  });

  it('VOLUME is the literal "volume"', () => {
    expect(VOLUME).toBe('volume');
  });

  it('DIMENSIONS tuple lists every built-in dimension', () => {
    expect(DIMENSIONS).toEqual([LENGTH, AREA, VOLUME]);
  });

  it('every entry in DIMENSIONS is a kebab-case identifier', () => {
    for (const d of DIMENSIONS) {
      expect(d).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });
});
