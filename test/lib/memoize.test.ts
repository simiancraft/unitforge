import { describe, expect, it } from 'bun:test';
import { forge } from '../../src/index.js';
import { foot, meter } from '../../src/kits/geometry/index.js';
import {
  buildCacheKey,
  CACHE_KEY_SEP,
  DEFAULT_MEMO_CAP,
  MEMO_CAP_MAX,
  roundIfNumber,
  validateMemoCap,
  writeCache,
} from '../../src/lib/memoize.js';

// Targeted unit tests against the memoize primitives. Each test pins a
// specific invariant the fuzz suite implies but doesn't directly check
// (NUL byte separator, exact MAX cap, validateMemoCap range, FIFO
// eviction, roundIfNumber non-number passthrough).

describe('memoize constants', () => {
  it('CACHE_KEY_SEP is the NUL byte exactly', () => {
    expect(CACHE_KEY_SEP).toBe('\x00');
  });

  it('MEMO_CAP_MAX is 2^20 = 1,048,576', () => {
    expect(MEMO_CAP_MAX).toBe(1_048_576);
  });

  it('DEFAULT_MEMO_CAP is 1024', () => {
    expect(DEFAULT_MEMO_CAP).toBe(1024);
  });
});

describe('validateMemoCap', () => {
  it('returns 0 for null/undefined', () => {
    expect(validateMemoCap(null)).toBe(0);
    expect(validateMemoCap(undefined)).toBe(0);
  });

  it('accepts a valid integer in [0, MEMO_CAP_MAX]', () => {
    expect(validateMemoCap(0)).toBe(0);
    expect(validateMemoCap(1)).toBe(1);
    expect(validateMemoCap(MEMO_CAP_MAX)).toBe(MEMO_CAP_MAX);
  });

  it('rejects negative integers', () => {
    expect(() => validateMemoCap(-1)).toThrow(/memoize must be an integer/);
  });

  it('rejects values above MEMO_CAP_MAX', () => {
    expect(() => validateMemoCap(MEMO_CAP_MAX + 1)).toThrow(/memoize must be an integer/);
  });

  it('rejects non-integer numbers', () => {
    expect(() => validateMemoCap(1.5)).toThrow(/memoize must be an integer/);
  });

  it('rejects non-number values', () => {
    expect(() => validateMemoCap('128' as unknown as number)).toThrow(/memoize must be an integer/);
    expect(() => validateMemoCap(true as unknown as number)).toThrow(/memoize must be an integer/);
  });
});

describe('buildCacheKey', () => {
  it('joins sorted values with the NUL separator', () => {
    const key = buildCacheKey({ a: 1, b: 2 }, ['a', 'b'], null);
    expect(key).toBe(`1${CACHE_KEY_SEP}2`);
  });

  it('different inputs at the boundary do not collide', () => {
    // {a: '1', b: '2'} vs {a: '12', b: ''}: collide under plain
    // concatenation, MUST NOT collide under NUL-separated form.
    const k1 = buildCacheKey({ a: '1', b: '2' }, ['a', 'b'], null);
    const k2 = buildCacheKey({ a: '12', b: '' }, ['a', 'b'], null);
    expect(k1).not.toBe(k2);
  });

  it('rounds numeric values when precisionMul is set', () => {
    const k = buildCacheKey({ a: 1.234567 }, ['a'], 100);
    expect(k).toBe('1.23');
  });
});

describe('writeCache (FIFO eviction)', () => {
  it('evicts the oldest insertion when at cap', () => {
    const cache = new Map<string, unknown>();
    writeCache(cache, 'a', 1, 2);
    writeCache(cache, 'b', 2, 2);
    writeCache(cache, 'c', 3, 2);
    expect(cache.has('a')).toBe(false); // oldest evicted
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(true);
  });

  it('does not evict when below cap', () => {
    const cache = new Map<string, unknown>();
    writeCache(cache, 'a', 1, 4);
    writeCache(cache, 'b', 2, 4);
    expect(cache.size).toBe(2);
  });
});

describe('roundIfNumber', () => {
  it('rounds finite numbers to the precision multiplier', () => {
    expect(roundIfNumber(1.234, 100)).toBe(1.23);
  });

  it('passes through when mul is null', () => {
    expect(roundIfNumber(1.234, null)).toBe(1.234);
  });

  it('passes through non-numbers unchanged', () => {
    expect(roundIfNumber('hello', 100)).toBe('hello');
    expect(roundIfNumber(null, 100)).toBe(null);
    expect(roundIfNumber(undefined, 100)).toBe(undefined);
  });

  it('passes through NaN and Infinity', () => {
    expect(Number.isNaN(roundIfNumber(NaN, 100) as number)).toBe(true);
    expect(roundIfNumber(Infinity, 100)).toBe(Infinity);
    expect(roundIfNumber(-Infinity, 100)).toBe(-Infinity);
  });
});

describe('forge with memoize: integration covers cache key path', () => {
  it('cache hits return the same value as cache misses', () => {
    const convert = forge(meter, foot, { memoize: 32 });
    const first = convert(1.5);
    const second = convert(1.5);
    expect(second).toBe(first);
  });
});
