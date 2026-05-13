// Router shell. Reads window.location.hash, looks up the active kit from
// the registry, and renders that kit's Screen wrapped in the root
// ThemeProvider. The provider owns the data-theme cascade on <html> and
// per-kit theme persistence in localStorage.
//
// Adding a new kit: register it in components/kits/registry.ts. App.tsx
// requires no edits.

import { ArrowLeft, Coffee } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { VERSION } from 'unitforge/version';
import { findKit, KITS } from './components/kits/registry.js';
import { resolveInitialThemeId, ThemeProvider, useTheme } from './components/theme/provider.js';
import { pairForKit, type ThemeId } from './components/theme/recipes.js';
import { ThemeToggle } from './components/theme/toggle.js';
import { ErrorBoundary } from './components/ui/error-boundary.js';
import SimianMark from './components/ui/simian.js';

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
    <footer className="mt-16 flex flex-col items-center gap-3 text-center text-xs text-uf-muted">
      <span className="mono">v{VERSION}</span>
      <nav aria-label="project and author links" className="flex items-center gap-4">
        <FooterLink href="https://github.com/simiancraft/unitforge" label="unitforge on GitHub">
          <GithubGlyph />
        </FooterLink>
        <FooterLink href="https://x.com/5imian" label="Jesse Harlin on X">
          <XGlyph />
        </FooterLink>
        <FooterLink href="https://ko-fi.com/the_simian0604" label="Tip on Ko-fi">
          <Coffee size={18} strokeWidth={1.6} aria-hidden />
        </FooterLink>
      </nav>
      <p>
        Crafted with care by{' '}
        <a
          href="https://simiancraft.com"
          className="inline-flex items-center gap-1.5 align-middle text-uf-muted transition-colors hover:text-uf-accent"
        >
          <SimianMark width={16} height={16} aria-hidden />
          <span className="underline">Simiancraft</span>
        </a>
      </p>
    </footer>
  );
}

function FooterLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      target="_blank"
      rel="noopener noreferrer"
      className="text-uf-muted transition-colors hover:text-uf-accent"
    >
      {children}
    </a>
  );
}

// Brand glyphs rendered inline; lucide v1 dropped branded icons over
// trademark concerns, so GitHub and X both need their official paths.
function GithubGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" role="img">
      <title>GitHub</title>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.13c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.44-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17.92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39c2.2-1.48 3.16-1.17 3.16-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.35.78 1.05.78 2.12v3.14c0 .3.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" role="img">
      <title>X</title>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
