// Home page. Forge-themed: simple-version unitforge mark above the
// wordmark, layered ember backgrounds, hot-metal accent kit cards.
//
// Two ember layers: an always-on ambient stream and a "stoked" overlay
// that fades in on hover (more particles, bigger glow) and fades back
// out on a timeout. Pairs with the `uf-anvil-strike` percussion on press.

import { useRef, useState } from 'react';
import { Box, Database } from 'lucide-react';
import { ForgeBench, type BenchState } from '../components/ForgeBench.js';
import { findByKey, LENGTH_UNITS } from '../lib/units.js';
import { CircuitBg } from '../themes/CircuitBg.js';
import { ForgeEmberBg } from '../themes/ForgeEmberBg.js';
import { GridPaperBg } from '../themes/GridPaperBg.js';
import { KITS } from '../lib/kits.js';

const STOKE_HOLD_MS = 1200; // how long the stoked layer stays bright after a hover
const STOKE_FADE_MS = 700; // matches the ForgeEmberBg opacity transition

export function Home() {
  const [bench, setBench] = useState<BenchState<'length'>>({
    fromKey: 'm',
    toKey: 'ft',
    value: 5,
  });
  const [hovered, setHovered] = useState<string | null>(null);
  const [stoked, setStoked] = useState(0);
  const stokeTimer = useRef<number | null>(null);

  const triggerStoke = () => {
    setStoked(1);
    if (stokeTimer.current !== null) window.clearTimeout(stokeTimer.current);
    stokeTimer.current = window.setTimeout(() => setStoked(0), STOKE_HOLD_MS);
  };

  const triggerStrike = () => {
    const main = document.getElementById('main');
    if (!main) return;
    main.classList.remove('uf-anvil-strike');
    void main.offsetWidth;
    main.classList.add('uf-anvil-strike');
    window.setTimeout(() => {
      main.classList.remove('uf-anvil-strike');
    }, 320);
  };

  const onTileEnter = (id: string) => {
    setHovered(id);
    triggerStoke();
  };

  return (
    <>
      <ForgeEmberBg intensity={1} boost={1} />
      <ForgeEmberBg intensity={stoked} boost={2.5} />
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
              onEnter={() => onTileEnter(kit.id)}
              onLeave={() => setHovered(null)}
              onMouseDown={triggerStrike}
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
  onEnter: () => void;
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
      onFocus={onEnter}
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
        {kit.id === 'geometry' && <GridPaperBg inline scale={hovered ? 1.5 : 1} />}
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
