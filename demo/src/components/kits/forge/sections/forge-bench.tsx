// ForgeBench (slim home variant); the two-line forge instrument on the
// root page. Reads as an interactive horizontal rule between the masthead
// and the kits.
//
// Row 1: FROM unit on the left (picker + slider + live value), TO unit on
//        the right (result + picker). No chrome, no "LIVE" badge, no
//        "RESULT" label.
// Row 2: code block with the minimal imports + the live forge() call.
//
// Shares the option-lookup + forge invocation engine with <Bench> via
// computeBenchValues; the visual layouts stay distinct on purpose.

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { BenchState } from '~/components/kits/bench.js';
import { computeBenchValues } from '~/components/kits/compute-bench-values.js';
import { CodeLine } from '~/components/ui/code-block.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { cn } from '~/lib/cn.js';
import { toJsName } from '~/lib/format.js';
import { round1 } from '~/lib/math.js';
import { LENGTH_UNITS } from '../../geometry/units.js';

// Slider bounds for the home-page forge bench, in the user-selected
// from-unit (length). Local to this surface; other benches pick their own.
const HOME_BENCH_MIN = 0.1;
const HOME_BENCH_MAX = 100;
const HOME_BENCH_STEP = 0.1;

interface ForgeBenchProps {
  state: BenchState;
  onChange: (next: BenchState) => void;
}

export function ForgeBench({ state, onChange }: ForgeBenchProps) {
  const { fromId, toId, value } = state;
  const { fromUnit, toUnit, result } = computeBenchValues({
    fromId,
    toId,
    value,
    options: LENGTH_UNITS,
  });
  const [sliderActive, setSliderActive] = useState(false);

  const fromName = toJsName(fromUnit.id);
  const toName = toJsName(toUnit.id);
  const code = `import { forge } from 'unitforge';
import { ${fromName}, ${toName} } from 'unitforge/kits/geometry';

forge(${fromName}, ${toName})(${value}); // ${result.toFixed(4)}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="mono flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {/* LEFT half: FROM picker + slider + live value */}
        <div className="flex flex-1 items-center gap-3">
          <UnitPicker
            label="from unit"
            labelHidden
            value={fromId}
            units={LENGTH_UNITS}
            onChange={(next) => onChange({ ...state, fromId: next })}
          />
          <input
            type="range"
            min={HOME_BENCH_MIN}
            max={HOME_BENCH_MAX}
            step={HOME_BENCH_STEP}
            value={value}
            onChange={(e) => {
              const next = round1(Number(e.target.value));
              if (Number.isFinite(next)) onChange({ ...state, value: next });
            }}
            onPointerDown={() => setSliderActive(true)}
            onPointerUp={() => setSliderActive(false)}
            onPointerCancel={() => setSliderActive(false)}
            onBlur={() => setSliderActive(false)}
            aria-label={`value in ${fromUnit.label}`}
            aria-valuetext={`${value.toFixed(2)} ${fromUnit.label}`}
            className="h-3 flex-1 accent-uf-accent"
          />
          <span className="whitespace-nowrap text-lg tabular-nums text-uf-accent">
            {value.toFixed(2)} {fromUnit.symbol}
          </span>
        </div>

        {/* Dotted-trail pointing across to the result. The whole zone
            mutes to 50% opacity at rest and lifts to 100% when the
            user is actively dragging the slider, so the user's eye
            follows the trail toward the live output. */}
        <div
          className={cn(
            'flex flex-1 items-center gap-1 self-center transition-opacity duration-200',
            sliderActive ? 'opacity-100' : 'opacity-50',
          )}
        >
          <span className="flex-1 border-t-2 border-dotted border-uf-accent" aria-hidden />
          <ArrowRight size={18} strokeWidth={1.8} className="text-uf-accent" />
        </div>

        {/* RIGHT half: result + TO picker. Content-width on purpose so
            the dotted trail in the middle gets the room. */}
        <div className="flex items-center justify-end gap-3">
          <span className="whitespace-nowrap text-2xl tabular-nums md:text-3xl">
            {result.toFixed(4)}
            <span className="sr-only"> {toUnit.label}</span>
          </span>
          <UnitPicker
            label="to unit"
            labelHidden
            value={toId}
            units={LENGTH_UNITS}
            onChange={(next) => onChange({ ...state, toId: next })}
          />
        </div>
      </div>

      <CodeLine code={code} />
    </div>
  );
}
