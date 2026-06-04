// The stature ruler: a full-width visualizer where the X axis IS the
// height axis. Reference stand-ins (plain glyph) park at the 5/6/7 ft
// marks; the two selected people (tie glyph, colour-coded) drop in at
// the X position matching their height. Figures are scaled uniformly
// (natural proportions, calibrated so a 6 ft figure looks right), so a
// taller person reads as further right AND bigger, a rising stair-step.
//
// A dotted level line runs across the canvas at each selected person's
// height, coloured to their side, and a delta arrow on the far left
// spans the gap between the two lines, labelled with the height
// difference in ft′in″.

import { ChevronDown, ChevronUp } from 'lucide-react';
import { ftIn, type ResolvedSide } from '../stature-model.js';
import { EXEC_GLYPH_ASPECT, ExecGlyph } from './exec-glyph.js';
import { FIGURE_GLYPH_ASPECT, FigureGlyph } from './figure-glyph.js';

const VIS_H = 210; // px height of a 7'6" figure (90 in maps to this)
const PX_PER_IN = VIS_H / 90;
const BASE = 26; // space below the baseline for the foot-mark labels
const TOP_PAD = 36; // headroom for each figure's name + height tags
// X domain is symmetric around 6 ft (72 in) so the 5/6/7 ft marks sit
// with equal margin on each side.
const RULER_MIN = 51;
const RULER_MAX = 93;
const MARKS = [60, 72, 84]; // 5, 6, 7 ft, in inches

function xPct(inches: number): number {
  const t = (inches - RULER_MIN) / (RULER_MAX - RULER_MIN);
  return Math.min(1, Math.max(0, t)) * 100;
}

function StandIn({ inches }: { inches: number }) {
  const h = inches * PX_PER_IN;
  return (
    <FigureGlyph
      fill="currentColor"
      className="absolute text-uf-muted"
      style={{
        left: `${xPct(inches)}%`,
        bottom: BASE,
        width: h * FIGURE_GLYPH_ASPECT,
        height: h,
        transform: 'translateX(-50%)',
        opacity: 0.3,
        zIndex: 0,
      }}
    />
  );
}

function LevelLine({ inches, color }: { inches: number; color: string }) {
  return (
    <div
      className="absolute inset-x-0"
      style={{
        bottom: BASE + inches * PX_PER_IN,
        borderTop: `1px dashed ${color}`,
        opacity: 0.7,
        zIndex: 4,
      }}
    />
  );
}

function LiveFigure({ side, color, z }: { side: ResolvedSide; color: string; z: number }) {
  const h = side.heightInches * PX_PER_IN;
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${xPct(side.heightInches)}%`,
        bottom: BASE,
        transform: 'translateX(-50%)',
        color,
        zIndex: z,
      }}
    >
      <span className="mb-1 flex flex-col items-center leading-tight" style={{ maxWidth: 90 }}>
        {side.badge ? (
          <span aria-hidden className="text-sm leading-none">
            {side.badge}
          </span>
        ) : null}
        <span className="text-center text-[9px] text-uf-fg">{side.label}</span>
        <span className="mono text-[11px] tabular-nums">{ftIn(side.heightInches)}</span>
      </span>
      <ExecGlyph
        fill="currentColor"
        style={{ width: h * EXEC_GLYPH_ASPECT, height: h, opacity: 0.95 }}
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
  const sPx = subject.heightInches * PX_PER_IN;
  const rPx = reference.heightInches * PX_PER_IN;
  const minPx = Math.min(sPx, rPx);
  const gapPx = Math.abs(sPx - rPx);
  const deltaIn = Math.abs(subject.heightInches - reference.heightInches);
  const showDelta = deltaIn >= 0.5;

  return (
    <div
      className="relative w-full"
      style={{ height: TOP_PAD + VIS_H + BASE }}
      role="img"
      aria-label={`${subject.label} at ${ftIn(subject.heightInches)} beside ${reference.label} at ${ftIn(reference.heightInches)}, a difference of ${ftIn(deltaIn)}`}
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

      {/* level lines across the canvas at each height */}
      {showDelta ? (
        <>
          <LevelLine inches={reference.heightInches} color="var(--uf-accent-2)" />
          <LevelLine inches={subject.heightInches} color="var(--uf-accent)" />
          {/* delta arrow + label, pinned to the left edge */}
          <div
            className="absolute flex flex-col items-center text-uf-fg"
            style={{ left: 0, bottom: BASE + minPx, height: gapPx, zIndex: 6 }}
          >
            <ChevronUp size={12} className="-mb-1 shrink-0" aria-hidden />
            <div className="w-px flex-1 bg-current" />
            <ChevronDown size={12} className="-mt-1 shrink-0" aria-hidden />
          </div>
          <span
            className="mono absolute text-[11px] tabular-nums text-uf-fg"
            style={{ left: 16, bottom: BASE + minPx + gapPx / 2 - 8, zIndex: 6 }}
          >
            {ftIn(deltaIn)}
          </span>
        </>
      ) : null}

      {/* the two selected people */}
      <LiveFigure side={reference} color="var(--uf-accent-2)" z={10} />
      <LiveFigure side={subject} color="var(--uf-accent)" z={20} />
    </div>
  );
}
