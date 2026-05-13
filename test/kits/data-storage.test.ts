import { describe, expect, it } from 'bun:test';
import { DATA } from '../../src/dimensions.js';
import { forge } from '../../src/index.js';
import {
  bit,
  byte,
  exabyte,
  gibibyte,
  gigabit,
  gigabyte,
  kibibyte,
  kilobit,
  kilobyte,
  mebibyte,
  megabit,
  megabyte,
  pebibyte,
  petabyte,
  tebibyte,
  terabyte,
  yottabyte,
  zettabyte,
} from '../../src/kits/data-storage/index.js';

// Per-unit tests assert the four invariants every Unit must hold:
//   1. `id` / `label` / `symbol` match the documented identity triple
//   2. `dimension` is correct
//   3. `toBase` converts forward correctly (some known reference value)
//   4. `fromBase` is the inverse (round-trip from base back to unit)
// `base: true` is asserted only on canonical bases.

describe('data-storage/units: bytes (decimal)', () => {
  describe('byte (base)', () => {
    it('has the right shape', () => {
      expect(byte.id).toBe('byte');
      expect(byte.label).toBe('Byte');
      expect(byte.symbol).toBe('B');
      expect(byte.dimension).toBe(DATA);
      expect(byte.base).toBe(true);
    });
    it('toBase is identity', () => {
      expect(byte.toBase(0)).toBe(0);
      expect(byte.toBase(1)).toBe(1);
      expect(byte.toBase(123.456)).toBe(123.456);
    });
    it('fromBase is identity', () => {
      expect(byte.fromBase(0)).toBe(0);
      expect(byte.fromBase(1)).toBe(1);
      expect(byte.fromBase(123.456)).toBe(123.456);
    });
  });

  describe('kilobyte', () => {
    it('has the right shape', () => {
      expect(kilobyte.id).toBe('kilobyte');
      expect(kilobyte.label).toBe('Kilobyte');
      expect(kilobyte.symbol).toBe('kB');
      expect(kilobyte.dimension).toBe(DATA);
      expect(kilobyte.base).toBeUndefined();
    });
    it('1 kB = 1000 B via toBase', () => {
      expect(kilobyte.toBase(1)).toBe(1000);
      expect(kilobyte.toBase(2.5)).toBe(2500);
    });
    it('1000 B = 1 kB via fromBase', () => {
      expect(kilobyte.fromBase(1000)).toBe(1);
      expect(kilobyte.fromBase(2500)).toBe(2.5);
    });
  });

  describe('megabyte', () => {
    it('has the right shape', () => {
      expect(megabyte.id).toBe('megabyte');
      expect(megabyte.label).toBe('Megabyte');
      expect(megabyte.symbol).toBe('MB');
      expect(megabyte.dimension).toBe(DATA);
    });
    it('1 MB = 1e6 B via toBase', () => {
      expect(megabyte.toBase(1)).toBe(1_000_000);
    });
    it('1e6 B = 1 MB via fromBase', () => {
      expect(megabyte.fromBase(1_000_000)).toBe(1);
    });
  });

  describe('gigabyte', () => {
    it('has the right shape', () => {
      expect(gigabyte.id).toBe('gigabyte');
      expect(gigabyte.label).toBe('Gigabyte');
      expect(gigabyte.symbol).toBe('GB');
      expect(gigabyte.dimension).toBe(DATA);
    });
    it('1 GB = 1e9 B via toBase', () => {
      expect(gigabyte.toBase(1)).toBe(1_000_000_000);
    });
    it('1e9 B = 1 GB via fromBase', () => {
      expect(gigabyte.fromBase(1_000_000_000)).toBe(1);
    });
  });

  describe('terabyte', () => {
    it('has the right shape', () => {
      expect(terabyte.id).toBe('terabyte');
      expect(terabyte.label).toBe('Terabyte');
      expect(terabyte.symbol).toBe('TB');
      expect(terabyte.dimension).toBe(DATA);
    });
    it('1 TB = 1e12 B via toBase', () => {
      expect(terabyte.toBase(1)).toBe(1_000_000_000_000);
    });
    it('1e12 B = 1 TB via fromBase', () => {
      expect(terabyte.fromBase(1_000_000_000_000)).toBe(1);
    });
  });

  describe('petabyte', () => {
    it('has the right shape', () => {
      expect(petabyte.id).toBe('petabyte');
      expect(petabyte.label).toBe('Petabyte');
      expect(petabyte.symbol).toBe('PB');
      expect(petabyte.dimension).toBe(DATA);
    });
    it('1 PB = 1e15 B via toBase', () => {
      expect(petabyte.toBase(1)).toBe(1_000_000_000_000_000);
    });
    it('1e15 B = 1 PB via fromBase', () => {
      expect(petabyte.fromBase(1_000_000_000_000_000)).toBe(1);
    });
  });

  describe('exabyte', () => {
    it('has the right shape', () => {
      expect(exabyte.id).toBe('exabyte');
      expect(exabyte.label).toBe('Exabyte');
      expect(exabyte.symbol).toBe('EB');
      expect(exabyte.dimension).toBe(DATA);
    });
    it('1 EB = 1e18 B via toBase', () => {
      expect(exabyte.toBase(1)).toBe(1e18);
    });
    it('1e18 B = 1 EB via fromBase', () => {
      expect(exabyte.fromBase(1e18)).toBe(1);
    });
  });

  describe('zettabyte', () => {
    it('has the right shape', () => {
      expect(zettabyte.id).toBe('zettabyte');
      expect(zettabyte.label).toBe('Zettabyte');
      expect(zettabyte.symbol).toBe('ZB');
      expect(zettabyte.dimension).toBe(DATA);
    });
    it('1 ZB = 1e21 B via toBase', () => {
      expect(zettabyte.toBase(1)).toBe(1e21);
    });
    it('1e21 B = 1 ZB via fromBase', () => {
      expect(zettabyte.fromBase(1e21)).toBe(1);
    });
  });

  describe('yottabyte', () => {
    it('has the right shape', () => {
      expect(yottabyte.id).toBe('yottabyte');
      expect(yottabyte.label).toBe('Yottabyte');
      expect(yottabyte.symbol).toBe('YB');
      expect(yottabyte.dimension).toBe(DATA);
    });
    it('1 YB = 1e24 B via toBase', () => {
      expect(yottabyte.toBase(1)).toBe(1e24);
    });
    it('1e24 B = 1 YB via fromBase', () => {
      expect(yottabyte.fromBase(1e24)).toBe(1);
    });
  });
});

describe('data-storage/units: bytes (binary / IEC 80000-13)', () => {
  describe('kibibyte', () => {
    it('has the right shape', () => {
      expect(kibibyte.id).toBe('kibibyte');
      expect(kibibyte.label).toBe('Kibibyte');
      expect(kibibyte.symbol).toBe('KiB');
      expect(kibibyte.dimension).toBe(DATA);
    });
    it('1 KiB = 1024 B via toBase', () => {
      expect(kibibyte.toBase(1)).toBe(1024);
    });
    it('1024 B = 1 KiB via fromBase', () => {
      expect(kibibyte.fromBase(1024)).toBe(1);
    });
  });

  describe('mebibyte', () => {
    it('has the right shape', () => {
      expect(mebibyte.id).toBe('mebibyte');
      expect(mebibyte.label).toBe('Mebibyte');
      expect(mebibyte.symbol).toBe('MiB');
      expect(mebibyte.dimension).toBe(DATA);
    });
    it('1 MiB = 1024² B via toBase', () => {
      expect(mebibyte.toBase(1)).toBe(1_048_576);
    });
    it('1024² B = 1 MiB via fromBase', () => {
      expect(mebibyte.fromBase(1_048_576)).toBe(1);
    });
  });

  describe('gibibyte', () => {
    it('has the right shape', () => {
      expect(gibibyte.id).toBe('gibibyte');
      expect(gibibyte.label).toBe('Gibibyte');
      expect(gibibyte.symbol).toBe('GiB');
      expect(gibibyte.dimension).toBe(DATA);
    });
    it('1 GiB = 1024³ B via toBase', () => {
      expect(gibibyte.toBase(1)).toBe(1_073_741_824);
    });
    it('1024³ B = 1 GiB via fromBase', () => {
      expect(gibibyte.fromBase(1_073_741_824)).toBe(1);
    });
  });

  describe('tebibyte', () => {
    it('has the right shape', () => {
      expect(tebibyte.id).toBe('tebibyte');
      expect(tebibyte.label).toBe('Tebibyte');
      expect(tebibyte.symbol).toBe('TiB');
      expect(tebibyte.dimension).toBe(DATA);
    });
    it('1 TiB = 1024⁴ B via toBase', () => {
      expect(tebibyte.toBase(1)).toBe(1_099_511_627_776);
    });
    it('1024⁴ B = 1 TiB via fromBase', () => {
      expect(tebibyte.fromBase(1_099_511_627_776)).toBe(1);
    });
  });

  describe('pebibyte', () => {
    it('has the right shape', () => {
      expect(pebibyte.id).toBe('pebibyte');
      expect(pebibyte.label).toBe('Pebibyte');
      expect(pebibyte.symbol).toBe('PiB');
      expect(pebibyte.dimension).toBe(DATA);
    });
    it('1 PiB = 1024⁵ B via toBase', () => {
      expect(pebibyte.toBase(1)).toBe(1_125_899_906_842_624);
    });
    it('1024⁵ B = 1 PiB via fromBase', () => {
      expect(pebibyte.fromBase(1_125_899_906_842_624)).toBe(1);
    });
  });
});

describe('data-storage/units: bits', () => {
  describe('bit', () => {
    it('has the right shape', () => {
      expect(bit.id).toBe('bit');
      expect(bit.label).toBe('Bit');
      expect(bit.symbol).toBe('bit');
      expect(bit.dimension).toBe(DATA);
    });
    it('1 bit = 0.125 B via toBase (8 bits = 1 byte)', () => {
      expect(bit.toBase(1)).toBe(0.125);
      expect(bit.toBase(8)).toBe(1);
    });
    it('1 B = 8 bits via fromBase', () => {
      expect(bit.fromBase(1)).toBe(8);
      expect(bit.fromBase(0.125)).toBe(1);
    });
  });

  describe('kilobit', () => {
    it('has the right shape', () => {
      expect(kilobit.id).toBe('kilobit');
      expect(kilobit.label).toBe('Kilobit');
      expect(kilobit.symbol).toBe('kbit');
      expect(kilobit.dimension).toBe(DATA);
    });
    it('1 kbit = 125 B via toBase (1000 bits / 8)', () => {
      expect(kilobit.toBase(1)).toBe(125);
    });
    it('125 B = 1 kbit via fromBase', () => {
      expect(kilobit.fromBase(125)).toBe(1);
    });
  });

  describe('megabit', () => {
    it('has the right shape', () => {
      expect(megabit.id).toBe('megabit');
      expect(megabit.label).toBe('Megabit');
      expect(megabit.symbol).toBe('Mbit');
      expect(megabit.dimension).toBe(DATA);
    });
    it('1 Mbit = 125 000 B via toBase', () => {
      expect(megabit.toBase(1)).toBe(125_000);
    });
    it('125 000 B = 1 Mbit via fromBase', () => {
      expect(megabit.fromBase(125_000)).toBe(1);
    });
  });

  describe('gigabit', () => {
    it('has the right shape', () => {
      expect(gigabit.id).toBe('gigabit');
      expect(gigabit.label).toBe('Gigabit');
      expect(gigabit.symbol).toBe('Gbit');
      expect(gigabit.dimension).toBe(DATA);
    });
    it('1 Gbit = 125 000 000 B via toBase', () => {
      expect(gigabit.toBase(1)).toBe(125_000_000);
    });
    it('125 000 000 B = 1 Gbit via fromBase', () => {
      expect(gigabit.fromBase(125_000_000)).toBe(1);
    });
  });
});

describe('data-storage end-to-end via forge', () => {
  it('1 GB = 0.93132... GiB (the canonical decimal-vs-binary gap)', () => {
    const result = forge(gigabyte, gibibyte)(1);
    expect(result).toBeCloseTo(0.9313225746154785, 12);
  });

  it('1 GiB = 1.073741824 GB exactly', () => {
    const result = forge(gibibyte, gigabyte)(1);
    expect(result).toBe(1.073741824);
  });

  it('1 Gbit/s = 125 MB/s (network throughput → storage rate)', () => {
    const result = forge(gigabit, megabyte)(1);
    expect(result).toBe(125);
  });

  it('1 byte = 8 bits round-trips exactly', () => {
    const toBits = forge(byte, bit)(1);
    expect(toBits).toBe(8);
    const back = forge(bit, byte)(toBits);
    expect(back).toBe(1);
  });

  it('500 GB consumer-drive vs 500 GiB OS report', () => {
    const drive = forge(gigabyte, gibibyte)(500);
    expect(drive).toBeCloseTo(465.661, 3);
  });

  it('1 TB / 1 TiB round-trip via base preserves identity', () => {
    expect(forge(terabyte, terabyte)(1)).toBe(1);
    expect(forge(tebibyte, tebibyte)(1)).toBe(1);
  });

  it('1 kilobyte = 0.9765625 kibibyte (decimal smaller than binary)', () => {
    const result = forge(kilobyte, kibibyte)(1);
    expect(result).toBe(0.9765625);
  });
});
