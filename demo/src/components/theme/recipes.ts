// Theme registry — the single source of truth for every visual recipe.
// Each recipe coordinates the resources a theme needs (CSS variable
// cascade via data-theme, shiki theme for code blocks, optional code-
// frame chrome class). The ThemeProvider activates a recipe by id; every
// downstream consumer reads via useTheme().
//
// Adding a kit variant: drop a `[data-theme='<kit>-<variant>']` block in
// the kit's CSS file, then append a recipe here. The provider, toggle,
// and code blocks pick it up with no further changes.

export type KitId = 'forge' | 'geometry' | 'data-storage';

export type ThemeId =
  | 'forge-dark'
  | 'forge-light'
  | 'geometry-dark'
  | 'geometry-light'
  | 'data-storage-dark'
  | 'data-storage-light';

export type ThemeVariant = 'dark' | 'light';

export interface ThemeRecipe {
  /** Used both as the data-theme attribute value and as the registry key. */
  id: ThemeId;
  /** Which kit this recipe belongs to. */
  kit: KitId;
  /** Light or dark; used by the toggle UI to pair recipes. */
  variant: ThemeVariant;
  /** Shiki theme name; must be present in THEME_LOADERS (lib/highlighter.ts). */
  shikiTheme: string;
  /** Optional class applied to code-block frames (e.g. CRT scanlines on data-storage-dark). */
  codeFrameClass?: string;
}

export const THEMES = {
  'forge-dark': {
    id: 'forge-dark',
    kit: 'forge',
    variant: 'dark',
    shikiTheme: 'github-dark',
  },
  'forge-light': {
    id: 'forge-light',
    kit: 'forge',
    variant: 'light',
    shikiTheme: 'github-light',
  },
  'geometry-light': {
    id: 'geometry-light',
    kit: 'geometry',
    variant: 'light',
    shikiTheme: 'vitesse-light',
  },
  'geometry-dark': {
    id: 'geometry-dark',
    kit: 'geometry',
    variant: 'dark',
    shikiTheme: 'vitesse-dark',
  },
  'data-storage-dark': {
    id: 'data-storage-dark',
    kit: 'data-storage',
    variant: 'dark',
    shikiTheme: 'synthwave-84',
    codeFrameClass: 'uf-code-crt',
  },
  'data-storage-light': {
    id: 'data-storage-light',
    kit: 'data-storage',
    variant: 'light',
    shikiTheme: 'light-plus',
  },
} as const satisfies Record<ThemeId, ThemeRecipe>;

export function findTheme(id: string): ThemeRecipe | undefined {
  return (THEMES as Record<string, ThemeRecipe>)[id];
}

/**
 * Pair of theme ids that belong to the same kit, surfaced for the toggle.
 * Returns null if the recipe's kit doesn't have both variants registered
 * (it always does today; null is the "graceful future" path).
 */
export function pairForKit(kit: KitId): { light: ThemeId; dark: ThemeId } | null {
  const light = (Object.values(THEMES) as ThemeRecipe[]).find(
    (t) => t.kit === kit && t.variant === 'light',
  );
  const dark = (Object.values(THEMES) as ThemeRecipe[]).find(
    (t) => t.kit === kit && t.variant === 'dark',
  );
  if (!light || !dark) return null;
  return { light: light.id, dark: dark.id };
}
