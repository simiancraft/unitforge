// Antiquity backdrop. The oldest measurement record is a tally mark
// scratched in clay; the backdrop is a faint field of inscribed
// strokes (grouped in fives, the way tallies have always been
// counted) plus a soft accent glow at the page center.
//
//   - The tally field is deterministic (LCG-seeded) so the layout is
//     stable across renders and reloads.
//   - Bench-reactive: the bench's normalized slider position drives
//     `--ant-intensity`; the tick opacity and the center glow scale
//     with it, so a larger measured value reads as a denser, brighter
//     inscription.
//
// Inline preview (kit-grid card) reuses the same composition at
// reduced size; the wrapper class swap matches the cooking / mass /
// temperature pattern (fixed inset-0 -z-10 non-inline, absolute
// inset-0 inline).

import type { CSSProperties } from 'react';

interface AntiquityBackdropProps {
  inline?: boolean;
  /** Normalized bench-slider position (0..1); drives tick opacity and
   *  center-glow strength. */
  intensity?: number;
}

const TALLIES = generateTallies(48);

export function AntiquityBackdrop({ inline = false, intensity = 0.4 }: AntiquityBackdropProps) {
  const t = clamp01(intensity);

  const wrapperStyle: CSSProperties & Record<'--ant-intensity', string> = {
    background: 'var(--uf-bg)',
    '--ant-intensity': String(t),
  };

  const className = inline
    ? 'pointer-events-none absolute inset-0 overflow-hidden'
    : 'pointer-events-none fixed inset-0 -z-10 overflow-hidden';

  return (
    <div aria-hidden className={className} style={wrapperStyle}>
      <TallyField t={t} />
    </div>
  );
}

function TallyField({ t }: { t: number }) {
  // Center glow scales 120..420 px and brightens with intensity.
  const glowRadius = 120 + t * 300;
  const glowOpacity = 0.1 + t * 0.4;
  // Tick opacity floats with intensity so the inscription "deepens"
  // as the measured value climbs.
  const tickOpacity = 0.18 + t * 0.34;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <title>Antiquity tally-mark backdrop; decorative</title>
      <defs>
        <radialGradient id="ant-center-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--uf-accent)" stopOpacity="0.5" />
          <stop offset="55%" stopColor="var(--uf-accent)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--uf-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="ant-glow" style={{ opacity: glowOpacity }}>
        <circle cx="600" cy="400" r={glowRadius} fill="url(#ant-center-glow)" />
      </g>

      <g className="ant-drift" style={{ opacity: tickOpacity }}>
        {TALLIES.map((group) => (
          <TallyGroup key={group.key} group={group} />
        ))}
      </g>
    </svg>
  );
}

// One tally group: four uprights and a diagonal slash through them,
// the universal "five" count. Rendered as a single <g> so the whole
// cluster shares one transform.
function TallyGroup({ group }: { group: TallyGroupModel }) {
  const stroke = 'var(--uf-grid)';
  const h = 26;
  return (
    <g transform={`translate(${group.x} ${group.y}) rotate(${group.rot})`}>
      {[0, 6, 12, 18].map((dx) => (
        <line key={dx} x1={dx} y1={0} x2={dx} y2={h} stroke={stroke} strokeWidth={1.6} />
      ))}
      <line x1={-3} y1={h} x2={21} y2={0} stroke={stroke} strokeWidth={1.6} />
    </g>
  );
}

interface TallyGroupModel {
  key: string;
  x: number;
  y: number;
  rot: number;
}

// Deterministic pseudo-random tally layout via a fixed LCG, seeded so
// the field is stable across renders + reloads.
function generateTallies(count: number): TallyGroupModel[] {
  let seed = 0x1d87;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed & 0xffff) / 0xffff;
  };
  const groups: TallyGroupModel[] = [];
  for (let i = 0; i < count; i++) {
    groups.push({
      key: `t${i}`,
      x: 40 + next() * 1120,
      y: 40 + next() * 720,
      rot: -18 + next() * 36,
    });
  }
  return groups;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.4;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
