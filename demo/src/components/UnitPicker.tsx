// Themed select for picking a unit. Generic over the key union so the
// parent's setState callback narrows correctly (e.g. setFromKey takes
// `LengthKey`, not plain `string`).

import type { ChangeEvent } from 'react';

interface UnitPickerProps<K extends string> {
  label: string;
  value: K;
  options: ReadonlyArray<{ key: K; label: string }>;
  onChange: (key: K) => void;
}

export function UnitPicker<K extends string>({
  label,
  value,
  options,
  onChange,
}: UnitPickerProps<K>) {
  // e.target.value is `string`; the runtime invariant (`<option>` values
  // are drawn from `options`) lets the parent safely narrow to K.
  const handle = (e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as K);
  return (
    <label className="flex flex-col gap-1">
      <span className="uf-eyebrow">{label}</span>
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
