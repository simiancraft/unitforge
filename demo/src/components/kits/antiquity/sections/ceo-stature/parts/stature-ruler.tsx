// The stature ruler: a full-width visualizer where the X axis IS the
// height axis. Reference stand-ins (plain glyph) park at the 5/6/7 ft
// marks; the two selected people (tie glyph, colour-coded) drop in at
// the X position matching their height and are stretched vertically to
// it (height-only), so a taller person reads as further right AND
// taller, a rising stair-step. Below-5 ft lands left of the 5 mark,
// above-7 ft right of the 7 mark.

import { STATURE_MAX_IN, STATURE_MIN_IN } from '../figures.js';
import { ftIn, type ResolvedSide } from '../stature-model.js';
import { ExecGlyph } from './exec-glyph.js';
import { FigureGlyph } from './figure-glyph.js';

const VIS_H = 230; // px height of the tallest renderable figure (7'6")
const GLYPH_W = 26; // fixed glyph width; only height scales
const TOP_PAD = 30; // headroom for the per-figure height tag + badge
const BASE = 24; // space below the baseline for the foot-mark labels
const MARKS = [60, 72, 84]; // 5, 6, 7 ft, in inches
const pxPerIn = VIS_H / STATURE_MAX_IN;

function xPct(inches: number): number {
  const t = (inches - STATURE_MIN_IN) / (STATURE_MAX_IN - STATURE_MIN_IN);
  return Math.min(1, Math.max(0, t)) * 100;
}

function StandIn({ inches }: { inches: number }) {
  return (
    <FigureGlyph
      fill="currentColor"
      className="absolute text-uf-muted"
      style={{
        left: `${xPct(inches)}%`,
        bottom: BASE,
        width: GLYPH_W - 2,
        height: inches * pxPerIn,
        transform: 'translateX(-50%)',
        opacity: 0.22,
        zIndex: 0,
      }}
    />
  );
}

function LiveFigure({ side, color, z }: { side: ResolvedSide; color: string; z: number }) {
  const h = side.heightInches;
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${xPct(h)}%`, bottom: BASE, transform: 'translateX(-50%)', color, zIndex: z }}
    >
      <span className="mb-1 flex flex-col items-center leading-none">
        {side.badge ? (
          <span aria-hidden className="text-sm">
            {side.badge}
          </span>
        ) : null}
        <span className="mono text-[11px] tabular-nums">{ftIn(h)}</span>
      </span>
      <ExecGlyph
        fill="currentColor"
        style={{ width: GLYPH_W, height: h * pxPerIn, opacity: 0.92 }}
      />
    </div>
  );
}

export function StatureRuler({
  subject,
  reference,
}: {
  subject: ResolvedSide;
  reference: ResolvedSide;
}) {
  return (
    <div
      className="relative w-full"
      style={{ height: TOP_PAD + VIS_H + BASE }}
      role="img"
      aria-label={`${subject.label} at ${ftIn(subject.heightInches)} beside ${reference.label} at ${ftIn(reference.heightInches)}, on a 4 to 7.5 foot scale`}
    >
      {/* foot-mark gridlines + labels */}
      {MARKS.map((m) => (
        <div key={m}>
          <div
            className="absolute w-px bg-uf-border"
            style={{ left: `${xPct(m)}%`, bottom: BASE, height: VIS_H, opacity: 0.5 }}
          />
          <span
            className="uf-eyebrow absolute text-uf-muted"
            style={{ left: `${xPct(m)}%`, bottom: 0, transform: 'translateX(-50%)' }}
          >
            {m / 12} ft
          </span>
        </div>
      ))}

      {/* baseline */}
      <div className="absolute inset-x-0 bg-uf-border" style={{ bottom: BASE, height: 1 }} />

      {/* reference stand-ins behind */}
      {MARKS.map((m) => (
        <StandIn key={m} inches={m} />
      ))}

      {/* the two selected people */}
      <LiveFigure side={reference} color="var(--uf-accent-2)" z={10} />
      <LiveFigure side={subject} color="var(--uf-accent)" z={20} />
    </div>
  );
}
