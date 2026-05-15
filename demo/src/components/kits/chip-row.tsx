// ChipRow: a row of accent-bordered text radio chips with optional
// inline label. The kit's text-pick primitive for sub-state selection
// (floppy formats, IEEE rate, drain target, etc.). Sibling to MenuPill;
// MenuPill is the icon button used at the machine-dispatch level, this
// is the text chip used inside a tier/link/view's interactivity zone.
//
// Layout: flex-wrap so the row stays one line at desktop width and
// degrades gracefully on narrow viewports. When `label` is supplied,
// the eyebrow sits on the row's left edge with a fixed width so two
// stacked ChipRows align their chip columns; the label drops above
// the chips at sub-tablet widths.

import { cn } from '~/lib/cn.js';

interface ChipOption {
  id: string;
  short: string;
}

interface ChipRowProps {
  /** Identifier of the currently selected chip. Must match one `id`. */
  value: string;
  /** Closed enumeration of chips, rendered left-to-right with flex wrap. */
  options: ReadonlyArray<ChipOption>;
  /** Selection callback. Caller narrows the id back to its own union. */
  onChange: (id: string) => void;
  /**
   * Optional inline label rendered as a fixed-width eyebrow on the
   * row's left edge. When set, the row uses an inline layout (label +
   * chips on one line at wide widths; label-above-chips on narrow).
   * When omitted, the row is chips-only and spans the full grid width
   * without an eyebrow column.
   */
  label?: string;
  /**
   * Required when `label` is set. Names the radio group for screen
   * readers; not rendered visually.
   */
  ariaLabel?: string;
}

export function ChipRow({ value, options, onChange, label, ariaLabel }: ChipRowProps) {
  const chips = (
    <div
      className="flex flex-wrap gap-1.5"
      role="radiogroup"
      aria-label={ariaLabel ?? label}
    >
      {options.map((o) => (
        <Chip key={o.id} option={o} active={o.id === value} onSelect={onChange} />
      ))}
    </div>
  );

  if (label) {
    return (
      <div className="sm:col-span-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="uf-eyebrow shrink-0 w-28 leading-tight">{label}</span>
        {chips}
      </div>
    );
  }
  return <div className="sm:col-span-3">{chips}</div>;
}

interface ChipProps {
  option: ChipOption;
  active: boolean;
  onSelect: (id: string) => void;
}

function Chip({ option, active, onSelect }: ChipProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onSelect(option.id)}
      className={cn(
        'rounded border px-2.5 py-1 text-[11px] mono transition focus:outline-none focus-visible:ring-1 focus-visible:ring-uf-accent',
        active
          ? 'border-uf-accent bg-uf-accent/20 text-uf-accent shadow-[inset_0_0_0_1px_var(--uf-accent)]'
          : 'border-uf-fg/15 bg-transparent text-uf-fg hover:border-uf-accent/50',
      )}
    >
      {option.short}
    </button>
  );
}
