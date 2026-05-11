// Home page. Forge-themed: simple-version unitforge mark, ember streams,
// hot-metal accent kit cards, then a "three verbs" core-API teaser and a
// build-your-own Settlers-of-Crouton demo. Reads top-down as:
//
//   1. icon + the thesis "forge anything measurable"
//   2. interactive horizontal rule (HomeBench)
//   3. kits with reactive themed previews
//   4. core api intro (three primitives + tiny snippets)
//   5. byo Crouton demo
//
// Ember layering: one ambient stream + two stoke slots on a round-robin
// so rapid hovers stack flurries. Each stoke also fires a multi-stop
// forge-glow flash at the bottom of the viewport (one of three height
// variants for variation).

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CroutonDemo } from './CroutonDemo.js';
import { CoreApiIntro } from './CoreApiIntro.js';
import { EmberStream } from '../components/EmberStream.js';
import { HomeBench } from './HomeBench.js';
import { useForgeStoke } from '../hooks/useForgeStoke.js';
import { KITS } from '../lib/kits.js';
import '../forge.css';
// Kit-card backgrounds preview their target kit's theme inline (the
// previewBg components in lib/kits.tsx reach into each kit), so the
// kit CSS bundles need to load on home too.
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

// Reference (1.0) intensity for the stoke event; hover and mousedown
// scale relative to this so all three effects (shake, flash, particle
// stoke layer) move together.
const STOKE_HOVER_INTENSITY = 0.75;
const STOKE_STRIKE_INTENSITY = 3;
const SHAKE_AMP_BASE_PX = 9; // peak translateY at intensity 1.0
const SHAKE_DURATION_MS = 320;

export function Home() {
  const [bench, setBench] = useState({ fromKey: 'm', toKey: 'ft', value: 5 });
  const [hovered, setHovered] = useState<string | null>(null);

  // Everything stoke-related lives in this hook: shake side effects,
  // the two-slot particle pool with timers, and the flash key + most-
  // recent intensity + active variant.
  const { stoke, flashKey, flashIntensity, flashVariant, slotA, slotB } = useForgeStoke({
    holdMs: STOKE_HOLD_MS,
    shakeAmpBasePx: SHAKE_AMP_BASE_PX,
    shakeDurationMs: SHAKE_DURATION_MS,
    variantCount: FORGE_GLOW_VARIANTS.length,
  });

  const onTileEnter = (id: string) => {
    setHovered(id);
    stoke(STOKE_HOVER_INTENSITY);
  };

  // Clicks always read at the same physical size; pin to variant 2 (the
  // median height) so the strike intensity isn't compounded by an
  // unrelated round-robin variant change.
  const STRIKE_VARIANT = 1;
  const onTileMouseDown = () => {
    stoke(STOKE_STRIKE_INTENSITY, STRIKE_VARIANT);
  };

  // Delay the hash navigation until ~2/3 of the stoke burst has played
  // so the user sees the impact (shake + flash + flurry crest) before
  // the route swaps. Tied to STOKE_HOLD_MS so retuning the burst
  // automatically retunes the delay.
  const NAV_DELAY_MS = Math.round(STOKE_HOLD_MS * (2 / 3));
  const onTileClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.setTimeout(() => {
      window.location.hash = `#/${id}`;
    }, NAV_DELAY_MS);
  };

  // Portal the background flair (forge-flash + ember streams) directly
  // into document.body. The anvil-strike animation applies `transform`
  // to <main>; any `position: fixed` descendant of a transformed
  // ancestor is positioned relative to that ancestor instead of the
  // viewport. Portaling sidesteps the issue and keeps the flash
  // pinned to viewport-bottom even mid-strike or during page scroll.
  const flair = (
    <>
      <div
        key={`forge-flash-${flashKey}`}
        aria-hidden
        className={`${FORGE_GLOW_VARIANTS[flashVariant]} fixed bottom-0 left-0 w-screen pointer-events-none`}
        style={{
          zIndex: -2,
          opacity: 0,
          transformOrigin: 'bottom',
          // X stays at 1 so the flash spans viewport width; Y is the
          // most-recent intensity from useForgeStoke. The element is
          // keyed on flashKey so each stoke remounts the div with the
          // current intensity baked into the inline style — no CSS var
          // indirection, no state-batching race.
          scale: `1 ${flashIntensity}`,
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
        count={Math.round(STOKE_COUNT * slotA.intensity)}
        boost={STOKE_BOOST * slotA.intensity}
        durationMin={STOKE_DURATION_MIN / slotA.intensity}
        durationMax={STOKE_DURATION_MAX / slotA.intensity}
        maxDelaySec={STOKE_MAX_DELAY_SEC}
      />
      <EmberStream
        key={`B-${slotB.key}`}
        intensity={slotB.expiresAt !== null ? 1 : 0}
        count={Math.round(STOKE_COUNT * slotB.intensity)}
        boost={STOKE_BOOST * slotB.intensity}
        durationMin={STOKE_DURATION_MIN / slotB.intensity}
        durationMax={STOKE_DURATION_MAX / slotB.intensity}
        maxDelaySec={STOKE_MAX_DELAY_SEC}
      />
    </>
  );

  return (
    <>
      {createPortal(flair, document.body)}

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
              onMouseDown={onTileMouseDown}
              onClick={onTileClick(kit.id)}
            />
          ))}
        </div>

        <CroutonDemo />

        <CoreApiIntro />
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
  onClick,
}: {
  kit: (typeof KITS)[number];
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onMouseDown: () => void;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const Icon = kit.icon;
  const PreviewBg = kit.previewBg;
  return (
    <a
      href={`#/${kit.id}`}
      data-theme={kit.theme}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onMouseDown={onMouseDown}
      onClick={onClick}
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
        <PreviewBg hovered={hovered} />
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
