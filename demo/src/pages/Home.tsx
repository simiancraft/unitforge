// Home page. Forge-themed: ember background, hot-metal accent, anvil-vibe
// kit cards. Each card previews the kit's own theme (grid paper background
// for geometry, circuit traces for data-storage) so clicking through feels
// like crossing into the world the card already hinted at.

import { Box, Database } from 'lucide-react';
import { CircuitBg } from '../themes/CircuitBg.js';
import { ForgeEmberBg } from '../themes/ForgeEmberBg.js';
import { GridPaperBg } from '../themes/GridPaperBg.js';
import { KITS } from '../lib/kits.js';

export function Home() {
  return (
    <>
      <ForgeEmberBg />
      <section className="flex flex-col gap-10">
        <div className="flex flex-col items-center text-center gap-4">
          <p className="uf-eyebrow">forge anything measurable</p>
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">unitforge</h1>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
            Units, dimensions, and conversions are values you import. Each kit
            below is a domain with its own visual world; click in to play with
            real <code className="mono">forge()</code> calls against the built
            package.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {KITS.map((kit) => (
            <KitCard key={kit.id} kit={kit} />
          ))}
        </div>
      </section>
    </>
  );
}

function KitCard({ kit }: { kit: (typeof KITS)[number] }) {
  const Icon = kit.id === 'geometry' ? Box : Database;
  return (
    <a
      href={`#/${kit.id}`}
      data-theme={kit.theme}
      className="uf-flare-card group relative flex flex-col gap-3 rounded-lg border p-6 transition-transform hover:-translate-y-1"
      style={{
        background: 'var(--uf-card)',
        borderColor: 'var(--uf-border)',
        color: 'var(--uf-fg)',
        minHeight: '180px',
      }}
    >
      <div className="uf-flare-bg">
        {kit.id === 'geometry' && <GridPaperBg inline />}
        {kit.id === 'data-storage' && <CircuitBg inline />}
      </div>
      <div className="uf-flare-content flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Icon size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />
          <span
            className="mono text-base uppercase tracking-wider font-semibold"
            style={{ color: 'var(--uf-accent)' }}
          >
            {kit.label}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
          {kit.blurb}
        </p>
        <span className="mono mt-auto text-xs" style={{ color: 'var(--uf-fg)' }}>
          enter →
        </span>
      </div>
    </a>
  );
}
