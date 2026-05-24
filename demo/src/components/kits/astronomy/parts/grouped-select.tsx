// Grouped select for the astronomy control panels. Same Radix shape and
// theming as ui/UnitPicker, but the option list is partitioned into
// labelled groups (Select.Group + Select.Label) and each row carries an
// optional leading glyph and a muted right-aligned hint (a speed rate, a
// catalogued distance). Used by the generations and telescope sections
// where the option count outgrew a flat pill row.
//
// Pass a single group with no `label` for an ungrouped list (the
// traveler picker); the heading is simply omitted.

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useId } from 'react';
import { cn } from '~/lib/cn.js';

export interface PickerOption {
  id: string;
  label: string;
  /** Muted right-aligned detail (e.g. "17 km/s", "1.3 light-seconds"). */
  hint?: string;
  /** Optional leading glyph rendered before the label. */
  icon?: ReactNode;
}

export interface PickerGroup {
  /** Group heading; omit for an ungrouped list (no visible label row). */
  label?: string;
  options: readonly PickerOption[];
}

interface GroupedSelectProps {
  label: string;
  value: string;
  groups: readonly PickerGroup[];
  onChange: (id: string) => void;
  className?: string;
}

function OptionRow({ option }: { option: PickerOption }) {
  return (
    <span className="flex flex-1 items-center gap-2">
      {option.icon ? <span className="inline-flex text-uf-accent-2">{option.icon}</span> : null}
      <span className="truncate">{option.label}</span>
      {option.hint ? (
        <span className="ml-auto whitespace-nowrap text-xs text-uf-muted">{option.hint}</span>
      ) : null}
    </span>
  );
}

export function GroupedSelect({ label, value, groups, onChange, className }: GroupedSelectProps) {
  const labelId = useId();
  const selected = groups.flatMap((g) => g.options).find((o) => o.id === value);
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span id={labelId} className="uf-eyebrow">
        {label}
      </span>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          aria-labelledby={labelId}
          className="flex items-center justify-between gap-2 rounded border border-uf-border bg-uf-card px-2 py-1.5 text-sm text-uf-fg outline-none focus-visible:ring-1 focus-visible:ring-uf-accent"
        >
          <Select.Value>{selected ? <OptionRow option={selected} /> : null}</Select.Value>
          <Select.Icon>
            <ChevronDown size={14} className="text-uf-muted" aria-hidden />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={4}
            className="z-50 max-h-[320px] w-[var(--radix-select-trigger-width)] overflow-hidden rounded border border-uf-border bg-uf-card text-sm text-uf-fg shadow-md"
          >
            <Select.Viewport className="p-1">
              {groups.map((group, gi) => (
                <Select.Group key={group.label ?? `group-${gi}`}>
                  {group.label ? (
                    <Select.Label className="uf-eyebrow block px-2 pb-1 pt-2 text-uf-muted">
                      {group.label}
                    </Select.Label>
                  ) : null}
                  {group.options.map((option) => (
                    <Select.Item
                      key={option.id}
                      value={option.id}
                      className="relative flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 pr-8 outline-none data-[highlighted]:bg-uf-accent/10 data-[state=checked]:text-uf-accent"
                    >
                      <span className="sr-only">
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </span>
                      <OptionRow option={option} />
                      <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
                        <Check size={14} aria-hidden />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Group>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
