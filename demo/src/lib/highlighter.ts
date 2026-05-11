// Shared shiki/core singleton. Multiple themes are supported; each is
// lazy-loaded the first time it's requested so the bundle weight scales
// with what's actually used.
//
// To add a new theme, drop it in THEME_LOADERS and reference it by name
// from a kit page's <KitThemeProvider>.

interface Highlighter {
  codeToHtml: (
    code: string,
    opts: { lang: string; theme: string },
  ) => string;
  loadTheme: (mod: unknown) => Promise<void>;
  getLoadedThemes: () => string[];
}

const THEME_LOADERS: Record<string, () => Promise<unknown>> = {
  'github-dark': () => import('shiki/themes/github-dark.mjs'),
  'github-light': () => import('shiki/themes/github-light.mjs'),
  'vitesse-light': () => import('shiki/themes/vitesse-light.mjs'),
  'synthwave-84': () => import('shiki/themes/synthwave-84.mjs'),
};

let highlighterPromise: Promise<Highlighter> | null = null;
const loadedThemes = new Set<string>();
const htmlCache = new Map<string, string>();

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const [{ createHighlighterCore }, { createOnigurumaEngine }] = await Promise.all([
        import('shiki/core'),
        import('shiki/engine/oniguruma'),
      ]);
      const h = await createHighlighterCore({
        themes: [],
        langs: [
          import('shiki/langs/typescript.mjs'),
          import('shiki/langs/tsx.mjs'),
          import('shiki/langs/javascript.mjs'),
        ],
        engine: createOnigurumaEngine(import('shiki/wasm')),
      });
      return h as unknown as Highlighter;
    })();
  }
  return highlighterPromise;
}

async function ensureTheme(theme: string): Promise<void> {
  if (loadedThemes.has(theme)) return;
  const loader = THEME_LOADERS[theme];
  if (!loader) {
    throw new Error(
      `Unknown shiki theme: '${theme}'. Add it to THEME_LOADERS in lib/highlighter.ts.`,
    );
  }
  const [h, mod] = await Promise.all([getHighlighter(), loader()]);
  if (!h.getLoadedThemes().includes(theme)) {
    await h.loadTheme(mod);
  }
  loadedThemes.add(theme);
}

export async function highlight(
  code: string,
  lang: 'ts' | 'tsx' | 'js' = 'ts',
  theme = 'github-dark',
): Promise<string> {
  const key = `${theme}::${lang}::${code}`;
  const cached = htmlCache.get(key);
  if (cached) return cached;
  await ensureTheme(theme);
  const h = await getHighlighter();
  const rendered = h.codeToHtml(code, { lang, theme });
  htmlCache.set(key, rendered);
  return rendered;
}

export function cachedHighlight(
  code: string,
  lang: 'ts' | 'tsx' | 'js' = 'ts',
  theme = 'github-dark',
): string | undefined {
  return htmlCache.get(`${theme}::${lang}::${code}`);
}
