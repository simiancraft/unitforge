// MenuPill for the 3D shape machine. Identical shape to the 2D one;
// kept local for now (per plan; if 2D's stays identical we may elevate
// to a shared part later).

import type { ReactNode } from 'react';

interface MenuPillProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
}

export function MenuPill({ children, active, onClick, ariaLabel }: MenuPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
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
