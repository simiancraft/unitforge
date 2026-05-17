// Recipe-card background for the cooking theme. Three load-bearing
// layers, all ambient:
//
//   1. Horizontal scan lines (the recipe-card ruling) slowly drift
//      upward via patternTransform driven by a single rAF loop. Very
//      slow — meant to read as page-texture breath, not a marquee.
//
//   2. Two pools of Lucide food icons (FROM_POOL + TO_POOL) stamped at
//      hand-picked positions. The bench's from-unit deterministically
//      activates 4 of the 8 from-pool slots; the to-unit deterministically
//      activates 4 of the 8 to-pool slots. So at any time ~8 of 16
//      slots are visible. A unit swap fades the old slots out and the
//      new ones in via CSS opacity transition.
//
//   3. Slider drives a multiplicative scale on every visible glyph
//      (0.6 → 1.4) through a forge() call in ./backdrop-scales.ts. CSS
//      transition on transform so the size change rides smoothly with
//      the slider drag.
//
// prefers-reduced-motion short-circuits the scan-line rAF; the glyph
// fades and scale change still apply (they're discrete user actions,
// not ambient motion).

import {
  Apple,
  Beef,
  Cake,
  CakeSlice,
  Candy,
  Coffee,
  Cookie,
  CookingPot,
  Croissant,
  Donut,
  IceCream,
  type LucideIcon,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Utensils,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { glyphSubsetIndices, SCAN_LINE_SPEED_PX_S } from './backdrop-scales.js';

interface CookingBackdropProps {
  inline?: boolean;
  /** Bench's from-unit id; selects which from-pool glyphs are active. */
  fromUnitId?: string;
  /** Bench's to-unit id; selects which to-pool glyphs are active. */
  toUnitId?: string;
  /** Slider-driven multiplicative scale on every visible glyph. */
  glyphScale?: number;
}

interface Slot {
  Icon: LucideIcon;
  /** % of backdrop width. */
  x: number;
  /** % of backdrop height. */
  y: number;
  /** Base px size before glyphScale is applied. */
  size: number;
  /** Base rotation in degrees. */
  rotate: number;
}

// FROM pool: savories + drinks + working tools. 8 slots.
// Base sizes are 4x the original (the previous thumb-scale max ≈ the
// new min); glyphs read as poster-scale recipe-card doodles. The
// slider's scale multiplier (0.6 to 1.4) still rides on top.
const FROM_POOL: ReadonlyArray<Slot> = [
  { Icon: CookingPot, x: 8, y: 12, size: 256, rotate: -3 },
  { Icon: Pizza, x: 22, y: 30, size: 288, rotate: 12 },
  { Icon: Soup, x: 14, y: 56, size: 240, rotate: -5 },
  { Icon: Sandwich, x: 28, y: 80, size: 240, rotate: -8 },
  { Icon: Beef, x: 38, y: 18, size: 224, rotate: 4 },
  { Icon: Salad, x: 40, y: 48, size: 240, rotate: -6 },
  { Icon: Utensils, x: 48, y: 88, size: 208, rotate: 3 },
  { Icon: Coffee, x: 4, y: 78, size: 224, rotate: 6 },
];

// TO pool: sweet + dessert + fruit. 8 slots, placed on the right side
// of the page so the two pools occupy roughly disjoint screen halves
// (helps the eye read "from-cluster on the left, to-cluster on the
// right"). Mixed sizes / rotations for hand-drawn feel.
const TO_POOL: ReadonlyArray<Slot> = [
  { Icon: Cookie, x: 60, y: 10, size: 224, rotate: -8 },
  { Icon: Donut, x: 78, y: 8, size: 256, rotate: 5 },
  { Icon: Cake, x: 64, y: 32, size: 224, rotate: 8 },
  { Icon: CakeSlice, x: 90, y: 24, size: 208, rotate: -4 },
  { Icon: Croissant, x: 56, y: 58, size: 240, rotate: -10 },
  { Icon: IceCream, x: 88, y: 56, size: 224, rotate: 10 },
  { Icon: Candy, x: 62, y: 78, size: 192, rotate: 12 },
  { Icon: Apple, x: 84, y: 84, size: 240, rotate: -5 },
];

const PREFERS_REDUCED_MOTION_QUERY =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

function prefersReducedMotion(): boolean {
  return PREFERS_REDUCED_MOTION_QUERY?.matches ?? false;
}

export function CookingBackdrop({
  inline,
  fromUnitId,
  toUnitId,
  glyphScale = 1,
}: CookingBackdropProps) {
  const className = inline
    ? 'absolute inset-0 pointer-events-none overflow-hidden'
    : 'fixed inset-0 pointer-events-none -z-10 overflow-hidden';

  // Subset selection: deterministic per unit id. Falls back to "all 4
  // lowest-indexed slots" on kit-card previews where no bench is in
  // scope (fromUnitId / toUnitId undefined).
  const fromActive = fromUnitId
    ? glyphSubsetIndices(fromUnitId, FROM_POOL.length, 4)
    : new Set([0, 1, 2, 3]);
  const toActive = toUnitId
    ? glyphSubsetIndices(toUnitId, TO_POOL.length, 4)
    : new Set([0, 1, 2, 3]);

  // rAF-driven scan-line scroll. patternTransform written directly via
  // setAttribute so the React tree does not re-render per frame.
  const scanRef = useRef<SVGPatternElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    let last = performance.now();
    let phase = 0;
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      // Scroll upward → translate y NEGATIVE; modulo the pattern's
      // height (36 px) so the numeric phase stays bounded and the
      // lines tile seamlessly.
      phase = (phase + dt * SCAN_LINE_SPEED_PX_S) % 36;
      scanRef.current?.setAttribute('patternTransform', `translate(0 ${-phase})`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div aria-hidden className={className} style={{ zIndex: inline ? 0 : -1 }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="absolute inset-0"
      >
        <defs>
          <pattern
            ref={scanRef}
            id="uf-recipe-card"
            width="800"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="35" x2="800" y2="35" stroke="var(--uf-grid-faint)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#uf-recipe-card)" />
      </svg>

      {/* Glyph stamps: render every slot in both pools; opacity gates
          visibility so a unit swap cross-fades without re-keying the
          DOM. transform combines centering, scale, and rotation. */}
      <div className="absolute inset-0">
        {FROM_POOL.map((s, i) => (
          <Glyph
            // biome-ignore lint/suspicious/noArrayIndexKey: stable per-pool index
            key={`from-${i}`}
            slot={s}
            active={fromActive.has(i)}
            scale={glyphScale}
          />
        ))}
        {TO_POOL.map((s, i) => (
          <Glyph
            // biome-ignore lint/suspicious/noArrayIndexKey: stable per-pool index
            key={`to-${i}`}
            slot={s}
            active={toActive.has(i)}
            scale={glyphScale}
          />
        ))}
      </div>
    </div>
  );
}

interface GlyphProps {
  slot: Slot;
  active: boolean;
  scale: number;
}

// Slide distance (px) for the swap-in / swap-out animation. Active
// glyphs come in from the LEFT (start at -GLYPH_SLIDE_PX, settle at 0);
// inactive glyphs leave to the RIGHT (start at 0, settle at +GLYPH_SLIDE_PX).
// Combined with the 1800 ms opacity transition this reads as "old ones
// fade and fly off to the right, new ones fade in and fly in from the
// left."
const GLYPH_SLIDE_PX = 80;

function Glyph({ slot, active, scale }: GlyphProps) {
  const Icon = slot.Icon;

  // translateX for the wrapper is direction-aware: a newly-active glyph
  // pops to -SLIDE then transitions to 0 (slide in from left); a
  // newly-inactive glyph transitions from 0 to +SLIDE (fly off right).
  // We need a separate effect that runs the "pre-position to -SLIDE,
  // then on next frame settle to 0" sequence for the entering case so
  // the transition has somewhere to animate from.
  const [translateX, setTranslateX] = useState(active ? 0 : GLYPH_SLIDE_PX);
  const wasActiveRef = useRef(active);

  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = active;
    if (active && !wasActive) {
      // Entering: prime at -SLIDE without transition, then on the next
      // frame transition to 0. requestAnimationFrame x2 ensures the
      // browser paints the primed position before the transition begins.
      setTranslateX(-GLYPH_SLIDE_PX);
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setTranslateX(0));
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
    if (!active && wasActive) {
      // Exiting: simply transition to +SLIDE; opacity goes to 0 in
      // parallel.
      setTranslateX(GLYPH_SLIDE_PX);
    }
  }, [active]);

  // Wrapper owns position + the slow translateX (1800 ms) so the swap
  // animation reads as a long fade-and-slide. Inner Icon owns scale
  // and rotate with a snappy 320 ms transition so the slider's scale
  // change still feels responsive.
  return (
    <div
      className="absolute text-uf-grid"
      style={{
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        transform: `translate(-50%, -50%) translateX(${translateX}px)`,
        opacity: active ? 0.12 : 0,
        transition:
          'opacity 1800ms cubic-bezier(0.22,1,0.36,1), transform 1800ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <Icon
        size={slot.size}
        strokeWidth={1.2}
        style={{
          transform: `scale(${scale}) rotate(${slot.rotate}deg)`,
          transformOrigin: 'center',
          transition: 'transform 320ms cubic-bezier(0.22,1,0.36,1)',
        }}
      />
    </div>
  );
}
