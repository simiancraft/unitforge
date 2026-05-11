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

export type ThemeVariant = 'dark' | 'light';

// ThemeId is derived from KitId + variant so adding a kit can't drift
// the union. The completeness check on THEMES below enforces that every
// kit ships both variants.
export type ThemeId = `${KitId}-${ThemeVariant}`;

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

export const THEMES: Record<ThemeId, ThemeRecipe> = {
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
};

export function findTheme(id: string): ThemeRecipe | undefined {
  return THEMES[id as ThemeId];
}

// Precomputed once at module init: every kit's light/dark pair. The
// completeness of this map is enforced by ThemeId's template-literal
// derivation + the THEMES type annotation above.
const PAIRS_BY_KIT: Record<KitId, { light: ThemeId; dark: ThemeId }> = (() => {
  const map = {} as Record<KitId, { light: ThemeId; dark: ThemeId }>;
  for (const recipe of Object.values(THEMES)) {
    const slot = map[recipe.kit] ?? { light: 'forge-light', dark: 'forge-dark' };
    slot[recipe.variant] = recipe.id;
    map[recipe.kit] = slot;
  }
  return map;
})();

/** Pair of theme ids that belong to the same kit, surfaced for the toggle. */
export function pairForKit(kit: KitId): { light: ThemeId; dark: ThemeId } {
  return PAIRS_BY_KIT[kit];
}
