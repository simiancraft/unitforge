// Home page. Forge-themed: ember background, hot-metal accent, anvil-vibe
// kit cards. Each kit card previews its own theme via an inline flair
// background and pulses brighter on hover. A small "try it" forge bench
// sits between header and cards so visitors can run a real conversion
// before they decide which kit to enter; bench interaction also drives
// the ember intensity, so the forge "breathes brighter" while the user
// is playing.

import { useState } from 'react';
import { Box, Database } from 'lucide-react';
import { ForgeBench, type BenchState } from '../components/ForgeBench.js';
import { findByKey, LENGTH_UNITS } from '../lib/units.js';
import { CircuitBg } from '../themes/CircuitBg.js';
import { ForgeEmberBg } from '../themes/ForgeEmberBg.js';
import { GridPaperBg } from '../themes/GridPaperBg.js';
import { KITS } from '../lib/kits.js';

export function Home() {
  const [bench, setBench] = useState<BenchState<'length'>>({
    fromKey: 'm',
    toKey: 'ft',
    value: 5,
  });
  const [hovered, setHovered] = useState<string | null>(null);

  // Intensity boost while the user is interacting with the bench (any
  // value != initial), or hovering a kit card.
  const isPlaying =
    bench.value !== 5 || bench.fromKey !== 'm' || bench.toKey !== 'ft' || hovered !== null;
  const intensity = isPlaying ? 1.5 : 1;

  return (
    <>
      <ForgeEmberBg intensity={intensity} />
      <section className="flex flex-col gap-10">
        <div className="flex flex-col items-center text-center gap-4">
          <p className="uf-eyebrow">forge anything measurable</p>
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">unitforge</h1>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
            Units, dimensions, and conversions are values you import. Try a
            quick conversion below, or pick a kit and play with a domain.
          </p>
        </div>

        <ForgeBench
          state={bench}
          onChange={setBench}
          options={LENGTH_UNITS.map((o) => ({ key: o.key, label: o.label, unit: o.unit }))}
          min={0.1}
          max={100}
          step={0.1}
          codeFor={(s, r) =>
            `forge(${findByKey(LENGTH_UNITS, s.fromKey).label}, ${findByKey(LENGTH_UNITS, s.toKey).label})(${s.value}); // ${r.toFixed(4)}`
          }
          label="try unitforge"
        />

        <div className="grid gap-5 md:grid-cols-2">
          {KITS.map((kit) => (
            <KitCard
              key={kit.id}
              kit={kit}
              hovered={hovered === kit.id}
              onHover={(h) => setHovered(h ? kit.id : null)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function KitCard({
  kit,
  hovered,
  onHover,
}: {
  kit: (typeof KITS)[number];
  hovered: boolean;
  onHover: (h: boolean) => void;
}) {
  const Icon = kit.id === 'geometry' ? Box : Database;
  return (
    <a
      href={`#/${kit.id}`}
      data-theme={kit.theme}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      className="uf-flare-card group relative flex flex-col gap-3 rounded-lg border p-6 transition-transform hover:-translate-y-1"
      style={{
        background: 'var(--uf-card)',
        borderColor: 'var(--uf-border)',
        color: 'var(--uf-fg)',
        minHeight: '180px',
      }}
    >
      <div
        className="uf-flare-bg"
        style={{
          transition: 'opacity 300ms ease',
          opacity: hovered ? 0.85 : 0.45,
        }}
      >
        {kit.id === 'geometry' && (
          <GridPaperBg inline cellSize={hovered ? 18 : 12} />
        )}
        {kit.id === 'data-storage' && <CircuitBg inline pulse={hovered} />}
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
