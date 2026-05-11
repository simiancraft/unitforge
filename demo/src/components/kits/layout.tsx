// KitLayout — the page chrome every kit composes into. Pure presentational
// zone-container: each kit's chassis (kits/<kit>/index.tsx) decides what
// fills each zone, the layout just positions them.
//
// Render order (top to bottom): backdrop (fixed, behind content), header,
// bench (optional sticky instrument), sections (vertical stack), footer
// (optional kit-specific footnotes — not the global page footer).
//
// Theme cascade lives one level up in App.tsx, set on <html> from the
// route's registry entry, so the body background var resolves and paints
// the viewport.

import type { ReactNode } from 'react';

interface KitLayoutProps {
  backdropZone: ReactNode;
  headerZone: ReactNode;
  benchZone?: ReactNode;
  sectionsZone: ReactNode;
  footerZone?: ReactNode;
}

export function KitLayout({
  backdropZone,
  headerZone,
  benchZone,
  sectionsZone,
  footerZone,
}: KitLayoutProps) {
  return (
    <>
      {backdropZone}
      {headerZone}
      {benchZone ? <div className="mt-6">{benchZone}</div> : null}
      <div className="mt-12 flex flex-col gap-16">{sectionsZone}</div>
      {footerZone}
    </>
  );
}
