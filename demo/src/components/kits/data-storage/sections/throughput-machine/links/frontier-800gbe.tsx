// Frontier 800 GbE link of the throughput machine. 800 Gigabit Ethernet
// is a deployed datacenter rate as of 2026; the canonical conversion
// forge(gigabit, gigabyte)(800) === 100 reads as "an 800 GbE port can
// drain a 100 GB SSD in one second." This link demonstrates the bit-to-
// byte conversion at the actual modern frontier and exercises terabit
// and petabit for context on the bit ladder.

import { Zap } from 'lucide-react';
import { forge } from 'unitforge';
import { byte, gigabit, gigabyte, megabyte, petabit, terabit } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { ControlPanel } from '../parts/control-panel.js';

// Fixed link rate: 800 Gbit/s. This entry is not interactive; the rate
// is the story.
const GBITS = 800;
const TARGET_GB = 100;

export function useFrontier800GbE() {
  const mbPerSec = forge(gigabit, megabyte)(GBITS);
  const gbPerSec = forge(gigabit, gigabyte)(GBITS);
  const bytesPerSec = forge(gigabit, byte)(GBITS);
  const targetBytes = forge(gigabyte, byte)(TARGET_GB);
  const seconds = targetBytes / bytesPerSec;

  // Context: where 800 Gbit/s sits relative to the larger bit ladder.
  const inTbit = forge(gigabit, terabit)(GBITS);
  const inPbit = forge(gigabit, petabit)(GBITS);

  return {
    menuZone: <FrontierIcon />,
    interactivityZone: (
      <ControlPanel
        visualZone={<FrontierVisual />}
        resultsZone={
          <>
            <Result
              label="800 GbE bandwidth"
              value={`${gbPerSec.toFixed(0)} GB/s · ${mbPerSec.toFixed(0)} MB/s`}
              variant="hero"
            />
            <Result label="time to drain a 100 GB SSD" value={`${seconds.toFixed(2)} seconds`} />
            <Result
              label="bit ladder context"
              value={`${inTbit.toFixed(2)} Tbit · ${inPbit.toFixed(4)} Pbit`}
            />
          </>
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode()} />,
  };
}

function FrontierIcon() {
  return <Zap size={22} strokeWidth={1.6} />;
}

// Static visual: a stylized fiber-optic link badge with 800 GbE label.
function FrontierVisual() {
  return (
    <div
      className="rounded-md border border-uf-accent/40 p-4"
      style={{
        background: 'linear-gradient(180deg, var(--uf-card) 0%, rgba(0,0,0,0.4) 100%)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset',
      }}
    >
      <div className="mono text-[10px] uppercase tracking-[0.3em] text-uf-trace">
        ieee 802.3df / 802.3dj
      </div>
      <div className="flex items-baseline gap-3">
        <span className="mono text-5xl font-bold text-uf-accent">800</span>
        <span className="mono text-2xl text-uf-fg">GbE</span>
        <span className="mono ml-auto text-xs text-uf-muted">
          per-lane 200 Gb/s · 4 lanes · QSFP-DD800
        </span>
      </div>
      <div className="mt-3 mono text-[11px] leading-relaxed text-uf-muted">
        <code className="rounded bg-uf-code-bg px-1 py-[1px] text-uf-fg">
          forge(gigabit, gigabyte)(800)
        </code>{' '}
        = <span className="text-uf-accent">100</span> exactly; a single 800 GbE port can drain a 100
        GB SSD in one second.
      </div>
    </div>
  );
}

function buildCode(): string {
  return `import { forge } from 'unitforge';
import { gigabit, gigabyte, megabyte, terabit } from 'unitforge/kits/data-storage';

// 800 Gigabit Ethernet line rate, exact:
forge(gigabit, gigabyte)(800);  // 100 GB/s (decimal)
forge(gigabit, megabyte)(800);  // 100,000 MB/s

// Context on the bit ladder:
forge(gigabit, terabit)(800);   // 0.8 Tbit/s
`;
}
