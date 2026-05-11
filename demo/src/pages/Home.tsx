// Home page. Forge-themed: simple-version unitforge mark, ember streams,
// hot-metal accent kit cards.
//
// Ember layering: one ambient EmberStream always running, plus a pool of
// two "stoke" EmberStreams that are restarted via key bumps on hover. The
// pool is round-robin: each stoke routes to whichever slot is more stale
// (idle, or expiring sooner), so rapid back-and-forth hovers keep one
// layer brightening while another is still fading.

import { useRef, useState } from 'react';
import { Box, Database } from 'lucide-react';
import { ForgeBench, type BenchState } from '../components/ForgeBench.js';
import { findByKey, LENGTH_UNITS } from '../lib/units.js';
import { CircuitBg } from '../themes/CircuitBg.js';
import { EmberStream } from '../themes/EmberStream.js';
import { GridPaperBg } from '../themes/GridPaperBg.js';
import { KITS } from '../lib/kits.js';

// ─── tweakables ──────────────────────────────────────────────────────────
const AMBIENT_COUNT = 32;
const AMBIENT_BOOST = 1;
const AMBIENT_DURATION_MIN = 6;
const AMBIENT_DURATION_MAX = 11;
const AMBIENT_MAX_DELAY_SEC = 4;

const STOKE_COUNT = 72;
const STOKE_BOOST = 2;
// Wider speed variance than ambient so the burst reads as flurry, not
// a coherent layer. Fastest = 1.04s (was 1.56s; 50% faster); slowest =
// 3.575s (was 2.86s; 25% slower). Median ~2.3s, near the previous
// uniform-scale stoke timing.
const STOKE_DURATION_MIN = 1.04;
const STOKE_DURATION_MAX = 3.575;
const STOKE_MAX_DELAY_SEC = 0.52;
const STOKE_HOLD_MS = 1200;
// ─────────────────────────────────────────────────────────────────────────

interface StokeSlot {
  key: number;
  expiresAt: number | null;
}

export function Home() {
  const [bench, setBench] = useState<BenchState<'length'>>({
    fromKey: 'm',
    toKey: 'ft',
    value: 5,
  });
  const [hovered, setHovered] = useState<string | null>(null);
  const [slotA, setSlotA] = useState<StokeSlot>({ key: 0, expiresAt: null });
  const [slotB, setSlotB] = useState<StokeSlot>({ key: 0, expiresAt: null });
  const aTimer = useRef<number | null>(null);
  const bTimer = useRef<number | null>(null);

  const stoke = () => {
    const now = Date.now();
    const aLive = slotA.expiresAt !== null && slotA.expiresAt > now;
    const bLive = slotB.expiresAt !== null && slotB.expiresAt > now;
    // Pick the more-stale slot: an idle one if available, else whichever
    // is expiring sooner. Third rapid hover lands on the same slot as the
    // first, "shuffling" the most-stale instance with a fresh burst.
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
