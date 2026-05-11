// Router shell. Reads window.location.hash, looks up the active kit from
// the registry, and renders that kit's Page wrapped in the root
// ThemeProvider. The provider owns the data-theme cascade on <html> and
// per-kit theme persistence in localStorage.
//
// Adding a new kit: register it in components/kits/registry.ts. App.tsx
// requires no edits.

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { VERSION } from 'unitforge/version';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { findKit } from './components/kits/registry.js';
import {
  ThemeProvider,
  resolveInitialThemeId,
  useTheme,
} from './components/theme/provider.js';
import { pairForKit, type ThemeId } from './components/theme/recipes.js';
import { ThemeToggle } from './components/theme/toggle.js';

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

/**
 * Compute the theme to activate on initial mount. Routes to
 * resolveInitialThemeId in the provider module so localStorage logic and
 * the storage key live in one file.
 */
function getInitialThemeId(): ThemeId {
  const kit = findKit(parseHash());
  const fallback: ThemeId = kit?.meta.defaultThemeId ?? 'forge-dark';
  if (!kit) return fallback;
  return resolveInitialThemeId(kit.meta.id, fallback);
}

export function App() {
  return (
    <ThemeProvider initialThemeId={getInitialThemeId()}>
      <RouteShell />
    </ThemeProvider>
  );
}

function RouteShell() {
  const route = useHashRoute();
  const { setThemeForKit } = useTheme();
  const active = findKit(route) ?? findKit(DEFAULT_KIT_ID);
  const Page = active?.Page;

  // On hash change, honor the destination kit's stored theme or fall
  // back to its default. The initial mount is handled by ThemeProvider's
  // initialThemeId; this effect covers subsequent navigation.
  useEffect(() => {
    if (active) setThemeForKit(active.meta.id, active.meta.defaultThemeId);
  }, [active, setThemeForKit]);

  const isHome = route === DEFAULT_KIT_ID;

  const pair = active ? pairForKit(active.meta.id) : null;

  return (
    <div className="relative min-h-screen">
      <a href="#main" className="uf-skip-link">
        skip to content
      </a>
      {active && pair ? (
        <ThemeToggle
          light={pair.light}
          dark={pair.dark}
          defaultTheme={active.meta.defaultThemeId}
        />
      ) : null}
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
