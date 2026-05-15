// MenuPill: the kit-level icon button used in machine dispatch menus.
// Renders a 12-by-12 button with a glyph (`children`) and, on hover or
// keyboard focus, a themed popover carrying the label and an optional
// one-line hint. Replaces the native `title` tooltip with chrome that
// matches the kit theme and that screen readers can announce via
// aria-describedby. Position-aware via a small `placement` prop;
// machines that put pills above the widget use 'bottom', the default.

import { useId, useState, type ReactNode } from 'react';
import { cn } from '~/lib/cn.js';

type Placement = 'top' | 'bottom';

interface MenuPillProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  /** Display label shown in the popover and exposed as aria-label. */
  label: string;
  /** Optional one-line caption rendered under the label in the popover. */
  hint?: string | undefined;
  /** Which side of the pill the popover floats on. Default 'bottom'. */
  placement?: Placement;
}

export function MenuPill({
  children,
  active,
  onClick,
  label,
  hint,
  placement = 'bottom',
}: MenuPillProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={cn(
          'relative flex h-12 w-12 items-center justify-center rounded-md border transition focus:outline-none focus-visible:ring-1 focus-visible:ring-uf-accent',
          active
            ? 'border-uf-accent bg-uf-accent/15 text-uf-accent'
            : 'border-uf-fg/15 bg-transparent text-uf-fg hover:border-uf-accent/50',
        )}
      >
        {children}
      </button>
      {open ? (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded border border-uf-border bg-uf-card px-2 py-1 text-uf-fg shadow-md',
            placement === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5',
          )}
        >
          <div className="mono text-[11px] font-semibold leading-tight text-uf-accent">
            {label}
          </div>
          {hint ? (
            <div className="mono text-[10px] leading-tight text-uf-muted">{hint}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
