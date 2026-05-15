// MenuPill for the scale machine. Mirrors the geometry kit's pattern:
// `label` doubles as aria-label + native `title` tooltip.

import type { ReactNode } from 'react';

interface MenuPillProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
}

export function MenuPill({ children, active, onClick, label }: MenuPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`relative flex h-12 w-12 items-center justify-center rounded-md border transition ${
        active
          ? 'border-uf-accent bg-uf-accent/15 text-uf-accent'
          : 'border-uf-fg/15 bg-transparent text-uf-fg hover:border-uf-accent/50'
      }`}
    >
      {children}
    </button>
  );
}
