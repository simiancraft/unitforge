// MenuPill for the 3D shape machine. Identical shape to the 2D one;
// kept local for now (per plan; if 2D's stays identical we may elevate
// to a shared part later).

import type { ReactNode } from 'react';

interface MenuPillProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  /**
   * Human-readable name of this menu item. Used both as the screen-reader
   * label and the native `title` tooltip on hover.
   */
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
