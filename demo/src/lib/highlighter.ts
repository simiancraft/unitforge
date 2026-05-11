// Shared shiki/core singleton. CodeBlock and ForgeBench both highlight
// the same TS/TSX/JS code; we share one lazy import + one wasm instance
// across them.

interface Highlighter {
  codeToHtml: (code: string, opts: { lang: string; theme: string }) => string;
}

let highlighterPromise: Promise<Highlighter> | null = null;
const htmlCache = new Map<string, string>();

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const [{ createHighlighterCore }, { createOnigurumaEngine }] = await Promise.all([
        import('shiki/core'),
        import('shiki/engine/oniguruma'),
      ]);
      const h = await createHighlighterCore({
        themes: [import('shiki/themes/github-dark.mjs')],
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

export async function highlight(code: string, lang: 'ts' | 'tsx' | 'js' = 'ts'): Promise<string> {
  const key = `${lang}::${code}`;
  const cached = htmlCache.get(key);
  if (cached) return cached;
  const h = await getHighlighter();
  const rendered = h.codeToHtml(code, { lang, theme: 'github-dark' });
  htmlCache.set(key, rendered);
  return rendered;
}

export function cachedHighlight(code: string, lang: 'ts' | 'tsx' | 'js' = 'ts'): string | undefined {
  return htmlCache.get(`${lang}::${code}`);
}
