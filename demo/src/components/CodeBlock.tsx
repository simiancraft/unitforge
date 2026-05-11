// Lazy shiki-highlighted code block with copy-to-clipboard. Scrollbar
// styled via `.uf-code-scroll` (thin, theme-aware, only visible when
// overflow exists). Falls back to plain <pre> until shiki resolves.

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useKitTheme } from './KitTheme.js';
import { cachedHighlight, highlight } from '../lib/highlighter.js';

type Lang = 'ts' | 'tsx' | 'js';

interface CodeBlockProps {
  code: string;
  lang?: Lang;
  /** Optional extra classes (e.g. `min-h-[350px]` to align grid heights). */
  className?: string;
}

export function CodeBlock({ code, lang = 'ts', className = '' }: CodeBlockProps) {
  const { shikiTheme, codeFrameClass } = useKitTheme();
  const [html, setHtml] = useState<string | null>(
    cachedHighlight(code, lang, shikiTheme) ?? null,
  );

  useEffect(() => {
    setHtml(cachedHighlight(code, lang, shikiTheme) ?? null);
    let cancelled = false;
    highlight(code, lang, shikiTheme)
      .then((rendered) => {
        if (!cancelled) setHtml(rendered);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code, lang, shikiTheme]);

  return (
    <div
      role="region"
      aria-label="code sample"
      className={`relative overflow-hidden rounded-lg text-xs leading-relaxed ${codeFrameClass ?? ''} ${className}`}
      style={{
        background: 'var(--uf-code-bg)',
        border: '1px solid var(--uf-border)',
      }}
    >
      <span
        className="uf-eyebrow absolute right-2 top-2 z-10"
        style={{ color: 'var(--uf-muted)' }}
      >
        unitforge
      </span>
      <div className="absolute bottom-0.5 right-0.5 z-10">
        <CopyButton code={code} />
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
      title={copied ? 'copied' : label}
      aria-label={copied ? 'copied' : label}
      className="flex h-7 w-7 items-center justify-center rounded border transition-opacity hover:opacity-100"
      style={{
        background: 'var(--uf-card)',
        color: copied ? 'var(--uf-accent)' : 'var(--uf-fg)',
        borderColor: 'var(--uf-border)',
        opacity: 0.7,
      }}
    >
      {copied ? <Check size={14} strokeWidth={2.2} /> : <Copy size={14} strokeWidth={2.2} />}
    </button>
  );
}
