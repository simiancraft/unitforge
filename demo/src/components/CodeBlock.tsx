// Lazy shiki-highlighted code block with copy-to-clipboard. Scrollbar
// styled via `.uf-code-scroll` (thin, theme-aware, only visible when
// overflow exists). Falls back to plain <pre> until shiki resolves.

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTheme } from './theme/provider.js';
import { useHighlighted } from './theme/use-highlighted.js';
import { cn } from '~/lib/cn.js';

type Lang = 'ts' | 'tsx' | 'js';

interface CodeBlockProps {
  code: string;
  lang?: Lang;
  /** Optional extra classes (e.g. `min-h-[350px]` to align grid heights). */
  className?: string;
}

export function CodeBlock({ code, lang = 'ts', className }: CodeBlockProps) {
  const { activeTheme } = useTheme();
  const html = useHighlighted(code, lang, activeTheme.shikiTheme);
  const codeFrameClass = activeTheme.codeFrameClass;

  return (
    <div
      role="region"
      aria-label="code sample"
      className={cn(
        'relative overflow-hidden rounded-lg border border-uf-border bg-uf-code-bg text-xs leading-relaxed',
        codeFrameClass,
        className,
      )}
    >
      <span className="uf-eyebrow absolute right-2 top-2 z-10 text-uf-muted">unitforge</span>
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
        <pre className="uf-code-scroll mono m-0 px-4 py-4 text-xs text-uf-fg">{code}</pre>
      )}
    </div>
  );
}

/**
 * Compact inline variant of CodeBlock — no "unitforge" eyebrow, tighter
 * padding, mono. Used by Bench and ForgeBench to render the live forge()
 * call beneath their controls.
 */
export function CodeLine({ code, lang = 'ts' }: { code: string; lang?: Lang }) {
  const { activeTheme } = useTheme();
  const html = useHighlighted(code, lang, activeTheme.shikiTheme);
  const codeFrameClass = activeTheme.codeFrameClass;
  return (
    <div
      className={cn(
        'relative mono overflow-hidden rounded border border-uf-border bg-uf-code-bg text-xs',
        codeFrameClass,
      )}
    >
      <div className="absolute bottom-0.5 right-0.5 z-10">
        <CopyButton code={code} />
      </div>
      {html ? (
        <div
          className="uf-code-scroll px-3 py-2 pr-12 [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!whitespace-pre"
          // shiki output is generated from string literals we author; not user-controlled.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="uf-code-scroll m-0 px-3 py-2 pr-12 text-uf-fg">{code}</pre>
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
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded border border-uf-border bg-uf-card opacity-70 transition-opacity hover:opacity-100',
        copied ? 'text-uf-accent' : 'text-uf-fg',
      )}
    >
      {copied ? <Check size={14} strokeWidth={2.2} /> : <Copy size={14} strokeWidth={2.2} />}
    </button>
  );
}
