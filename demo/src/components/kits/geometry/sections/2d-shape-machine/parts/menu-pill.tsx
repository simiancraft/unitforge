// MenuPill; the button-shaped wrapper around a shape's `menuZone` icon.
// The chassis maps over its shape registry and wraps each shape's
// menuZone with one of these. The pill owns the active styling so
// individual shape menuZones don't have to know they're inside a menu.

import type { ReactNode } from 'react';

interface MenuPillProps {
  /**
   * The shape's `menuZone` ReactNode. Conventionally a small inline SVG
   * (square outline, circle outline, triangle outline) sized to fit a
   * 48px button cell; the icon's stroke / fill inherits from the pill's
   * `currentColor` so the active state can recolor it without the icon
   * having to re-render.
   */
  children: ReactNode;
  /** Whether this pill is the currently-selected shape in the chassis. */
  active: boolean;
  /** Click handler the chassis wires up to set this shape's id active. */
  onClick: () => void;
  /**
   * Human-readable name of this menu item ("rectangle", "circle"). Used
   * both as the screen-reader label and the native `title` tooltip on
   * hover; one string, double duty. Keep short — a one or two-word noun.
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
