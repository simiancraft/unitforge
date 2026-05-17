// Circuit-board background for the data-storage theme. PCB trace paths
// with via dots; copper traces stroke-dash-animate so data visibly
// "flows" along two accent groups.
//
// The two trace groups encode the bench's from/to selection: group A's
// dash length is driven by the chosen FROM unit, group B's by the TO
// unit. Both groups share a slider-driven dash gap and animation
// period (so the slider IS the "data rate"). Every parameter the
// animation reads comes out of a real forge() call in
// ./backdrop-scales.ts; this file just plumbs values into SVG.

import type { Unit } from 'unitforge';
import { useAnimatedNumber } from '~/lib/use-animated-number.js';
import {
  BG_DASH_DEFAULTS,
  dashGapPxFor,
  dashLengthPxFor,
  pulsePeriodSecondsFor,
} from './backdrop-scales.js';

type DataUnit = Unit<'data', number>;

interface DataStorageBackdropProps {
  inline?: boolean;
  /** Bench state, if rendered inside a kit page. Omitted on the kit-card preview. */
  bench?: {
    fromUnit: DataUnit;
    toUnit: DataUnit;
    value: number;
    min: number;
    max: number;
  };
}

interface ResolvedScales {
  dashFrom: number;
  dashTo: number;
  gap: number;
  periodSeconds: number;
}

function resolveScales(bench: DataStorageBackdropProps['bench']): ResolvedScales {
  if (!bench) {
    return {
      dashFrom: BG_DASH_DEFAULTS.dashLength,
      dashTo: BG_DASH_DEFAULTS.dashLength,
      gap: BG_DASH_DEFAULTS.dashGap,
      periodSeconds: BG_DASH_DEFAULTS.pulsePeriodSeconds,
    };
  }
  return {
    dashFrom: dashLengthPxFor(bench.fromUnit),
    dashTo: dashLengthPxFor(bench.toUnit),
    gap: dashGapPxFor(bench.fromUnit, bench.value, bench.min, bench.max),
    periodSeconds: pulsePeriodSecondsFor(bench.fromUnit, bench.value, bench.min, bench.max),
  };
}

export function DataStorageBackdrop({ inline, bench }: DataStorageBackdropProps) {
  const target = resolveScales(bench);
  // Ease each axis independently so a unit swap, a slider drag, and a
  // mode change all settle smoothly. Period eases to a per-second
  // value; the CSS animation reads it as a duration.
  const dashFrom = useAnimatedNumber(target.dashFrom);
  const dashTo = useAnimatedNumber(target.dashTo);
  const gap = useAnimatedNumber(target.gap);
  const periodSeconds = useAnimatedNumber(target.periodSeconds);

  const className = inline
    ? 'absolute inset-0 pointer-events-none'
    : 'fixed inset-0 pointer-events-none -z-10';

  const dashArrayFrom = `${dashFrom.toFixed(2)} ${gap.toFixed(2)}`;
  const dashArrayTo = `${dashTo.toFixed(2)} ${gap.toFixed(2)}`;
  const periodCss = `${periodSeconds.toFixed(3)}s`;
  // Dashoffset travels one full cycle (dash + gap); keep the keyframe
  // generic and parameterize via CSS custom properties so a period
  // change re-times the animation without reflowing the SVG.
  const cycleFrom = (dashFrom + gap).toFixed(2);
  const cycleTo = (dashTo + gap).toFixed(2);

  return (
    <div aria-hidden className={className} style={{ zIndex: inline ? 0 : -1 }}>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .uf-trace-pulse-from,
          .uf-trace-pulse-to {
            stroke: var(--uf-trace);
            animation-name: uf-trace-flow-from;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            opacity: 0.55;
          }
          .uf-trace-pulse-to {
            animation-name: uf-trace-flow-to;
            opacity: 0.42;
          }
          @keyframes uf-trace-flow-from {
            0%   { stroke-dashoffset: var(--uf-cycle-from); }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes uf-trace-flow-to {
            0%   { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: var(--uf-cycle-to); }
          }
        }
      `}</style>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="uf-pcb" width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M 0 20 L 60 20 L 60 60 L 100 60"
              fill="none"
              stroke="var(--uf-trace-faint)"
              strokeWidth="1.2"
            />
            <path
              d="M 0 80 L 40 80 L 40 40 L 100 40"
              fill="none"
              stroke="var(--uf-trace-faint)"
              strokeWidth="1.2"
            />
            <path
              d="M 20 0 L 20 30 L 80 30 L 80 100"
              fill="none"
              stroke="var(--uf-trace-faint)"
              strokeWidth="1.2"
            />
            <circle cx="60" cy="20" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="60" cy="60" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="40" cy="40" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="20" cy="30" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="80" cy="30" r="2" fill="var(--uf-trace)" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#uf-pcb)" />

        <g style={{ '--uf-cycle-from': cycleFrom } as React.CSSProperties}>
          <path
            d="M 0 120 L 240 120 L 240 280 L 540 280"
            fill="none"
            strokeWidth="1.8"
            strokeDasharray={dashArrayFrom}
            className="uf-trace-pulse-from"
            style={{ animationDuration: periodCss }}
          />
          <path
            d="M 100 600 L 100 460 L 380 460 L 380 360"
            fill="none"
            strokeWidth="1.8"
            strokeDasharray={dashArrayFrom}
            className="uf-trace-pulse-from"
            style={{ animationDuration: periodCss, animationDelay: '0.6s' }}
          />
        </g>

        <g style={{ '--uf-cycle-to': cycleTo } as React.CSSProperties}>
          <path
            d="M 800 400 L 600 400 L 600 200 L 320 200"
            fill="none"
            strokeWidth="1.8"
            strokeDasharray={dashArrayTo}
            className="uf-trace-pulse-to"
            style={{ animationDuration: periodCss }}
          />
          <path
            d="M 800 80 L 660 80 L 660 320 L 500 320 L 500 520"
            fill="none"
            strokeWidth="1.8"
            strokeDasharray={dashArrayTo}
            className="uf-trace-pulse-to"
            style={{ animationDuration: periodCss, animationDelay: '0.3s' }}
          />
        </g>
      </svg>
    </div>
  );
}
