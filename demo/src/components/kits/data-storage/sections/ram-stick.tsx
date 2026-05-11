// RAM-module visualizer. Memory chips boot in sequence with a stagger as
// capacity scales; each chip's status LED breathes when active. Slide the
// capacity and you watch the DIMM "post". The same forged value renders
// in the decimal-GB family alongside.

import { useEffect, useState } from 'react';
import { MemoryStick } from 'lucide-react';
import { byte, gibibyte, gigabyte } from 'unitforge/kits/data-storage';
import { forge } from 'unitforge';
import { CodeBlock } from '~/components/CodeBlock.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { SectionHeader, SectionLayout } from '../../section-layout.js';

const CHIPS = 8;
const VIEW_W = 460;
const VIEW_H = 140;
const STAGGER_MS = 65;

const CODE = `import { forge } from 'unitforge';
import {
  byte, gigabyte, gibibyte,
} from 'unitforge/kits/data-storage';

const inDecimalGB = forge(gibibyte, gigabyte)(16); // 17.18
const bytes = forge(gibibyte, byte)(16);
`;

export function RamStick() {
  const [gibValue, setGibValue] = useState(16);

  const inBytes = forge(gibibyte, byte)(gibValue);
  const inGB = forge(gibibyte, gigabyte)(gibValue);

  const max = 64;
  const targetLit = Math.min(CHIPS, Math.max(0, Math.round((gibValue / max) * CHIPS)));

  const [litCount, setLitCount] = useState(targetLit);
  useEffect(() => {
    if (litCount === targetLit) return;
    const step = litCount < targetLit ? 1 : -1;
    const t = window.setTimeout(() => setLitCount(litCount + step), STAGGER_MS);
    return () => window.clearTimeout(t);
  }, [litCount, targetLit]);

  const chipW = (VIEW_W - 100) / CHIPS - 8;
  const chipH = 52;
  const chipY = 40;

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
          Modern memory is sold in GiB; consumer drives use decimal GB.
          Move the slider and the chips boot in sequence with their
          status LEDs glowing. Same capacity, two unit families.
        </>
      }
      widgetZone={
        <div className="flex flex-col gap-4">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            xmlns="http://www.w3.org/2000/svg"
            className="block w-full"
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
              y={chipY + 14}
              width={18}
              height={22}
              rx={2}
              fill="var(--uf-bg)"
              stroke="var(--uf-trace)"
              strokeOpacity="0.7"
            />
            <text
              x={29}
              y={chipY + 28}
              textAnchor="middle"
              className="mono"
              fontSize="6"
              fill="var(--uf-muted)"
            >
              SPD
            </text>

            {Array.from({ length: CHIPS }).map((_, i) => {
              const isLit = i < litCount;
              return (
                <g key={i}>
                  <rect
                    x={48 + i * (chipW + 8)}
                    y={chipY}
                    width={chipW}
                    height={chipH}
                    rx={2.5}
                    fill={isLit ? 'var(--uf-accent)' : 'var(--uf-bg)'}
                    fillOpacity={isLit ? 0.82 : 0.55}
                    stroke="var(--uf-trace)"
                    strokeOpacity="0.7"
                    style={{
                      transition:
                        'fill 220ms ease, fill-opacity 220ms ease',
                    }}
                  />
                  <line
                    x1={48 + i * (chipW + 8) + 3}
                    y1={chipY + chipH - 3}
                    x2={48 + i * (chipW + 8) + chipW - 3}
                    y2={chipY + chipH - 3}
                    stroke="var(--uf-trace)"
                    strokeOpacity="0.55"
                    strokeWidth="0.6"
                  />
                  <circle
                    cx={48 + i * (chipW + 8) + chipW - 6}
                    cy={chipY + 6}
                    r={2.2}
                    fill={isLit ? 'var(--uf-fg)' : 'var(--uf-muted)'}
                    opacity={isLit ? 1 : 0.35}
                    className={isLit ? 'uf-led-active' : undefined}
                  />
                </g>
              );
            })}

            {Array.from({ length: 26 }).map((_, i) => (
              <rect
                key={i}
                x={28 + i * ((VIEW_W - 76) / 26)}
                y={108}
                width={(VIEW_W - 76) / 26 - 1.8}
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
              fill={litCount === targetLit ? 'var(--uf-accent)' : 'var(--uf-muted)'}
            >
              {litCount === targetLit ? `POST · ${litCount * (max / CHIPS)} GiB OK` : 'POST · …'}
            </text>
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
      }
      codeZone={<CodeBlock code={CODE} />}
    />
  );
}
