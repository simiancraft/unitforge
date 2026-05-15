// Server-array tier; PB and PiB scale. At consumer scale the
// decimal-vs-binary gap is ~7%; at petabyte scale it's ~12.6%. Same
// math, different magnitude of the "missing" capacity. Visual: a small
// rack of stylized drives whose lit count tracks the chosen raw count.

import { Server } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { byte, pebibyte, petabyte, tebibyte, terabyte } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { ControlPanel } from '~/components/kits/data-storage/control-panel.js';

const RACK_DRIVES = 24;
const DRIVE_SLOTS = Array.from({ length: RACK_DRIVES }, (_, i) => ({ id: `drive-${i}` }));

const MIN_TB = 10;
const MAX_TB = 2000;

export function useServerArray() {
  const [marketedTB, setMarketedTB] = useState(500);

  const bytes = forge(terabyte, byte)(marketedTB);
  const inTiB = forge(byte, tebibyte)(bytes);
  const inPB = forge(byte, petabyte)(bytes);
  const inPiB = forge(byte, pebibyte)(bytes);
  const gapTiB = marketedTB - inTiB;
  const gapPct = (gapTiB / marketedTB) * 100;

  const litCount = Math.min(
    RACK_DRIVES,
    Math.max(1, Math.round((marketedTB / MAX_TB) * RACK_DRIVES)),
  );

  return {
    menuZone: <ServerIcon />,
    interactivityZone: (
      <ControlPanel
        visualZone={<RackVisual litCount={litCount} />}
        controlsZone={
          <Slider
            label={`array capacity (TB, marketed)`}
            value={marketedTB}
            min={MIN_TB}
            max={MAX_TB}
            step={10}
            onChange={setMarketedTB}
            suffix="TB"
          />
        }
        resultsZone={
          <>
            <Result
              label="apparent gap"
              value={`${gapTiB.toFixed(1)} TiB (${gapPct.toFixed(2)}%)`}
              variant="hero"
            />
            <Result label="marketed (decimal)" value={`${marketedTB.toFixed(0)} TB`} />
            <Result label="reported (binary)" value={`${inTiB.toFixed(1)} TiB`} />
            <Result label="in PB" value={`${inPB.toFixed(3)} PB`} />
            <Result label="in PiB" value={`${inPiB.toFixed(3)} PiB`} />
          </>
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(marketedTB, inTiB, inPiB)} />,
  };
}

function ServerIcon() {
  return <Server size={22} strokeWidth={1.6} />;
}

interface RackVisualProps {
  litCount: number;
}

// Stylized 4U rack with 24 drive bays. Lit bays use accent fill + a
// small status LED that glows; unlit are bg-colored placeholders.
function RackVisual({ litCount }: RackVisualProps) {
  return (
    <svg
      viewBox="0 0 480 160"
      xmlns="http://www.w3.org/2000/svg"
      className="block w-full"
      style={{ maxWidth: '480px', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Chassis frame */}
      <rect
        x="6"
        y="10"
        width="468"
        height="140"
        rx="4"
        fill="var(--uf-card)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.6"
      />
      {/* Rack ears with mount holes */}
      <rect x="6" y="10" width="14" height="140" fill="var(--uf-bg)" fillOpacity="0.6" />
      <rect x="460" y="10" width="14" height="140" fill="var(--uf-bg)" fillOpacity="0.6" />
      {[26, 70, 110].map((y) => (
        <g key={`mount-${y}`}>
          <circle
            cx="13"
            cy={y}
            r="2"
            fill="var(--uf-bg)"
            stroke="var(--uf-trace)"
            strokeWidth="0.5"
          />
          <circle
            cx="467"
            cy={y}
            r="2"
            fill="var(--uf-bg)"
            stroke="var(--uf-trace)"
            strokeWidth="0.5"
          />
        </g>
      ))}

      {/* Drive bays: 24 slots in a 4×6 grid */}
      {DRIVE_SLOTS.map((slot, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const x = 30 + col * 70;
        const y = 22 + row * 32;
        const isLit = i < litCount;
        return (
          <g key={slot.id}>
            <rect
              x={x}
              y={y}
              width="62"
              height="24"
              rx="1.5"
              fill={isLit ? 'var(--uf-accent)' : 'var(--uf-bg)'}
              fillOpacity={isLit ? 0.78 : 0.55}
              stroke="var(--uf-trace)"
              strokeOpacity="0.7"
              style={{ transition: 'fill 220ms ease, fill-opacity 220ms ease' }}
            />
            {/* Drive face: handle slot + small status LED */}
            <line
              x1={x + 4}
              y1={y + 12}
              x2={x + 20}
              y2={y + 12}
              stroke="var(--uf-trace)"
              strokeOpacity="0.55"
              strokeWidth="0.7"
            />
            <circle
              cx={x + 56}
              cy={y + 12}
              r="1.6"
              fill={isLit ? 'var(--uf-fg)' : 'var(--uf-muted)'}
              opacity={isLit ? 1 : 0.35}
            />
          </g>
        );
      })}

      {/* Status text */}
      <text x={470} y={18} textAnchor="end" className="mono" fontSize="8" fill="var(--uf-accent)">
        {litCount} / {RACK_DRIVES} bays · online
      </text>
    </svg>
  );
}

function buildCode(marketedTB: number, reportedTiB: number, reportedPiB: number): string {
  return `import { forge } from 'unitforge';
import { byte, terabyte, tebibyte, pebibyte } from 'unitforge/kits/data-storage';

// At the petabyte tier the decimal-vs-binary gap reaches ~12.6%.
// Same conversion shape as a consumer drive; just shifted up two scales.
forge(terabyte, tebibyte)(${marketedTB}); // ${reportedTiB.toFixed(3)}
forge(terabyte, pebibyte)(${marketedTB}); // ${reportedPiB.toFixed(6)}
`;
}
