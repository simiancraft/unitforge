// IEEE 802.3df / 802.3dj rate frontier. Pick a spec rate (200G / 400G /
// 800G / 1.6T) and a drain target (100 GB SSD through 1 EB cluster) and
// read the bandwidth and time-to-drain. Same forge composition through
// the bit↔byte conversion at every rate; the IEEE picked numbers that
// round cleanly so each (rate, target) pair lands on exact GB/s. The
// secondary GiB/s figure surfaces the decimal-vs-binary tax that kicks
// back in once you cross the bit-to-byte boundary.

import { Zap } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { byte, gibibyte, gigabit, gigabyte } from 'unitforge/kits/data-storage';
import { ChipRow } from '~/components/kits/chip-row.js';
import { ControlPanel } from '~/components/kits/data-storage/control-panel.js';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';

type RateId = '200g' | '400g' | '800g' | '1600g';
type TargetId = 'ssd' | 'drive' | 'rack' | 'archive' | 'cluster';

interface RateSpec {
  id: RateId;
  short: string;
  long: string;
  gbits: number;
  clause: string;
  year: string;
  lanes: string;
}

const RATES: readonly RateSpec[] = [
  {
    id: '200g',
    short: '200G',
    long: '200 GbE',
    gbits: 200,
    clause: '802.3df',
    year: '2024',
    lanes: '4 × 50G PAM4',
  },
  {
    id: '400g',
    short: '400G',
    long: '400 GbE',
    gbits: 400,
    clause: '802.3df',
    year: '2024',
    lanes: '4 × 100G PAM4',
  },
  {
    id: '800g',
    short: '800G',
    long: '800 GbE',
    gbits: 800,
    clause: '802.3df',
    year: '2024',
    lanes: '4 × 200G PAM4',
  },
  {
    id: '1600g',
    short: '1.6T',
    long: '1.6 TbE',
    gbits: 1600,
    clause: '802.3dj',
    year: '2026 (expected)',
    lanes: '8 × 200G PAM4',
  },
];

interface DrainTarget {
  id: TargetId;
  short: string;
  long: string;
  bytes: number;
}

const TARGETS: readonly DrainTarget[] = [
  { id: 'ssd', short: '100 GB SSD', long: '100 GB SSD', bytes: 100e9 },
  { id: 'drive', short: '1 TB drive', long: '1 TB drive', bytes: 1e12 },
  { id: 'rack', short: '100 TB rack', long: '100 TB datacenter rack', bytes: 100e12 },
  { id: 'archive', short: '1 PB archive', long: '1 PB archive', bytes: 1e15 },
  { id: 'cluster', short: '1 EB cluster', long: '1 EB compute cluster', bytes: 1e18 },
];

const DEFAULT_RATE: RateId = '800g';
const DEFAULT_TARGET: TargetId = 'ssd';

const RATE_OPTIONS = RATES.map((r) => ({ id: r.id, short: r.short }));
const TARGET_OPTIONS = TARGETS.map((t) => ({ id: t.id, short: t.short }));

function findRate(id: RateId): RateSpec {
  const found = RATES.find((r) => r.id === id);
  if (!found) throw new Error(`unknown IEEE rate: ${id}`);
  return found;
}

function findTarget(id: TargetId): DrainTarget {
  const found = TARGETS.find((t) => t.id === id);
  if (!found) throw new Error(`unknown drain target: ${id}`);
  return found;
}

export function useFrontier() {
  const [rateId, setRateId] = useState<RateId>(DEFAULT_RATE);
  const [targetId, setTargetId] = useState<TargetId>(DEFAULT_TARGET);

  const rate = findRate(rateId);
  const target = findTarget(targetId);

  const gbPerSec = forge(gigabit, gigabyte)(rate.gbits);
  const gibPerSec = forge(gigabit, gibibyte)(rate.gbits);
  const bytesPerSec = forge(gigabit, byte)(rate.gbits);
  const drainSeconds = target.bytes / bytesPerSec;

  return {
    menuZone: <FrontierIcon />,
    interactivityZone: (
      <ControlPanel
        pickersZone={
          <>
            <ChipRow
              label="IEEE rate"
              ariaLabel="ieee 802.3 rate"
              value={rateId}
              options={RATE_OPTIONS}
              onChange={(v) => setRateId(v as RateId)}
            />
            <ChipRow
              label="drain target"
              ariaLabel="drain target"
              value={targetId}
              options={TARGET_OPTIONS}
              onChange={(v) => setTargetId(v as TargetId)}
            />
          </>
        }
        visualZone={<FrontierVisual rate={rate} />}
        resultsZone={
          <>
            <Result
              label={`${rate.long} bandwidth`}
              value={`${formatBandwidth(gbPerSec)} · ${gibPerSec.toFixed(2)} GiB/s`}
              variant="hero"
            />
            <Result label="line rate" value={`${rate.gbits} Gbit/s · ${rate.lanes}`} />
            <Result label={`time to drain ${target.long}`} value={formatDuration(drainSeconds)} />
            <Result
              label="bit-to-byte forge"
              value={`forge(gigabit, gigabyte)(${rate.gbits}) = ${gbPerSec} (exact)`}
            />
            <Result
              label="binary tax"
              value={`${gbPerSec} GB/s = ${gibPerSec.toFixed(3)} GiB/s (${(((gbPerSec - gibPerSec) / gbPerSec) * 100).toFixed(2)}% drift)`}
            />
          </>
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(rate, target, drainSeconds)} />,
  };
}

function FrontierIcon() {
  return <Zap size={22} strokeWidth={1.6} />;
}

function FrontierVisual({ rate }: { rate: RateSpec }) {
  return (
    <div
      className="rounded-md border border-uf-accent/40 p-4"
      style={{
        background: 'linear-gradient(180deg, var(--uf-card) 0%, rgba(0,0,0,0.4) 100%)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset',
      }}
    >
      <div className="mono text-[10px] uppercase tracking-[0.3em] text-uf-trace">
        ieee {rate.clause} · {rate.year}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="mono text-5xl font-bold text-uf-accent">{rate.short}</span>
        <span className="mono text-2xl text-uf-fg">Ethernet</span>
        <span className="mono ml-auto text-xs text-uf-muted">{rate.lanes}</span>
      </div>
      <div className="mt-3 mono text-[11px] leading-relaxed text-uf-muted">
        <code className="rounded bg-uf-code-bg px-1 py-[1px] text-uf-fg">
          forge(gigabit, gigabyte)({rate.gbits})
        </code>{' '}
        = <span className="text-uf-accent">{forge(gigabit, gigabyte)(rate.gbits)}</span> exactly.
      </div>
    </div>
  );
}

function formatBandwidth(gbPerSec: number): string {
  if (gbPerSec >= 1000) return `${(gbPerSec / 1000).toFixed(2)} TB/s`;
  return `${gbPerSec.toFixed(0)} GB/s`;
}

function formatDuration(seconds: number): string {
  if (seconds < 0.001) return `${(seconds * 1e6).toFixed(0)} µs`;
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} ms`;
  if (seconds < 60) return `${seconds.toFixed(2)} s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(2)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} h`;
  if (seconds < 86400 * 365.25) return `${(seconds / 86400).toFixed(1)} days`;
  return `${(seconds / (86400 * 365.25)).toFixed(2)} years`;
}

function buildCode(rate: RateSpec, target: DrainTarget, drainSeconds: number): string {
  return `import { forge } from 'unitforge';
import { gigabit, gigabyte, gibibyte, byte } from 'unitforge/kits/data-storage';

// IEEE ${rate.clause} (${rate.year}): ${rate.long}, ${rate.lanes}.
forge(gigabit, gigabyte)(${rate.gbits});  // ${forge(gigabit, gigabyte)(rate.gbits)} GB/s (exact)
forge(gigabit, gibibyte)(${rate.gbits});  // ${forge(gigabit, gibibyte)(rate.gbits).toFixed(3)} GiB/s (binary tax)

// Time to drain ${target.long} at line rate:
const bytesPerSec = forge(gigabit, byte)(${rate.gbits});
const seconds = ${target.bytes} / bytesPerSec; // ${drainSeconds.toExponential(3)} s ≈ ${formatDuration(drainSeconds)}
`;
}
