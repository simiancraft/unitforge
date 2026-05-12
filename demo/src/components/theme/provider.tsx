// ThemeProvider — root-level provider that owns the active theme and
// orchestrates its side effects (data-theme cascade on <html>, persistence
// in localStorage). Recipes carry the rest (shiki theme name, frame
// chrome class, future: fonts/icons/music).
//
// Consumers call useTheme() to read the active recipe; route shells call
// setThemeForKit(kit, fallback) on mount to honor per-kit persistence
// before any toggle UI mounts. Toggles call setTheme(id) directly.
//
// Per-kit persistence shape in localStorage:
//   "unitforge.themes" -> JSON { [kitId]: themeId }
// Each kit remembers the user's last selection independently, so a user
// who flipped geometry to dark keeps that choice even after visiting
// other kits.
//
// Kit CSS files load transitively: each kit's index.tsx imports its own
// CSS, and the kit registry imports every kit's index for the meta
// export. So importing the registry side-effects every kit's CSS into
// the bundle; the [data-theme='<id>'] cascade resolves regardless of
// which theme is active. Adding a kit needs no edits here.

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { findTheme, type KitId, THEMES, type ThemeId, type ThemeRecipe } from './recipes.js';
// Pull the kit registry as a side effect so every kit's index.tsx (and
// therefore its CSS) is in the module graph by the time the provider
// mounts. The registry itself isn't consumed here.
import '../kits/registry.js';

const STORAGE_KEY = 'unitforge.themes';

interface ThemeContextValue {
  activeTheme: ThemeRecipe;
  /** Set the active theme directly; persists per-kit. */
  setTheme: (id: ThemeId) => void;
  /**
   * Activate the user's last-selected theme for this kit (from
   * localStorage), falling back to `fallback` if none is stored. Route
   * shells call this on mount so navigation respects user preferences.
   */
  setThemeForKit: (kit: KitId, fallback: ThemeId) => void;
}

const Ctx = createContext<ThemeContextValue | null>(null);

function readStorage(): Partial<Record<KitId, ThemeId>> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') {
      return parsed as Partial<Record<KitId, ThemeId>>;
    }
  } catch {
    // SSR / locked-down storage; ignore.
  }
  return {};
}

function writeStorage(next: Partial<Record<KitId, ThemeId>>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota / locked-down storage; ignore.
  }
}

interface ThemeProviderProps {
  /** Default theme to activate before any route shell calls setThemeForKit. */
  initialThemeId: ThemeId;
  children: ReactNode;
}

export function ThemeProvider({ initialThemeId, children }: ThemeProviderProps) {
  const [activeId, setActiveId] = useState<ThemeId>(initialThemeId);
  const activeTheme = THEMES[activeId];

  // data-theme cascade on <html> so body.background var resolves and
  // paints the viewport beyond the route container.
  useEffect(() => {
    document.documentElement.dataset.theme = activeTheme.id;
  }, [activeTheme.id]);

  // React Compiler v1 auto-memoizes these; no manual useCallback needed.
  const setTheme = (id: ThemeId) => {
    const recipe = findTheme(id);
    if (!recipe) return;
    setActiveId(id);
    const current = readStorage();
    writeStorage({ ...current, [recipe.kit]: id });
  };

  const setThemeForKit = (kit: KitId, fallback: ThemeId) => {
    const stored = readStorage()[kit];
    const next = stored && findTheme(stored) ? stored : fallback;
    setActiveId(next);
  };

  return <Ctx.Provider value={{ activeTheme, setTheme, setThemeForKit }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeContextValue {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useTheme called outside <ThemeProvider>; wrap the app root.');
  }
  return v;
}

/**
 * Resolve the initial theme to activate for a given kit on first paint,
 * honoring localStorage so the user's last choice wins without flashing
 * the default first. Callers (App.tsx today) pass this into
 * <ThemeProvider initialThemeId={...}/> as the first-render value.
 *
 * Lives outside the provider so App.tsx can compute it before mounting
 * the provider tree.
 */
export function resolveInitialThemeId(kit: KitId, fallback: ThemeId): ThemeId {
  const stored = readStorage()[kit];
  if (stored && findTheme(stored)) return stored;
  return fallback;
}
