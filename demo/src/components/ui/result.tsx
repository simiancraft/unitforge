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
  valueClassName?: string;
}

export function Result({ label, value, variant, layout, className, valueClassName }: ResultProps) {
  // <dl>/<dt>/<dd> encodes the label↔value relationship for screen readers;
  // visually identical to the prior <div><span>/<span> via the flex overrides
  // + m-0 resets on the browser-default description-list margins.
  return (
    <dl className={cn(resultRoot({ layout }), className)}>
      <dt className="uf-eyebrow">{label}</dt>
      <dd className={cn('m-0', resultValue({ variant }), valueClassName)}>{value}</dd>
    </dl>
  );
}
