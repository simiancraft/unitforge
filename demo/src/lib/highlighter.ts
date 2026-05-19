// Shared shiki/core singleton. Multiple themes are supported; each is
// lazy-loaded the first time it's requested so the bundle weight scales
// with what's actually used.
//
// To add a new theme, drop it in THEME_LOADERS and reference it by name
// from a recipe in components/theme/recipes.ts.

interface Highlighter {
  codeToHtml: (code: string, opts: { lang: string; theme: string }) => string;
  loadTheme: (mod: unknown) => Promise<void>;
  getLoadedThemes: () => string[];
}

const THEME_LOADERS: Record<string, () => Promise<unknown>> = {
  'github-dark': () => import('shiki/themes/github-dark.mjs'),
  'github-light': () => import('shiki/themes/github-light.mjs'),
  'vitesse-light': () => import('shiki/themes/vitesse-light.mjs'),
  'vitesse-dark': () => import('shiki/themes/vitesse-dark.mjs'),
  'synthwave-84': () => import('shiki/themes/synthwave-84.mjs'),
  'light-plus': () => import('shiki/themes/light-plus.mjs'),
  'rose-pine-dawn': () => import('shiki/themes/rose-pine-dawn.mjs'),
  monokai: () => import('shiki/themes/monokai.mjs'),
  'solarized-light': () => import('shiki/themes/solarized-light.mjs'),
  'tokyo-night': () => import('shiki/themes/tokyo-night.mjs'),
};

let highlighterPromise: Promise<Highlighter> | null = null;
const loadedThemes = new Set<string>();
// Bounded so a long session of slider drags can't accumulate ~MB of
// stale rendered HTML. JS Map preserves insertion order, so popping the
// first key on overflow gives a cheap FIFO with no extra bookkeeping.
// 500 covers every kit's bench drag range × every theme × the live
// code templates with headroom.
const HTML_CACHE_MAX = 500;
const htmlCache = new Map<string, string>();

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const [{ createHighlighterCore }, { createOnigurumaEngine }] = await Promise.all([
        import('shiki/core'),
        import('shiki/engine/oniguruma'),
      ]);
      // Demo snippets are all TypeScript today; the tsx/javascript grammars
      // are heavy (~175 KB each gzipped) and unused. Add them back when a
      // section ships a JSX or vanilla-JS sample.
      const h = await createHighlighterCore({
        themes: [],
        langs: [import('shiki/langs/typescript.mjs')],
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
  if (htmlCache.size >= HTML_CACHE_MAX) {
    const oldest = htmlCache.keys().next().value;
    if (oldest !== undefined) htmlCache.delete(oldest);
  }
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
