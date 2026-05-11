// Lazy-loaded shiki-highlighted code block. Uses the fine-grained
// `shiki/core` API so we only ship the wasm engine + ts/tsx/js grammars,
// not the full bundled-language catalogue. A module-level Map caches
// `codeToHtml` output keyed by `(code, lang)` so identical snippets
// rendered on multiple pages don't re-run the highlighter on each mount.
//
// Until the highlighter resolves, raw code renders in <pre> so the
// section reads correctly even before the JS chunk arrives.

import { useEffect, useState } from 'react';

type Lang = 'ts' | 'tsx' | 'js';

interface CodeBlockProps {
  code: string;
  lang?: Lang;
}

interface Highlighter {
  codeToHtml: (code: string, opts: { lang: string; theme: string }) => string;
}

let highlighterPromise: Promise<Highlighter> | null = null;
const htmlCache = new Map<string, string>();

async function getHighlighter(): Promise<Highlighter> {
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

export function CodeBlock({ code, lang = 'ts' }: CodeBlockProps) {
  const cacheKey = `${lang}::${code}`;
  const [html, setHtml] = useState<string | null>(htmlCache.get(cacheKey) ?? null);

  useEffect(() => {
    if (html !== null) return;
    let cancelled = false;
    getHighlighter()
      .then((h) => {
        if (cancelled) return;
        const rendered = h.codeToHtml(code, { lang, theme: 'github-dark' });
        htmlCache.set(cacheKey, rendered);
        setHtml(rendered);
      })
      .catch(() => {
        // Silent fallback to <pre>; raw code is already legible.
      });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, code, html, lang]);

  return (
    <div
      role="region"
      aria-label="code sample"
      className="relative overflow-hidden rounded-lg text-xs leading-relaxed"
      style={{
        background: 'var(--uf-code-bg)',
        border: '1px solid var(--uf-border)',
      }}
    >
      <div
        className="uf-eyebrow absolute right-3 top-2 z-10"
        style={{ color: 'var(--uf-muted)' }}
      >
        unitforge
      </div>
      {html ? (
        <div
          className="px-4 py-4 [&_pre]:!bg-transparent [&_pre]:overflow-x-auto"
          // shiki output is generated from string literals we author; not user-controlled.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="mono overflow-x-auto px-4 py-4 text-xs" style={{ color: 'var(--uf-fg)' }}>
          {code}
        </pre>
      )}
    </div>
  );
}
