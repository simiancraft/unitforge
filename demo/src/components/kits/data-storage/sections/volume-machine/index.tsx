// Volume machine. Two widgets stacked: the flagship compare widget
// (pick two anchor units; thin-instanced inner cubes fill the outer
// cube) and the original tier-scrub (decimal vs binary at every prefix,
// shell-thickness rendering). Both share the same translucent-outer
// + opaque-inner visual idiom and the same --uf-cube-{outer,inner}
// color tokens, so the readout rows double as a legend across both
// widgets.

import { Box } from 'lucide-react';
import { useState } from 'react';
import type { Unit } from 'unitforge';
import {
  exabyte,
  exbibyte,
  gibibyte,
  gigabyte,
  kibibyte,
  kilobyte,
  mebibyte,
  megabyte,
  pebibyte,
  petabyte,
  tebibyte,
  terabyte,
  yobibyte,
  yottabyte,
  zebibyte,
  zettabyte,
} from 'unitforge/kits/data-storage';
import { SectionHeader, SectionLayout, WidgetLayout } from '~/components/kits/section-layout.js';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { BabylonCubes } from './parts/babylon-cubes.js';
import { CompareWidget } from './parts/compare-widget.js';

interface Pair {
  label: string;
  decimal: Unit<'data', number>;
  binary: Unit<'data', number>;
}

const PAIRS: readonly Pair[] = [
  { label: 'kilo', decimal: kilobyte, binary: kibibyte },
  { label: 'mega', decimal: megabyte, binary: mebibyte },
  { label: 'giga', decimal: gigabyte, binary: gibibyte },
  { label: 'tera', decimal: terabyte, binary: tebibyte },
  { label: 'peta', decimal: petabyte, binary: pebibyte },
  { label: 'exa', decimal: exabyte, binary: exbibyte },
  { label: 'zetta', decimal: zettabyte, binary: zebibyte },
  { label: 'yotta', decimal: yottabyte, binary: yobibyte },
];

// Decimal-vs-binary ratio at each tier. binary/decimal = 1024^n / 1000^n.
// At kilo: 1.024; at yotta: 1.20892...
function ratioFor(pair: Pair): number {
  return pair.binary.toBase(1) / pair.decimal.toBase(1);
}

export function VolumeMachine() {
  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 04"
          title="volume machine"
          kicker="fill it or scrub it"
          iconZone={<Box size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          How many floppies fit in a Wikipedia; how many Wikipedias fit in a Library of Congress;
          how many Libraries of Congress fit in the global datasphere. Each answer is one{' '}
          <code className="mono">defineUnit</code> + <code className="mono">forge</code> away, and
          renders as thin-instanced cubes packed in a translucent shell. The decimal-vs-binary
          ladder gets the same treatment, with the shell thickness itself as the gap.
        </>
      }
      widgetZone={
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <SubHeading
              eyebrow="compare"
              hint="pack one anchor with another; every cube is a defineUnit call"
            />
            <CompareWidget />
          </div>
          <div className="flex flex-col gap-2">
            <SubHeading
              eyebrow="scrub"
              hint="the decimal-vs-binary gap as a shell, every prefix on the ladder"
            />
            <TierScrubBody />
          </div>
        </div>
      }
    />
  );
}

function SubHeading({ eyebrow, hint }: { eyebrow: string; hint: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-uf-border/60 pb-1">
      <span className="uf-eyebrow text-uf-accent">{eyebrow}</span>
      <span className="text-xs text-uf-muted">{hint}</span>
    </div>
  );
}

function TierScrubBody() {
  const [tierIndex, setTierIndex] = useState(2);
  const safeIndex = Math.max(0, Math.min(PAIRS.length - 1, Math.round(tierIndex)));
  const pair: Pair = PAIRS[safeIndex] ??
    PAIRS[0] ?? { label: 'kilo', decimal: kilobyte, binary: kibibyte };
  const ratio = ratioFor(pair);
  const edgeRatio = Math.cbrt(ratio);
  const percentBigger = (ratio - 1) * 100;
  return (
    <WidgetLayout
      interactionZone={
        <div className="flex flex-col gap-4">
          <BabylonCubes binaryEdgeRatio={edgeRatio} />
          <Slider
            label={`tier · ${pair.label} (${pair.decimal.symbol} vs ${pair.binary.symbol})`}
            value={tierIndex}
            min={0}
            max={PAIRS.length - 1}
            step={1}
            onChange={(v) => setTierIndex(Math.round(v))}
          />
          <div className="flex flex-col gap-2">
            <Result
              label={`${pair.binary.symbol} / ${pair.decimal.symbol} ratio`}
              value={`${ratio.toFixed(4)} (${percentBigger.toFixed(2)}% bigger)`}
              variant="hero"
            />
            <Result
              label={`1 ${pair.decimal.symbol} in bytes (inner cube)`}
              value={pair.decimal.toBase(1).toExponential(3)}
              bulletColor="var(--uf-cube-inner)"
            />
            <Result
              label={`1 ${pair.binary.symbol} in bytes (outer shell)`}
              value={pair.binary.toBase(1).toExponential(3)}
              bulletColor="var(--uf-cube-outer)"
            />
            <Result
              label="byte gap"
              value={`${(pair.binary.toBase(1) - pair.decimal.toBase(1)).toExponential(3)}`}
            />
            <Result
              label="outer-cube edge"
              value={`${edgeRatio.toFixed(4)}× the inner cube`}
              bulletColor="var(--uf-cube-outer)"
            />
          </div>
        </div>
      }
      codeZone={<CodeBlock code={buildCode(pair, ratio)} />}
    />
  );
}

function buildCode(pair: Pair, ratio: number): string {
  return `import { forge } from 'unitforge';
import { ${pair.decimal.id.replace(/-/g, '')}, ${pair.binary.id.replace(/-/g, '')}, byte } from 'unitforge/kits/data-storage';

// At the ${pair.label} tier the binary unit is ${((ratio - 1) * 100).toFixed(2)}% larger.
forge(${pair.decimal.id.replace(/-/g, '')}, byte)(1); // ${pair.decimal.toBase(1).toExponential(3)}
forge(${pair.binary.id.replace(/-/g, '')}, byte)(1);  // ${pair.binary.toBase(1).toExponential(3)}

// Volume ratio in 3D space: binary cube edge is the cube root of the
// byte-count ratio relative to the decimal cube.
const edgeRatio = Math.cbrt(${ratio.toFixed(6)}); // ${Math.cbrt(ratio).toFixed(4)}
`;
}
