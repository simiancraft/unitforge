// Themed range slider. Two orientations dispatched via a lookup table so
// each render path is small and side-by-side: 'horizontal' is the default,
// 'vertical' is for inputs whose orientation maps to the axis they
// visually control (e.g. rectangle width).

import type { ChangeEvent } from 'react';
import { cn } from '~/lib/cn.js';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  orientation?: 'horizontal' | 'vertical';
  suffix?: string;
  className?: string;
}

export function Slider({ orientation = 'horizontal', ...rest }: SliderProps) {
  const Component = ORIENTATIONS[orientation];
  return <Component {...rest} />;
}

interface OrientedProps extends Omit<SliderProps, 'orientation'> {}

function HorizontalSlider({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  suffix,
  className,
}: OrientedProps) {
  return (
    <label className={cn('flex flex-1 flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between">
        <span className="uf-eyebrow">{label}</span>
        <SliderReadout value={value} suffix={suffix} />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange(onChange)}
        aria-valuetext={suffix ? `${value.toFixed(2)} ${suffix}` : value.toFixed(2)}
        className="uf-slider w-full accent-uf-accent"
      />
    </label>
  );
}

function VerticalSlider({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  suffix,
  className,
}: OrientedProps) {
  return (
    <label className={cn('flex flex-col items-center gap-2', className)}>
      <SliderReadout value={value} suffix={suffix} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange(onChange)}
        aria-orientation="vertical"
        aria-valuetext={suffix ? `${value.toFixed(2)} ${suffix}` : value.toFixed(2)}
        className="uf-slider accent-uf-accent"
        style={{
          writingMode: 'vertical-lr',
          direction: 'rtl',
          width: '8px',
          height: '180px',
        }}
      />
      <span className="uf-eyebrow">{label}</span>
    </label>
  );
}

const ORIENTATIONS = {
  horizontal: HorizontalSlider,
  vertical: VerticalSlider,
} as const;

function SliderReadout({ value, suffix }: { value: number; suffix?: string | undefined }) {
  return (
    <span className="mono text-sm tabular-nums">
      {value.toFixed(2)}
      {suffix ? <span className="ml-1 opacity-60">{suffix}</span> : null}
    </span>
  );
}

function handleChange(onChange: (n: number) => void) {
  return (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) onChange(next);
  };
}
