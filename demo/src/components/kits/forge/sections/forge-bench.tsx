// ForgeBench (slim home variant) — the two-line forge instrument on the
// root page. Reads as an interactive horizontal rule between the masthead
// and the kits.
//
// Row 1: FROM unit on the left (picker + slider + live value), TO unit on
//        the right (result + picker). No chrome, no "LIVE" badge, no
//        "RESULT" label.
// Row 2: code block with the minimal imports + the live forge() call.

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LENGTH_UNITS, findByKey, type LengthKey } from '~/lib/units.js';
import { convert } from '~/lib/convert.js';
import { CodeLine } from '~/components/CodeBlock.js';
import { cn } from '~/lib/cn.js';

const MIN = 0.1;
const MAX = 100;
const STEP = 0.1;

interface ForgeBenchProps {
  fromKey: LengthKey;
  toKey: LengthKey;
  value: number;
  onChange: (next: { fromKey: LengthKey; toKey: LengthKey; value: number }) => void;
}

export function ForgeBench({ fromKey, toKey, value, onChange }: ForgeBenchProps) {
  const fromOpt = findByKey(LENGTH_UNITS, fromKey);
  const toOpt = findByKey(LENGTH_UNITS, toKey);
  const result = convert(fromOpt.unit, toOpt.unit, value);
  const [sliderActive, setSliderActive] = useState(false);

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
              onChange({ fromKey: e.target.value as LengthKey, toKey, value })
            }
            aria-label="from unit"
            className="rounded border border-uf-border bg-uf-bg px-2 py-1 text-sm text-uf-fg"
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
            onPointerDown={() => setSliderActive(true)}
            onPointerUp={() => setSliderActive(false)}
            onPointerCancel={() => setSliderActive(false)}
            onBlur={() => setSliderActive(false)}
            aria-label={`value in ${fromOpt.label}`}
            aria-valuetext={`${value.toFixed(2)} ${fromOpt.label}`}
            className="h-3 flex-1 accent-uf-accent"
          />
          <span className="whitespace-nowrap text-lg tabular-nums text-uf-accent">
            {value.toFixed(2)} {fromOpt.key}
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
          <span
            className="whitespace-nowrap text-2xl tabular-nums md:text-3xl"
            aria-live="polite"
            aria-atomic="true"
          >
            {result.toFixed(4)}
            <span className="sr-only"> {toOpt.label}</span>
          </span>
          <select
            value={toKey}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onChange({ fromKey, toKey: e.target.value as LengthKey, value })
            }
            aria-label="to unit"
            className="rounded border border-uf-border bg-uf-bg px-2 py-1 text-sm text-uf-fg"
          >
            {LENGTH_UNITS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <CodeLine code={code} />
    </div>
  );
}
