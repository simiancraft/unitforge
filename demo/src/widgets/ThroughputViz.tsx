// Throughput visualizer. Two sliders drive a link rate (Gbit/s) and a
// target file size (GB); the widget renders the same rate in MB/s, the
// computed time-to-fill, AND a literal progress bar that fills at the
// computed rate. The fill animation is keyed to the inputs so each slider
// change restarts the sweep — the time-to-fill becomes physically visible.

import { useEffect, useRef, useState } from 'react';
import { forge } from 'unitforge';
import { byte, gigabit, gigabyte, megabyte } from 'unitforge/kits/data-storage';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';

const MAX_VIEW_SECONDS = 12; // cap the on-screen sweep so very-fast or very-slow rates remain perceivable

export function ThroughputViz() {
  const [gbits, setGbits] = useState(1);
  const [targetGB, setTargetGB] = useState(100);

  const mbPerSec = forge(gigabit, megabyte)(gbits);
  const bytesPerSec = forge(gigabit, byte)(gbits);
  const targetBytes = forge(gigabyte, byte)(targetGB);
  const realSeconds = targetBytes / bytesPerSec;
  const sweepSeconds = Math.min(MAX_VIEW_SECONDS, Math.max(0.4, realSeconds));

  // Restart the sweep whenever the user touches an input.
  const [tick, setTick] = useState(0);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setTick((t) => t + 1);
  }, [gbits, targetGB]);

  const isRealtime = realSeconds <= MAX_VIEW_SECONDS;

  return (
    <div className="flex flex-col gap-4">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .uf-throughput-fill {
            animation-name: uf-throughput-sweep;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
            animation-iteration-count: 1;
          }
          @keyframes uf-throughput-sweep {
            from { width: 0%; }
            to   { width: 100%; }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .uf-throughput-fill { width: 100%; }
        }
      `}</style>

      <Slider
        label="link rate (Gbit/s)"
        value={gbits}
        min={0.05}
        max={100}
        step={0.05}
        onChange={setGbits}
        suffix="Gbit/s"
      />
      <Slider
        label="target file size (GB)"
        value={targetGB}
        min={1}
        max={1000}
        step={1}
        onChange={setTargetGB}
        suffix="GB"
      />

      <div
        className="relative h-9 overflow-hidden rounded border"
        role="img"
        aria-label={`progress fills over ${formatDuration(realSeconds)} at ${mbPerSec.toFixed(1)} megabytes per second`}
        style={{
          background: 'var(--uf-bg)',
          borderColor: 'var(--uf-border)',
        }}
      >
        <div
          key={tick}
          className="uf-throughput-fill absolute inset-y-0 left-0"
          style={{
            background:
              'linear-gradient(90deg, var(--uf-accent) 0%, var(--uf-fg) 100%)',
            opacity: 0.85,
            animationDuration: `${sweepSeconds}s`,
          }}
        />
        <span
          className="mono absolute inset-0 flex items-center justify-center text-xs"
          style={{ color: 'var(--uf-bg)', mixBlendMode: 'difference' }}
        >
          {targetGB.toFixed(0)} GB · @ {mbPerSec.toFixed(1)} MB/s
        </span>
      </div>

      <Result label="bandwidth" value={`${mbPerSec.toFixed(1)} MB/s`} emphasis />
      <Result
        label={isRealtime ? 'time to fill' : 'time to fill (sweep capped)'}
        value={formatDuration(realSeconds)}
      />
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
