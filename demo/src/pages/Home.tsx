// Home page. Forge-themed: simple-version unitforge mark, ember streams,
// hot-metal accent kit cards, then a "three verbs" core-API teaser and a
// build-your-own Catan demo. Reads top-down as:
//
//   1. icon + the thesis "forge anything measurable"
//   2. interactive horizontal rule (HomeBench)
//   3. kits with reactive themed previews
//   4. core api intro (three primitives + tiny snippets)
//   5. byo Catan demo
//
// Ember layering: one ambient stream + two stoke slots on a round-robin
// so rapid hovers stack flurries. Each stoke also fires a multi-stop
// forge-glow flash at the bottom of the viewport (one of three height
// variants for variation).

import { useRef, useState } from 'react';
import { Box, Database } from 'lucide-react';
import { CatanDemo } from '../components/CatanDemo.js';
import { CoreApiIntro } from '../components/CoreApiIntro.js';
import { EmberStream } from '../components/EmberStream.js';
import { HomeBench } from '../components/HomeBench.js';
import { CircuitBg } from '../kits/data-storage/components/CircuitBg.js';
import { GridPaperBg } from '../kits/geometry/components/GridPaperBg.js';
import { KITS } from '../lib/kits.js';
import '../forge.css';
// Kit-card backgrounds preview their target kit's theme inline, so the
// kit-CSS bundles need to load on home too.
import '../kits/geometry/geometry.css';
import '../kits/data-storage/data-storage.css';

// ─── tweakables ──────────────────────────────────────────────────────────
const AMBIENT_COUNT = 32;
const AMBIENT_BOOST = 1;
const AMBIENT_DURATION_MIN = 6;
const AMBIENT_DURATION_MAX = 11;
const AMBIENT_MAX_DELAY_SEC = 4;

const STOKE_COUNT = 72;
const STOKE_BOOST = 2;
const STOKE_DURATION_MIN = 1.04;
const STOKE_DURATION_MAX = 3.575;
const STOKE_MAX_DELAY_SEC = 0.52;
const STOKE_HOLD_MS = 1200;
const STOKE_FLASH_DECAY_MS = STOKE_HOLD_MS * 0.25;

const FORGE_GLOW_VARIANTS = ['uf-forge-glow-1', 'uf-forge-glow-2', 'uf-forge-glow-3'] as const;
// ─────────────────────────────────────────────────────────────────────────

interface StokeSlot {
  key: number;
  expiresAt: number | null;
}

export function Home() {
  const [bench, setBench] = useState({ fromKey: 'm', toKey: 'ft', value: 5 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [slotA, setSlotA] = useState<StokeSlot>({ key: 0, expiresAt: null });
  const [slotB, setSlotB] = useState<StokeSlot>({ key: 0, expiresAt: null });
  const [flashKey, setFlashKey] = useState(0);
  const aTimer = useRef<number | null>(null);
  const bTimer = useRef<number | null>(null);

  const stoke = () => {
    setFlashKey((k) => k + 1);
    const now = Date.now();
    const aLive = slotA.expiresAt !== null && slotA.expiresAt > now;
    const bLive = slotB.expiresAt !== null && slotB.expiresAt > now;
    let target: 'A' | 'B';
    if (aLive && bLive) {
      target = (slotA.expiresAt ?? 0) <= (slotB.expiresAt ?? 0) ? 'A' : 'B';
    } else if (aLive) {
      target = 'B';
    } else {
      target = 'A';
    }
    const newExpiry = now + STOKE_HOLD_MS;
    if (target === 'A') {
      setSlotA((s) => ({ key: s.key + 1, expiresAt: newExpiry }));
      if (aTimer.current !== null) window.clearTimeout(aTimer.current);
      aTimer.current = window.setTimeout(() => {
        setSlotA((s) => ({ ...s, expiresAt: null }));
      }, STOKE_HOLD_MS);
    } else {
      setSlotB((s) => ({ key: s.key + 1, expiresAt: newExpiry }));
      if (bTimer.current !== null) window.clearTimeout(bTimer.current);
      bTimer.current = window.setTimeout(() => {
        setSlotB((s) => ({ ...s, expiresAt: null }));
      }, STOKE_HOLD_MS);
    }
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
    stoke();
  };

  return (
    <>
      <div
        key={`forge-flash-${flashKey}`}
        aria-hidden
        className={`${FORGE_GLOW_VARIANTS[flashKey % FORGE_GLOW_VARIANTS.length]} fixed bottom-0 left-0 right-0 pointer-events-none`}
        style={{
          zIndex: -2,
          opacity: 0,
          transformOrigin: 'bottom',
          animation:
            flashKey > 0
              ? `uf-forge-flash ${STOKE_FLASH_DECAY_MS}ms ease-out forwards`
              : 'none',
        }}
      />
      <EmberStream
        intensity={1}
        count={AMBIENT_COUNT}
        boost={AMBIENT_BOOST}
        durationMin={AMBIENT_DURATION_MIN}
        durationMax={AMBIENT_DURATION_MAX}
        maxDelaySec={AMBIENT_MAX_DELAY_SEC}
      />
      <EmberStream
        key={`A-${slotA.key}`}
        intensity={slotA.expiresAt !== null ? 1 : 0}
        count={STOKE_COUNT}
        boost={STOKE_BOOST}
        durationMin={STOKE_DURATION_MIN}
        durationMax={STOKE_DURATION_MAX}
        maxDelaySec={STOKE_MAX_DELAY_SEC}
      />
      <EmberStream
        key={`B-${slotB.key}`}
        intensity={slotB.expiresAt !== null ? 1 : 0}
        count={STOKE_COUNT}
        boost={STOKE_BOOST}
        durationMin={STOKE_DURATION_MIN}
        durationMax={STOKE_DURATION_MAX}
        maxDelaySec={STOKE_MAX_DELAY_SEC}
      />

      <section className="flex flex-col gap-12">
        <header className="flex flex-col items-center text-center gap-4">
          <img
            src="./unitforge-simple.png"
            alt=""
            width={128}
            height={128}
            className="h-32 w-32 select-none"
            draggable={false}
          />
          <h1 className="display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            forge anything measurable
          </h1>
        </header>

        <HomeBench
          fromKey={bench.fromKey}
          toKey={bench.toKey}
          value={bench.value}
          onChange={setBench}
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

        <CoreApiIntro />

        <CatanDemo />
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
