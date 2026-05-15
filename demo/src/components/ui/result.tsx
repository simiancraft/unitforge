// A row showing a label and a formatted value. Used inside every demo
// for the live "answer" the widget produces. Two variants:
//   - 'standard' (default): small mono row, foreground text
//   - 'hero': larger accent-colored value for the headline answer

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/cn.js';

const resultValue = cva('mono tabular-nums leading-tight', {
  variants: {
    variant: {
      standard: 'text-sm text-uf-fg',
      hero: 'text-2xl text-uf-accent',
    },
  },
  defaultVariants: {
    variant: 'standard',
  },
});

const resultRoot = cva('m-0 border-t border-uf-border pt-2', {
  variants: {
    layout: {
      // Row: label left, value right; default for hero readouts and
      // most one-off conversions where the value fits on its baseline.
      row: 'flex items-baseline justify-between',
      // Stack: label on top, value below. Use for billboards where
      // values get long and wrapping the unit suffix to a new line
      // reads worse than letting the whole number own its own line.
      stack: 'flex flex-col gap-0.5',
    },
  },
  defaultVariants: {
    layout: 'row',
  },
});

interface ResultProps extends VariantProps<typeof resultValue>, VariantProps<typeof resultRoot> {
  label: string;
  value: string;
  className?: string;
  /** Merged into the `<dd>` element; lets a caller override font-size or
   *  color on the value text without touching the row's layout. Use for
   *  per-row tweaks like shrinking very long digit strings. */
  valueClassName?: string | undefined;
  /** Optional CSS color (hex / rgb / CSS var like `var(--uf-accent)`).
   *  When set, renders a small filled circle before the label so the row
   *  can act as a legend entry whose color matches a drawn element in
   *  an accompanying visual (e.g. the coordinate plane's distance line
   *  or midpoint marker). Omitted ⇒ no bullet, no layout shift. */
  bulletColor?: string;
}

export function Result({
  label,
  value,
  variant,
  layout,
  className,
  valueClassName,
  bulletColor,
}: ResultProps) {
  // <dl>/<dt>/<dd> encodes the label↔value relationship for screen readers;
  // visually identical to the prior <div><span>/<span> via the flex overrides
  // + m-0 resets on the browser-default description-list margins.
  return (
    <dl className={cn(resultRoot({ layout }), className)}>
      <dt className="uf-eyebrow flex items-center gap-2">
        {bulletColor ? (
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: bulletColor }}
          />
        ) : null}
        {label}
      </dt>
      <dd className={cn('m-0', resultValue({ variant }), valueClassName)}>{value}</dd>
    </dl>
  );
}
