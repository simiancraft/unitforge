// A row showing a label and a formatted value. Used inside every demo
// for the live "answer" the widget produces. Two variants:
//   - 'standard' (default): small mono row, foreground text
//   - 'hero': larger accent-colored value for the headline answer

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn.js';

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

interface ResultProps extends VariantProps<typeof resultValue> {
  label: string;
  value: string;
  className?: string;
}

export function Result({ label, value, variant, className }: ResultProps) {
  // <dl>/<dt>/<dd> encodes the label↔value relationship for screen readers;
  // visually identical to the prior <div><span>/<span> via the flex overrides
  // + m-0 resets on the browser-default description-list margins.
  return (
    <dl
      className={cn(
        'm-0 flex items-baseline justify-between border-t border-uf-border pt-2',
        className,
      )}
    >
      <dt className="uf-eyebrow">{label}</dt>
      <dd className={cn('m-0', resultValue({ variant }))}>{value}</dd>
    </dl>
  );
}
