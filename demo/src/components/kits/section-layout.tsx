// SectionLayout; the zone container every kit's sections compose into.
// Zones (in render order): header, intro, menu, widget, notes. Pure
// presentational; the section file (kits/<kit>/sections/<name>.tsx)
// decides what fills each zone. The widget slot conventionally
// receives a WidgetLayout that holds the live interaction surface
// alongside its code sample. The optional menu slot is for
// enumerative-machine sections (a row of pills that dispatch which
// shape / variant fills the widget below); when absent, the section
// renders flat with no menu strip.
//
// SectionHeader is a convenience helper for the standard look (eyebrow +
// optional kicker + title + optional icon). Sections that need a different
// header shape can pass their own ReactNode into headerZone.

import type { ReactNode } from 'react';

interface SectionLayoutProps {
  /**
   * Section title bar. Conventionally a `<SectionHeader>` carrying
   * `eyebrow`, `kicker?`, `title`, and `iconZone?` (the glyph). A
   * section can pass its own ReactNode here if it wants a header
   * shape outside the SectionHeader convention; that's rare.
   */
  headerZone: ReactNode;
  /**
   * Short paragraph describing what the section teaches. Plain
   * children: text, inline `<code>`, fragments. Rendered as a
   * single `<p>` with muted text-sm styling, so do not nest a
   * block element here. Two to four sentences is the sweet spot;
   * longer copy belongs in `notesZone` below the widget.
   */
  introZone: ReactNode;
  /**
   * Optional dispatch menu rendered between intro and widget. For
   * "machine"-shape sections that enumerate variants (the 2D Shape
   * Machine, the 3D Shape Machine), this is conventionally a row
   * of pills, each wrapping the active entry's `menuZone` content
   * (typically a small inline SVG). The pill's active state is the
   * caller's responsibility (a `.active` class, a `data-active`
   * attribute, etc.); SectionLayout does no styling here, just
   * placement. Absent for ordinary sections; render is identical to
   * pre-extension behavior when omitted.
   */
  menuZone?: ReactNode;
  /**
   * The live demo body. Conventionally a `<WidgetLayout>` pairing
   * the interaction surface with its templated code sample, but
   * any ReactNode is accepted (sections that don't have a code
   * sample can render a single column here).
   */
  widgetZone: ReactNode;
  /**
   * Optional footnote shown below the widget. Use for one-line
   * caveats, "note that…" asides, or links to deeper docs.
   * Rendered as a muted text-xs `<p>`; keep it inline-only.
   */
  notesZone?: ReactNode;
  /** Anchor id for deep-linking from outside the demo (e.g. README cross-links). */
  id?: string;
}

export function SectionLayout({
  headerZone,
  introZone,
  menuZone,
  widgetZone,
  notesZone,
  id,
}: SectionLayoutProps) {
  return (
    <section id={id} className="flex flex-col gap-5">
      {headerZone}
      <p className="max-w-2xl text-sm leading-relaxed text-uf-muted">{introZone}</p>
      {menuZone ? <div className="flex flex-wrap gap-2">{menuZone}</div> : null}
      {widgetZone}
      {notesZone ? (
        <p className="w-full text-xs leading-relaxed text-uf-muted text-right">{notesZone}</p>
      ) : null}
    </section>
  );
}

// WidgetLayout pairs the live interaction surface with its code
// sample side by side. The 2-column grid + the interaction-side
// card framing live here so SectionLayout stays vertical-stack
// only; sections compose this layout into the widgetZone slot.
interface WidgetLayoutProps {
  /**
   * The live interaction surface. Conventionally a vertical flex
   * column containing, top-to-bottom: input controls (UnitPicker,
   * Slider), then any "visualizer" subcomponent the section has
   * (extracted per the Named Organ criterion so the compiler can
   * memo it on primitive props), then readout rows (`<Result>`).
   * Inputs-at-top is the convention; sections whose visualizer is
   * the primary affordance (RAM stick, both shape machines) place
   * it above its slider, which is fine. Wrapped in a `uf-card` by
   * this layout; sections should not add their own card wrap.
   */
  interactionZone: ReactNode;
  /**
   * The code sample. Conventionally `<CodeBlock code={buildCode(...current
   * state...)} />` where `buildCode` is a pure function defined at
   * module scope in the same section file. Numeric comments in the
   * template should route through `formatMagnitude` from
   * `~/lib/format.ts` so they render as plain decimals (no
   * scientific notation). CodeBlock applies `useDeferredValue`
   * internally, so passing a fresh string per render is safe under
   * high-cadence drag updates.
   */
  codeZone: ReactNode;
}

export function WidgetLayout({ interactionZone, codeZone }: WidgetLayoutProps) {
  return (
    <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
      <div className="uf-card relative overflow-hidden rounded-lg p-5">{interactionZone}</div>
      {codeZone}
    </div>
  );
}

interface SectionHeaderProps {
  /** Tiny uppercase-tracked tag above the title. "demo 02", "kit · 03", "build your own kit". */
  eyebrow: string;
  /** Section title. Rendered as `<h2>` in display font. */
  title: string;
  /** Optional accent-colored sibling to the eyebrow ("within-dimension", "cross-dimensional", "flair"). */
  kicker?: string;
  /**
   * The section glyph, rendered to the left of the title. Conventionally
   * a lucide-react icon at `size={28} strokeWidth={1.5}` with
   * `className="text-uf-accent"`. Any inline-flow ReactNode works
   * (emoji, custom svg) so long as it fits next to an h2.
   */
  iconZone?: ReactNode;
}

export function SectionHeader({ eyebrow, title, kicker, iconZone }: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <span className="uf-eyebrow">{eyebrow}</span>
        {kicker ? <span className="uf-eyebrow text-uf-accent">{kicker}</span> : null}
      </div>
      <h2 className="display flex items-center gap-3 text-3xl font-bold leading-tight md:text-4xl">
        {iconZone}
        {title}
      </h2>
    </header>
  );
}
