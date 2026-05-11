// RAM-module visualizer. A stylized DIMM with eight memory chips. The user
// slides a capacity in GiB; the chips light up proportionally and the legend
// renders the same quantity in decimal GB and bytes. The "flair" of the
// data-storage page: an animated piece of hardware on screen, reacting to
// state.

import { useState } from 'react';
import { forge } from 'unitforge';
import { byte, gibibyte, gigabyte } from 'unitforge/kits/data-storage';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';

const CHIPS = 8;
const VIEW_W = 440;
const VIEW_H = 130;

export function RamStick() {
  const [gibValue, setGibValue] = useState(16);

  const inBytes = forge(gibibyte, byte)(gibValue);
  const inGB = forge(gibibyte, gigabyte)(gibValue);

  // Total RAM the stick visually represents (largest tick on the slider).
  const max = 64;
  const litChips = Math.min(CHIPS, Math.max(0, Math.round((gibValue / max) * CHIPS)));

  const chipW = (VIEW_W - 80) / CHIPS - 8;
  const chipH = 50;
  const chipY = 40;

  return (
    <div className="flex flex-col gap-4">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full"
      >
        {/* PCB substrate */}
        <rect
          x={4}
          y={20}
          width={VIEW_W - 8}
          height={90}
          rx={4}
          fill="var(--uf-card)"
          stroke="var(--uf-trace)"
          strokeOpacity="0.5"
        />
        {/* gold contact fingers along the bottom */}
        {Array.from({ length: 22 }).map((_, i) => (
          <rect
            key={i}
            x={20 + i * ((VIEW_W - 60) / 22)}
            y={104}
            width={(VIEW_W - 60) / 22 - 1.5}
            height={6}
            fill="var(--uf-trace)"
            opacity="0.85"
          />
        ))}
        {/* memory chips */}
        {Array.from({ length: CHIPS }).map((_, i) => {
          const isLit = i < litChips;
          return (
            <g key={i}>
              <rect
                x={40 + i * (chipW + 8)}
                y={chipY}
                width={chipW}
                height={chipH}
                rx={2}
                fill={isLit ? 'var(--uf-accent)' : 'var(--uf-bg)'}
                fillOpacity={isLit ? 0.85 : 0.6}
                stroke="var(--uf-trace)"
                strokeOpacity="0.7"
                style={{
                  transition: 'fill 220ms ease, fill-opacity 220ms ease',
                }}
              />
              {/* status LED on each chip */}
              <circle
                cx={40 + i * (chipW + 8) + chipW - 6}
                cy={chipY + 6}
                r={2}
                fill={isLit ? 'var(--uf-fg)' : 'var(--uf-muted)'}
                opacity={isLit ? 1 : 0.4}
              />
            </g>
          );
        })}
        {/* notch */}
        <rect
          x={VIEW_W / 2 - 6}
          y={104}
          width={12}
          height={10}
          fill="var(--uf-bg)"
        />
      </svg>

      <Slider
        label="capacity (GiB)"
        value={gibValue}
        min={1}
        max={64}
        step={1}
        onChange={setGibValue}
        suffix="GiB"
      />
      <Result label="same value" value={`${inGB.toFixed(3)} GB`} />
      <Result label="raw bytes" value={`${inBytes.toExponential(3)} B`} />
    </div>
  );
}
