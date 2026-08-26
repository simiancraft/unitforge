// GlyphRow; renders a count as a row of discrete icons. The page's
// central visual argument is that these quantities are made of pieces,
// so the readout draws pieces rather than a bar. Above `cap` the row
// truncates and appends a "+N" chip, which keeps a 480-can pallet from
// painting 480 nodes.
//
// Named Organ extraction: pure sink, primitive prop surface (count,
// glyph key, tone), so React can memo it across slider drags.

import { cn } from '~/lib/cn.js';
import { formatCount } from '~/lib/format.js';
import { glyphFor } from './glyph-slots.js';

type Tone = 'raw' | 'refined' | 'spent';

const TONE_CLASS: Record<Tone, string> = {
  // Raw stock: muted, it is not the answer yet.
  raw: 'text-uf-muted',
  // Refined output: the accent, because it is what the forge call
  // returned.
  refined: 'text-uf-accent',
  // Leftovers that could not make a whole piece. Secondary accent so
  // the remainder reads as a real result rather than an error.
  spent: 'text-uf-accent-2',
};

interface GlyphRowProps {
  label: string;
  count: number;
  glyph: string;
  tone?: Tone;
  /** Icons drawn before the row truncates into a "+N" chip. */
  cap?: number;
  /** Unit suffix rendered after the numeral ("ea", "kg"). */
  suffix?: string;
}

export function GlyphRow({ label, count, glyph, tone = 'raw', cap = 24, suffix }: GlyphRowProps) {
  const Icon = glyphFor(glyph);
  // Only whole pieces get an icon. A fractional count means a compute
  // body failed to floor; the numeral still shows the true value (see
  // formatCount), and the icons show the whole part, so the two
  // disagreeing is the visible symptom.
  const whole = Math.max(0, Math.floor(count));
  const drawn = Math.min(whole, cap);
  const overflow = whole - drawn;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="mono text-[10px] uppercase tracking-wider text-uf-muted">{label}</span>
        <span className="mono leading-tight">
          <span className={cn('text-base tabular-nums', TONE_CLASS[tone])}>
            {formatCount(count)}
          </span>
          {suffix ? <span className="ml-1 text-xs text-uf-muted">{suffix}</span> : null}
        </span>
      </div>
      <div className="flex min-h-[18px] flex-wrap items-center gap-1">
        {Array.from({ length: drawn }, (_, i) => (
          <Icon
            // biome-ignore lint/suspicious/noArrayIndexKey: the icons are interchangeable placeholders for identical pieces; they hold no state, are never reordered, and the list only ever grows or shrinks from its tail.
            key={`${glyph}-${i}`}
            size={14}
            strokeWidth={1.8}
            className={TONE_CLASS[tone]}
            aria-hidden
          />
        ))}
        {overflow > 0 ? (
          <span className="mono rounded border border-uf-border px-1 text-[10px] text-uf-muted">
            +{formatCount(overflow)}
          </span>
        ) : null}
        {whole === 0 ? <span className="mono text-[10px] text-uf-muted">none</span> : null}
      </div>
    </div>
  );
}
