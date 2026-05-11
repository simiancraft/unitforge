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
import { foot, meter } from 'unitforge/kits/geometry';
import { LENGTH_UNITS, findByKey } from '../lib/units.js';
import { cachedHighlight, highlight } from '../lib/highlighter.js';
import { CopyButton } from './CodeBlock.js';

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

  // Reference the imported `meter`/`foot` so the example imports show up
  // as actually-used at the top of the page (lets bundlers tree-shake
  // honestly + keeps lint happy in case unused-imports gets stricter).
  void meter;
  void foot;

  const code = `import { forge } from 'unitforge';
import { ${fromOpt.label.replace(/\s/g, '')}, ${toOpt.label.replace(/\s/g, '')} } from 'unitforge/kits/geometry';

forge(${fromOpt.label.replace(/\s/g, '')}, ${toOpt.label.replace(/\s/g, '')})(${value}); // ${result.toFixed(4)}`;

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

        <ArrowRight
          size={18}
          strokeWidth={1.8}
          style={{ color: 'var(--uf-accent)' }}
          className="self-center"
        />

        {/* RIGHT half: result + TO picker */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <span className="tabular-nums whitespace-nowrap text-2xl md:text-3xl">
            {result.toFixed(4)}
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
  const [html, setHtml] = useState<string | null>(cachedHighlight(code) ?? null);
  useEffect(() => {
    let cancelled = false;
    highlight(code)
      .then((rendered) => {
        if (!cancelled) setHtml(rendered);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code]);
  return (
    <div
      className="relative mono rounded text-xs"
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
