// GateRow; one line of a bill of materials, showing how many finished
// assemblies that single component could support on its own. The
// section computes the fold (`Math.min` across every line); this part
// draws one line of it and flags the one that is currently binding.
//
// The teaching point it carries: an assembly's yield is not the sum of
// its inputs and not their average, it is the minimum. The line that is
// binding is not always the one with the fewest pieces on the shelf,
// because the per-assembly rates differ.

import { cn } from '~/lib/cn.js';
import { formatCount } from '~/lib/format.js';
import { glyphFor } from './glyph-slots.js';

interface GateRowProps {
  label: string;
  /** Glyph key for this component. */
  glyph: string;
  /** Pieces of this component currently on the shelf. */
  stock: number;
  /** Pieces consumed per finished assembly. */
  perAssembly: number;
  /** Assemblies this line alone could support. */
  capacity: number;
  /** True when this line is the one setting the overall yield. */
  binding: boolean;
}

export function GateRow({ label, glyph, stock, perAssembly, capacity, binding }: GateRowProps) {
  const Icon = glyphFor(glyph);
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded border px-3 py-2',
        binding ? 'border-uf-accent-2 bg-uf-accent-2/5' : 'border-uf-border',
      )}
    >
      <Icon
        size={18}
        strokeWidth={1.6}
        className={binding ? 'text-uf-accent-2' : 'text-uf-muted'}
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="mono text-[10px] uppercase tracking-wider text-uf-muted">{label}</span>
        <span className="mono text-xs text-uf-muted tabular-nums">
          {formatCount(stock)} on hand &middot; {formatCount(perAssembly)} per unit
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={cn('mono text-base tabular-nums', binding ? 'text-uf-accent-2' : 'text-uf-fg')}
        >
          {formatCount(capacity)}
        </span>
        <span className="mono text-[10px] uppercase tracking-wider text-uf-muted">
          {binding ? 'binding' : 'slack'}
        </span>
      </div>
    </div>
  );
}
