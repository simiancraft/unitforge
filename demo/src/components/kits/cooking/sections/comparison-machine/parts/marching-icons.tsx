// Renders N copies of a Lucide icon laid out as a wrapping flow, used
// for "1 of these has the same sugar as N of those" comparison
// infographics. The leftover-fraction tail (e.g. 0.7 of a donut) is
// rendered as a faded partial icon so the count stays visually honest
// without forcing the reader to do rounding math.
//
// Hard upper bound on rendered icons keeps the SVG draw cost bounded;
// anything past the cap collapses to a "+N more" pill.

import type { LucideIcon } from 'lucide-react';

const MAX_ICONS = 40;

interface MarchingIconsProps {
  /** The exact (possibly fractional) count; whole-number icons get full
   *  opacity, the fractional remainder gets a faded partial icon. */
  count: number;
  Icon: LucideIcon;
  /** Tailwind size class for each icon (e.g. 'h-8 w-8'). */
  iconClassName?: string;
  /** Color class (e.g. 'text-uf-accent-2'). */
  colorClassName?: string;
  /** ARIA label for the whole group (the screen-reader summary). */
  ariaLabel: string;
}

export function MarchingIcons({
  count,
  Icon,
  iconClassName = 'h-8 w-8',
  colorClassName = 'text-uf-accent-2',
  ariaLabel,
}: MarchingIconsProps) {
  const whole = Math.floor(count);
  const remainder = count - whole;
  const rendered = Math.min(whole, MAX_ICONS);
  const overflow = whole - rendered;

  return (
    <div role="img" aria-label={ariaLabel} className="flex flex-wrap items-center gap-1.5">
      {Array.from({ length: rendered }, (_, i) => (
        <Icon
          // biome-ignore lint/suspicious/noArrayIndexKey: stateless decorative repeats; reorder is impossible
          key={`whole-${i}`}
          strokeWidth={1.6}
          className={`${iconClassName} ${colorClassName}`}
          aria-hidden
        />
      ))}
      {remainder > 0.05 && rendered === whole ? (
        <Icon
          key="fraction"
          strokeWidth={1.6}
          className={`${iconClassName} ${colorClassName}`}
          style={{ opacity: Math.max(0.25, remainder) }}
          aria-hidden
        />
      ) : null}
      {overflow > 0 ? (
        <span className="mono text-xs uppercase tracking-wider text-uf-muted">
          + {overflow} more
        </span>
      ) : null}
    </div>
  );
}
