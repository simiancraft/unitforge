// Themed select for picking a unit. Keys are arbitrary strings; the parent
// owns the mapping from key to Unit value (lets the picker stay decoupled
// from unitforge's type plumbing).

import type { ChangeEvent } from 'react';

interface UnitOption {
  key: string;
  label: string;
}

interface UnitPickerProps {
  label: string;
  value: string;
  options: ReadonlyArray<UnitOption>;
  onChange: (key: string) => void;
}

export function UnitPicker({ label, value, options, onChange }: UnitPickerProps) {
  const handle = (e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value);
  return (
    <label className="flex flex-col gap-1">
      <span className="uf-eyebrow">{label}</span>
      <select
        value={value}
        onChange={handle}
        className="mono rounded border px-2 py-1 text-sm"
        style={{
          background: 'var(--uf-card)',
          color: 'var(--uf-fg)',
          borderColor: 'var(--uf-border)',
        }}
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
