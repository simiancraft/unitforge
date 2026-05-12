// Throughput visualizer. Two sliders drive a link rate (Gbit/s) and a
// target file size (GB); the widget renders the same rate in MB/s, the
// computed time-to-fill, AND a literal progress bar that fills at the
// computed rate. The fill animation is keyed to the inputs so each slider
// change restarts the sweep; the time-to-fill becomes physically visible.

import { Gauge } from 'lucide-react';
import { useState } from 'react';
import { defineConversion, defineUnit, forge } from 'unitforge';
import { byte, gigabit, gigabyte, megabyte } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/CodeBlock.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { formatMagnitude } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';

// View-time mapping: real transfer seconds → sweep-bar seconds. Both
// are time, but they're different *kinds* of time pedagogically, so
// we model them as two dimensions and forge a converter between them
// with a clamped linear remap. Real-seconds in [MIN_REAL, MAX_REAL]
// map onto sweep-seconds in [MIN_SWEEP, MAX_SWEEP]; outside that band
// the sweep saturates at the endpoints. Dogfoods unitforge's
// defineUnit + defineConversion + via pattern in the same section
// that already shows the byte/bit forge calls.
const REAL_TIME = 'real-time' as const;
const SWEEP_TIME = 'sweep-time' as const;

const MIN_REAL = 0.5;
const MAX_REAL = 100;
const MIN_SWEEP = 1;
const MAX_SWEEP = 30;

const realSecond = defineUnit({
  name: 'realSecond',
  dimension: REAL_TIME,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

const sweepSecond = defineUnit({
  name: 'sweepSecond',
  dimension: SWEEP_TIME,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

const realToSweep = defineConversion({
  inputs: { real: REAL_TIME },
  output: SWEEP_TIME,
  compute: ({ real }) => {
    if (real <= MIN_REAL) return MIN_SWEEP;
    if (real >= MAX_REAL) return MAX_SWEEP;
    const t = (real - MIN_REAL) / (MAX_REAL - MIN_REAL);
    return MIN_SWEEP + t * (MAX_SWEEP - MIN_SWEEP);
  },
});

const sweepFor = forge({ real: realSecond }, sweepSecond, { via: realToSweep });

export function ThroughputViz() {
  const [gbits, setGbits] = useState(1);
  const [targetGB, setTargetGB] = useState(100);

  const mbPerSec = forge(gigabit, megabyte)(gbits);
  const bytesPerSec = forge(gigabit, byte)(gbits);
  const targetBytes = forge(gigabyte, byte)(targetGB);
  const realSeconds = targetBytes / bytesPerSec;
  const sweepSeconds = sweepFor({ real: realSeconds });

  // Derived key remounts the fill element whenever the inputs change so
  // the CSS keyframe sweep restarts in lockstep with the slider.
  const tick = `${gbits}-${targetGB}`;

  const isCapped = realSeconds >= MAX_REAL;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 03"
          title="throughput"
          kicker="Gbit/s ↔ MB/s"
          iconZone={<Gauge size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Network specs are in bits; storage rates in bytes. Same DATA dimension, factor of 8 apart.
          Adjust the link rate; the file fills against the clock, and the sweep duration is the
          forge-computed transfer time at that rate.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <ThroughputWidget
              gbits={gbits}
              targetGB={targetGB}
              mbPerSec={mbPerSec}
              sweepSeconds={sweepSeconds}
              realSeconds={realSeconds}
              tick={tick}
              isCapped={isCapped}
              onGbitsChange={setGbits}
              onTargetGBChange={setTargetGB}
            />
          }
          codeZone={<CodeBlock code={buildCode(gbits, mbPerSec, targetGB, realSeconds)} />}
        />
      }
    />
  );
}

interface ThroughputWidgetProps {
  gbits: number;
  targetGB: number;
  mbPerSec: number;
  sweepSeconds: number;
  realSeconds: number;
  tick: string;
  isCapped: boolean;
  onGbitsChange: (next: number) => void;
  onTargetGBChange: (next: number) => void;
}

function ThroughputWidget({
  gbits,
  targetGB,
  mbPerSec,
  sweepSeconds,
  realSeconds,
  tick,
  isCapped,
  onGbitsChange,
  onTargetGBChange,
}: ThroughputWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <Slider
        label="link rate (Gbit/s)"
        value={gbits}
        min={0.05}
        max={100}
        step={0.05}
        onChange={onGbitsChange}
        suffix="Gbit/s"
      />
      <Slider
        label="target file size (GB)"
        value={targetGB}
        min={1}
        max={1000}
        step={1}
        onChange={onTargetGBChange}
        suffix="GB"
      />

      {/* Sweep is animated by CSS; current fill % isn't React-tracked,
          so role="progressbar" would lie via aria-valuenow. ThroughputBar
          uses role="img" + aria-label to describe the animation honestly. */}
      <ThroughputBar
        targetGB={targetGB}
        mbPerSec={mbPerSec}
        sweepSeconds={sweepSeconds}
        realSeconds={realSeconds}
        tick={tick}
      />

      <Result label="bandwidth" value={`${mbPerSec.toFixed(1)} MB/s`} variant="hero" />
      <Result
        label={isCapped ? 'time to fill (sweep capped)' : 'time to fill'}
        value={formatDuration(realSeconds)}
      />
    </div>
  );
}

// Throughput progress bar. Named Organ: the gradient fill sweep is a
// self-contained visualizer. Sink (no state), bounded props, ticks on
// every slider change while the rest of the SectionLayout chrome
// doesn't need to.
interface ThroughputBarProps {
  targetGB: number;
  mbPerSec: number;
  sweepSeconds: number;
  realSeconds: number;
  tick: string;
}

function ThroughputBar({
  targetGB,
  mbPerSec,
  sweepSeconds,
  realSeconds,
  tick,
}: ThroughputBarProps) {
  return (
    <div
      className="relative h-9 overflow-hidden rounded border border-uf-border bg-uf-bg"
      role="img"
      aria-label={`bar sweep over ${formatDuration(realSeconds)} at ${mbPerSec.toFixed(1)} megabytes per second`}
    >
      <div
        key={tick}
        className="uf-throughput-fill absolute inset-y-0 left-0"
        style={{
          background: 'linear-gradient(90deg, var(--uf-accent) 0%, var(--uf-fg) 100%)',
          opacity: 0.85,
          animationDuration: `${sweepSeconds}s`,
        }}
      />
      <span className="mono absolute inset-0 flex items-center justify-center text-xs text-neutral-500 mix-blend-color-burn">
        {targetGB.toFixed(0)} GB · @ {mbPerSec.toFixed(1)} MB/s
      </span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} ms`;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  if (seconds < 86_400) return `${(seconds / 3600).toFixed(1)} h`;
  return `${(seconds / 86_400).toFixed(1)} d`;
}

function buildCode(gbits: number, mbps: number, targetGB: number, seconds: number): string {
  return `import { forge } from 'unitforge';
import {
  gigabit, megabyte, byte, gigabyte,
} from 'unitforge/kits/data-storage';

const mbps = forge(gigabit, megabyte)(${formatMagnitude(gbits)}); // ${formatMagnitude(mbps)}

// Time to transfer a ${formatMagnitude(targetGB)} GB file at ${formatMagnitude(gbits)} Gbit/s.
const bytesPerSec = forge(gigabit, byte)(${formatMagnitude(gbits)});
const target = forge(gigabyte, byte)(${formatMagnitude(targetGB)});
const seconds = target / bytesPerSec; // ${formatMagnitude(seconds)}
`;
}
