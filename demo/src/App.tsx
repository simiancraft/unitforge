// Pre-alpha placeholder. Just the logo for now; the real demo (per PLANNING
// next-steps #7) lands once v1 ships and there are kits, benchmarks, and
// demo GIFs to point at.

const VERSION = '0.0.0';

export function App() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center">
      <img
        src="./unitforge-logo.png"
        alt="unitforge"
        className="h-40 w-40 rounded"
        width={160}
        height={160}
      />
      <h1 className="mt-6 text-4xl font-bold tracking-tight">unitforge</h1>
      <p className="mono mt-2 text-sm" style={{ color: 'var(--uf-muted)' }}>
        v{VERSION} · pre-alpha · placeholder demo
      </p>
      <p
        className="mt-6 max-w-md text-sm leading-relaxed"
        style={{ color: 'var(--uf-muted)' }}
      >
        A units library where the units, dimensions, and conversions are all
        values you import. The full demo lands once v1 ships.
      </p>
      <p className="mt-8 text-xs" style={{ color: 'var(--uf-muted)' }}>
        <a
          href="https://github.com/simiancraft/unitforge"
          className="underline"
          style={{ color: 'var(--uf-fg)' }}
        >
          github.com/simiancraft/unitforge
        </a>
      </p>
    </main>
  );
}
