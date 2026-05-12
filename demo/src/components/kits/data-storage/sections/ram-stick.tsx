// RAM-module visualizer. Memory chips light in sequence as capacity scales;
// each chip's status LED breathes when active. Slide the capacity and you
// watch the DIMM "post". The staggered boot is pure CSS: each chip carries
// a per-index `transition-delay`, so when the lit count jumps the browser
// sequences the chips on its own. No effect, no state animation loop.

import { MemoryStick } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { byte, gibibyte, gigabyte } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/CodeBlock.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { formatMagnitude } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';

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

export function RamStick() {
  const [gibValue, setGibValue] = useState(16);

  const inBytes = forge(gibibyte, byte)(gibValue);
  const inGB = forge(gibibyte, gigabyte)(gibValue);

  const litCount = Math.min(CHIPS, Math.max(0, Math.round((gibValue / RAMSTICK_MAX_GIB) * CHIPS)));

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 04 · flair"
          title="RAM stick"
          kicker="memory you can light up"
          iconZone={<MemoryStick size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Modern memory is sold in GiB; consumer drives use decimal GB. Move the slider and the
          chips boot in sequence with their status LEDs glowing. Same capacity, two unit families.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <RamStickWidget
              gibValue={gibValue}
              inBytes={inBytes}
              inGB={inGB}
              litCount={litCount}
              onGibValueChange={setGibValue}
            />
          }
          codeZone={<CodeBlock code={buildCode(gibValue, inGB, inBytes)} />}
        />
      }
    />
  );
}

interface RamStickWidgetProps {
  gibValue: number;
  inBytes: number;
  inGB: number;
  litCount: number;
  onGibValueChange: (next: number) => void;
}

function RamStickWidget({
  gibValue,
  inBytes,
  inGB,
  litCount,
  onGibValueChange,
}: RamStickWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <RamStickVisual litCount={litCount} />

      <Slider
        label={`capacity (${gibibyte.symbol})`}
        value={gibValue}
        min={1}
        max={RAMSTICK_MAX_GIB}
        step={1}
        onChange={onGibValueChange}
        suffix={gibibyte.symbol}
      />
      <Result label="same value" value={`${inGB.toFixed(3)} ${gigabyte.symbol}`} />
      <Result label="raw bytes" value={`${formatMagnitude(inBytes)} ${byte.symbol}`} />
    </div>
  );
}

// RAM stick visualizer. Named Organ: the DIMM with chips + status LEDs +
// SPD chip + edge connector is one cohesive named artifact. Sink: takes
// the lit-chip count and renders. Per-chip transitionDelay (i * STAGGER_MS)
// sequences the boot animation without any React state — chip 0 lights at
// 0 ms, chip 1 at 65 ms, ..., chip 7 at 455 ms. Going down works the same
// way; chips fade out in their own ordered delays.
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
import {
  byte, gigabyte, gibibyte,
} from 'unitforge/kits/data-storage';

const inDecimalGB = forge(gibibyte, gigabyte)(${formatMagnitude(gib)}); // ${formatMagnitude(decimalGB)}
const bytes = forge(gibibyte, byte)(${formatMagnitude(gib)}); // ${formatMagnitude(bytes)}
`;
}
