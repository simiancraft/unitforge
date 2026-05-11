// Drive-marketing vs OS-reporting visualizer. Two stylized "panels": the
// disk-vendor product label on top (decimal GB, big sticker), and a
// pretend Windows-Explorer / Properties panel on bottom (binary GiB,
// chrome dialog vibe). The striped gap between the marketed-bar and the
// reported-bar gets a labelled callout so the pedagogy is obvious.

import { useState } from 'react';
import { HardDrive } from 'lucide-react';
import { byte, gibibyte, gigabyte } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/CodeBlock.js';
import { convert } from '~/lib/convert.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { SectionHeader, SectionLayout } from '../../section-layout.js';

const VIEW_W = 520;
const BAR_H = 30;
const PADDING = 16;
const MAX_GB = 8000;

const CODE = `import { forge } from 'unitforge';
import { gigabyte, gibibyte } from 'unitforge/kits/data-storage';

const marketedToReported = forge(gigabyte, gibibyte);

// A "1 TB" drive shows up as ~931 GiB.
marketedToReported(1000); // 931.32...
`;

export function DriveVsOs() {
  const [marketedGB, setMarketedGB] = useState(1000);

  const bytes = convert(gigabyte, byte, marketedGB);
  const inGiB = convert(byte, gibibyte, bytes);
  const inTB = marketedGB / 1000;
  const lossFraction = 1 - inGiB / marketedGB;
  const fullW = VIEW_W - PADDING * 2;
  const reportedW = fullW * (1 - lossFraction);
  const gapStartX = PADDING + reportedW;
  const gapW = fullW - reportedW;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="drive vs OS"
          kicker="why 1 TB shows up as 931 GiB"
          iconZone={<HardDrive size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Drive vendors market capacity in decimal gigabytes; operating
          systems traditionally report in binary gibibytes. Slide the
          marketed capacity and watch the "missing" space appear; it
          isn't missing, it's the unit conversion.
        </>
      }
      widgetZone={
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

          {/* Top: drive-vendor "product label" sticker */}
          <div
            className="relative rounded-md p-3"
            style={{
              background: 'linear-gradient(180deg, var(--uf-card) 0%, rgba(0,0,0,0.4) 100%)',
              border: '1px solid var(--uf-trace)',
              boxShadow: '0 2px 0 rgba(0,0,0,0.3) inset',
            }}
          >
            <div className="mono text-[10px] uppercase tracking-[0.3em] text-uf-trace">
              drive label
            </div>
            <div className="flex items-baseline gap-2">
              <span className="mono text-4xl font-bold text-uf-fg">
                {inTB >= 1 ? inTB.toFixed(inTB < 10 ? 1 : 0) : (marketedGB / 1).toFixed(0)}
              </span>
              <span className="mono text-2xl text-uf-accent">
                {inTB >= 1 ? 'TB' : 'GB'}
              </span>
              <span className="mono ml-auto text-xs text-uf-muted">
                {marketedGB.toFixed(0)} GB · 1 GB = 1,000,000,000 bytes
              </span>
            </div>
          </div>

          {/* Bottom: Windows Properties-dialog vibe */}
          <div
            className="rounded-md"
            style={{
              background: 'var(--uf-card)',
              border: '1px solid var(--uf-border)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset',
            }}
          >
            <div
              className="flex items-center justify-between px-3 py-1.5 text-[11px]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)',
                borderBottom: '1px solid var(--uf-border)',
              }}
            >
              <span className="mono uppercase tracking-wider text-uf-muted">
                local disk (c:) · properties
              </span>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: '#ffd166' }} />
                <span className="h-2 w-2 rounded-full" style={{ background: '#ef476f' }} />
              </div>
            </div>

            <div className="px-4 py-3">
              <svg
                viewBox={`0 0 ${VIEW_W} ${BAR_H * 2 + 70}`}
                xmlns="http://www.w3.org/2000/svg"
                className="block w-full"
              >
                <defs>
                  <pattern
                    id="uf-stripes"
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="3" height="6" fill="var(--uf-accent)" opacity="0.6" />
                  </pattern>
                </defs>

                <text x={PADDING} y={12} className="mono" fill="var(--uf-muted)" fontSize="10">
                  MARKETED · {marketedGB.toFixed(0)} GB (decimal · 10^9)
                </text>
                <rect
                  x={PADDING}
                  y={18}
                  width={fullW}
                  height={BAR_H}
                  fill="var(--uf-bg)"
                  stroke="var(--uf-border)"
                />
                <rect x={PADDING} y={18} width={fullW} height={BAR_H} fill="var(--uf-accent)" opacity="0.78" />

                <text
                  x={PADDING}
                  y={18 + BAR_H + 14}
                  className="mono"
                  fill="var(--uf-muted)"
                  fontSize="10"
                >
                  OS REPORTS · {inGiB.toFixed(1)} GiB (binary · 2^30)
                </text>
                <rect
                  x={PADDING}
                  y={18 + BAR_H + 20}
                  width={fullW}
                  height={BAR_H}
                  fill="var(--uf-bg)"
                  stroke="var(--uf-border)"
                />
                <rect
                  x={PADDING}
                  y={18 + BAR_H + 20}
                  width={reportedW}
                  height={BAR_H}
                  fill="var(--uf-accent)"
                  opacity="0.78"
                  style={{ transition: 'width 220ms cubic-bezier(0.22,1,0.36,1)' }}
                />
                <rect
                  x={gapStartX}
                  y={18 + BAR_H + 20}
                  width={gapW}
                  height={BAR_H}
                  fill="url(#uf-stripes)"
                  style={{ transition: 'x 220ms cubic-bezier(0.22,1,0.36,1), width 220ms cubic-bezier(0.22,1,0.36,1)' }}
                />

                <line
                  x1={gapStartX + gapW / 2}
                  y1={18 + BAR_H + 20 + BAR_H + 4}
                  x2={gapStartX + gapW / 2}
                  y2={18 + BAR_H + 20 + BAR_H + 18}
                  stroke="var(--uf-accent)"
                  strokeWidth="1.2"
                />
                <text
                  x={gapStartX + gapW / 2}
                  y={18 + BAR_H + 20 + BAR_H + 30}
                  textAnchor="middle"
                  className="mono"
                  fill="var(--uf-accent)"
                  fontSize="10"
                >
                  ← same drive, same bytes, different unit
                </text>
              </svg>
            </div>
          </div>

          <Result
            label="apparent gap"
            value={`${(marketedGB - inGiB).toFixed(2)} (≈ ${(lossFraction * 100).toFixed(2)}%)`}
            variant="hero"
          />
        </div>
      }
      codeZone={<CodeBlock code={CODE} />}
    />
  );
}
