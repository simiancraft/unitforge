// Bench — the page's persistent "instrument". A compact unit-to-unit
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

import type { Dimension, ForgeInput, Unit } from 'unitforge';
import { forge } from 'unitforge';
import { type ChangeEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { CodeLine } from '../CodeBlock.js';

export interface BenchState<D extends Dimension = Dimension, K extends string = string> {
  fromKey: K;
  toKey: K;
  value: number;
  // Phantom tag: keeps `BenchState<'length'>` and `BenchState<'data'>`
  // structurally distinct so a kit's setBench can't accept the wrong
  // dimension's state.
  readonly __dimension?: D;
}

interface BenchProps<D extends Dimension, K extends string> {
  state: BenchState<D, K>;
  onChange: (next: BenchState<D, K>) => void;
  options: ReadonlyArray<{ key: K; label: string; unit: Unit<D, number> }>;
  /** Slider bounds (in fromKey units). */
  min: number;
  max: number;
  step: number;
  /** Short code-block snippet shown under the controls; receives the live values. */
  codeFor: (s: BenchState<D, K>, result: number) => string;
  label?: string;
}

export function Bench<D extends Dimension, K extends string>({
  state,
  onChange,
  options,
  min,
  max,
  step,
  codeFor,
  label = 'forge bench',
}: BenchProps<D, K>) {
  // The options array is non-empty by contract; the runtime invariant
  // (every option's unit shares dimension D) is enforced at the kit-page
  // level. If state.fromKey/toKey falls out of the catalog (hot-reload,
  // future deep-link wiring), we fall back to options[0]. The non-null
  // assertions are sound: the kit-page always passes a non-empty list.
  const fromOpt = options.find((o) => o.key === state.fromKey) ?? options[0]!;
  const toOpt = options.find((o) => o.key === state.toKey) ?? options[0]!;
  // Cast: TS cannot prove the conditional `ForgeInput<D> = Unit<D>` for a
  // generic D extending Dimension. The runtime invariant is enforced by
  // the options array (every option's unit shares dimension D).
  const result = forge(
    fromOpt.unit as ForgeInput<D, number>,
    toOpt.unit as ForgeInput<D, number>,
  )(state.value);

  const handleValue = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) onChange({ ...state, value: next });
  };

  return (
    <div
      className="uf-card relative rounded-lg p-4 shadow-md md:p-5"
      role="region"
      aria-label={label}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="uf-eyebrow text-uf-accent">{label}</span>
        <span className="uf-eyebrow">live</span>
      </div>

      <div className="grid items-end gap-3 md:grid-cols-[1fr_auto_1fr]">
        <label className="flex flex-col gap-1">
          <span className="uf-eyebrow">from</span>
          <select
            value={state.fromKey}
            onChange={(e) => onChange({ ...state, fromKey: e.target.value as K })}
            className="mono rounded border border-uf-border bg-uf-bg px-2 py-1.5 text-sm text-uf-fg"
          >
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <ArrowRight
          size={20}
          strokeWidth={1.8}
          className="hidden text-uf-accent md:block md:justify-self-center"
        />

        <label className="flex flex-col gap-1">
          <span className="uf-eyebrow">to</span>
          <select
            value={state.toKey}
            onChange={(e) => onChange({ ...state, toKey: e.target.value as K })}
            className="mono rounded border border-uf-border bg-uf-bg px-2 py-1.5 text-sm text-uf-fg"
          >
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
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
          aria-label={`value in ${fromOpt.label}`}
          aria-valuetext={`${formatLive(state.value)} ${fromOpt.label}`}
        />
        <div className="mono whitespace-nowrap text-xl tabular-nums text-uf-accent md:text-2xl">
          {formatLive(state.value)} {fromOpt.key}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-uf-border pt-3">
        <span className="uf-eyebrow">result</span>
        <span
          className="mono text-2xl tabular-nums text-uf-fg md:text-3xl"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatLive(result)} <span className="text-uf-muted">{toOpt.key}</span>
        </span>
      </div>

      <div className="mt-3">
        <CodeLine code={codeFor(state, result)} />
      </div>
    </div>
  );
}

function formatLive(n: number): string {
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs >= 1e15 || abs < 1e-4) return n.toExponential(3);
  if (abs >= 1000) return n.toFixed(2);
  if (abs >= 1) return n.toFixed(3);
  return n.toFixed(5);
}
