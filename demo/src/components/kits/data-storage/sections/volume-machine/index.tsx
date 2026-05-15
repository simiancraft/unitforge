// Volume machine. Standalone surface (no menu): a tier slider scrubs
// through 8 decimal:binary unit pairs (kilo through yotta). The Babylon
// scene shows the decimal cube (opaque) nested inside the binary cube
// (translucent shell); the shell's thickness IS the gap, growing from
// a sliver at kilo to a visible layer at yotta. Color-coded Result rows
// match the cube colors so the readout doubles as a legend.

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
  const [tierIndex, setTierIndex] = useState(2); // default: giga
  // Clamp the index; the slider's min/max are wired to PAIRS bounds, so
  // the OR-fallback is dead code in practice but satisfies TypeScript's
  // noUncheckedIndexedAccess without a non-null assertion.
  const safeIndex = Math.max(0, Math.min(PAIRS.length - 1, Math.round(tierIndex)));
  const pair: Pair = PAIRS[safeIndex] ??
    PAIRS[0] ?? { label: 'kilo', decimal: kilobyte, binary: kibibyte };
  const ratio = ratioFor(pair);
  // Edge-length ratio for the binary cube is the cube root of the
  // byte-count ratio; volume scales as edge^3.
  const edgeRatio = Math.cbrt(ratio);
  const percentBigger = (ratio - 1) * 100;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 04"
          title="volume machine"
          kicker="see the gap grow"
          iconZone={<Box size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          The decimal-vs-binary gap is also literal volumetric difference. The decimal cube sits
          opaque at the center; the binary cube wraps it as a translucent shell. The shell's
          thickness is the gap. Scrub the tier slider from kilo to yotta and watch a 2.4% ratio
          grow into 20.9% as the shell thickens. Drag the canvas to orbit; the camera auto-rotates
          after a moment of idle.
        </>
      }
      widgetZone={
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
      }
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
