// Hubble machine. Turn the Hubble constant into the Hubble time. H0 is
// conventionally quoted in km/s/Mpc; its reciprocal is the Hubble time,
// the first-order estimate of the age of the universe (the true age
// only lands near it because the expansion history roughly cancels).
// The only conversion that matters is Mpc → km, which is a real forge
// call; the rest is the reciprocal and a unit-cancelling divide.
//
//   t_H = 1 / H0 = (1 Mpc in km) / H0  seconds
//
// We also show the recession velocity at 1 Gpc (v = H0 · d), which at
// H0 = 70 is ~0.23c, to make the expansion rate tangible.

import { Sparkle } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { megaparsec } from 'unitforge/kits/astronomy';
import { kilometer } from 'unitforge/kits/length';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { formatMagnitude } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';

// 1 Mpc in km, via a real forge call (evaluated once at module load).
const MPC_KM = forge(megaparsec, kilometer)(1);
// Seconds in a Julian gigayear (365.25 d), the IAU year convention the
// kit's light-year uses, so the age reads consistently with the kit.
const SECONDS_PER_GYR = 365.25 * 86400 * 1e9;
// Speed of light, km/s (exact, BIPM).
const C_KMS = 299792.458;

/** Hubble time in gigayears for a given H0 (km/s/Mpc). t_H = 1/H0;
 *  with H0 in km/s/Mpc, 1/H0 = (Mpc in km)/H0 seconds. */
function hubbleTimeGyr(h0: number): number {
  return MPC_KM / h0 / SECONDS_PER_GYR;
}

export function HubbleMachine() {
  const [h0, setH0] = useState(70);
  const ageGyr = hubbleTimeGyr(h0);
  // Recession velocity at 1 Gpc (= 1000 Mpc): v = H0 · d.
  const vAt1Gpc = h0 * 1000;
  const fractionC = vAt1Gpc / C_KMS;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 04"
          title="the Hubble machine"
          kicker="a constant becomes the age of the universe, almost"
          iconZone={<Sparkle size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Flip one expansion-rate number upside down and you get the age of the universe, almost.
          The Hubble constant H0 is quoted in km/s/Mpc; its reciprocal is the Hubble time, the
          first-order estimate of cosmic age. The only unit work is Mpc to km, a real forge call;
          the rest cancels. Nudge H0 (measurements cluster near 67 to 73) and watch the age move.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <HubbleWidget
              h0={h0}
              ageGyr={ageGyr}
              vAt1Gpc={vAt1Gpc}
              fractionC={fractionC}
              onH0Change={setH0}
            />
          }
          codeZone={<CodeBlock code={buildCode(h0, ageGyr)} />}
        />
      }
    />
  );
}

interface HubbleWidgetProps {
  h0: number;
  ageGyr: number;
  vAt1Gpc: number;
  fractionC: number;
  onH0Change: (next: number) => void;
}

function HubbleWidget({ h0, ageGyr, vAt1Gpc, fractionC, onH0Change }: HubbleWidgetProps) {
  return (
    <div className="flex flex-col gap-5">
      <Slider
        label="Hubble constant H0"
        value={h0}
        min={50}
        max={80}
        step={0.5}
        onChange={onH0Change}
        suffix="km/s/Mpc"
      />

      <Result
        label={`H0 = ${formatMagnitude(h0)} km/s/Mpc`}
        value={`Hubble time ≈ ${formatMagnitude(ageGyr)} billion years`}
        variant="hero"
        valueClassName="text-base"
      />

      <div className="flex flex-col gap-1.5 rounded-md border border-uf-border bg-uf-card p-4">
        <span className="uf-eyebrow">recession velocity at 1 Gpc</span>
        <div className="flex items-baseline justify-between">
          <span className="mono text-xs uppercase tracking-wider text-uf-muted">v = H0 · d</span>
          <span className="mono leading-tight">
            <span className="text-lg text-uf-fg tabular-nums">{formatMagnitude(vAt1Gpc)}</span>
            <span className="ml-1 text-xs text-uf-muted">km/s</span>
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="mono text-xs uppercase tracking-wider text-uf-muted">fraction of c</span>
          <span className="mono text-lg text-uf-accent tabular-nums">
            {formatMagnitude(fractionC)} c
          </span>
        </div>
      </div>
    </div>
  );
}

function buildCode(h0: number, ageGyr: number): string {
  return `import { forge } from 'unitforge';
import { megaparsec } from 'unitforge/kits/astronomy';
import { kilometer } from 'unitforge/kits/length';

const MPC_KM = forge(megaparsec, kilometer)(1); // 3.0857e19 km
const H0 = ${formatMagnitude(h0)}; // km/s/Mpc

// t_H = 1/H0 = (Mpc in km) / H0 seconds
const ageSeconds = MPC_KM / H0;
const ageGyr = ageSeconds / (365.25 * 86400 * 1e9);
// → ${formatMagnitude(ageGyr)} billion years
`;
}
