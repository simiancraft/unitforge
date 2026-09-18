// Inventory backdrop. A wall of parts bins, fully bench-reactive. Three
// controls drive three distinct backdrop dimensions, matching the
// pattern the mass and cooking backdrops established:
//
//   - bench.fromId → bin grid density. A small grouping (each, pair)
//     reads as many small bins; a large one (ream, great gross) reads
//     as fewer, wider bins. The wall reorganizes when you change what
//     you are counting in, which is exactly what a warehouse does.
//   - bench.toId   → how full each bin sits. Converting into a large
//     grouping leaves shallow bins; into a small one, deep ones.
//   - bench.value  → how many bins are lit. The count itself walks
//     across the wall left to right, top to bottom.
//
// The wall is static geometry; only fill heights and lit state animate,
// and both are state-driven rather than ambient, so they survive
// prefers-reduced-motion. The one ambient motion (a slow shimmer on the
// lit bins' front edge) is behind the reduced-motion guard in
// inventory.css.

import type { CSSProperties } from 'react';
import { forge, type Unit } from 'unitforge';
import { each } from 'unitforge/kits/count';

interface InventoryBackdropProps {
  inline?: boolean;
  /** Bench's from-unit; drives bin grid density. Optional so the inline
   *  preview can render without bench state. */
  fromUnit?: Unit<'count', number>;
  /** Bench's to-unit; drives how full each bin sits. */
  toUnit?: Unit<'count', number>;
  /** Normalized bench slider position (0..1); drives how many bins are
   *  lit. */
  intensity?: number;
}

const VIEW_W = 1200;
const VIEW_H = 800;

interface BinCell {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Fill height in pixels, measured up from the bin floor. */
  fill: number;
  lit: boolean;
}

export function InventoryBackdrop({
  inline = false,
  fromUnit,
  toUnit,
  intensity = 0.5,
}: InventoryBackdropProps) {
  const bins = computeBins(fromUnit, toUnit, intensity);

  // Same convention as every other kit backdrop: fixed + -z-10 for the
  // page (so the wall covers the viewport rather than the content
  // column), absolute for the inline preview card on the home grid.
  const className = inline
    ? 'pointer-events-none absolute inset-0 overflow-hidden'
    : 'pointer-events-none fixed inset-0 -z-10 overflow-hidden';

  const wrapperStyle: CSSProperties = { background: 'var(--uf-bg)' };

  return (
    <div aria-hidden className={className} style={wrapperStyle}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <title>{inline ? 'Inventory kit preview backdrop' : 'Parts-bin wall backdrop'}</title>
        {bins.map((bin) => (
          <Bin key={bin.key} bin={bin} />
        ))}
      </svg>
    </div>
  );
}

function Bin({ bin }: { bin: BinCell }) {
  const stroke = bin.lit ? 'var(--uf-grid)' : 'var(--uf-grid-faint)';
  return (
    <g>
      {/* Bin shell. Open-topped: three sides, so the wall reads as
          storage rather than as a chart of rectangles. */}
      <path
        d={`M ${bin.x} ${bin.y} L ${bin.x} ${bin.y + bin.h} L ${bin.x + bin.w} ${bin.y + bin.h} L ${bin.x + bin.w} ${bin.y}`}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        opacity={bin.lit ? 0.55 : 0.22}
      />
      {bin.fill > 0 ? (
        <rect
          className={bin.lit ? 'inventory-bin-fill' : undefined}
          x={bin.x + 1}
          y={bin.y + bin.h - bin.fill}
          width={bin.w - 2}
          height={bin.fill}
          fill="var(--uf-accent)"
          opacity={bin.lit ? 0.18 : 0.06}
        />
      ) : null}
    </g>
  );
}

// Config helpers. COUNT spans a much narrower range than mass (each = 1
// through great gross = 1728), so a log scale over that band is what
// keeps the small groupings from all collapsing to the same t.

const MAX_LOG_EACH = Math.log10(1728);

function unitT(unit: Unit<'count', number> | undefined): number {
  if (!unit) return 0.5;
  // How many `each` one of this unit is worth. `each` is the COUNT
  // base, so this is the unit's factor read straight back out of it.
  const inEach = Math.max(forge(unit, each)(1), 1);
  return clamp01(Math.log10(inEach) / MAX_LOG_EACH);
}

function computeBins(
  fromUnit: Unit<'count', number> | undefined,
  toUnit: Unit<'count', number> | undefined,
  intensity: number,
): BinCell[] {
  const fromT = unitT(fromUnit);
  const toT = unitT(toUnit);
  const lit01 = clamp01(intensity);

  // From-unit drives density, inverted: counting in `each` means many
  // small bins; counting in great gross means few wide ones.
  const cols = Math.round(18 - fromT * 10); // 18..8
  const rows = Math.round(11 - fromT * 5); // 11..6
  const cellW = VIEW_W / cols;
  const cellH = VIEW_H / rows;
  const gap = 6;
  const w = cellW - gap;
  const h = cellH - gap;

  // To-unit drives fill depth, also inverted: converting into a big
  // grouping leaves a shallow pile in each bin.
  const fillFraction = 0.75 - toT * 0.55; // 0.75..0.20

  const total = cols * rows;
  const litCount = Math.round(lit01 * total);

  const bins: BinCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const lit = index < litCount;
      bins.push({
        key: `${r}-${c}`,
        x: c * cellW + gap / 2,
        y: r * cellH + gap / 2,
        w,
        h,
        // Unlit bins keep a token amount of stock so the wall does not
        // read as an empty warehouse at slider-min.
        fill: h * (lit ? fillFraction : fillFraction * 0.25),
        lit,
      });
    }
  }
  return bins;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
