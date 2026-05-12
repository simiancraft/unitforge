// Themed select for picking a unit. Takes a unit list directly — each
// entry must carry `id` (used as the option's stable value) and `label`
// (the visible dropdown text). The lib's `Unit<D, T>` shape satisfies
// this; sections pass their kit-local catalog straight through.
//
// Parents own the selected id as state (plain string; the unit's `id`
// is the stable kebab-case identifier). The visible field-label can be
// hidden via `labelHidden`; the label still labels the control for
// screen readers (rendered into an sr-only span). Use this when the
// surrounding layout already conveys the field's role (e.g. the slim
// ForgeBench, where the value's unit is implied by the adjacent
// slider).

import type { ChangeEvent } from 'react';
import { cn } from '~/lib/cn.js';

interface UnitPickerProps {
  label: string;
  value: string;
  units: ReadonlyArray<{ id: string; label: string }>;
  onChange: (id: string) => void;
  /** Hide the visible eyebrow label; keep the screen-reader association. */
  labelHidden?: boolean;
  className?: string;
}

export function UnitPicker({
  label,
  value,
  units,
  onChange,
  labelHidden,
  className,
}: UnitPickerProps) {
  const handle = (e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value);
  return (
    <label className={cn('flex flex-col gap-1', className)}>
      <span className={cn('uf-eyebrow', labelHidden && 'sr-only')}>{label}</span>
      <select
        value={value}
        onChange={handle}
        className="mono rounded border border-uf-border bg-uf-card px-2 py-1 text-sm text-uf-fg"
      >
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.label}
          </option>
        ))}
      </select>
    </label>
  );
}
