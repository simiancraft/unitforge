// Themed range slider with an optional unit-picker dropdown attached.
// Two orientations: 'horizontal' (default) and 'vertical' (for inputs whose
// orientation maps to the visual axis they control).

import type { ChangeEvent } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  orientation?: 'horizontal' | 'vertical';
  suffix?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  orientation = 'horizontal',
  suffix,
}: SliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) onChange(next);
  };

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="mono text-sm tabular-nums">
          {value.toFixed(2)}
          {suffix && <span className="ml-1 opacity-60">{suffix}</span>}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          aria-label={label}
          aria-orientation="vertical"
          className="uf-slider"
          style={{
            writingMode: 'vertical-lr' as never,
            direction: 'rtl',
            width: '8px',
            height: '180px',
            accentColor: 'var(--uf-accent)',
          }}
        />
        <span className="uf-eyebrow">{label}</span>
      </div>
    );
  }

  return (
    <label className="flex flex-1 flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="uf-eyebrow">{label}</span>
        <span className="mono text-sm tabular-nums">
          {value.toFixed(2)}
          {suffix && <span className="ml-1 opacity-60">{suffix}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="uf-slider w-full"
        style={{ accentColor: 'var(--uf-accent)' }}
      />
    </label>
  );
}
