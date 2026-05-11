// Data-storage kit page. PCB / phosphor theme. The page owns ForgeBench
// state at the top so the circuit background's pulse animation toggles
// whenever the user is actively moving the bench; the visual effect is
// "data flowing through the board as you scrub units".

import { useEffect, useRef, useState } from 'react';
import { Cpu, Gauge, HardDrive, MemoryStick } from 'lucide-react';
import { DemoSection } from '../../components/DemoSection.js';
import { ForgeBench, type BenchState } from '../../components/ForgeBench.js';
import { KitThemeProvider } from '../../components/KitTheme.js';
import { CircuitBg } from './components/CircuitBg.js';
import { DATA_ALL_UNITS, findByKey } from '../../lib/units.js';
import { DriveVsOs } from './components/DriveVsOs.js';
import { HelloBytes } from './components/HelloBytes.js';
import { RamStick } from './components/RamStick.js';
import { ThroughputViz } from './components/ThroughputViz.js';
import './data-storage.css';

export function DataStoragePage() {
  const [bench, setBench] = useState<BenchState<'data'>>({
    fromKey: 'GB',
    toKey: 'GiB',
    value: 500,
  });

  // Pulse the circuit traces briefly each time the bench moves. We flip
  // `pulse` to true on change and back to false 1.6s later so the
  // animation has time to play and then rests.
  const [pulse, setPulse] = useState(false);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    setPulse(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPulse(false), 1600);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [bench.fromKey, bench.toKey, bench.value]);

  return (
    <KitThemeProvider values={{ shikiTheme: 'synthwave-84' }}>
      <CircuitBg pulse={pulse} />

      <header className="relative uf-scanlines flex flex-col gap-2">
        <p className="uf-eyebrow">kit · 02</p>
        <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">
          data-storage
        </h1>
        <p
          className="mt-2 max-w-2xl text-sm leading-relaxed"
          style={{ color: 'var(--uf-muted)' }}
        >
          Decimal bytes (kilobyte through petabyte), IEC binary bytes
          (kibibyte through pebibyte), and bits. The board pulses as you
          scrub the bench; every conversion is a real forge call against the
          built package.
        </p>
      </header>

      <div className="mt-6">
        <ForgeBench
          state={bench}
          onChange={setBench}
          options={DATA_ALL_UNITS.map((o) => ({ key: o.key, label: o.label, unit: o.unit }))}
          min={1}
          max={2000}
          step={1}
          codeFor={(s, r) =>
            `forge(${findByKey(DATA_ALL_UNITS, s.fromKey).label}, ${findByKey(DATA_ALL_UNITS, s.toKey).label})(${s.value}); // ${r.toExponential(3)}`
          }
          label="forge bench · data"
        />
      </div>

      <div className="mt-12 flex flex-col gap-16">
        <DemoSection
          eyebrow="demo 01"
          title="hello, bytes"
          kicker="one value, every unit"
          icon={<Cpu size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
          intro={
            <>
              Pick a number and a unit; every other byte and bit unit renders
              side by side. Decimal and binary columns sit next to each other
              so the gap between (say) GB and GiB is visible at a glance.
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
              systems traditionally report in binary gibibytes. Slide the
              marketed capacity and watch the "missing" space appear; it
              isn't missing, it's the unit conversion.
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
              dimension, factor of 8 apart. Adjust the link rate; the file
              fills against the clock, and the sweep duration is the
              forge-computed transfer time at that rate.
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
              Modern memory is sold in GiB; consumer drives use decimal GB.
              Move the slider and the chips boot in sequence with their
              status LEDs glowing. Same capacity, two unit families.
            </>
          }
          widget={<RamStick />}
          code={RAM_CODE}
        />
      </div>
    </KitThemeProvider>
  );
}

const HELLO_BYTES_CODE = `import { forge } from 'unitforge';
import {
  byte, gigabyte, gibibyte, megabit,
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
  gigabit, megabyte, byte, gigabyte,
} from 'unitforge/kits/data-storage';

const mbps = forge(gigabit, megabyte)(1); // 125

// Time to transfer a 100 GB file at 1 Gbit/s.
const bytesPerSec = forge(gigabit, byte)(1);
const target = forge(gigabyte, byte)(100);
const seconds = target / bytesPerSec; // 800
`;

const RAM_CODE = `import { forge } from 'unitforge';
import {
  byte, gigabyte, gibibyte,
} from 'unitforge/kits/data-storage';

const inDecimalGB = forge(gibibyte, gigabyte)(16); // 17.18
const bytes = forge(gibibyte, byte)(16);
`;
