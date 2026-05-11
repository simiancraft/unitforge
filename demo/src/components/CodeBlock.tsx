// Lazy shiki-highlighted code block with copy-to-clipboard. Scrollbar
// styled via `.uf-code-scroll` (thin, theme-aware, only visible when
// overflow exists). Falls back to plain <pre> until shiki resolves.

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
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
      .catch(() => {});
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
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
        <CopyButton code={code} />
        <span className="uf-eyebrow" style={{ color: 'var(--uf-muted)' }}>
          unitforge
        </span>
      </div>
      {html ? (
        <div
          className="uf-code-scroll px-4 py-4 [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!whitespace-pre"
          // shiki output is generated from string literals we author; not user-controlled.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          className="uf-code-scroll mono m-0 px-4 py-4 text-xs"
          style={{ color: 'var(--uf-fg)' }}
        >
          {code}
        </pre>
      )}
    </div>
  );
}

export function CopyButton({ code, label = 'copy' }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Older / locked-down environments; silently no-op.
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? 'copied' : label}
      className="flex items-center gap-1 rounded border px-2 py-1 text-[10px] uppercase tracking-wider transition-opacity"
      style={{
        background: 'var(--uf-card)',
        color: copied ? 'var(--uf-accent)' : 'var(--uf-fg)',
        borderColor: 'var(--uf-border)',
        opacity: 0.85,
      }}
    >
      {copied ? <Check size={12} strokeWidth={2.2} /> : <Copy size={12} strokeWidth={2.2} />}
      {copied ? 'copied' : label}
    </button>
  );
}
