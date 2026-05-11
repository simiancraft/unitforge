// Router shell. Reads window.location.hash, derives a route, sets
// data-theme on the route container, and renders the corresponding page.
// Error boundary catches widget-level throws; skip-link supports
// keyboard-only navigation. Reduced-motion users don't get smooth scrolls.

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { VERSION } from 'unitforge/version';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { KITS, type KitId } from './lib/kits.js';
import { DataStoragePage } from './pages/DataStorage.js';
import { GeometryPage } from './pages/Geometry.js';
import { Home } from './pages/Home.js';

type Route = 'home' | KitId;

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (raw === 'geometry' || raw === 'data-storage') return raw;
  return 'home';
}

function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash());
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
  const theme = route === 'home' ? 'home' : route;
  const kitMeta = route === 'home' ? null : KITS.find((k) => k.id === route);

  return (
    <div
      data-theme={theme}
      className="relative min-h-screen"
      style={{
        background: 'var(--uf-bg)',
        color: 'var(--uf-fg)',
        transition: 'background-color 600ms cubic-bezier(0.22,1,0.36,1), color 600ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <a href="#main" className="uf-skip-link">
        skip to content
      </a>
      <main id="main" className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
        {route !== 'home' && <BreadcrumbBar kitLabel={kitMeta?.label ?? route} />}
        <ErrorBoundary>
          {route === 'home' && <Home />}
          {route === 'geometry' && <GeometryPage />}
          {route === 'data-storage' && <DataStoragePage />}
        </ErrorBoundary>
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
