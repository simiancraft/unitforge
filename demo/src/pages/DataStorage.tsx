// Data-storage kit page. PCB / phosphor theme. Scroll-down stack of demos
// that escalates: hello-bytes (one number, every unit, side-by-side
// decimal/binary/bits) → drive-vs-os (the famous marketed-vs-reported
// gap, visualized) → throughput (Gbit ↔ MB and fill-time) → RAM stick flair.

import { Cpu, Gauge, HardDrive, MemoryStick } from 'lucide-react';
import { DemoSection } from '../components/DemoSection.js';
import { CircuitBg } from '../themes/CircuitBg.js';
import { DriveVsOs } from '../widgets/DriveVsOs.js';
import { HelloBytes } from '../widgets/HelloBytes.js';
import { RamStick } from '../widgets/RamStick.js';
import { ThroughputViz } from '../widgets/ThroughputViz.js';

export function DataStoragePage() {
  return (
    <>
      <CircuitBg />

      <header className="flex flex-col gap-2 relative uf-scanlines">
        <p className="uf-eyebrow">kit · 02</p>
        <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">
          data-storage
        </h1>
        <p
          className="mt-2 max-w-2xl text-sm leading-relaxed"
          style={{ color: 'var(--uf-muted)' }}
        >
          Decimal bytes (kilobyte through petabyte), IEC binary bytes
          (kibibyte through pebibyte), and bits. Shipping all three is the
          point: a units library that calls a kilobyte and a kibibyte the
          same thing is the bug. Click through; the demos all run the same
          forge calls your code would.
        </p>
      </header>

      <div className="mt-12 flex flex-col gap-16">
        <DemoSection
          eyebrow="demo 01"
          title="hello, bytes"
          kicker="one value, every unit"
          icon={<Cpu size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
          intro={
            <>
              Pick a number and a unit; every other byte and bit unit
              renders side-by-side. The decimal and binary columns sit next
              to each other so the gap between (e.g.) GB and GiB is visible
              at a glance.
            </>
          }
          widget={<HelloBytes />}
          code={HELLO_BYTES_CODE}
        />

        <DemoSection
          eyebrow="demo 02"
          title="drive vs OS"
          kicker="why 1 TB shows up as 931 GiB"
          icon={<HardDrive size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
          intro={
            <>
              Drive vendors market capacity in decimal gigabytes; operating
              systems traditionally report in binary gibibytes. Same drive,
              different unit. Slide the marketed capacity and watch the
              "lost" space (it isn't lost; it's the unit conversion).
            </>
          }
          widget={<DriveVsOs />}
          code={DRIVE_CODE}
        />

        <DemoSection
          eyebrow="demo 03"
          title="throughput"
          kicker="Gbit/s ↔ MB/s"
          icon={<Gauge size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
          intro={
            <>
              Network specs are in bits; storage rates in bytes. Same DATA
              dimension, factor of 8 apart. This widget converts your
              connection's Gbit/s into MB/s and computes the time-to-fill
              for a target file size.
            </>
          }
          widget={<ThroughputViz />}
          code={THROUGHPUT_CODE}
        />

        <DemoSection
          eyebrow="demo 04 · flair"
          title="RAM stick"
          kicker="memory you can light up"
          icon={<MemoryStick size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
          intro={
            <>
              Modern memory is sold in GiB (Windows reports it the same
              way), while consumer drives use decimal GB. Move the slider;
              the chips light up proportionally and you see the same
              capacity rendered in both unit families.
            </>
          }
          widget={<RamStick />}
          code={RAM_CODE}
        />
      </div>
    </>
  );
}

const HELLO_BYTES_CODE = `import { forge } from 'unitforge';
import {
  byte,
  gigabyte,
  gibibyte,
  megabit,
} from 'unitforge/kits/data-storage';

const bytes = forge(gigabyte, byte)(500); // 5e11
const inGiB = forge(byte, gibibyte)(bytes); // 465.66
const inMbit = forge(byte, megabit)(bytes); // 4e6
`;

const DRIVE_CODE = `import { forge } from 'unitforge';
import { gigabyte, gibibyte } from 'unitforge/kits/data-storage';

const marketedToReported = forge(gigabyte, gibibyte);

// A "1 TB" drive shows up as ~931 GiB.
marketedToReported(1000); // 931.32...
`;

const THROUGHPUT_CODE = `import { forge } from 'unitforge';
import {
  gigabit,
  megabyte,
  byte,
  gigabyte,
} from 'unitforge/kits/data-storage';

// 1 Gbit/s as MB/s
const mbps = forge(gigabit, megabyte)(1); // 125

// Time to transfer a 100 GB file at 1 Gbit/s
const bytesPerSec = forge(gigabit, byte)(1);
const target = forge(gigabyte, byte)(100);
const seconds = target / bytesPerSec; // 800
`;

const RAM_CODE = `import { forge } from 'unitforge';
import {
  byte,
  gigabyte,
  gibibyte,
} from 'unitforge/kits/data-storage';

// 16 GiB of RAM, rendered in both family conventions.
const bytes = forge(gibibyte, byte)(16);
const inDecimalGB = forge(gibibyte, gigabyte)(16); // 17.18
`;
