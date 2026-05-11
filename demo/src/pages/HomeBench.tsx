// HomeBench — the slim, two-line forge instrument on the root page. Reads
// as an interactive horizontal rule between the masthead and the kits.
//
// Row 1: FROM unit on the left (picker + slider + live value), TO unit on
//        the right (result + picker). No chrome, no "LIVE" badge, no
//        "RESULT" label.
// Row 2: code block with the minimal imports + the live forge() call.

import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { forge } from 'unitforge';
import { LENGTH_UNITS, findByKey } from '../lib/units.js';
import { cachedHighlight, highlight } from '../lib/highlighter.js';
import { CopyButton } from '../components/CodeBlock.js';
import { useKitTheme } from '../components/KitTheme.js';

const MIN = 0.1;
const MAX = 100;
const STEP = 0.1;

interface HomeBenchProps {
  fromKey: string;
  toKey: string;
  value: number;
  onChange: (next: { fromKey: string; toKey: string; value: number }) => void;
}

export function HomeBench({ fromKey, toKey, value, onChange }: HomeBenchProps) {
  const fromOpt = findByKey(LENGTH_UNITS, fromKey);
  const toOpt = findByKey(LENGTH_UNITS, toKey);
  const result = forge(fromOpt.unit, toOpt.unit)(value);

  const code = `import { forge } from 'unitforge';
import { ${fromOpt.label}, ${toOpt.label} } from 'unitforge/kits/geometry';

forge(${fromOpt.label}, ${toOpt.label})(${value}); // ${result.toFixed(4)}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="mono flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {/* LEFT half: FROM picker + slider + live value */}
        <div className="flex flex-1 items-center gap-3">
          <select
            value={fromKey}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onChange({ fromKey: e.target.value, toKey, value })
            }
            aria-label="from unit"
            className="rounded border px-2 py-1 text-sm"
            style={{
              background: 'var(--uf-bg)',
              color: 'var(--uf-fg)',
              borderColor: 'var(--uf-border)',
            }}
          >
            {LENGTH_UNITS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={value}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) onChange({ fromKey, toKey, value: next });
            }}
            aria-label={`value in ${fromOpt.label}`}
            className="flex-1"
            style={{ accentColor: 'var(--uf-accent)' }}
          />
          <span
            className="tabular-nums whitespace-nowrap text-lg"
            style={{ color: 'var(--uf-accent)' }}
          >
            {value.toFixed(2)} {fromOpt.key}
          </span>
        </div>

        {/* Dotted-trail pointing across to the right; arrow lands at the
            far end. Renders as a subtle accent-colored trace between
            the FROM and TO halves rather than a stranded glyph. */}
        <div className="flex items-center gap-1 self-center w-14 md:w-24">
          <span
            className="flex-1 border-t-2 border-dotted"
            style={{ borderColor: 'var(--uf-accent)', opacity: 0.55 }}
            aria-hidden
          />
          <ArrowRight
            size={18}
            strokeWidth={1.8}
            style={{ color: 'var(--uf-accent)' }}
          />
        </div>

        {/* RIGHT half: result + TO picker */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <span
            className="tabular-nums whitespace-nowrap text-2xl md:text-3xl"
            aria-live="polite"
            aria-atomic="true"
          >
            {result.toFixed(4)}
            <span className="sr-only"> {toOpt.label}</span>
          </span>
          <select
            value={toKey}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onChange({ fromKey, toKey: e.target.value, value })
            }
            aria-label="to unit"
            className="rounded border px-2 py-1 text-sm"
            style={{
              background: 'var(--uf-bg)',
              color: 'var(--uf-fg)',
              borderColor: 'var(--uf-border)',
            }}
          >
            {LENGTH_UNITS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <BenchCodeLine code={code} />
    </div>
  );
}

function BenchCodeLine({ code }: { code: string }) {
  const { shikiTheme, codeFrameClass } = useKitTheme();
  const [html, setHtml] = useState<string | null>(
    cachedHighlight(code, 'ts', shikiTheme) ?? null,
  );
  useEffect(() => {
    setHtml(cachedHighlight(code, 'ts', shikiTheme) ?? null);
    let cancelled = false;
    highlight(code, 'ts', shikiTheme)
      .then((rendered) => {
        if (!cancelled) setHtml(rendered);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code, shikiTheme]);
  return (
    <div
      className={`relative mono rounded text-xs overflow-hidden ${codeFrameClass ?? ''}`}
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
        <pre className="uf-code-scroll m-0 px-3 py-2 pr-12" style={{ color: 'var(--uf-fg)' }}>
          {code}
        </pre>
      )}
    </div>
  );
}
