// Themed unit picker built on Radix Select. Takes a unit list directly;
// each entry needs id, label, and symbol. The lib's `Unit<D, T>` already
// fits.
//
// Each row is a two-column "symbol  label" pair: symbol in mono-bold,
// label muted. The trigger renders the same shape via an explicit
// `Select.Value` child, looked up from the current value; this is
// Radix's supported escape hatch when item rows carry decorative
// markup. `Select.ItemText` stays plain text so keyboard type-ahead
// matches against the label cleanly.
//
// Required selection: Radix Select always has a value; both `value`
// and `onChange` are required.
//
// `labelHidden` hides the visible eyebrow but keeps the screen-reader
// association via an sr-only span. The trigger is wired to the eyebrow
// with `aria-labelledby`.

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { cn } from '~/lib/cn.js';

interface Unit {
  id: string;
  label: string;
  symbol: string;
}

interface UnitPickerProps {
  label: string;
  value: string;
  units: ReadonlyArray<Unit>;
  onChange: (id: string) => void;
  /** Hide the visible eyebrow label; keep the screen-reader association. */
  labelHidden?: boolean;
  className?: string;
}

function UnitRow({ unit }: { unit: Unit }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="mono font-semibold">{unit.symbol}</span>
      <span className="text-uf-muted">{unit.label}</span>
    </span>
  );
}

export function UnitPicker({
  label,
  value,
  units,
  onChange,
  labelHidden,
  className,
}: UnitPickerProps) {
  const labelId = useId();
  const selected = units.find((u) => u.id === value);
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span id={labelId} className={cn('uf-eyebrow', labelHidden && 'sr-only')}>
        {label}
      </span>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          aria-labelledby={labelId}
          className="flex items-center justify-between gap-2 rounded border border-uf-border bg-uf-card px-2 py-1 text-sm text-uf-fg outline-none focus-visible:ring-1 focus-visible:ring-uf-accent"
        >
          <Select.Value>{selected ? <UnitRow unit={selected} /> : null}</Select.Value>
          <Select.Icon>
            <ChevronDown size={14} className="text-uf-muted" aria-hidden />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={4}
            className="z-50 max-h-[300px] overflow-hidden rounded border border-uf-border bg-uf-card text-sm text-uf-fg shadow-md"
          >
            <Select.Viewport className="p-1">
              {units.map((u) => (
                <Select.Item
                  key={u.id}
                  value={u.id}
                  className="relative flex cursor-pointer select-none items-center gap-3 rounded px-2 py-1.5 pr-8 outline-none data-[highlighted]:bg-uf-accent/10 data-[state=checked]:text-uf-accent"
                >
                  <Select.ItemText>{u.label}</Select.ItemText>
                  <UnitRow unit={u} />
                  <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
                    <Check size={14} aria-hidden />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
