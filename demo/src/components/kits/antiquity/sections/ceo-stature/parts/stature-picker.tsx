// One side of the stature gauge, used twice (subject + reference). A
// grouped Radix select over the roster (Executives / Leaders) plus a
// "custom height" escape that swaps the trigger for an inches slider
// whose readout projects to ft′in″ (primary) and cm (muted) via forge.

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { type ChangeEvent, type CSSProperties, useId } from 'react';
import { EXECS, type Figure, LEADERS, STATURE_MAX_IN, STATURE_MIN_IN } from '../figures.js';
import { cm, ftIn, resolveSide, type SideState } from '../stature-model.js';

const CUSTOM = '__custom__';

interface StaturePickerProps {
  label: string;
  side: SideState;
  onChange: (next: SideState) => void;
  /** Side accent (a CSS color), drives the trigger ring and slider. */
  accent: string;
}

function FigureRow({ figure }: { figure: Figure }) {
  return (
    <span className="flex items-baseline gap-2">
      {figure.badge ? <span aria-hidden>{figure.badge}</span> : null}
      <span className="font-semibold text-uf-fg">{figure.name}</span>
      <span className="text-xs text-uf-muted">{figure.role}</span>
    </span>
  );
}

function FigureItem({ figure }: { figure: Figure }) {
  return (
    <Select.Item
      value={figure.id}
      className="relative flex cursor-pointer select-none items-center rounded px-2 py-1.5 pr-8 outline-none data-[highlighted]:bg-uf-accent/10 data-[state=checked]:text-uf-accent"
    >
      <span className="sr-only">
        <Select.ItemText>{figure.name}</Select.ItemText>
      </span>
      <FigureRow figure={figure} />
      <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
        <Check size={14} aria-hidden />
      </Select.ItemIndicator>
    </Select.Item>
  );
}

export function StaturePicker({ label, side, onChange, accent }: StaturePickerProps) {
  const labelId = useId();
  const value = side.mode === 'preset' ? side.figureId : CUSTOM;

  const handleSelect = (next: string) => {
    if (next === CUSTOM) {
      onChange({ mode: 'custom', inches: resolveSide(side).heightInches });
    } else {
      onChange({ mode: 'preset', figureId: next });
    }
  };

  const handleSlider = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ mode: 'custom', inches: Number(e.target.value) });
  };

  const selected = side.mode === 'preset' ? resolveSide(side) : null;

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="uf-eyebrow" style={{ color: accent }}>
        {label}
      </span>

      <Select.Root value={value} onValueChange={handleSelect}>
        <Select.Trigger
          aria-labelledby={labelId}
          className="flex items-center justify-between gap-2 rounded border border-uf-border bg-uf-card px-2 py-1.5 text-sm outline-none focus-visible:ring-1"
          style={{ '--tw-ring-color': accent } as CSSProperties}
        >
          <Select.Value>
            {selected ? (
              <span className="flex min-w-0 items-baseline gap-2">
                {selected.badge ? <span aria-hidden>{selected.badge}</span> : null}
                <span className="truncate font-semibold text-uf-fg">{selected.label}</span>
              </span>
            ) : (
              <span className="font-semibold text-uf-fg">custom height</span>
            )}
          </Select.Value>
          <Select.Icon>
            <ChevronDown size={14} className="text-uf-muted" aria-hidden />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={4}
            className="z-50 max-h-[320px] overflow-hidden rounded border border-uf-border bg-uf-card text-sm text-uf-fg shadow-md"
          >
            <Select.Viewport className="p-1">
              <Select.Group>
                <Select.Label className="uf-eyebrow px-2 py-1 text-uf-muted">
                  Executives
                </Select.Label>
                {EXECS.map((f) => (
                  <FigureItem key={f.id} figure={f} />
                ))}
              </Select.Group>
              <Select.Group>
                <Select.Label className="uf-eyebrow px-2 py-1 pt-2 text-uf-muted">
                  Leaders
                </Select.Label>
                {LEADERS.map((f) => (
                  <FigureItem key={f.id} figure={f} />
                ))}
              </Select.Group>
              <Select.Separator className="my-1 h-px bg-uf-border" />
              <Select.Item
                value={CUSTOM}
                className="relative flex cursor-pointer select-none items-center rounded px-2 py-1.5 pr-8 outline-none data-[highlighted]:bg-uf-accent/10 data-[state=checked]:text-uf-accent"
              >
                <span className="sr-only">
                  <Select.ItemText>custom height</Select.ItemText>
                </span>
                <span className="font-semibold">custom height…</span>
                <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
                  <Check size={14} aria-hidden />
                </Select.ItemIndicator>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {side.mode === 'custom' ? (
        <div className="mt-1 flex flex-col gap-1">
          <input
            type="range"
            min={STATURE_MIN_IN}
            max={STATURE_MAX_IN}
            step={0.1}
            value={side.inches}
            onChange={handleSlider}
            aria-label={`${label} height in inches`}
            aria-valuetext={`${ftIn(side.inches)}, ${cm(side.inches)}`}
            className="w-full"
            style={{ accentColor: accent }}
          />
          <div className="flex items-baseline gap-2">
            <span className="mono text-lg tabular-nums text-uf-fg">{ftIn(side.inches)}</span>
            <span className="text-xs text-uf-muted">{cm(side.inches)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
