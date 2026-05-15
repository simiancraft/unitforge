// Any-rate link of the throughput machine. The original ThroughputViz
// section, refactored to a useAnyRate hook returning the three
// ReactNodes the chassis dispatches over. Two sliders drive a link
// rate (Gbit/s) and a target file size (GB); the widget computes MB/s
// and time-to-fill, and a literal progress bar fills at the computed
// rate so the time-to-fill is physically visible.

import { Gauge } from 'lucide-react';
import { useState } from 'react';
import { defineConversion, defineUnit, forge } from 'unitforge';
import { byte, gigabit, gigabyte, megabyte } from 'unitforge/kits/data-storage';
import { ControlPanel } from '~/components/kits/data-storage/control-panel.js';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { formatMagnitude } from '~/lib/format.js';

// View-time mapping: real transfer seconds to sweep-bar seconds.
// Modeled as two separate dimensions with a clamped linear remap;
// dogfoods defineUnit + defineConversion + via in the same section.
const REAL_TIME = 'real-time' as const;
const SWEEP_TIME = 'sweep-time' as const;

const MIN_REAL = 0.5;
const MAX_REAL = 100;
const MIN_SWEEP = 0.5;
const MAX_SWEEP = 45;

const realSecond = defineUnit({
  id: 'real-second',
  label: 'Real Second',
  symbol: 's',
  dimension: REAL_TIME,
  toBase: (v) => v,
  fromBase: (b) => b,
  base: true,
});

const sweepSecond = defineUnit({
  id: 'sweep-second',
  label: 'Sweep Second',
  symbol: 's',
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

export function useAnyRate() {
  const [gbits, setGbits] = useState(1);
  const [targetGB, setTargetGB] = useState(100);

  const mbPerSec = forge(gigabit, megabyte)(gbits);
  const bytesPerSec = forge(gigabit, byte)(gbits);
  const targetBytes = forge(gigabyte, byte)(targetGB);
  const realSeconds = targetBytes / bytesPerSec;
  const sweepSeconds = sweepFor({ real: realSeconds });

  const tick = `${gbits}-${targetGB}`;
  const isCapped = realSeconds >= MAX_REAL;

  return {
    menuZone: <AnyRateIcon />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <ThroughputBar
            targetGB={targetGB}
            mbPerSec={mbPerSec}
            sweepSeconds={sweepSeconds}
            realSeconds={realSeconds}
            tick={tick}
          />
        }
        controlsZone={
          <div className="flex flex-col gap-2">
            <Slider
              label={`link rate (${gigabit.symbol}/s)`}
              value={gbits}
              min={0.05}
              max={100}
              step={0.05}
              onChange={setGbits}
              suffix={`${gigabit.symbol}/s`}
            />
            <Slider
              label={`target file size (${gigabyte.symbol})`}
              value={targetGB}
              min={1}
              max={1000}
              step={1}
              onChange={setTargetGB}
              suffix={gigabyte.symbol}
            />
          </div>
        }
        resultsZone={
          <>
            <Result
              label="bandwidth"
              value={`${mbPerSec.toFixed(1)} ${megabyte.symbol}/s`}
              variant="hero"
            />
            <Result
              label={isCapped ? 'time to fill (sweep capped)' : 'time to fill'}
              value={formatDuration(realSeconds)}
            />
          </>
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(gbits, mbPerSec, targetGB, realSeconds)} />,
  };
}

function AnyRateIcon() {
  return <Gauge size={22} strokeWidth={1.6} />;
}

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
        {targetGB.toFixed(0)} {gigabyte.symbol} · @ {mbPerSec.toFixed(1)} {megabyte.symbol}/s
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
import { gigabit, megabyte, byte, gigabyte } from 'unitforge/kits/data-storage';

const mbps = forge(gigabit, megabyte)(${formatMagnitude(gbits)}); // ${formatMagnitude(mbps)}

const bytesPerSec = forge(gigabit, byte)(${formatMagnitude(gbits)});
const target = forge(gigabyte, byte)(${formatMagnitude(targetGB)});
const seconds = target / bytesPerSec; // ${formatMagnitude(seconds)}
`;
}
