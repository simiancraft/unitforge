// Lazy shiki-highlighted code block. Delegates the highlighter setup +
// (code, lang) result cache to `lib/highlighter.ts` so other surfaces
// (the ForgeBench live code line) can share the same wasm + grammar
// instance. Falls back to plain <pre> until shiki resolves.

import { useEffect, useState } from 'react';
import { cachedHighlight, highlight } from '../lib/highlighter.js';

type Lang = 'ts' | 'tsx' | 'js';

interface CodeBlockProps {
  code: string;
  lang?: Lang;
}

export function CodeBlock({ code, lang = 'ts' }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(cachedHighlight(code, lang) ?? null);

  useEffect(() => {
    if (html !== null) return;
    let cancelled = false;
    highlight(code, lang)
      .then((rendered) => {
        if (!cancelled) setHtml(rendered);
      })
      .catch(() => {
        // Silent fallback; raw code already renders in <pre>.
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang, html]);

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
