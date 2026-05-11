// Shared anatomy for every demo on a kit page:
//   eyebrow + title + kicker header (mono, themed)
//   intro paragraph: how to use it, what it does
//   widget slot (interactive)
//   code block: the unitforge snippet that powers the widget
//   optional notes paragraph: why it's cool / non-obvious detail
//
// The component is composition-only. The actual widget and code text are
// passed in as props/children so each demo can be its own focused module.

import type { ReactNode } from 'react';
import { CodeBlock } from './CodeBlock.js';

interface DemoSectionProps {
  eyebrow: string;
  title: string;
  kicker?: string;
  intro: ReactNode;
  widget: ReactNode;
  code: string;
  notes?: ReactNode;
  /** Optional Lucide icon next to the title. */
  icon?: ReactNode;
}

export function DemoSection({
  eyebrow,
  title,
  kicker,
  intro,
  widget,
  code,
  notes,
  icon,
}: DemoSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="uf-eyebrow">{eyebrow}</span>
          {kicker && <span className="uf-eyebrow" style={{ color: 'var(--uf-accent)' }}>{kicker}</span>}
        </div>
        <h2
          className="display flex items-center gap-3 text-3xl font-bold leading-tight md:text-4xl"
        >
          {icon}
          {title}
        </h2>
      </header>

      <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
        {intro}
      </p>

      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
        <div className="uf-card relative overflow-hidden rounded-lg p-5">
          {widget}
        </div>
        <CodeBlock code={code} />
      </div>

      {notes && (
        <p className="max-w-2xl text-xs leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
          {notes}
        </p>
      )}
    </section>
  );
}
