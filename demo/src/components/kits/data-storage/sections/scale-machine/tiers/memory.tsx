// Memory tier of the scale machine. `useMemory` returns three ReactNodes:
// the menu icon, the interactivity (animated DIMM SVG with sequenced
// chip-boot LEDs), and the code template. Lifted from the original
// RamStick section; chip-boot stagger is pure CSS transition-delay
// (no JS animation loop).

import { MemoryStick } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { byte, gibibyte, gigabyte } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { formatMagnitude } from '~/lib/format.js';
import { ControlPanel } from '~/components/kits/data-storage/control-panel.js';

const CHIPS = 8;
const VIEW_W = 460;
const VIEW_H = 140;
const STAGGER_MS = 130;
const PINS = 26;
const RAMSTICK_MAX_GIB = 64;

const CHIP_SLOTS = Array.from({ length: CHIPS }, (_, i) => ({ id: `chip-${i}` }));
const PIN_SLOTS = Array.from({ length: PINS }, (_, i) => ({ id: `pin-${i}` }));

const CHIP_W = (VIEW_W - 100) / CHIPS - 8;
const CHIP_H = 52;
const CHIP_Y = 40;

export function useMemory() {
  const [gibValue, setGibValue] = useState(16);

  const inBytes = forge(gibibyte, byte)(gibValue);
  const inGB = forge(gibibyte, gigabyte)(gibValue);

  const litCount = Math.min(CHIPS, Math.max(0, Math.round((gibValue / RAMSTICK_MAX_GIB) * CHIPS)));

  return {
    menuZone: <MemoryIcon />,
    interactivityZone: (
      <ControlPanel
        visualZone={<RamStickVisual litCount={litCount} />}
        controlsZone={
          <Slider
            label={`capacity (${gibibyte.symbol})`}
            value={gibValue}
            min={1}
            max={RAMSTICK_MAX_GIB}
            step={1}
            onChange={setGibValue}
            suffix={gibibyte.symbol}
          />
        }
        resultsZone={
          <>
            <Result
              label="same value (decimal)"
              value={`${inGB.toFixed(3)} ${gigabyte.symbol}`}
              variant="hero"
            />
            <Result label="raw bytes" value={`${formatMagnitude(inBytes)} ${byte.symbol}`} />
          </>
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(gibValue, inGB, inBytes)} />,
  };
}

function MemoryIcon() {
  return <MemoryStick size={22} strokeWidth={1.6} />;
}

interface RamStickVisualProps {
  litCount: number;
}

function RamStickVisual({ litCount }: RamStickVisualProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block w-full"
      aria-hidden="true"
    >
      <rect
        x={4}
        y={20}
        width={VIEW_W - 8}
        height={96}
        rx={5}
        fill="var(--uf-card)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.6"
      />

      <rect
        x={20}
        y={CHIP_Y + 14}
        width={18}
        height={22}
        rx={2}
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.7"
      />
      <text
        x={29}
        y={CHIP_Y + 28}
        textAnchor="middle"
        className="mono"
        fontSize="6"
        fill="var(--uf-muted)"
      >
        SPD
      </text>

      {CHIP_SLOTS.map((chip, i) => {
        const isLit = i < litCount;
        const transitionDelay = `${i * STAGGER_MS}ms`;
        return (
          <g key={chip.id}>
            <rect
              x={48 + i * (CHIP_W + 8)}
              y={CHIP_Y}
              width={CHIP_W}
              height={CHIP_H}
              rx={2.5}
              fill={isLit ? 'var(--uf-accent)' : 'var(--uf-bg)'}
              fillOpacity={isLit ? 0.82 : 0.55}
              stroke="var(--uf-trace)"
              strokeOpacity="0.7"
              style={{
                transition: 'fill 220ms ease, fill-opacity 220ms ease',
                transitionDelay,
              }}
            />
            <line
              x1={48 + i * (CHIP_W + 8) + 3}
              y1={CHIP_Y + CHIP_H - 3}
              x2={48 + i * (CHIP_W + 8) + CHIP_W - 3}
              y2={CHIP_Y + CHIP_H - 3}
              stroke="var(--uf-trace)"
              strokeOpacity="0.55"
              strokeWidth="0.6"
            />
            <circle
              cx={48 + i * (CHIP_W + 8) + CHIP_W - 6}
              cy={CHIP_Y + 6}
              r={2.2}
              fill={isLit ? 'var(--uf-fg)' : 'var(--uf-muted)'}
              opacity={isLit ? 1 : 0.35}
              className={isLit ? 'uf-led-active' : undefined}
              style={{
                transition: 'fill 220ms ease, opacity 220ms ease',
                transitionDelay,
              }}
            />
          </g>
        );
      })}

      {PIN_SLOTS.map((pin, i) => (
        <rect
          key={pin.id}
          x={28 + i * ((VIEW_W - 76) / PINS)}
          y={108}
          width={(VIEW_W - 76) / PINS - 1.8}
          height={6}
          fill="var(--uf-trace)"
          opacity="0.9"
        />
      ))}
      <rect x={VIEW_W / 2 - 6} y={108} width={12} height={10} fill="var(--uf-card)" />

      <text
        x={VIEW_W - 8}
        y={14}
        textAnchor="end"
        className="mono"
        fontSize="8"
        fill="var(--uf-accent)"
      >
        POST · {litCount * (RAMSTICK_MAX_GIB / CHIPS)} {gibibyte.symbol} OK
      </text>
    </svg>
  );
}

function buildCode(gib: number, decimalGB: number, bytes: number): string {
  return `import { forge } from 'unitforge';
import { byte, gigabyte, gibibyte } from 'unitforge/kits/data-storage';

forge(gibibyte, gigabyte)(${formatMagnitude(gib)}); // ${formatMagnitude(decimalGB)}
forge(gibibyte, byte)(${formatMagnitude(gib)}); // ${formatMagnitude(bytes)}
`;
}
