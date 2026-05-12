// Lazy shiki-highlighted code block with copy-to-clipboard. Scrollbar
// styled via `.uf-code-scroll` (thin, theme-aware, only visible when
// overflow exists). Falls back to plain <pre> until shiki resolves.
//
// Two variants via cva:
//   - 'block' (default): cards on section pages, with the "unitforge"
//     eyebrow corner badge
//   - 'inline': compact bench code line, no badge, tighter padding

import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Copy } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { cn } from '~/lib/cn.js';
import { useTheme } from './theme/provider.js';
import { useHighlighted } from './theme/use-highlighted.js';

type Lang = 'ts' | 'tsx' | 'js';

const codeFrame = cva(
  'relative overflow-hidden rounded-lg border border-uf-border bg-uf-code-bg text-xs',
  {
    variants: {
      variant: {
        block: 'leading-relaxed',
        inline: 'mono rounded text-xs',
      },
    },
    defaultVariants: { variant: 'block' },
  },
);

const codeInner = cva(
  'uf-code-scroll [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!whitespace-pre',
  {
    variants: {
      variant: {
        block: 'px-4 py-4',
        inline: 'px-3 py-2 pr-12',
      },
    },
    defaultVariants: { variant: 'block' },
  },
);

interface CodeBlockProps extends VariantProps<typeof codeFrame> {
  code: string;
  lang?: Lang;
  /** Optional extra classes (e.g. `min-h-[350px]` to align grid heights). */
  className?: string;
}

export function CodeBlock({ code, lang = 'ts', variant = 'block', className }: CodeBlockProps) {
  const { activeTheme } = useTheme();
  // Demos that template CODE from drag state push a fresh string on
  // every pointer frame; deferring the value lets React skip running
  // the (async) shiki pass on intermediate updates and keep painting
  // the previous highlight until the latest one resolves.
  const deferredCode = useDeferredValue(code);
  const html = useHighlighted(deferredCode, lang, activeTheme.shikiTheme);
  const codeFrameClass = activeTheme.codeFrameClass;

  const inner = (
    <>
      <div className="absolute bottom-0.5 right-0.5 z-10">
        <CopyButton code={code} />
      </div>
      {html ? (
        <div
          className={codeInner({ variant })}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is generated from string literals we author; not user-controlled.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className={cn(codeInner({ variant }), 'mono m-0 text-uf-fg')}>{code}</pre>
      )}
    </>
  );

  if (variant === 'block') {
    return (
      <section
        aria-label="code sample"
        className={cn(codeFrame({ variant }), codeFrameClass, className)}
      >
        <span className="uf-eyebrow absolute right-2 top-2 z-10 text-uf-muted">unitforge</span>
        {inner}
      </section>
    );
  }

  return <div className={cn(codeFrame({ variant }), codeFrameClass, className)}>{inner}</div>;
}

/** Back-compat alias; `CodeLine` is `CodeBlock variant="inline"`. */
export function CodeLine({ code, lang = 'ts' }: { code: string; lang?: Lang }) {
  return <CodeBlock code={code} lang={lang} variant="inline" />;
}

export function CopyButton({ code, label = 'copy' }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  // React Compiler doesn't lower try/catch in hook bodies; promise-form
  // .then(success, error) keeps the compiler happy and is equivalent.
  const onClick = () => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      },
      () => {
        // Older / locked-down environments; silently no-op.
      },
    );
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
