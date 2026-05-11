// Drive-marketing vs OS-reporting visualizer. Two stacked bars: the
// manufacturer's "1 TB!" claim (decimal) and the same drive as the OS sees
// it (binary, smaller). The gap is the entire pedagogical point of this
// widget; we draw it explicitly with a stripe overlay and a callout.

import { useState } from 'react';
import { forge } from 'unitforge';
import { byte, gibibyte, gigabyte } from 'unitforge/kits/data-storage';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';

const VIEW_W = 480;
const BAR_H = 36;
const PADDING = 12;
const MAX_GB = 8000;

export function DriveVsOs() {
  const [marketedGB, setMarketedGB] = useState(1000);

  const bytes = forge(gigabyte, byte)(marketedGB);
  const inGiB = forge(byte, gibibyte)(bytes);

  const fullW = VIEW_W - PADDING * 2;
  // Normalize: marketedGB drives the visible bar width; OS-reported GiB
  // expressed as a fraction of decimal bytes (always shorter).
  const lossFraction = 1 - inGiB / marketedGB; // ratio of "missing" reported space
  const reportedW = fullW * (1 - lossFraction);

  return (
    <div className="flex flex-col gap-4">
      <Slider
        label="marketed capacity (GB)"
        value={marketedGB}
        min={100}
        max={MAX_GB}
        step={10}
        onChange={setMarketedGB}
        suffix="GB"
      />

      <svg
        viewBox={`0 0 ${VIEW_W} ${BAR_H * 2 + 36}`}
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full"
      >
        <defs>
          <pattern id="uf-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="3" height="6" fill="var(--uf-accent)" opacity="0.55" />
          </pattern>
        </defs>

        {/* marketed bar */}
        <text x={PADDING} y={14} className="mono" fill="var(--uf-muted)" fontSize="9">
          MARKETED  ·  {marketedGB.toFixed(0)} GB (decimal)
        </text>
        <rect
          x={PADDING}
          y={18}
          width={fullW}
          height={BAR_H}
          fill="var(--uf-card)"
          stroke="var(--uf-border)"
        />
        <rect x={PADDING} y={18} width={fullW} height={BAR_H} fill="var(--uf-accent)" opacity="0.85" />

        {/* reported bar (shorter; the gap is the famous "missing space") */}
        <text x={PADDING} y={18 + BAR_H + 16} className="mono" fill="var(--uf-muted)" fontSize="9">
          OS REPORTS  ·  {inGiB.toFixed(1)} GiB (binary)
        </text>
        <rect
          x={PADDING}
          y={18 + BAR_H + 20}
          width={fullW}
          height={BAR_H}
          fill="var(--uf-card)"
          stroke="var(--uf-border)"
        />
        <rect
          x={PADDING}
          y={18 + BAR_H + 20}
          width={reportedW}
          height={BAR_H}
          fill="var(--uf-accent)"
          opacity="0.85"
        />
        {/* striped gap overlay */}
        <rect
          x={PADDING + reportedW}
          y={18 + BAR_H + 20}
          width={fullW - reportedW}
          height={BAR_H}
          fill="url(#uf-stripes)"
        />
      </svg>

      <Result
        label="apparent gap"
        value={`${(marketedGB - inGiB).toFixed(2)} (≈ ${(lossFraction * 100).toFixed(2)}%)`}
        emphasis
      />
    </div>
  );
}
