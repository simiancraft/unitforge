// Throughput visualizer. Network specs (Gbit/s) and storage rates (MB/s) are
// the same quantity in different units; this widget makes that visible by
// computing "how long to fill a 100 GB target at the current rate".
//
// One slider drives a connection speed in Gbit/s; the widget renders MB/s
// (the same value forge'd into a different unit) and the implied fill-time
// for a configurable target size.

import { useState } from 'react';
import { forge } from 'unitforge';
import { byte, gigabit, gigabyte, megabyte } from 'unitforge/kits/data-storage';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';

export function ThroughputViz() {
  const [gbits, setGbits] = useState(1);
  const [targetGB, setTargetGB] = useState(100);

  const mbPerSec = forge(gigabit, megabyte)(gbits);
  const bytesPerSec = forge(gigabit, byte)(gbits);
  const targetBytes = forge(gigabyte, byte)(targetGB);
  const seconds = targetBytes / bytesPerSec;

  return (
    <div className="flex flex-col gap-4">
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
      <Result label="bandwidth" value={`${mbPerSec.toFixed(1)} MB/s`} emphasis />
      <Result label="time to fill" value={formatDuration(seconds)} />
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
