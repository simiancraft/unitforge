// Home page. Forge-themed: simple-version unitforge mark above the
// wordmark, drifting ember background, hot-metal accent kit cards. The
// cards have a hammer-cursor (uf-anvil-cursor) and on hover they:
//   - "stoke" the embers: intensity boosts globally + a one-shot
//     EmberBurst spawns at the tile's center.
//   - trigger a brief vertical "anvil strike" on the page main so the
//     whole frame reads as percussion (subtle; 3px peak, 280ms).
//   - pulse their themed inline background brighter.

import { useRef, useState } from 'react';
import { Box, Database } from 'lucide-react';
import { ForgeBench, type BenchState } from '../components/ForgeBench.js';
import { findByKey, LENGTH_UNITS } from '../lib/units.js';
import { CircuitBg } from '../themes/CircuitBg.js';
import { EmberBurst } from '../themes/EmberBurst.js';
import { ForgeEmberBg } from '../themes/ForgeEmberBg.js';
import { GridPaperBg } from '../themes/GridPaperBg.js';
import { KITS } from '../lib/kits.js';

interface Burst {
  id: number;
  x: number;
  y: number;
}

export function Home() {
  const [bench, setBench] = useState<BenchState<'length'>>({
    fromKey: 'm',
    toKey: 'ft',
    value: 5,
  });
  const [hovered, setHovered] = useState<string | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstIdRef = useRef(0);

  const isPlaying =
    bench.value !== 5 || bench.fromKey !== 'm' || bench.toKey !== 'ft' || hovered !== null;
  const intensity = isPlaying ? 1.6 : 1.05;

  const triggerStrike = () => {
    const main = document.getElementById('main');
    if (!main) return;
    main.classList.remove('uf-anvil-strike');
    // Force a reflow so removing-then-adding the class restarts the animation.
    void main.offsetWidth;
    main.classList.add('uf-anvil-strike');
  };

  const onTileEnter = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    setHovered(id);
    const rect = e.currentTarget.getBoundingClientRect();
    const burst: Burst = {
      id: ++burstIdRef.current,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setBursts((b) => [...b, burst]);
    window.setTimeout(() => {
      setBursts((b) => b.filter((x) => x.id !== burst.id));
    }, 1300);
  };

  // Hammer hits the anvil on click, not on hover; the strike rings briefly
  // and the user is carried into the kit page mid-animation.
  const onTileClick = () => {
    triggerStrike();
  };

  return (
    <>
      <ForgeEmberBg intensity={intensity} />
      {bursts.map((b) => (
        <EmberBurst key={b.id} x={b.x} y={b.y} />
      ))}
      <section className="flex flex-col gap-10">
        <div className="flex flex-col items-center text-center gap-3">
          <img
            src="./unitforge-simple.png"
            alt=""
            width={128}
            height={128}
            className="h-32 w-32 select-none"
            draggable={false}
          />
          <p className="uf-eyebrow">forge anything measurable</p>
          <p
            className="max-w-xl text-sm leading-relaxed"
            style={{ color: 'var(--uf-muted)' }}
          >
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
              onEnter={(e) => onTileEnter(kit.id, e)}
              onLeave={() => setHovered(null)}
              onMouseDown={onTileClick}
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
  onEnter,
  onLeave,
  onMouseDown,
}: {
  kit: (typeof KITS)[number];
  hovered: boolean;
  onEnter: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onLeave: () => void;
  onMouseDown: () => void;
}) {
  const Icon = kit.id === 'geometry' ? Box : Database;
  return (
    <a
      href={`#/${kit.id}`}
      data-theme={kit.theme}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={(e) => onEnter(e as unknown as React.MouseEvent<HTMLAnchorElement>)}
      onBlur={onLeave}
      onMouseDown={onMouseDown}
      className="uf-flare-card uf-anvil-cursor group relative flex flex-col gap-3 rounded-lg border p-6 transition-transform hover:-translate-y-1"
      style={{
        background: 'var(--uf-card)',
        borderColor: 'var(--uf-border)',
        color: 'var(--uf-fg)',
        minHeight: '180px',
      }}
    >
      <div
        className="uf-flare-bg"
        style={{ transition: 'opacity 300ms ease', opacity: hovered ? 0.9 : 0.45 }}
      >
        {kit.id === 'geometry' && <GridPaperBg inline cellSize={hovered ? 18 : 12} />}
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
