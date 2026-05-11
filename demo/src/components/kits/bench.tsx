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
import { CopyButton } from '../CodeBlock.js';
import { useTheme } from '../theme/provider.js';
import { useHighlighted } from '../theme/use-highlighted.js';

export interface BenchState<D extends Dimension> {
  fromKey: string;
  toKey: string;
  value: number;
}

interface BenchProps<D extends Dimension> {
  state: BenchState<D>;
  onChange: (next: BenchState<D>) => void;
  options: ReadonlyArray<{ key: string; label: string; unit: Unit<D, number> }>;
  /** Slider bounds (in fromKey units). */
  min: number;
  max: number;
  step: number;
  /** Short code-block snippet shown under the controls; receives the live values. */
  codeFor: (s: BenchState<D>, result: number) => string;
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
  const fromOpt = options.find((o) => o.key === state.fromKey) ?? options[0];
  const toOpt = options.find((o) => o.key === state.toKey) ?? options[0];
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
      className="uf-card relative rounded-lg p-4 md:p-5"
      role="region"
      aria-label={label}
      style={{
        background: 'var(--uf-card)',
        borderColor: 'var(--uf-border)',
        boxShadow: '0 6px 24px -12px rgba(0,0,0,0.35)',
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="uf-eyebrow" style={{ color: 'var(--uf-accent)' }}>
          {label}
        </span>
        <span className="uf-eyebrow">live</span>
      </div>

      <div className="grid items-end gap-3 md:grid-cols-[1fr_auto_1fr]">
        <label className="flex flex-col gap-1">
          <span className="uf-eyebrow">from</span>
          <select
            value={state.fromKey}
            onChange={(e) => onChange({ ...state, fromKey: e.target.value })}
            className="mono rounded border px-2 py-1.5 text-sm"
            style={{
              background: 'var(--uf-bg)',
              color: 'var(--uf-fg)',
              borderColor: 'var(--uf-border)',
            }}
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
          style={{ color: 'var(--uf-accent)', justifySelf: 'center' }}
        />

        <label className="flex flex-col gap-1">
          <span className="uf-eyebrow">to</span>
          <select
            value={state.toKey}
            onChange={(e) => onChange({ ...state, toKey: e.target.value })}
            className="mono rounded border px-2 py-1.5 text-sm"
            style={{
              background: 'var(--uf-bg)',
              color: 'var(--uf-fg)',
              borderColor: 'var(--uf-border)',
            }}
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
          className="flex-1"
          aria-label={`value in ${fromOpt.label}`}
          style={{ accentColor: 'var(--uf-accent)' }}
        />
        <div
          className="mono tabular-nums whitespace-nowrap text-xl md:text-2xl"
          style={{ color: 'var(--uf-accent)' }}
        >
          {formatLive(state.value)} {fromOpt.key}
        </div>
      </div>

      <div
        className="mt-3 flex items-baseline justify-between gap-3 border-t pt-3"
        style={{ borderColor: 'var(--uf-border)' }}
      >
        <span className="uf-eyebrow">result</span>
        <span
          className="mono tabular-nums text-2xl md:text-3xl"
          style={{ color: 'var(--uf-fg)' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {formatLive(result)} <span style={{ color: 'var(--uf-muted)' }}>{toOpt.key}</span>
        </span>
      </div>

      <LiveCodeLine code={codeFor(state, result)} />
    </div>
  );
}

function LiveCodeLine({ code }: { code: string }) {
  const { activeTheme } = useTheme();
  const html = useHighlighted(code, 'ts', activeTheme.shikiTheme);
  const codeFrameClass = activeTheme.codeFrameClass;
  return (
    <div
      className={`relative mono mt-3 rounded text-xs overflow-hidden ${codeFrameClass ?? ''}`}
      style={{
        background: 'var(--uf-code-bg)',
        border: '1px solid var(--uf-border)',
      }}
    >
      <div className="absolute bottom-0.5 right-0.5 z-10">
        <CopyButton code={code} />
      </div>
      {html ? (
        <div
          className="uf-code-scroll px-3 py-2 pr-12 [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!whitespace-pre"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          className="uf-code-scroll m-0 px-3 py-2 pr-12"
          style={{ color: 'var(--uf-fg)' }}
        >
          {code}
        </pre>
      )}
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
