// Bench; the page's persistent "instrument". A compact unit-to-unit
// converter pinned to the top of each kit page; updates as the user moves
// its slider or rotates the unit pickers. The bench's state is owned by
// the page (so the page's themed background can react to it), so the
// component is fully controlled.
//
// The bench is the chromonym-style "live RGB strip" analogue: a single
// always-visible interaction surface that proves forge is running, plus a
// live, syntax-coloured code line that shows the exact `forge()` call
// currently executing. Other demos on the page keep their own state and
// don't read from the bench; this lets each page have one canonical
// instrument plus several escalating explorations.

import { ArrowRight } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { Dimension, Unit } from 'unitforge';
import { formatMagnitude } from '~/lib/format.js';
import { roundToStep } from '~/lib/math.js';
import { CodeLine } from '../ui/code-block.js';
import { UnitPicker } from '../ui/unit-picker.js';
import { computeBenchValues } from './compute-bench-values.js';

export interface BenchState {
  fromId: string;
  toId: string;
  value: number;
}

interface BenchProps<D extends Dimension> {
  state: BenchState;
  onChange: (next: BenchState) => void;
  options: ReadonlyArray<Unit<D, number>>;
  /** Slider bounds (in fromId units). */
  min: number;
  max: number;
  step: number;
  /** Short code-block snippet shown under the controls; receives the live values. */
  codeFor: (s: BenchState, result: number) => string;
  label?: string;
}

export function Bench<D extends Dimension>({
  state,
  onChange,
  options,
  min,
  max,
  step,
  codeFor,
  label = 'forge bench',
}: BenchProps<D>) {
  const { fromUnit, toUnit, result } = computeBenchValues({
    fromId: state.fromId,
    toId: state.toId,
    value: state.value,
    options,
  });

  // Round at the input boundary so the rendered code-snippet doesn't
  // pick up floating-point drift from the slider (e.g. 0.30000000000004).
  // Snap to the slider's own step precision so a 0.01-step unit (inch,
  // cm) keeps its hundredths instead of being flattened to tenths.
  const handleValue = (e: ChangeEvent<HTMLInputElement>) => {
    const next = roundToStep(Number(e.target.value), step);
    if (Number.isFinite(next)) onChange({ ...state, value: next });
  };

  return (
    <section className="uf-card relative rounded-lg p-4 shadow-md md:p-5" aria-label={label}>
      <div className="mb-3 flex items-center justify-between">
        <span className="uf-eyebrow text-uf-accent">{label}</span>
        <span className="uf-eyebrow">live</span>
      </div>

      <div className="grid items-end gap-3 md:grid-cols-[1fr_auto_1fr]">
        <UnitPicker
          label="from"
          value={state.fromId}
          units={options}
          onChange={(next) => onChange({ ...state, fromId: next })}
        />

        <ArrowRight
          size={20}
          strokeWidth={1.8}
          className="mb-1 hidden text-uf-accent md:block md:justify-self-center"
        />

        <UnitPicker
          label="to"
          value={state.toId}
          units={options}
          onChange={(next) => onChange({ ...state, toId: next })}
        />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={state.value}
          onChange={handleValue}
          className="flex-1 accent-uf-accent"
          aria-label={`value in ${fromUnit.label}`}
          aria-valuetext={`${formatMagnitude(state.value)} ${fromUnit.label}`}
        />
        <div className="mono whitespace-nowrap text-xl tabular-nums text-uf-accent md:text-2xl">
          {formatMagnitude(state.value)} {fromUnit.symbol}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-uf-border pt-3">
        <span className="uf-eyebrow">result</span>
        <span className="mono text-2xl tabular-nums text-uf-fg md:text-3xl">
          {formatMagnitude(result)} <span className="text-uf-muted">{toUnit.symbol}</span>
        </span>
      </div>

      <div className="mt-3">
        <CodeLine code={codeFor(state, result)} />
      </div>
    </section>
  );
}
