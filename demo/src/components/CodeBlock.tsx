// Lazy-loaded shiki-highlighted code block. The shiki module + a single
// grammar weighs ~150 KB; we keep it out of the initial bundle by importing
// the highlighter on mount, then rendering the HTML it emits. Until the
// highlighter resolves, the raw code renders in <pre> as a fallback so the
// section reads correctly even on slow connections.

import { useEffect, useState } from 'react';

interface CodeBlockProps {
  code: string;
  lang?: 'ts' | 'tsx' | 'js';
}

let highlighterPromise: Promise<{
  codeToHtml: (code: string, opts: { lang: string; theme: string }) => string;
}> | null = null;

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then((shiki) =>
      shiki.createHighlighter({
        themes: ['github-dark'],
        langs: ['ts', 'tsx', 'js'],
      }),
    );
  }
  return highlighterPromise;
}

export function CodeBlock({ code, lang = 'ts' }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((h) => {
        if (cancelled) return;
        const rendered = h.codeToHtml(code, { lang, theme: 'github-dark' });
        setHtml(rendered);
      })
      .catch(() => {
        // Silent fallback to <pre>; the raw code is already legible.
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  return (
    <div
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
          // shiki HTML output is trusted-static (we generate it from a string
          // we author in our own source); this is not user-controlled input.
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
