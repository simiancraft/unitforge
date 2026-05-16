import { describe, expect, it } from 'bun:test';
import { RESERVED_PROTO_KEYS, safeCopy } from '../../src/lib/safeCopy.js';

// Targeted unit tests against safeCopy + RESERVED_PROTO_KEYS. The
// existing forge test iterates the RESERVED_PROTO_KEYS set, which is a
// tautology against mutations that swap an entry's literal value (the
// mutated set still has SOME key, the test still iterates SOME keys,
// the equality check between the mutated set and the iteration target
// still passes). These tests pin the exact set membership so a
// mutation that changes any literal entry is caught.

describe('RESERVED_PROTO_KEYS', () => {
  it('contains __proto__ exactly', () => {
    expect(RESERVED_PROTO_KEYS.has('__proto__')).toBe(true);
  });

  it('contains constructor exactly', () => {
    expect(RESERVED_PROTO_KEYS.has('constructor')).toBe(true);
  });

  it('contains prototype exactly', () => {
    expect(RESERVED_PROTO_KEYS.has('prototype')).toBe(true);
  });

  it('has exactly three entries', () => {
    expect(RESERVED_PROTO_KEYS.size).toBe(3);
  });
});

describe('safeCopy', () => {
  it('preserves regular keys unchanged', () => {
    const input = { id: 'foo', label: 'Foo', value: 1 };
    const copy = safeCopy(input);
    expect(copy).toEqual(input);
    expect(copy).not.toBe(input);
  });

  it('throws on __proto__ as own enumerable key', () => {
    const evil: Record<string, unknown> = { id: 'evil' };
    Object.defineProperty(evil, '__proto__', {
      value: { polluted: true },
      enumerable: true,
      configurable: true,
      writable: true,
    });
    expect(() => safeCopy(evil)).toThrow(/__proto__/);
  });

  it('throws on constructor key', () => {
    const evil: Record<string, unknown> = { constructor: 'polluted', id: 'evil' };
    expect(() => safeCopy(evil)).toThrow(/constructor/);
  });

  it('throws on prototype key', () => {
    const evil: Record<string, unknown> = { prototype: 'polluted', id: 'evil' };
    expect(() => safeCopy(evil)).toThrow(/prototype/);
  });
});
