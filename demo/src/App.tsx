// Router shell. Reads window.location.hash, looks up the active kit from
// the registry, sets data-theme on <html> from that kit's meta, and renders
// the kit's Page. ErrorBoundary catches widget-level throws; skip-link
// supports keyboard-only navigation. Reduced-motion users don't get smooth
// scrolls.
//
// Adding a new kit: register it in components/kits/registry.ts. App.tsx
// requires no edits.

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { VERSION } from 'unitforge/version';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { findKit } from './components/kits/registry.js';

// 'forge' is the default route (#/ or empty hash); other kits route at #/<id>.
const DEFAULT_KIT_ID = 'forge';

function parseHash(): string {
  const raw = window.location.hash.replace(/^#\/?/, '');
  return raw === '' ? DEFAULT_KIT_ID : raw;
}

function useHashRoute(): string {
  const [route, setRoute] = useState<string>(parseHash());
  useEffect(() => {
    const handler = () => {
      setRoute(parseHash());
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return route;
}

export function App() {
  const route = useHashRoute();
  const active = findKit(route) ?? findKit(DEFAULT_KIT_ID);
  const Page = active?.Page;
  const theme = active?.meta.theme ?? 'home';

  // Theme cascade lives on <html> so the body's `background: var(--uf-bg)`
  // resolves to the kit palette and paints the viewport. The route
  // container below stays transparent so the fixed-position background
  // flair (embers / grid / circuit) shows through.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const isHome = route === DEFAULT_KIT_ID;

  return (
    <div className="relative min-h-screen">
      <a href="#main" className="uf-skip-link">
        skip to content
      </a>
      <main id="main" className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
        {isHome ? null : <BreadcrumbBar kitLabel={active?.meta.label ?? route} />}
        <ErrorBoundary>{Page ? <Page /> : null}</ErrorBoundary>
        <Footer />
      </main>
    </div>
  );
}

function BreadcrumbBar({ kitLabel }: { kitLabel: string }) {
  return (
    <nav
      aria-label="breadcrumb"
      className="mb-8 flex items-center justify-between"
      style={{ color: 'var(--uf-muted)' }}
    >
      <a
        href="#/"
        className="mono inline-flex items-center gap-2 text-xs uppercase tracking-wider"
        style={{ color: 'var(--uf-fg)' }}
      >
        <ArrowLeft size={14} strokeWidth={2} />
        unitforge
      </a>
      <span className="uf-eyebrow" aria-current="page">
        kit · {kitLabel}
      </span>
    </nav>
  );
}

function Footer() {
  return (
    <footer
      className="mt-16 flex flex-col items-center gap-1 text-center text-xs"
      style={{ color: 'var(--uf-muted)' }}
    >
      <span className="mono">v{VERSION}</span>
      <a
        href="https://github.com/simiancraft/unitforge"
        className="underline"
        style={{ color: 'var(--uf-fg)' }}
      >
        github.com/simiancraft/unitforge
      </a>
    </footer>
  );
}
