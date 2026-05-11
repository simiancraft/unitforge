// SectionLayout — the zone container every kit's sections compose into.
// Zones (in render order): header, intro, widget, code, notes. Pure
// presentational; the section file (kits/<kit>/sections/<name>.tsx) decides
// what fills each zone.
//
// SectionHeader is a convenience helper for the standard look (eyebrow +
// optional kicker + title + optional icon). Sections that need a different
// header shape can pass their own ReactNode into headerZone.

import type { ReactNode } from 'react';

interface SectionLayoutProps {
  headerZone: ReactNode;
  introZone: ReactNode;
  widgetZone: ReactNode;
  codeZone: ReactNode;
  notesZone?: ReactNode;
}

export function SectionLayout({
  headerZone,
  introZone,
  widgetZone,
  codeZone,
  notesZone,
}: SectionLayoutProps) {
  return (
    <section className="flex flex-col gap-5">
      {headerZone}
      <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
        {introZone}
      </p>
      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
        <div className="uf-card relative overflow-hidden rounded-lg p-5">{widgetZone}</div>
        {codeZone}
      </div>
      {notesZone ? (
        <p className="max-w-2xl text-xs leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
          {notesZone}
        </p>
      ) : null}
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  kicker?: string;
  icon?: ReactNode;
}

export function SectionHeader({ eyebrow, title, kicker, icon }: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <span className="uf-eyebrow">{eyebrow}</span>
        {kicker ? (
          <span className="uf-eyebrow" style={{ color: 'var(--uf-accent)' }}>
            {kicker}
          </span>
        ) : null}
      </div>
      <h2 className="display flex items-center gap-3 text-3xl font-bold leading-tight md:text-4xl">
        {icon}
        {title}
      </h2>
    </header>
  );
}
