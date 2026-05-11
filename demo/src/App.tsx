// Router shell. Reads window.location.hash, derives a route, and renders
// the corresponding themed page. The `data-theme` attribute on the route
// container switches the entire CSS variable bundle (see index.css), so the
// whole page feels like it crossed into a different visual world.

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { VERSION } from 'unitforge/version';
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div data-theme={theme} className="relative min-h-screen">
      <main className="relative mx-auto max-w-5xl px-6 py-10 md:py-14">
        {route !== 'home' && <BreadcrumbBar kitLabel={kitMeta?.label ?? route} />}
        {route === 'home' && <Home />}
        {route === 'geometry' && <GeometryPage />}
        {route === 'data-storage' && <DataStoragePage />}
        <Footer />
      </main>
    </div>
  );
}

function BreadcrumbBar({ kitLabel }: { kitLabel: string }) {
  return (
    <nav
      className="mb-8 flex items-center justify-between"
      style={{ color: 'var(--uf-muted)' }}
    >
      <a
        href="#/"
        className="mono inline-flex items-center gap-2 text-xs uppercase tracking-wider transition-colors"
        style={{ color: 'var(--uf-fg)' }}
      >
        <ArrowLeft size={14} strokeWidth={2} />
        unitforge
      </a>
      <span className="uf-eyebrow">kit · {kitLabel}</span>
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
