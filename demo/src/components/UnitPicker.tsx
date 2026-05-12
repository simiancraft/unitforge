// Themed select for picking a unit. Options come from `pickerOptions(LIST)`
// in `lib/units.ts`, which projects each unit's `id` as the option key and
// `label` as the visible dropdown text. Parents own the selected id as
// state (plain string; the unit's `id` is the stable kebab-case identifier).
//
// The visible label can be hidden via `labelHidden`; the label still
// labels the control for screen readers (rendered into an sr-only span).
// Use this when the surrounding layout already conveys the field's role
// (e.g. the slim ForgeBench, where the value's unit is implied by the
// adjacent slider).

import type { ChangeEvent } from 'react';
import { cn } from '~/lib/cn.js';

interface UnitPickerProps<K extends string> {
  label: string;
  value: K;
  options: ReadonlyArray<{ key: K; label: string }>;
  onChange: (key: K) => void;
  /** Hide the visible eyebrow label; keep the screen-reader association. */
  labelHidden?: boolean;
  className?: string;
}

export function UnitPicker<K extends string>({
  label,
  value,
  options,
  onChange,
  labelHidden,
  className,
}: UnitPickerProps<K>) {
  // e.target.value is `string`; the runtime invariant (`<option>` values
  // are drawn from `options`) lets the parent safely narrow to K.
  const handle = (e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as K);
  return (
    <label className={cn('flex flex-col gap-1', className)}>
      <span className={cn('uf-eyebrow', labelHidden && 'sr-only')}>{label}</span>
      <select
        value={value}
        onChange={handle}
        className="mono rounded border border-uf-border bg-uf-card px-2 py-1 text-sm text-uf-fg"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
