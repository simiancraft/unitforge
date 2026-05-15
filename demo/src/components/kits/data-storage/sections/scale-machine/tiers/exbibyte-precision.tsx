// Exbibyte-precision tier. At 2^60 bytes the Float64 ULP (unit in last
// place) exceeds 1, so byte-resolution arithmetic stops working: adding
// 1 byte to 1 EiB and 1 EiB are the same Float64 value. This isn't a
// unitforge defect; it's Float64 itself. The tier surfaces the cliff
// as a runtime assertion so the user can see it land true.

import { Sigma } from 'lucide-react';
import { forge } from 'unitforge';
import { byte, exbibyte, yobibyte, yottabyte } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { ControlPanel } from '../parts/control-panel.js';

export function useExbibytePrecision() {
  const eibInBytes = forge(exbibyte, byte)(1);
  const eibPlusOne = eibInBytes + 1;
  const vanishes = eibPlusOne === eibInBytes;

  // The decimal-vs-binary ratio at the top of the unit ladder. YiB / YB
  // is the most dramatic spread: ~20.9% bigger.
  const ybInBytes = forge(yottabyte, byte)(1);
  const yibInBytes = forge(yobibyte, byte)(1);
  const yibToYbRatio = yibInBytes / ybInBytes;

  return {
    menuZone: <PrecisionIcon />,
    interactivityZone: (
      <ControlPanel
        visualZone={<PrecisionVisual eibBytes={eibInBytes} vanishes={vanishes} />}
        resultsZone={
          <>
            <Result
              label="1 EiB in bytes"
              value={`${eibInBytes.toExponential(3)}`}
              variant="hero"
            />
            <Result label="1 EiB + 1 byte" value={`${eibPlusOne.toExponential(3)}`} />
            <Result
              label="does the +1 vanish?"
              value={vanishes ? 'yes (Float64 ULP exceeds 1 here)' : 'no; surprising'}
            />
            <Result
              label="YiB / YB ratio (top of ladder)"
              value={`${yibToYbRatio.toFixed(4)} (${((yibToYbRatio - 1) * 100).toFixed(1)}% bigger)`}
            />
          </>
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode()} />,
  };
}

function PrecisionIcon() {
  return <Sigma size={22} strokeWidth={1.6} />;
}

interface PrecisionVisualProps {
  eibBytes: number;
  vanishes: boolean;
}

// Pure-static visual: a number line showing the Float64 representable
// values near 2^60. The arrow at "1 EiB + 1" lands ON "1 EiB" because
// the gap between adjacent Float64 values at this magnitude is > 1.
function PrecisionVisual({ eibBytes, vanishes }: PrecisionVisualProps) {
  return (
    <div className="rounded-md border border-uf-border bg-uf-card p-4">
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-uf-muted">
        float64 number line near 2⁶⁰
      </div>
      <div className="mt-3 flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-uf-accent" aria-hidden="true" />
          <span className="mono text-uf-fg">1 EiB</span>
          <span className="mono ml-auto text-uf-muted">{eibBytes.toExponential(6)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-uf-accent" aria-hidden="true" />
          <span className="mono text-uf-fg">1 EiB + 1 byte</span>
          <span className="mono ml-auto text-uf-muted">{(eibBytes + 1).toExponential(6)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-uf-accent" aria-hidden="true" />
          <span className="mono text-uf-fg">1 EiB + 256</span>
          <span className="mono ml-auto text-uf-muted">{(eibBytes + 256).toExponential(6)}</span>
        </div>
      </div>
      <div className="mt-3 mono text-[11px] leading-relaxed text-uf-fg">
        {vanishes
          ? '1 EiB + 1 === 1 EiB; the +1 falls below the Float64 ULP for this magnitude.'
          : 'unexpected; Float64 ULP behaved differently this run.'}
        <br />
        <span className="text-uf-muted">
          Limitation lives in Float64, not unitforge; the library does not silently switch to
          BigInt.
        </span>
      </div>
    </div>
  );
}

function buildCode(): string {
  return `import { forge } from 'unitforge';
import { byte, exbibyte, yobibyte, yottabyte } from 'unitforge/kits/data-storage';

// At 2^60 bytes the gap between adjacent Float64 values exceeds 1,
// so byte-resolution arithmetic loses meaning.
const eib = forge(exbibyte, byte)(1);
eib + 1 === eib;  // true; the +1 vanishes

// At the top of the ladder the binary-vs-decimal ratio reaches ~21%.
forge(yottabyte, byte)(1);  // 1.0e+24
forge(yobibyte, byte)(1);   // 1.20893e+24
`;
}
