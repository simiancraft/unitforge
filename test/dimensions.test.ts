import { describe, expect, it } from 'bun:test';
import {
  ANGLE,
  AREA,
  DATA,
  DIMENSIONS,
  LENGTH,
  MASS,
  TEMPERATURE,
  VOLUME,
} from '../src/dimensions.js';

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

  it('DATA is the literal "data"', () => {
    expect(DATA).toBe('data');
  });

  it('ANGLE is the literal "angle"', () => {
    expect(ANGLE).toBe('angle');
  });

  it('MASS is the literal "mass"', () => {
    expect(MASS).toBe('mass');
  });

  it('TEMPERATURE is the literal "temperature"', () => {
    expect(TEMPERATURE).toBe('temperature');
  });

  it('DIMENSIONS tuple lists every built-in dimension', () => {
    expect(DIMENSIONS).toEqual([LENGTH, AREA, VOLUME, DATA, ANGLE, MASS, TEMPERATURE]);
  });

  it('every entry in DIMENSIONS is a kebab-case identifier', () => {
    for (const d of DIMENSIONS) {
      expect(d).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });
});
