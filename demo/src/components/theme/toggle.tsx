// ThemeToggle — fixed top-right sun/moon button that flips between two
// theme variants for the currently active kit. Three props: lightThemeId,
// darkThemeId, defaultThemeId. Click swaps; mount normalizes if the
// active theme isn't one of the toggle's options (covers misconfiguration
// or stale storage).
//
// The toggle is dumb plumbing: it doesn't know about routes. The caller
// (App.tsx today; a per-route shell file tomorrow) passes the pair that
// belongs to the visible kit.

import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './provider.js';
import type { ThemeId } from './recipes.js';

interface ThemeToggleProps {
  light: ThemeId;
  dark: ThemeId;
  /** Theme to activate on mount if the active theme isn't one of light/dark. */
  defaultTheme: ThemeId;
}

export function ThemeToggle({ light, dark, defaultTheme }: ThemeToggleProps) {
  const { activeTheme, setTheme } = useTheme();

  // Belt-and-suspenders: if the active theme isn't one of this toggle's
  // variants, normalize to the toggle's default. App.tsx's setThemeForKit
  // covers the common path; this protects against stale storage or
  // deep-link edge cases.
  useEffect(() => {
    if (activeTheme.id !== light && activeTheme.id !== dark) {
      setTheme(defaultTheme);
    }
  }, [activeTheme.id, light, dark, defaultTheme, setTheme]);

  const isLight = activeTheme.id === light;
  const nextId = isLight ? dark : light;
  const Icon = isLight ? Moon : Sun;
  const nextLabel = isLight ? 'dark' : 'light';

  return (
    <button
      type="button"
      onClick={() => setTheme(nextId)}
      aria-label={`switch to ${nextLabel} theme`}
      title={`switch to ${nextLabel}`}
      className="fixed top-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:opacity-100"
      style={{
        background: 'var(--uf-card)',
        borderColor: 'var(--uf-border)',
        color: 'var(--uf-fg)',
        opacity: 0.85,
      }}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
}
