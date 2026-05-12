// Router shell. Reads window.location.hash, looks up the active kit from
// the registry, and renders that kit's Screen wrapped in the root
// ThemeProvider. The provider owns the data-theme cascade on <html> and
// per-kit theme persistence in localStorage.
//
// Adding a new kit: register it in components/kits/registry.ts. App.tsx
// requires no edits.

import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { VERSION } from 'unitforge/version';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { findKit, KITS } from './components/kits/registry.js';
import { resolveInitialThemeId, ThemeProvider, useTheme } from './components/theme/provider.js';
import { pairForKit, type ThemeId } from './components/theme/recipes.js';
import { ThemeToggle } from './components/theme/toggle.js';

const DEFAULT_KIT_ID = 'forge';

interface HashLocation {
  route: string;
  /** In-page anchor for `#<name>` hashes (no leading slash). */
  anchor: string | null;
}

function parseLocation(): HashLocation {
  const hash = window.location.hash;
  // Route navigation: `#/`, `#/geometry`, etc.
  if (hash === '' || hash === '#' || hash.startsWith('#/')) {
    const raw = hash.replace(/^#\/?/, '');
    return { route: raw === '' ? DEFAULT_KIT_ID : raw, anchor: null };
  }
  // In-page anchor: `#crouton`, etc. Lands on the default kit (home);
  // section-scrolling is handled below.
  return { route: DEFAULT_KIT_ID, anchor: hash.slice(1) };
}

function useHashLocation(): HashLocation {
  const [loc, setLoc] = useState<HashLocation>(parseLocation());
  useEffect(() => {
    const handler = () => {
      const next = parseLocation();
      setLoc(next);
      // Route-change scroll-to-top is preserved; anchor scrolling is
      // owned by the [anchor]-keyed effect in RouteShell so it fires
      // after the destination route's DOM has committed.
      if (!next.anchor) {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      }
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return loc;
}

/**
 * Compute the theme to activate on initial mount. Routes to
 * resolveInitialThemeId in the provider module so localStorage logic and
 * the storage key live in one file.
 */
function getInitialThemeId(): ThemeId {
  // KITS is a non-empty tuple, so KITS[0] is always defined; no fallback
  // branch needed.
  const kit = findKit(parseLocation().route) ?? KITS[0];
  return resolveInitialThemeId(kit.meta.id, kit.meta.defaultThemeId);
}

export function App() {
  // Lazy state initializer so getInitialThemeId; which reads
  // window.location.hash and localStorage; runs only once on first
  // mount, not on every <App/> render.
  const [initialThemeId] = useState(getInitialThemeId);
  return (
    <ThemeProvider initialThemeId={initialThemeId}>
      <RouteShell />
    </ThemeProvider>
  );
}

function RouteShell() {
  const { route, anchor } = useHashLocation();
  const { setThemeForKit } = useTheme();
  const active = findKit(route) ?? findKit(DEFAULT_KIT_ID);
  const Screen = active?.Screen;

  // On hash change, honor the destination kit's stored theme or fall
  // back to its default. The initial mount is handled by ThemeProvider's
  // initialThemeId; this effect covers subsequent navigation.
  useEffect(() => {
    if (active) setThemeForKit(active.meta.id, active.meta.defaultThemeId);
  }, [active, setThemeForKit]);

  // Anchor scroll. Fires after the destination route's DOM commits so
  // `getElementById` finds the section even on a fresh load of `#crouton`.
  // Routes have already had scroll-to-top applied by the hashchange handler.
  useEffect(() => {
    if (!anchor) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = requestAnimationFrame(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(id);
  }, [anchor]);

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
        <ErrorBoundary>{Screen ? <Screen /> : null}</ErrorBoundary>
        <Footer />
      </main>
    </div>
  );
}

function BreadcrumbBar({ kitLabel }: { kitLabel: string }) {
  return (
    <nav aria-label="breadcrumb" className="mb-8 flex items-center justify-between text-uf-muted">
      <a
        href="#/"
        className="mono inline-flex items-center gap-2 text-xs uppercase tracking-wider text-uf-fg"
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
    <footer className="mt-16 flex flex-col items-center gap-1 text-center text-xs text-uf-muted">
      <span className="mono">v{VERSION}</span>
      <a href="https://github.com/simiancraft/unitforge" className="underline text-uf-fg">
        github.com/simiancraft/unitforge
      </a>
    </footer>
  );
}
